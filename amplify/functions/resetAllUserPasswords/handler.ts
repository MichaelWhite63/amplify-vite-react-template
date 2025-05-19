import { CognitoIdentityServiceProvider, SES } from 'aws-sdk';
import type { Schema } from "../../data/resource";
//import * as crypto from 'crypto';

/**
 * IAM Requirements for Mass Password Reset:
 * 
 * This Lambda function needs the following permissions:
 * - cognito-idp:ListUsers
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
 *         "cognito-idp:ListUsers",
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

// Define a configuration type for better code organization
type Config = {
  userPoolId: string;
  region: string;
  emailSource: string;
  passwordLength: number;
  batchSize: number; // For processing users in batches to avoid timeouts
};

const config: Config = {
  userPoolId: 'us-east-1_oy1KeDlsD',
  region: 'us-east-1',
  emailSource: 'Kuromatsu@metalnews.com',
  passwordLength: 12,
  batchSize: 25 // Process 25 users at a time
};

export const handler: Schema["resetAllUserPasswords"]["functionHandler"] = async (event) => {
  // Optional parameters to allow for flexibility
  const { dryRun = true } = event.arguments;
  
  // Initialize AWS clients
  const cognitoISP = new CognitoIdentityServiceProvider({
    region: config.region,
  });
  
  const ses = new SES({
    region: config.region,
  });

  try {
    // Summary stats for the operation
    const summary: {
      totalUsers: number;
      successfulResets: number;
      failedResets: { username: string; error: Error | unknown; }[];
      skippedUsers: { username: string | undefined; reason: string | undefined; }[];
    } = {
      totalUsers: 0,
      successfulResets: 0,
      failedResets: [],
      skippedUsers: []
    };

    // Get all users from Cognito
    const users = await getAllUsers(cognitoISP, config.userPoolId);
    summary.totalUsers = users.length;
    
    console.log(`Found ${users.length} users in UserPool`);
    
    // Process users in batches to avoid timeout issues
    for (let i = 0; i < users.length; i += config.batchSize) {
      const batch = users.slice(i, i + config.batchSize);
      console.log(`Processing batch ${i/config.batchSize + 1} (${batch.length} users)`);
      
      // Process each user in the batch
      const batchResults = await Promise.allSettled(
        batch.map(user => processUser(user, cognitoISP, ses, dryRun ?? true))
      );
      
      // Update summary stats
      batchResults.forEach((result, index) => {
        const user = batch[index];
        if (result.status === 'fulfilled') {
          if (result.value.action === 'reset') {
            summary.successfulResets++;
          } else if (result.value.action === 'skipped') {
            summary.skippedUsers.push({
              username: user.Username ?? 'unknown',
              reason: result.value.reason
            });
          }
        } else {
          summary.failedResets.push({
            username: user.Username!,
            error: result.reason
          });
        }
      });
    }
    
    // Return summary of operation
    return JSON.stringify({
      message: `Password reset operation completed. ${dryRun ? '(DRY RUN - No passwords were actually changed)' : ''}`,
      totalUsers: summary.totalUsers,
      successfulResets: summary.successfulResets,
      failedResets: summary.failedResets,
      skippedUsers: summary.skippedUsers
    });
    
  } catch (error) {
    console.error('Error in mass password reset operation:', error);
    const typedError = error as Error;
    throw new Error(`Failed to reset passwords: ${typedError.message || 'Unknown error'}`);
  }
};

// Helper function to get all users from Cognito
async function getAllUsers(cognitoISP: CognitoIdentityServiceProvider, userPoolId: string): Promise<CognitoIdentityServiceProvider.UserType[]> {
  let users: CognitoIdentityServiceProvider.UserType[] = [];
  let paginationToken: string | undefined;
  
  do {
    const params: CognitoIdentityServiceProvider.ListUsersRequest = {
      UserPoolId: userPoolId,
      Limit: 60 // Maximum allowed by Cognito
    };
    
    if (paginationToken) {
      params.PaginationToken = paginationToken;
    }
    
    const response = await cognitoISP.listUsers(params).promise();
    
    if (response.Users) {
      users = users.concat(response.Users);
    }
    
    paginationToken = response.PaginationToken;
  } while (paginationToken);
  
  return users;
}

// Refactor the password generation function to be simpler
function generateSimplePassword(): string {
  // Generate three random digits (0-9)
  const firstDigit = Math.floor(Math.random() * 10);
  const secondDigit = Math.floor(Math.random() * 10);
  const thirdDigit = Math.floor(Math.random() * 10);
  
  // Combine with the word "Metal"
  return `Metal${firstDigit}${secondDigit}${thirdDigit}`;
}

// Process a single user
async function processUser(
  user: CognitoIdentityServiceProvider.UserType, 
  cognitoISP: CognitoIdentityServiceProvider, 
  ses: SES,
  dryRun: boolean
): Promise<{ action: 'reset' | 'skipped', reason?: string }> {
  const username = user.Username;
  
  if (!username) {
    return { action: 'skipped', reason: 'Username is undefined' };
  }
  
  // Skip users with specific statuses if needed
  if (user.UserStatus === 'EXTERNAL_PROVIDER') {
    return { action: 'skipped', reason: 'User is from external provider' };
  }
  
  try {
    // Generate a new simple password
    const newPassword = generateSimplePassword();
    
    // Get user details to retrieve email
    const userDetails = await cognitoISP.adminGetUser({
      UserPoolId: config.userPoolId,
      Username: username
    }).promise();
    
    // Extract email from user attributes
    const emailAttribute = userDetails.UserAttributes?.find(attr => attr.Name === 'email');
    if (!emailAttribute?.Value) {
      return { action: 'skipped', reason: 'User email not found' };
    }
    
    const userEmail = emailAttribute.Value;
    
    // Skip the actual password change and email sending in dry run mode
    if (dryRun) {
      console.log(`[DRY RUN] Would reset password for ${username} (${userEmail})`);
      return { action: 'reset' };
    }
    
    // Change the password
    const params = {
      UserPoolId: config.userPoolId,
      Username: username,
      Password: newPassword,
      Permanent: true
    };
    
    await cognitoISP.adminSetUserPassword(params).promise();
    
    // Send notification email
    await sendPasswordChangeEmail(ses, userEmail, username, newPassword);
    
    console.log(`Successfully reset password for ${username} (${userEmail})`);
    return { action: 'reset' };
    
  } catch (error) {
    console.error(`Error processing user ${username}:`, error);
    throw error;
  }
}

// Send password change email
async function sendPasswordChangeEmail(
  ses: SES,
  email: string, 
  username: string, 
  newPassword: string
) {
  const subject = 'Your Metal News Password Has Been Reset';
  
  const htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #191970; color: white; padding: 10px; text-align: center; }
        .content { padding: 20px; border: 1px solid #ddd; }
        .password { background-color: #f5f5f5; padding: 10px; font-family: monospace; margin: 10px 0; font-size: 18px; letter-spacing: 1px; }
        .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
        .important { color: #cc0000; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Metal News Password Reset</h2>
        </div>
        <div class="content">
          <p>Dear ${username},</p>
          <p>As part of our security protocols, your Metal News password has been reset.</p>
          <p>Your new login credentials are:</p>
          <p><strong>Username:</strong> ${username}</p>
          <p><strong>New Password:</strong></p>
          <div class="password">${newPassword}</div>
          <p class="important">Please save this password in a secure location and log in as soon as possible.</p>
          <p>After logging in, you may change your password from the account settings if desired.</p>
          <p>If you have any questions, please contact the system administrator.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Metal News. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `
    Metal News Password Reset
    
    Dear ${username},
    
    As part of our security protocols, your Metal News password has been reset.
    
    Your new login credentials are:
    Username: ${username}
    New Password: ${newPassword}
    
    Please save this password in a secure location and log in as soon as possible.
    After logging in, you may change your password from the account settings if desired.
    
    If you have any questions, please contact the system administrator.
    
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
    Source: config.emailSource
  };
  
  return ses.sendEmail(params).promise();
}