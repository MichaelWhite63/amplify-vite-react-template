import { CognitoIdentityServiceProvider } from 'aws-sdk';
import type { Schema } from "../../data/resource";
/*
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:ListUsers",
        "cognito-idp:AdminDeleteUser"
      ],
      "Resource": [
        "arn:aws:cognito-idp:us-east-1:*:userpool/us-east-1_oy1KeDlsD"
      ]
    }
  ]
}
*/

export const handler: Schema["deleteUser"]["functionHandler"] = async (event) => {
  const { email } = event.arguments;
  
  if (!email) {
    throw new Error('Email is required.');
  }
  
  const cognitoISP = new CognitoIdentityServiceProvider({
    region: 'us-east-1',
  });

  const userPoolId = 'us-east-1_oy1KeDlsD'; // Your Cognito User Pool ID
  
  try {
    // First get the username from the email
    const listUsersResponse = await cognitoISP.listUsers({
      UserPoolId: userPoolId,
      Filter: `email = "${email}"`,
      Limit: 1
    }).promise();
    
    if (!listUsersResponse.Users || listUsersResponse.Users.length === 0) {
      throw new Error(`User with email ${email} not found.`);
    }
    
    const username = listUsersResponse.Users[0].Username;
    
    // Delete the user
    await cognitoISP.adminDeleteUser({
      UserPoolId: userPoolId,
      Username: username
    }).promise();
    
    return `User ${email} has been successfully deleted.`;
  } catch (error) {
    console.error(`Error deleting user with email ${email}:`, error);
    const typedError = error as Error;
    throw new Error(`Failed to delete user: ${typedError.message || 'Unknown error'}`);
  }
};