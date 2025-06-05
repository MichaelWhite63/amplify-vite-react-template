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

  // Step 1: Group articles by lDate and sort each group by createdAt (ASC)
  const groupedByDate = new Map<string, any[]>();
  
  result.Items.forEach(item => {
    const dateKey = item.lDate; // Use lDate as the grouping key
    if (!groupedByDate.has(dateKey)) {
      groupedByDate.set(dateKey, []);
    }
    groupedByDate.get(dateKey)!.push(item);
  });
  
  // Step 2: Sort items within each date group by createdAt (ASC)
  groupedByDate.forEach((items) => {
    items.sort((a, b) => {
      const createdAtA = new Date(a.createdAt);
      const createdAtB = new Date(b.createdAt);
      return createdAtA.getTime() - createdAtB.getTime(); // ASC order
    });
  });
  
  // Step 3: Sort the date groups by lDate (DESC) and flatten
  const sortedDates = Array.from(groupedByDate.keys()).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime(); // DESC order
  });
  
  // Step 4: Flatten the sorted groups and limit to count
  const sortedItems: any[] = [];
  for (const dateKey of sortedDates) {
    const items = groupedByDate.get(dateKey)!;
    sortedItems.push(...items);
    
    // Stop if we've reached the desired count
    if (sortedItems.length >= count) {
      break;
    }
  }
  
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