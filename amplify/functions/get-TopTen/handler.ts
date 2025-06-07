import { integer } from "aws-sdk/clients/cloudfront";
import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getTopTenArticles = async (type: 'Steel' | 'Auto' | 'Aluminum', count: number) => {
  // Temporarily remove the type filter to see ALL dates
  const params = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
    // Comment out the filter to see all records
    // FilterExpression: '#type = :type',
    // ExpressionAttributeValues: { ':type': type },
    // ExpressionAttributeNames: { '#type': 'type' }
  };
  const result = await dynamoDb.scan(params).promise();
  
  console.log(`Found ${result.Items?.length || 0} items for type: ${type}`);
  
  if (!result.Items || result.Items.length === 0) {
    return [];
  }

  // Debug: Log some sample lDate values
  console.log('Sample lDate values:', result.Items.slice(0, 5).map(item => ({
    id: item.id,
    lDate: item.lDate,
    parsedDate: new Date(item.lDate).toISOString(),
    isValidDate: !isNaN(new Date(item.lDate).getTime())
  })));

  // Add this before sorting to see all dates
  const allDates = result.Items.map(item => item.lDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime(); // Date sorting, newest first
  });
  console.log('All unique lDate values (date sorted):', [...new Set(allDates)]);
  console.log('Date range:', allDates[0], 'to', allDates[allDates.length - 1]);

  const sortedItems = result.Items.sort((a, b) => {
    const dateA = new Date(a.lDate);
    const dateB = new Date(b.lDate);
    
    // Debug: Log invalid dates
    if (isNaN(dateA.getTime())) {
      console.log(`Invalid dateA: ${a.lDate} for item:`, a.id);
    }
    if (isNaN(dateB.getTime())) {
      console.log(`Invalid dateB: ${b.lDate} for item:`, b.id);
    }
    
    const dateDiff = dateB.getTime() - dateA.getTime();
    
    if (dateDiff !== 0) {
      return dateDiff;
    }
    
    const createdAtA = new Date(a.createdAt);
    const createdAtB = new Date(b.createdAt);
    return createdAtA.getTime() - createdAtB.getTime();
  });
  
  // Debug: Log the top results
  console.log('Top 3 sorted results:', sortedItems.slice(0, 3).map(item => ({
    id: item.id,
    lDate: item.lDate,
    createdAt: item.createdAt
  })));
  
  // Add this to see what types exist for June 2025
  const june2025Records = result.Items?.filter(item => 
    item.lDate && item.lDate.startsWith('2025-06')
  );
  console.log('June 2025 records found:', june2025Records?.map(item => ({
    id: item.id,
    lDate: item.lDate,
    type: item.type
  })));
  
  return sortedItems.slice(0, count);
};

// Test the specific format
console.log('Date parsing test:');
console.log(new Date('2025-06-03')); // Should work fine
console.log(new Date('2025-05-28')); // Should work fine

export const handler: Schema["getTopTen"]["functionHandler"] = async (event) => {
  const { type, count = 10 } = event.arguments as { type: 'Steel' | 'Auto' | 'Aluminum', count: integer };
  const actualCount = count ?? 10;
  
  if (type === 'Steel' || type === 'Auto' || type === 'Aluminum') {
    const topTen = await getTopTenArticles(type, actualCount);
    return JSON.stringify(topTen);
  } else {
    throw new Error(`Invalid type: ${type}`);
  }
};