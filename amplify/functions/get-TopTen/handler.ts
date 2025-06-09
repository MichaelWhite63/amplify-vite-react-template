import { integer } from "aws-sdk/clients/cloudfront";
import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getTopTenArticles = async (type: 'Steel' | 'Auto' | 'Aluminum', count: number) => {
  let allItems: any[] = [];
  let lastEvaluatedKey: any = undefined;
  
  try {
    do {
      const params = {
        TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
        IndexName: 'newsByTypeAndDate', // Use the working GSI temporarily
        KeyConditionExpression: '#type = :type',
        ExpressionAttributeValues: { ':type': type },
        ExpressionAttributeNames: { '#type': 'type' },
        ScanIndexForward: false, // date DESC
        Limit: 1000, // Limit items per batch to avoid timeout
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
      };
      
      console.log(`Querying GSI: newsByTypeAndDate for type: ${type}`);
      
      const result = await dynamoDb.query(params).promise();
      
      console.log(`Query returned ${result.Items?.length || 0} items in this batch`);
      
      if (result.Items) {
        allItems = allItems.concat(result.Items);
      }
      
      lastEvaluatedKey = result.LastEvaluatedKey;
      
      // Break early if we have enough items to avoid timeout
      if (allItems.length >= count * 2) {
        console.log(`Breaking early with ${allItems.length} items to avoid timeout`);
        break;
      }
      
    } while (lastEvaluatedKey);
    
    console.log(`Final total: ${allItems.length} items for type ${type}`);
    
  } catch (error) {
    console.error('Error querying GSI:', error);
    throw error;
  }
  
  // Sort by date DESC, then createdAt ASC
  const sortedItems = allItems.sort((a, b) => {
    // Primary sort: date DESC
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    const dateDiff = dateB.getTime() - dateA.getTime();
    
    if (dateDiff !== 0) {
      return dateDiff; // date DESC
    }
    
    // Secondary sort: createdAt ASC for same date
    const createdAtA = new Date(a.createdAt);
    const createdAtB = new Date(b.createdAt);
    return createdAtA.getTime() - createdAtB.getTime(); // createdAt ASC
  });
  
  return sortedItems.slice(0, count);
};

export const handler: Schema["getTopTen"]["functionHandler"] = async (event) => {
  const { type, count = 10 } = event.arguments as { type: 'Steel' | 'Auto' | 'Aluminum', count: integer };
  const actualCount = count ?? 10;
  
  console.log(`getTopTen called with type: ${type}, count: ${actualCount}`);
  
  try {
    if (type === 'Steel' || type === 'Auto' || type === 'Aluminum') {
      const topTen = await getTopTenArticles(type, actualCount);
      console.log(`Returning ${topTen.length} items`);
      return JSON.stringify(topTen);
    } else {
      throw new Error(`Invalid type: ${type}`);
    }
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
};