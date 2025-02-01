import { integer } from "aws-sdk/clients/cloudfront";
import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getTopTen = async (type: 'Steel' | 'Auto' | 'Aluminum', count: integer) => {
  const params = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
    FilterExpression: '#type = :type',
    ExpressionAttributeValues: { 
      ':type': type,
    },
    ExpressionAttributeNames: {
      '#type': 'type',
    }
  };
  const result = await dynamoDb.scan(params).promise();
  
  // Sort by date descending and limit to count
  const sortedItems = result.Items?.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  ).slice(0, count);
  
  return sortedItems || [];
};

export const handler: Schema["get-TopTen"]["functionHandler"] = async (event) => {
  const { type, count } = event.arguments as { type: 'Steel' | 'Auto' | 'Aluminum', count: integer };
  
  if (type === 'Steel' || type === 'Auto' || type === 'Aluminum') {
    const topTen = await getTopTen(type, count);
    return JSON.stringify(topTen);
  } else {
    throw new Error(`Invalid type: ${type}`);
  }
};