import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getUnpublishedNews = async (type: 'Steel' | 'Auto' | 'Aluminum', date: string) => {
  let allItems: any[] = [];
  let lastEvaluatedKey: any = undefined;
  
  try {
    do {
      const params = {
        TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
        IndexName: 'newsByTypeAndDate', // Use the GSI for better performance
        KeyConditionExpression: '#type = :type',
        FilterExpression: '#date = :date AND #published = :published',
        ExpressionAttributeNames: {
          '#type': 'type',
          '#date': 'date',
          '#published': 'published'
        },
        ExpressionAttributeValues: { 
          ':type': type,
          ':date': date,
          ':published': false // Filter for unpublished articles
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
    
  } catch (error) {
    console.error('Error querying GSI:', error);
    throw error;
  }
  
  // Sort the items in chronological order (oldest first)
  const sortedItems = allItems.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date).getTime();
    const dateB = new Date(b.createdAt || b.date).getTime();
    return dateA - dateB; // For chronological order (oldest to newest)
  });
  
  return sortedItems;
};

export const handler: Schema["getUnpublished"]["functionHandler"] = async (event) => {
  const { type, date } = event.arguments as { type: 'Steel' | 'Auto' | 'Aluminum', date: string };
  
  try {
    if (type === 'Steel' || type === 'Auto' || type === 'Aluminum') {
      const unpublishedNews = await getUnpublishedNews(type, date);
      return JSON.stringify(unpublishedNews);
    } else {
      throw new Error(`Invalid type: ${type}`);
    }
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
};