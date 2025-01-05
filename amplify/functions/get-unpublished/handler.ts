import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getUnpublishedNews = async (type: 'Steel' | 'Auto' | 'Aluminum', date: string) => {
  const params = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
    FilterExpression: 'published = :published AND #type = :type AND #date = :date',
    ExpressionAttributeValues: { 
      ':published': false,
      ':type': type,
      ':date': date
    },
    ExpressionAttributeNames: {
      '#type': 'type',
      '#date': 'date'
    }
  };
  const result = await dynamoDb.scan(params).promise();
  return result.Items;
};

export const handler: Schema["getUnpublished"]["functionHandler"] = async (event) => {
  const { type, date } = event.arguments as { type: 'Steel' | 'Auto' | 'Aluminum', date: string };
  
  if (type === 'Steel' || type === 'Auto' || type === 'Aluminum') {
    const unpublishedNews = await getUnpublishedNews(type, date);
    return JSON.stringify(unpublishedNews);
  } else {
    throw new Error(`Invalid type: ${type}`);
  }
};