import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString } = event.arguments as { searchString: string };
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString();

  try {
    let allItems: any[] = [];
    let lastEvaluatedKey: any = undefined;
    
    do {
      const params = {
        TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
        FilterExpression: '#createdAt <= :tomorrow AND contains(#title, :searchString)',
        ExpressionAttributeNames: {
          '#createdAt': 'createdAt',
          '#title': 'title'
        },
        ExpressionAttributeValues: {
          ':tomorrow': tomorrowStr,
          ':searchString': searchString
        },
        Limit: 1000, // Process more items per batch
        ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
      };

      const result = await dynamoDb.scan(params).promise();
      
      if (result.Items) {
        allItems = allItems.concat(result.Items);
      }
      
      lastEvaluatedKey = result.LastEvaluatedKey;
      
      // Break early if we have enough results
      if (allItems.length >= 35) {
        break;
      }
      
    } while (lastEvaluatedKey && allItems.length < 35);

    // Sort by most recent first
    const sortedItems = allItems
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 35);

    return sortedItems && sortedItems.length > 0 ? JSON.stringify(sortedItems) : "NADA";

  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Error fetching news: ${error}`);
  }
};