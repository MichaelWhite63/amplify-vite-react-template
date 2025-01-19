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

async function formatEmailContent(newsItems: any[], header?: string): Promise<{ html: string, text: string }> {
  // Replace this URL with your actual S3 public URL for the logo
  const logoUrl = 'https://metal-news-image.s3.us-east-1.amazonaws.com/imgMetalNewsLogoN3.gif';
  
  let htmlContent = '<div style="font-family: Arial, sans-serif;">';
  // Add logo at the top with full width
  htmlContent += `<div style="text-align: center; margin-bottom: 20px;">
    <img src="${logoUrl}" alt="Metal News Logo" style="width: 100%; max-width: 100%; height: auto;" />
  </div>`;
  
  let textContent = 'METAL NEWS\n\n'; // Text version header
  
  if (header?.trim()) {
    htmlContent += `<h2>${header}</h2>`;
    textContent += `${header}\n\n`;
  }
  
  // Summary section with bullet points restored
  htmlContent += '<h3>概要:</h3><ul style="color: #2c5282; font-size: 12pt;">';
  textContent += "概要:\n";
  
  newsItems.forEach(item => {
    htmlContent += `<li style="margin-bottom: 8px; font-size: 12pt;">${item.title}</li>`;
    textContent += `• ${item.title}\n`;
  });
  
  htmlContent += '</ul>';
  
  // Details section - larger title (14pt)
  htmlContent += '<h3>詳細:</h3>';
  textContent += "\n詳細:\n\n";
  
  newsItems.forEach(item => {
    htmlContent += `<div style="margin-bottom: 20px;">
      <div style="color: #2c5282; font-size: 14pt; margin-bottom: 8px;">${item.title}</div>
      <div style="font-size: 12pt;">${item.memo}</div>
    </div>`;
    
    textContent += `${item.title}\n${item.memo}\n\n`;
  });
  
  htmlContent += '</div>';
  
  return { html: htmlContent, text: textContent };
}

async function sendEmailToUsers(users: CognitoIdentityServiceProvider.UserType[], subject: string, content: { html: string, text: string }) {
  for (const user of users) {
    const emailAttribute = user.Attributes?.find(attr => attr.Name === 'email');
    if (emailAttribute?.Value) {
      const params = {
        Destination: {
          ToAddresses: [emailAttribute.Value]
        },
        Message: {
          Body: {
            Html: { 
              Data: content.html,
              Charset: 'UTF-8'
            },
            Text: { 
              Data: content.text,
              Charset: 'UTF-8'
            }
          },
          Subject: { 
            Data: subject,
            Charset: 'UTF-8'
          }
        },
        Source: 'Kuromatsu@metalnews.com' 
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