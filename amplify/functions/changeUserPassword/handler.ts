import { CognitoIdentityServiceProvider } from 'aws-sdk';
import type { Schema } from "../../data/resource";

/**
 * IAM Requirements for Password Change:
 * 
 * This Lambda function needs the following permissions:
 * - cognito-idp:AdminSetUserPassword
 * 
 * Add the following to the function's IAM role:
 * {
 *   "Version": "2012-10-17",
 *   "Statement": [
 *     {
 *       "Effect": "Allow",
 *       "Action": "cognito-idp:AdminSetUserPassword",
 *       "Resource": "arn:aws:cognito-idp:us-east-1:*:userpool/us-east-1_oy1KeDlsD"
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

  const userPoolId = 'us-east-1_oy1KeDlsD'; // Your Cognito User Pool ID
  
  try {
    const params = {
      UserPoolId: userPoolId,
      Username: username,
      Password: password,
      Permanent: true
    };
    
    await cognitoISP.adminSetUserPassword(params).promise();
    
    return `Password for user ${username} has been successfully changed.`;
  } catch (error) {
    console.error(`Error changing password for user ${username}:`, error);
    // Improve error typing
    const typedError = error as Error;
    throw new Error(`Failed to change password: ${typedError.message || 'Unknown error'}`);
  }
};
