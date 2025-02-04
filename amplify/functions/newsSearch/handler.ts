import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString } = event.arguments as { searchString: string };
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString(); // Use full ISO string with time

  try {
    
    const params = {
      TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
      // Remove IndexName as we're using Scan instead of Query
      // IndexName: 'date-title-index',
      FilterExpression: '#createdAt <= :tomorrow AND contains(#title, :searchString)',
      ExpressionAttributeNames: {
        '#createdAt': 'createdAt',     // Updated attribute name
        '#title': 'title'
      },
      ExpressionAttributeValues: {
        ':tomorrow': tomorrowStr,       // Full ISO string for tomorrow
        ':searchString': searchString
      },
      Limit: 35
    };

    const result = await dynamoDb.scan(params).promise();
    return result.Items && result.Items.length > 0 ? JSON.stringify(result.Items) : "NADA";

  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Error fetching news: ${error}`);
  }
};