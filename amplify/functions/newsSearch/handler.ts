import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString } = event.arguments as { searchString: string };

  const params = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
    IndexName: 'byDate',
    KeyConditionExpression: '#date <= :now',
    FilterExpression: 'contains(#title, :searchString)',
    ExpressionAttributeNames: {
      '#date': 'date',
      '#title': 'title'
    },
    ExpressionAttributeValues: {
      ':now': new Date().toISOString().split('T')[0],
      ':searchString': searchString
    },
    Limit: 25,
    ScanIndexForward: false // false for descending order (newest first)
  };

  try {
    const data = await dynamoDb.query(params).promise();
    return JSON.stringify(data) || "NADA";
//    return JSON.stringify(data.Items) || null;
  } catch (error) {
    throw new Error(`Error fetching news: ` + error);
  }
};