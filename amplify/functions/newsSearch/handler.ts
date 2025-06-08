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
        // Change filter to use lDate (article date) instead of createdAt
        FilterExpression: '#lDate <= :tomorrow AND contains(#title, :searchString)',
        ExpressionAttributeNames: {
          '#lDate': 'lDate', // Changed from createdAt to lDate
          '#title': 'title'
        },
        ExpressionAttributeValues: {
          ':tomorrow': tomorrowStr, // Use YYYY-MM-DD format to match lDate
          ':searchString': searchString
        },
        Limit: 1000,
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
      };

      const result = await dynamoDb.scan(params).promise();
      
      if (result.Items) {
        allItems = allItems.concat(result.Items);
      }
      
      lastEvaluatedKey = result.LastEvaluatedKey;
      
      if (allItems.length >= 35) {
        break;
      }
      
    } while (lastEvaluatedKey && allItems.length < 35);

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