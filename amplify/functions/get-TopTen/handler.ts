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
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
      };
      
      console.log(`Querying GSI: newsByTypeAndDate for type: ${type}`);
      
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
  // Sort by lDate DESC, then createdAt ASC (since GSI sorts by 'date', not 'lDate')
  const sortedItems = allItems.sort((a, b) => {
    // Primary sort: lDate DESC
    const lDateA = new Date(a.lDate);
    const lDateB = new Date(b.lDate);
    const lDateDiff = lDateB.getTime() - lDateA.getTime();
    
    if (lDateDiff !== 0) {
      return lDateDiff; // lDate DESC
    }
    
    // Secondary sort: createdAt ASC for same lDate
    const createdAtA = new Date(a.createdAt);
    const createdAtB = new Date(b.createdAt);
    return createdAtA.getTime() - createdAtB.getTime(); // createdAt ASC
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
  
  // In your handler, add this temporary debug code
  const debugParams = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
    FilterExpression: '#type = :type',
    ExpressionAttributeValues: { ':type': 'Steel' },
    ExpressionAttributeNames: { '#type': 'type' },
    Limit: 5
  };

  const debugResult = await dynamoDb.scan(debugParams).promise();
  console.log('Sample lDate values:', debugResult.Items?.map(item => ({
    lDate: item.lDate,
    lDateType: typeof item.lDate,
    lDateValue: JSON.stringify(item.lDate)
  })));
  
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