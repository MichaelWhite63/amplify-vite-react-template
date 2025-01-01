import type { Schema } from "../../data/resource"
//import { DynamoDB } from 'aws-sdk';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();
//    const data = await cognito.listUsers(params).promise();

// Selects users by group. Grouping is done by type: steel, auto, aluminum
export async function selectUsers(userPoolId: string, groupName: string): Promise<CognitoIdentityServiceProvider.UserType[]> {

  const params = {UserPoolId: userPoolId,GroupName: groupName,};

  try {
    const data = await cognito.listUsersInGroup(params).promise();
    return data.Users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error fetching users');
  }
}

/*
const dynamoDb = new DynamoDB.DocumentClient();

// Selecting unpublished news. It is likely that being published or not
// is not important. If it is important, we can add a filter for it.
const getUnpublishedNews = async (type: 'Steel' | 'Auto' | 'Aluminum') => {
  const params = {
    TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
    FilterExpression: 'published = :published AND #type = :type',
    ExpressionAttributeValues: { 
      ':published': false,
      ':type': type
    },
    ExpressionAttributeNames: {
      '#type': 'type'
    }
  };
  const result = await dynamoDb.scan(params).promise();
  return result.Items;
};

const publishNews = async (newsIds: string[]) => {
  const updatePromises = newsIds.map(id => {
    const params = {
      TableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
      Key: { id },
      UpdateExpression: 'set published = :published',
      ExpressionAttributeValues: { ':published': true }
    };
    return dynamoDb.update(params).promise();
  });

  await Promise.all(updatePromises);
};
*/
export const handler: Schema["sendEmail"]["functionHandler"] = async (event) => {
  // arguments typed from `.arguments()`
  const { name, type, email, title, selectedNews } = event.arguments as { name: string, email: string, title: string,
    type: 'Steel' | 'Auto' | 'Aluminum', selectedNews: string[] };
  
  if (type === 'Steel' || type === 'Auto' || type === 'Aluminum') {
    //const unpublishedNews = await getUnpublishedNews(type);
/*
    if (unpublishedNews) {
      const newsIds = unpublishedNews.map(news => news.id);
      await publishNews(newsIds);
    }
    */
    const users = await selectUsers('us-east-1_oy1KeDlsD', type); 
    
    return JSON.stringify(users);
    // return typed from `.returns()`
//    return `Hello, ${name}! Unpublished ${type} news count: ${unpublishedNews ? unpublishedNews.length : 0} | type: ${type}`;
  } else {
    throw new Error(`Invalid type: ${type} | name : ${name}`);
  } 

 }