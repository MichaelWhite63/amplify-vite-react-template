import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString } = event.arguments as { searchString: string };
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  try {
    let allItems: any[] = [];
    
    // Query each type separately using existing GSI
    const types = ['Steel', 'Auto', 'Aluminum'];
    
    for (const type of types) {
      let lastEvaluatedKey: any = undefined;
      
      do {
        const params = {
          TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
          IndexName: 'newsByTypeAndDate', // Use existing GSI that works
          KeyConditionExpression: '#type = :type',
          FilterExpression: '#lDate <= :tomorrow AND contains(#title, :searchString)',
          ExpressionAttributeNames: {
            '#type': 'type',
            '#lDate': 'lDate',
            '#title': 'title'
          },
          ExpressionAttributeValues: {
            ':type': type,
            ':tomorrow': tomorrowStr,
            ':searchString': searchString
          },
          Limit: 1000,
          ...(lastEvaluatedKey && { ExclusiveStartKey: lastEvaluatedKey })
        };

        const result = await dynamoDb.query(params).promise();
        
        if (result.Items) {
          allItems = allItems.concat(result.Items);
        }
        
        lastEvaluatedKey = result.LastEvaluatedKey;
        
      } while (lastEvaluatedKey);
    }

    console.log(`Final result: ${allItems.length} items found`);

    // Sort by lDate DESC
    const sortedItems = allItems
      .sort((a, b) => {
        const dateA = new Date(a.lDate);
        const dateB = new Date(b.lDate);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 35);

    return sortedItems && sortedItems.length > 0 ? JSON.stringify(sortedItems) : "NADA";

  } catch (error) {
    console.error('Search error:', error);
    throw new Error(`Error fetching news: ${error}`);
  }
};