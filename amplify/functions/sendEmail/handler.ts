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

// Add this helper function before formatEmailContent
function wrapTextToWidth(text: string, maxWidth: number = 60): string {
  const lines = text.split('\n');
  return lines.map(line => {
    if (line.length <= maxWidth) return line;
    
    // Simple word-wrapping algorithm
    const words = line.split(' ');
    let result = '';
    let currentLine = '';
    
    for (const word of words) {
      if ((currentLine + word).length <= maxWidth) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        result += (result ? '\n' : '') + currentLine;
        currentLine = word;
      }
    }
    
    if (currentLine) {
      result += (result ? '\n' : '') + currentLine;
    }
    
    return result;
  }).join('\n');
}

// Enhance text formatting to create rich-looking plain text
function createEnhancedTextContent(newsItems: any[], header?: string, baseUrl: string): string {
  const separator = '─'.repeat(60);
  let textContent = '╔' + '═'.repeat(58) + '╗\n';
  textContent += '║ METAL NEWS' + ' '.repeat(47) + '║\n';
  textContent += '╚' + '═'.repeat(58) + '╝\n\n';
  
  if (header?.trim()) {
    textContent += '■ ' + header.toUpperCase() + ' ■\n';
    textContent += separator + '\n\n';
  }
  
  textContent += 'HEADLINES:\n';
  textContent += separator + '\n';
  
  newsItems.forEach((item) => {
    const fullUrl = `${baseUrl}/detail/${item.id}`;
    textContent += `• ${item.title}\n  ${fullUrl}\n\n`;
  });
  
  textContent += '\nDETAILED CONTENT:\n';
  textContent += separator + '\n\n';
  
  newsItems.forEach((item) => {
    const fullUrl = `${baseUrl}/detail/${item.id}`;
    
    // Title with underline
    textContent += `${item.title}\n`;
    textContent += '~'.repeat(Math.min(item.title.length, 60)) + '\n';
    textContent += `${fullUrl}\n\n`;
    
    // Process memo content for tables and text
    if (item.memo.includes('<table')) {
      const parts = item.memo.split(/(<table[\s\S]*?<\/table>)/);
      parts.forEach((part: string) => {
        if (part.startsWith('<table')) {
          // Format table with Unicode box drawing characters
          const rows = part.match(/<tr[^>]*>(.*?)<\/tr>/gs) || [];
          const tableData = rows.map(row => {
            const cells = row.match(/<t[dh][^>]*>(.*?)<\/t[dh]>/g) || [];
            return cells.map(cell => cell.replace(/<[^>]+>/g, '').trim());
          });
          
          if (tableData.length > 0) {
            // Calculate column widths
            const columnWidths = [];
            for (let i = 0; i < tableData[0].length; i++) {
              columnWidths[i] = Math.max(
                ...tableData.map(row => (row[i] || '').length),
                8 // Minimum width
              );
            }
            
            // Top border
            textContent += '┌';
            columnWidths.forEach((width, i) => {
              textContent += '─'.repeat(width + 2);
              textContent += (i < columnWidths.length - 1) ? '┬' : '┐\n';
            });
            
            // Header row
            if (tableData.length > 0) {
              textContent += '│';
              tableData[0].forEach((cell, i) => {
                const padding = columnWidths[i] - cell.length;
                const leftPad = Math.floor(padding / 2);
                const rightPad = padding - leftPad;
                textContent += ' ' + ' '.repeat(leftPad) + cell + ' '.repeat(rightPad) + ' │';
              });
              textContent += '\n';
              
              // Header separator
              textContent += '├';
              columnWidths.forEach((width, i) => {
                textContent += '─'.repeat(width + 2);
                textContent += (i < columnWidths.length - 1) ? '┼' : '┤\n';
              });
            }
            
            // Data rows
            for (let rowIndex = 1; rowIndex < tableData.length; rowIndex++) {
              textContent += '│';
              tableData[rowIndex].forEach((cell, colIndex) => {
                const padding = columnWidths[colIndex] - cell.length;
                
                // First column is left aligned, others are right aligned
                if (colIndex === 0) {
                  textContent += ' ' + cell + ' '.repeat(padding + 1) + '│';
                } else {
                  textContent += ' ' + ' '.repeat(padding) + cell + ' ' + '│';
                }
              });
              textContent += '\n';
            }
            
            // Bottom border
            textContent += '└';
            columnWidths.forEach((width, i) => {
              textContent += '─'.repeat(width + 2);
              textContent += (i < columnWidths.length - 1) ? '┴' : '┘\n';
            });
            
            textContent += '\n';
          }
        } else {
          // Format regular text, strip HTML tags
          const plainText = part.replace(/<[^>]+>/g, '').trim();
          if (plainText) {
            textContent += wrapTextToWidth(plainText, 60) + '\n\n';
          }
        }
      });
    } else {
      // No table in content
      const plainText = item.memo.replace(/<[^>]+>/g, '').trim();
      textContent += wrapTextToWidth(plainText, 60) + '\n\n';
    }
    
    textContent += separator + '\n\n';
  });
  
  return textContent;
}

