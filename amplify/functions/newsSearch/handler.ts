import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString } = event.arguments as { searchString: string };
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0]; // Get YYYY-MM-DD format

  try {
    let allItems: any[] = [];
    let lastEvaluatedKey: any = undefined;
    
    do {
      const params = {
        TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
        FilterExpression: '#lDate <= :tomorrow AND contains(#title, :searchString)',
        ExpressionAttributeNames: {
          '#lDate': 'lDate',
          '#title': 'title'
        },
        ExpressionAttributeValues: {
          ':tomorrow': tomorrowStr,
          ':searchString': searchString
        },
        Limit: 1000,
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
      };

      console.log(`Scanning batch with lastEvaluatedKey: ${lastEvaluatedKey ? 'exists' : 'null'}`);

      const result = await dynamoDb.scan(params).promise();
      
      console.log(`Batch returned ${result.Items?.length || 0} items`);
      console.log(`Scanned count: ${result.ScannedCount}`);
      console.log(`Has more data: ${!!result.LastEvaluatedKey}`);
      
      if (result.Items) {
        allItems = allItems.concat(result.Items);
      }
      
      lastEvaluatedKey = result.LastEvaluatedKey;
      
      console.log(`Total items found so far: ${allItems.length}`);
      
      if (allItems.length >= 35) {
        console.log('Breaking early - found enough items');
        break;
      }
      
    } while (lastEvaluatedKey);

    console.log(`Final result: ${allItems.length} items found`);

    // Sort by lDate (article date) instead of createdAt
    const sortedItems = allItems
      .sort((a, b) => {
        const dateA = new Date(a.lDate);
        const dateB = new Date(b.lDate);
        return dateB.getTime() - dateA.getTime(); // Most recent article dates first
      })
      .slice(0, 35);

    return sortedItems && sortedItems.length > 0 ? JSON.stringify(sortedItems) : "NADA";

  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Error fetching news: ${error}`);
  }
};