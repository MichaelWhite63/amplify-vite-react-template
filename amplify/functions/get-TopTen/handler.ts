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
        IndexName: 'newsByTypeAndLDate', // Use the active GSI that has data
        KeyConditionExpression: '#type = :type',
        ExpressionAttributeValues: { ':type': type },
        ExpressionAttributeNames: { '#type': 'type' },
        ScanIndexForward: false, // This gives us lDate DESC
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
      };
      
      console.log(`Querying GSI: newsByTypeAndLDate for type: ${type}`);
      
      const result = await dynamoDb.query(params).promise();
      
      console.log(`Query returned ${result.Items?.length || 0} items in this batch`);
      
      if (result.Items) {
        allItems = allItems.concat(result.Items);
      }
      
      lastEvaluatedKey = result.LastEvaluatedKey;
      console.log(`Total items so far: ${allItems.length}, hasMore: ${!!lastEvaluatedKey}`);
      
    } while (lastEvaluatedKey);
    
    console.log(`Final total: ${allItems.length} items for type ${type}`);
    
  } catch (error) {
    console.error('Error querying GSI:', error);
    throw error;
  }
  
  // Sort by createdAt for items with same lDate (GSI already sorted by lDate DESC)
  const sortedItems = allItems.sort((a, b) => {
    const dateA = new Date(a.lDate);
    const dateB = new Date(b.lDate);
    const dateDiff = dateB.getTime() - dateA.getTime();
    
    if (dateDiff !== 0) {
      return dateDiff; // lDate DESC (GSI should handle this, but keeping for safety)
    }
    
    // For same lDate, sort by createdAt ASC
    const createdAtA = new Date(a.createdAt);
    const createdAtB = new Date(b.createdAt);
    return createdAtA.getTime() - createdAtB.getTime();
  });
  
  // Debug: Show the most recent dates
  console.log('Top 5 dates after sorting:', sortedItems.slice(0, 5).map(item => ({
    lDate: item.lDate,
    createdAt: item.createdAt
  })));
  
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