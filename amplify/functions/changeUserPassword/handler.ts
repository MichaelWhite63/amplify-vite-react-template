import { CognitoIdentityServiceProvider, SES } from 'aws-sdk';
import type { Schema } from "../../data/resource";

/**
 * IAM Requirements for Password Change:
 * 
 * This Lambda function needs the following permissions:
 * - cognito-idp:AdminSetUserPassword
 * - cognito-idp:AdminGetUser
 * - ses:SendEmail
 * 
 * Add the following to the function's IAM role:
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Effect": "Allow",
 *       "Action": [
 *         "cognito-idp:AdminSetUserPassword",
 *         "cognito-idp:AdminGetUser",
 *         "ses:SendEmail"
 *       ],
 *       "Resource": [
 *         "arn:aws:cognito-idp:us-east-1:*:userpool/us-east-1_oy1KeDlsD",
 *         "*"
 *       ]
 *     }
 *   ]
 * }
 */

export const handler: Schema["changeUserPassword"]["functionHandler"] = async (event) => {
  const { username, password } = event.arguments;
  
  if (!username || !password) {
    throw new Error('Username and password are required.');
  }
  
  const cognitoISP = new CognitoIdentityServiceProvider({
    region: 'us-east-1',
  });
  
  const ses = new SES({
    region: 'us-east-1',
  });

  const userPoolId = 'us-east-1_oy1KeDlsD'; // Your Cognito User Pool ID
  
  try {
    // First, get user details to retrieve email
    const userDetails = await cognitoISP.adminGetUser({
      UserPoolId: userPoolId,
      Username: username
    }).promise();
    
    // Extract email from user attributes
    const emailAttribute = userDetails.UserAttributes?.find(attr => attr.Name === 'email');
    if (!emailAttribute?.Value) {
      throw new Error('User email not found');
    }
    
    const userEmail = emailAttribute.Value;
    
    // Change the password
    const params = {
      UserPoolId: userPoolId,
      Username: username,
      Password: password,
      Permanent: true
    };
    
    await cognitoISP.adminSetUserPassword(params).promise();
    
    // Send notification email
    await sendPasswordChangeEmail(ses, userEmail, username, password);
    
    return `Password for user ${username} has been successfully changed and notification email sent.`;
  } catch (error) {
    console.error(`Error changing password for user ${username}:`, error);
    // Improve error typing
    const typedError = error as Error;
    throw new Error(`Failed to change password: ${typedError.message || 'Unknown error'}`);
  }
};

async function sendPasswordChangeEmail(
  ses: SES,
  email: string, 
  username: string, 
  newPassword: string
) {
  const subject = 'Your Metal News Password Has Been Changed';
  
  const htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #191970; color: white; padding: 10px; text-align: center; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .password { background-color: #f5f5f5; padding: 10px; font-family: monospace; margin: 10px 0; }
        .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Metal News Password Change Notification</h2>
        </div>
        <div class="content">
          <p>Dear ${username},</p>
          <p>Your password for the Metal News platform has been changed.</p>
          <p>Your new login credentials are:</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>New Password:</strong></p>
          <div class="password">${newPassword}</div>
          <p>Please keep this information secure. We recommend logging in as soon as possible.</p>
          <p>If you did not request this password change, please contact the system administrator immediately.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Metal News. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
    Metal News Password Change Notification
    
    Dear ${username},
    
    Your password for the Metal News platform has been changed.
    
    Your new login credentials are:
    Username: ${username}
    New Password: ${newPassword}
    
    Please keep this information secure. We recommend logging in as soon as possible.
    
    If you did not request this password change, please contact the system administrator immediately.
    
    © ${new Date().getFullYear()} Metal News. All rights reserved.
  `;
  
  const params = {
    Destination: {
      ToAddresses: [email]
    },
    Message: {
      Body: {
        Html: { 
          Data: htmlContent,
          Charset: 'UTF-8'
        },
        Text: { 
          Data: textContent,
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
  
  return ses.sendEmail(params).promise();
}