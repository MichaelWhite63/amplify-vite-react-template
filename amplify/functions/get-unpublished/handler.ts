import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getUnpublishedNews = async (type: 'Steel' | 'Auto' | 'Aluminum') => {
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
export const handler: Schema["getUnpublished"]["functionHandler"] = async (event) => {
  // arguments typed from `.arguments()`
  const { type } = event.arguments as { type: 'Steel' | 'Auto' | 'Aluminum' };
  
  if (type === 'Steel' || type === 'Auto' || type === 'Aluminum') {
    const unpublishedNews = await getUnpublishedNews(type);
    return JSON.stringify(unpublishedNews);
  } else {
    throw new Error(`Invalid type: ${type}`);
  } 
 }