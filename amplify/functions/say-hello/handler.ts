import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getUnpublishedNews = async (type: 'Steel' | 'Auto' | 'Aluminum' ) => {
//  const getUnpublishedNews = async (type: 'Steel' | 'Auto' | 'Aluminum' | '鉄鋼' | '自動車' | 'アルミ') => {
    const params = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
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
      TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
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
//  const { name, type } = event.arguments as { name: string, type: 'Steel' | 'Auto' | 'Aluminum' | '鉄鋼' | '自動車' | 'アルミ'};
  const { name, type } = event.arguments as { name: string, type: 'Steel' | 'Auto' | 'Aluminum' };
  
  if (type === 'Steel' || type === 'Auto' || type === 'Aluminum'
//    || type === '鉄鋼' || type === '自動車' || type === 'アルミ'
  ) {
    const unpublishedNews = await getUnpublishedNews(type);
    if (unpublishedNews) {
      const newsIds = unpublishedNews.map(news => news.id);
      await publishNews(newsIds);
    }
    // return typed from `.returns()`
    return `Hello, ${name}! Unpublished ${type} news count: ${unpublishedNews ? unpublishedNews.length : 0} | type: ${type} `;
  } else {
    throw new Error(`Invalid type: ${type} | name : ${name}`);
  } 
 }
/*
import type { Handler } from 'aws-lambda';

export const handler: Handler = async (event, context) => {
  // your function code goes here
  return 'Hello, World!';
};
*/