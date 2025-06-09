import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString, date, type } = event.arguments as { 
    searchString?: string; 
    date?: string; 
    type?: 'Steel' | 'Auto' | 'Aluminum' 
  };

  try {
    let allItems: any[] = [];
    
    // Determine search type
    const isTextSearch = searchString && searchString.trim() !== '';
    const isDateSearch = date && date.trim() !== '';
    const hasTypeFilter = type && type.trim() !== '';

    // Determine which types to search
    const typesToSearch = hasTypeFilter ? [type] : ['Steel', 'Auto', 'Aluminum'];
    
    for (const searchType of typesToSearch) {
      let lastEvaluatedKey: any = undefined;
      
      do {
        const filterExpressions: string[] = [];
        const expressionAttributeNames: any = { '#type': 'type' };
        const expressionAttributeValues: any = { ':type': searchType };

        // Add date filter if specified
        if (isDateSearch) {
          filterExpressions.push('#lDate = :date');
          expressionAttributeNames['#lDate'] = 'lDate';
          expressionAttributeValues[':date'] = date;
        }

        // Add title search if specified
        if (isTextSearch) {
          filterExpressions.push('contains(#title, :searchString)');
          expressionAttributeNames['#title'] = 'title';
          expressionAttributeValues[':searchString'] = searchString;
        }

        const params = {
          TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
          IndexName: 'newsByTypeAndDate',
          KeyConditionExpression: '#type = :type',
          ...(filterExpressions.length > 0 && {
            FilterExpression: filterExpressions.join(' AND ')
          }),
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues,
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