import { integer } from "aws-sdk/clients/cloudfront";
import type { Schema } from "../../data/resource"
import { DynamoDB } from 'aws-sdk';

const dynamoDb = new DynamoDB.DocumentClient();

const getTopTenArticles = async (type: 'Steel' | 'Auto' | 'Aluminum', count: number) => {
  const params = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
    FilterExpression: '#type = :type',
    ExpressionAttributeValues: { ':type': type },
    ExpressionAttributeNames: { '#type': 'type' }
  };
  const result = await dynamoDb.scan(params).promise();
  
  console.log(`Found ${result.Items?.length || 0} items for type: ${type}`);
  
  if (!result.Items || result.Items.length === 0) {
    return [];
  }

  // Debug: Check for June 2025 articles before sorting using createdAt
  const june2025Articles = result.Items.filter(item => {
    if (!item.createdAt) return false;
    const createdDate = new Date(item.createdAt);
    return createdDate.getFullYear() === 2025 && createdDate.getMonth() === 5; // Month is 0-indexed, so 5 = June
  });
  console.log(`Found ${june2025Articles.length} June 2025 articles (by createdAt) before sorting`);

  // Debug: Check for articles created after May 28, 2025 using createdAt
  const recentArticles = result.Items.filter(item => {
    if (!item.createdAt) return false;
    const createdDate = new Date(item.createdAt);
    const cutoffDate = new Date('2025-05-28T00:00:00+00:00');
    return createdDate > cutoffDate;
  });
  console.log(`Found ${recentArticles.length} articles created after May 28, 2025 (by createdAt)`);

  // Debug: Log some sample lDate values
  console.log('Sample lDate values:', result.Items.slice(0, 5).map(item => ({
    id: item.id,
    lDate: item.lDate,
    parsedDate: new Date(item.lDate).toISOString(),
    isValidDate: !isNaN(new Date(item.lDate).getTime())
  })));

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
  
  // Debug: Log the top results after sorting
  console.log('Top 10 sorted results:', sortedItems.slice(0, 10).map(item => ({
    id: item.id,
    lDate: item.lDate,
    createdAt: item.createdAt
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