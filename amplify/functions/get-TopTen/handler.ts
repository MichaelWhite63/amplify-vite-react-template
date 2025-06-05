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
  
  // Sort by lDate descending, then by createdAt ascending (equivalent to ORDER BY lDate DESC, createdAt ASC)
  const sortedItems = result.Items?.sort((a, b) => {
    // First sort by lDate (date only) in descending order
    const dateA = new Date(a.lDate);
    const dateB = new Date(b.lDate);
    
    if (dateA.getTime() !== dateB.getTime()) {
      return dateB.getTime() - dateA.getTime(); // DESC order
    }
    
    // If lDate is the same, sort by createdAt (date and time) in ascending order
    const createdAtA = new Date(a.createdAt);
    const createdAtB = new Date(b.createdAt);
    
    return createdAtA.getTime() - createdAtB.getTime(); // ASC order
  }).slice(0, count);
  
  return sortedItems || [];
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