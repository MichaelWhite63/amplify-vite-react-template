import type { Schema } from "../../data/resource";
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

export const handler: Schema["newsSearch"]["functionHandler"] = async (event): Promise<string | null> => {
  const { searchString, date, type } = event.arguments as { 
    searchString?: string; 
    date?: string; 
    type?: 'Steel' | 'Auto' | 'Aluminum' 
  };

  // Debug input values
  console.log('=== NEWSEARCH DEBUG START ===');
  console.log('Input parameters:', {
    searchString,
    date,
    type,
    searchStringTrimmed: searchString?.trim(),
    dateTrimmed: date?.trim(),
    typeTrimmed: type?.trim()
  });

  try {
    let allItems: any[] = [];
    
    // Determine search type
    const isTextSearch = searchString && searchString.trim() !== '';
    const isDateSearch = date && date.trim() !== '';
    const hasTypeFilter = type && type.trim() !== '';

    console.log('Search flags:', {
      isTextSearch,
      isDateSearch,
      hasTypeFilter
    });

    // Determine which types to search
    const typesToSearch = hasTypeFilter ? [type] : ['Steel', 'Auto', 'Aluminum'];
    console.log('Types to search:', typesToSearch);
    
    for (const searchType of typesToSearch) {
      console.log(`\n--- Searching type: ${searchType} ---`);
      let lastEvaluatedKey: any = undefined;
      let batchCount = 0;
      
      do {
        batchCount++;
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

        console.log(`Batch ${batchCount} query params:`, {
          IndexName: params.IndexName,
          KeyConditionExpression: params.KeyConditionExpression,
          FilterExpression: params.FilterExpression || 'none',
          ExpressionAttributeValues: params.ExpressionAttributeValues,
          hasLastEvaluatedKey: !!lastEvaluatedKey
        });

        const result = await dynamoDb.query(params).promise();
        
        console.log(`Batch ${batchCount} results:`, {
          itemsReturned: result.Items?.length || 0,
          scannedCount: result.ScannedCount || 0,
          hasMoreData: !!result.LastEvaluatedKey
        });

        // Debug first few items from this batch
        if (result.Items && result.Items.length > 0) {
          console.log('Sample items from this batch:', result.Items.slice(0, 3).map(item => ({
            id: item.id,
            title: item.title?.substring(0, 50) + '...',
            lDate: item.lDate,
            createdAt: item.createdAt,
            type: item.type
          })));
        }
        
        if (result.Items) {
          allItems = allItems.concat(result.Items);
        }
        
        lastEvaluatedKey = result.LastEvaluatedKey;
        console.log(`Running total for ${searchType}: ${allItems.length} items`);
        
      } while (lastEvaluatedKey);
      
      console.log(`Completed ${searchType}: ${batchCount} batches, found items for this type: ${allItems.length - (allItems.length || 0)}`);
    }

    console.log(`\n=== AGGREGATION ===`);
    console.log(`Total items before sorting: ${allItems.length}`);

    // Debug date range of all items
    if (allItems.length > 0) {
      const dates = allItems.map(item => item.lDate).sort();
      console.log('Date range of results:', {
        earliest: dates[0],
        latest: dates[dates.length - 1],
        uniqueDates: [...new Set(dates)].length
      });
    }

    // Sort by lDate DESC
    const sortedItems = allItems
      .sort((a, b) => {
        const dateA = new Date(a.lDate);
        const dateB = new Date(b.lDate);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 35);

    console.log(`Final result: ${sortedItems.length} items after sorting and limiting to 35`);
    
    // Debug final results
    if (sortedItems.length > 0) {
      console.log('Top 5 final results:', sortedItems.slice(0, 5).map(item => ({
        id: item.id,
        title: item.title?.substring(0, 50) + '...',
        lDate: item.lDate,
        type: item.type
      })));
    }

    console.log('=== NEWSEARCH DEBUG END ===\n');

    return sortedItems && sortedItems.length > 0 ? JSON.stringify(sortedItems) : "NADA";

  } catch (error) {
    console.error('Search error:', error);
    console.log('=== NEWSEARCH DEBUG END (ERROR) ===\n');
    throw new Error(`Error fetching news: ${error}`);
  }
};