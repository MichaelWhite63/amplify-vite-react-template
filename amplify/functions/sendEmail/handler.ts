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
  const logoUrl = 'https://metal-news-image.s3.us-east-1.amazonaws.com/imgMetalNewsLogoN3.gif';
  const baseUrl = 'https://main.de7wz8ekh1b3f.amplifyapp.com';
  
  let htmlContent = '<div style="font-family: Arial, sans-serif;">';
  htmlContent += `<div style="width: 60%; margin: 0 auto;">
    <div style="text-align: left; margin-bottom: 20px;">
      <img src="${logoUrl}" alt="Metal News Logo" style="width: 100%; max-width: 100%; height: auto;" />
    </div>`;
  
  let textContent = 'METAL NEWS\n\n';
  
  if (header?.trim()) {
    htmlContent += `<h2>${header}</h2>`;
    textContent += `${header}\n\n`;
  }
  
  htmlContent += '<ul style="color: #191970; font-size: 12pt;">';
  
  newsItems.forEach((item) => {
    const fullUrl = `${baseUrl}/detail/${item.id}`;
    htmlContent += `<li><a href="${fullUrl}" style="color: #191970; text-decoration: none; font-weight: bold;">${item.title}</a></li>`;
    textContent += `• ${item.title} (${fullUrl})\n\n`;
  });
  
  htmlContent += '</ul>';
  
  newsItems.forEach((item) => {
    const fullUrl = `${baseUrl}/detail/${item.id}`;
    htmlContent += `<div style="margin-top: 20px;">
      <h3><a href="${fullUrl}" style="color: #191970; text-decoration: none; font-weight: bold;">${item.title}</a></h3>
      <div class="custom-content">`;

    // Split memo content if it contains a table
    if (item.memo.includes('<table')) {
      const parts = item.memo.split(/(<table[\s\S]*?<\/table>)/);
      parts.forEach((part: string) => {
        if (part.startsWith('<table')) {
          // Get first row content including both header and data cells
          const firstRowMatch = part.match(/<tr[^>]*>(.*?)<\/tr>/s);
          const firstRowContent = firstRowMatch ? firstRowMatch[1] : '';
          
          // Count both th and td cells in first row
          const thCount = (firstRowContent.match(/<th[^>]*>/g) || []).length;
          const tdCount = (firstRowContent.match(/<td[^>]*>/g) || []).length;
          const columnCount = Math.max(thCount, tdCount);
          
          console.log('Table analysis:', {
            firstRowContent,
            thCount,
            tdCount,
            columnCount
          });
          
          // Set width based on column count
          let tableWidth = '100%';
          if (columnCount <= 3) {
            tableWidth = '30%';
          } else if (columnCount <= 5) {
            tableWidth = '75%';
          } else if (columnCount <= 8) {
            tableWidth = '100%';
          }
          
          // Apply table styling with correct width
          const styledTable = part
            .replace('<table', `<table style="border-collapse: collapse; width: ${tableWidth}; margin: 0;" data-columns="${columnCount}"`)
            .replace(/<th/g, '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5; text-align: center;"')
            .replace(/<td/g, (match, offset, fullString) => {
              // Get current row's content
              const upToTd = fullString.substring(0, offset);
              const currentRowStart = upToTd.lastIndexOf('<tr');
              const currentRowContent = upToTd.substring(currentRowStart);
              
              // Count complete <td> tags before this one in the current row
              const tdBeforeCount = (currentRowContent.match(/<td[\s>]/g) || []).length;
              
              const isFirstRow = !upToTd.substring(0, currentRowStart).includes('</tr');
              const isFirstColumn = tdBeforeCount === 0;
              
              let style = 'border: 1px solid #ddd; padding: 8px;';
              if (isFirstRow || isFirstColumn) {
                style += ' background-color: #f0f0f0; text-align: center;';
              } else {
                style += ' text-align: right;';
              }
              
              return `<td style="${style}"`;
            });
          htmlContent += styledTable;
        } else {
          htmlContent += part;
        }
      });
    } else {
      // No table in content, display as regular text
      htmlContent += `<p>${item.memo}</p>`;
    }
    htmlContent += '</div></div>';
    textContent += `\n${item.memo}\n\n`;
  });
  htmlContent += '</div></div>';
  
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

/**
 * 
 * @param event 
 * @returns 
 */
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