import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString } = event.arguments as { searchString: string };
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStr = today.toISOString().split('T')[0];

  try {
    const params = {
      TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
      IndexName: 'date-index',  // Ensure this matches the generated index name
      KeyConditionExpression: '#date = :today',  // Use equality condition on partition key
      FilterExpression: 'contains(#title, :searchString)',  // Additional filtering
      ExpressionAttributeNames: {
        '#date': 'date',
        '#title': 'title'
      },
      ExpressionAttributeValues: {
        ':today': todayStr,             // Define 'todayStr' as the specific date you want to query
        ':searchString': searchString
      },
      Limit: 25,
      ScanIndexForward: false    // Sorts results in descending order if a sort key is present
    };

    const result = await dynamoDb.query(params).promise();
    return JSON.stringify(result) || "NADA";

  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Error fetching news: ${error}`);
  }
};