async function formatEmailContent(newsItems: any[], header?: string): Promise<{ html: string, text: string }> {
  const logoUrl = 'https://metal-news-image.s3.us-east-1.amazonaws.com/imgMetalNewsLogoN3.gif';
  const baseUrl = 'https://main.de7wz8ekh1b3f.amplifyapp.com';
  
  let htmlContent = '<div style="font-family: Arial, sans-serif;">';
  htmlContent += `<div style="width: 50%; margin: 0 auto;">
    <div style="text-align: left; margin-bottom: 20px;">
      <img src="${logoUrl}" alt="Metal News Logo" style="width: 100%; max-width: 100%; height: auto;" />
    </div>`;
  
  let textContent = createEnhancedTextContent(newsItems, header, baseUrl);
  
  htmlContent += '<ul style="color: #191970; font-size: 12pt;">';
  
  newsItems.forEach((item) => {
    const fullUrl = `${baseUrl}/detail/${item.id}`;
    htmlContent += `<li><a href="${fullUrl}" style="color: #191970; text-decoration: none; font-weight: bold;">${item.title}</a></li>`;
  });
  
  htmlContent += '</ul>';
  
  newsItems.forEach((item) => {
    const fullUrl = `${baseUrl}/detail/${item.id}`;
    htmlContent += `<div style="margin-top: 20px;">
      <h3><a href="${fullUrl}" style="color: #191970; text-decoration: none; font-weight: bold;">${item.title}</a></h3>
      <div class="custom-content">`;

    if (item.memo.includes('<table')) {
      const parts = item.memo.split(/(<table[\s\S]*?<\/table>)/);
      parts.forEach((part: string) => {
        if (part.startsWith('<table')) {
          const firstRowMatch = part.match(/<tr[^>]*>(.*?)<\/tr>/s);
          const firstRowContent = firstRowMatch ? firstRowMatch[1] : '';
          
          const thCount = (firstRowContent.match(/<th[^>]*>/g) || []).length;
          const tdCount = (firstRowContent.match(/<td[^>]*>/g) || []).length;
          const columnCount = Math.max(thCount, tdCount);
          
          let tableWidth = '100%';
          if (columnCount <= 3) {
            tableWidth = '30%';
          } else if (columnCount <= 5) {
            tableWidth = '75%';
          } else if (columnCount <= 8) {
            tableWidth = '100%';
          }
          
          const styledTable = part
            .replace('<table', `<table style="border-collapse: collapse; width: ${tableWidth}; margin: 0;" data-columns="${columnCount}"`)
            .replace(/<th/g, '<th style="border: 1px solid #ddd; padding: 8px; background-color: #f5f5f5; text-align: center;"')
            .replace(/<td/g, (match, offset, fullString) => {
              const upToTd = fullString.substring(0, offset);
              const currentRowStart = upToTd.lastIndexOf('<tr');
              const currentRowContent = upToTd.substring(currentRowStart);
              
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
      htmlContent += `<p>${item.memo}</p>`;
    }
    htmlContent += '</div></div>';
  });
  htmlContent += '</div></div>';
  
  return { 
    html: htmlContent, 
    text: textContent 
  };
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
    const users = (email) 
      ? await selectSingleUser('us-east-1_oy1KeDlsD', email) 
      : await selectUsersByType('us-east-1_oy1KeDlsD', type);

    const newsItems = await fetchNewsItems(selectedNewsIDs);
    
    const emailContent = await formatEmailContent(newsItems, header);
    
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