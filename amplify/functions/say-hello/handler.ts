import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getUnpublishedNews = async (type: 'Steel' | 'Auto' | 'Aluminum') => {
  const params = {
    TableName: 'News',
    FilterExpression: 'published = :published AND #type = :type',
    ExpressionAttributeValues: { 
      ':published': false,
      ':type': type
    },
    ExpressionAttributeNames: {
      '#type': 'type'
    }
  };

  const result = await dynamoDb.scan(params).promise();
  return result.Items;
};

const publishNews = async (newsIds: string[]) => {
  const updatePromises = newsIds.map(id => {
    const params = {
      TableName: 'News',
      Key: { id },
      UpdateExpression: 'set published = :published',
      ExpressionAttributeValues: { ':published': true }
    };
    return dynamoDb.update(params).promise();
  });

  await Promise.all(updatePromises);
};

export const handler: Schema["sayHello"]["functionHandler"] = async (event) => {
  // arguments typed from `.arguments()`
  const { name, type, nonEnum } = event.arguments as { name: string, type: 'Steel' | 'Auto' | 'Aluminum', nonEnum: string };
  
  if (type === 'Steel' || type === 'Auto' || type === 'Aluminum') {
    const unpublishedNews = await getUnpublishedNews(type);
    //if (unpublishedNews) {
    //  const newsIds = unpublishedNews.map(news => news.id);
    //  await publishNews(newsIds);
    //}
    // return typed from `.returns()`
    return `Hello, ${name}! Unpublished news count: ${unpublishedNews ? unpublishedNews.length : 0} | type: ${type} | nonEnum: ${nonEnum}`;
  } else {
    throw new Error(`Invalid type: ${type} | name : ${name} | nonEnum : ${nonEnum}`);
  }
  
  // return typed from `.returns()`
 // return `Hello, ${name}! Unpublished news count: ${unpublishedNews.length}`;
}
/*
import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
  // your function code goes here
  return 'Hello, World!';
};
*/