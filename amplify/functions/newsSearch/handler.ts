import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString } = event.arguments as { searchString: string };

  const params = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
    FilterExpression: 'contains(#title, :searchString)',
    ExpressionAttributeNames: {
      '#title': 'title',
    },
    ExpressionAttributeValues: {
      ':searchString': searchString,
    },
    Limit: 25,
    ScanIndexForward: false, // To get the most recently entered rows
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    return JSON.stringify(data.Items) || "Hello World";// null;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching news');
  }
};