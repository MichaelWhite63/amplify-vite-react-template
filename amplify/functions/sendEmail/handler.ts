import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider, DynamoDB, SES } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();
const dynamodb = new DynamoDB.DocumentClient();
const ses = new SES();

// Selects users by type/group. Cognito grouping is done by type: steel, auto, aluminum
export async function selectUsersByType(userPoolId: string, groupName: string): Promise<CognitoIdentityServiceProvider.UserType[]> {

  const params = {UserPoolId: userPoolId, GroupName: groupName,};

  try {
    const data = await cognito.listUsersInGroup(params).promise();
    return data.Users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error fetching users');
  }
}

// Selects users by group. Grouping is done by type: steel, auto, aluminum
export async function selectSingleUser(userPoolId: string, email: string): Promise<CognitoIdentityServiceProvider.UserType[]> {
  const params = {
    UserPoolId: userPoolId,
    Filter: `email = "${email}"`,
  };

  try {
    const data = await cognito.listUsers(params).promise();
    return data.Users || [];
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Error fetching user');
  }
}

async function fetchNewsItems(newsIds: string[]): Promise<any[]> {
  const tableName = process.env.NEWS_TABLE_NAME || 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE';
  
  const newsItems = await Promise.all(newsIds.map(async (id) => {
    const params = {
      TableName: tableName,
      Key: { id }
    };
    
    const result = await dynamodb.get(params).promise();
    return result.Item;
  }));
  
  return newsItems.filter(item => item !== undefined);
}

async function formatEmailContent(newsItems: any[], header?: string): Promise<string> {
  let emailContent = '';
  
  // Only add header if it exists and has content
  if (header?.trim()) {
    emailContent += `${header}\n\n`;
  }
  
  emailContent += "概要:\n";
  newsItems.forEach(item => {
    emailContent += `• ${item.title}\n`;
  });
  
  // Add detailed content
  emailContent += "\n詳細:\n\n";
  newsItems.forEach(item => {
    emailContent += `${item.title}\n`;
    emailContent += `${item.memo}\n\n`;
  });
  
  return emailContent;
}

async function sendEmailToUsers(users: CognitoIdentityServiceProvider.UserType[], subject: string, content: string) {
  for (const user of users) {
    const emailAttribute = user.Attributes?.find(attr => attr.Name === 'email');
    if (emailAttribute?.Value) {
      const params = {
        Destination: {
          ToAddresses: [emailAttribute.Value]
        },
        Message: {
          Body: {
            Text: { Data: content }
          },
          Subject: { Data: subject }
        },
        Source: 'Kuromatsu@metalnews.com' // Replace with your SES verified email
      };
      
      await ses.sendEmail(params).promise();
    }
  }
}

export const handler: Schema["sendEmail"]["functionHandler"] = async (event) => {
  const { name, email, type, title, header, selectedNewsIDs } = event.arguments as { name: string, 
    email: string, 
    type: 'Steel' | 'Auto' | 'Aluminum', 
    title: string,
    header: string, 
    selectedNewsIDs: string[] };

  try {
    // Get users to send email to
    const users = (email) 
      ? await selectSingleUser('us-east-1_oy1KeDlsD', email)
      : await selectUsersByType('us-east-1_oy1KeDlsD', type);

    // Fetch news items
    const newsItems = await fetchNewsItems(selectedNewsIDs);
    
    // Format email content
    const emailContent = await formatEmailContent(newsItems, header);
    
    // Send emails
    await sendEmailToUsers(users, title, emailContent);
    
    return JSON.stringify({ 
      success: true, 
      recipientCount: users.length,
      newsCount: newsItems.length,
      users: users.map(user => user.Username),
      emailContent: emailContent
    });
    
  } catch (error) {
    console.error('Error in sendEmail:', error);
    const errorMessage = (error as any).message;
    throw new Error(`Failed to send email: ${errorMessage}`);
  }
}