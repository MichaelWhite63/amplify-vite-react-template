import { integer } from "aws-sdk/clients/cloudfront";
import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getTopTenArticles = async (type: 'Steel' | 'Auto' | 'Aluminum', count: number) => {
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
  
  if (!result.Items || result.Items.length === 0) {
    return [];
  }

  // Single-pass sort with compound comparator - much more efficient
  const sortedItems = result.Items.sort((a, b) => {
    // Primary sort: lDate DESC
    const dateA = new Date(a.lDate);
    const dateB = new Date(b.lDate);
    const dateDiff = dateB.getTime() - dateA.getTime();
    
    // If dates are different, return the date comparison
    if (dateDiff !== 0) {
      return dateDiff;
    }
    
    // Secondary sort: createdAt ASC (only when dates are equal)
    const createdAtA = new Date(a.createdAt);
    const createdAtB = new Date(b.createdAt);
    return createdAtA.getTime() - createdAtB.getTime();
  });
  
  return sortedItems.slice(0, count);
};

export const handler: Schema["getTopTen"]["functionHandler"] = async (event) => {
  const { type, count = 10 } = event.arguments as { type: 'Steel' | 'Auto' | 'Aluminum', count: integer };
  const actualCount = count ?? 10;
  
  if (type === 'Steel' || type === 'Auto' || type === 'Aluminum') {
    const topTen = await getTopTenArticles(type, actualCount);
    return JSON.stringify(topTen);
  } else {
    throw new Error(`Invalid type: ${type}`);
  }
};