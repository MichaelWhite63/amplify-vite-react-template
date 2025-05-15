import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getUnpublishedNews = async (type: 'Steel' | 'Auto' | 'Aluminum', date: string) => {
  const params = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
    FilterExpression: '#type = :type AND #date = :date',
    ExpressionAttributeValues: { 
      ':type': type,
      ':date': date
    },
    ExpressionAttributeNames: {
      '#type': 'type',
      '#date': 'date'
    }
  };
  
  const result = await dynamoDb.scan(params).promise();
  
  // Sort the items in chronological order (oldest first)
  // Assuming each item has a 'createdAt' or timestamp field
  // If using a different field for ordering, replace 'createdAt' with that field name
  const sortedItems = result.Items?.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date).getTime();
    const dateB = new Date(b.createdAt || b.date).getTime();
    return dateA - dateB; // For chronological order (oldest to newest)
  });
  
  return sortedItems;
};

export const handler: Schema["getUnpublished"]["functionHandler"] = async (event) => {
  const { type, date } = event.arguments as { type: 'Steel' | 'Auto' | 'Aluminum', date: string };
  
  if (type === 'Steel' || type === 'Auto' || type === 'Aluminum') {
    const unpublishedNews = await getUnpublishedNews(type, date);
    return JSON.stringify(unpublishedNews);
  } else {
    throw new Error(`Invalid type: ${type}`);
  }
};