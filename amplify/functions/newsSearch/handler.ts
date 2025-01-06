import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString } = event.arguments as { searchString: string };

  // Since we don't have a proper partition key in the index,
  // we should use scan operation instead of query
  const params = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
    FilterExpression: 'contains(#title, :searchString)',
    ExpressionAttributeNames: {
      '#title': 'title'
    },
    ExpressionAttributeValues: {
      ':searchString': searchString
    },
    Limit: 25
  };

  try {
    const data = await dynamoDb.scan(params).promise();
    return JSON.stringify(data) || "NADA";
  } catch (error) {
    throw new Error(`Error fetching news: ${error}`);
  }
};