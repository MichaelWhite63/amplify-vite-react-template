import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString } = event.arguments as { searchString: string};

  const params = {
    TableName: 'News',
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
    return JSON.stringify(data.Items) || null;
  } catch (error) {
    console.error(error);
    throw new Error('Error fetching news');
  }
};