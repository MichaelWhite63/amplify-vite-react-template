import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString } = event.arguments as { searchString: string };
  const today = new Date().toISOString().split('T')[0];

  try {
    const params = {
      TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
      IndexName: 'byDate',
      KeyConditionExpression: '#date <= :today',
      FilterExpression: 'contains(#title, :searchString)',
      ExpressionAttributeNames: {
        '#date': 'date',
        '#title': 'title'
      },
      ExpressionAttributeValues: {
        ':today': today,
        ':searchString': searchString
      },
      Limit: 25,
      ScanIndexForward: false // Get newest first
    };

    const result = await dynamoDb.query(params).promise();
    return JSON.stringify(result) || "NADA";

  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Error fetching news: ${error}`);
  }
};