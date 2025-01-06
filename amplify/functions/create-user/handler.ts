//import type { Schema } from "../../data/resource";
import type { AppSyncResolverHandler } from 'aws-lambda';
export const USER_POOL_ID = process.env.USER_POOL_ID || 'us-east-1_oy1KeDlsD';

import { AdminCreateUserCommand } from '@aws-sdk/client-cognito-identity-provider';
import { cognitoClient } from './resource';

interface UserAttributes {
  Name: string;
  Value: string;
}

interface CreateUserResponse {
  User?: {
    Username?: string;
  };
}
/*
interface CreateUserResult {
  message: string;
  username: string;  // Remove optional modifier to match schema
  email: string;
  groups: string[];
}
*/
export const handler: AppSyncResolverHandler<{ username?: string; email?: string; groups?: string[] }, 
  { message: string; username: string; email: string; groups: string[] }> = async (event) => {
  const { email, username, groups } = event.arguments as { 
    email: string; 
    username: string;
    groups: string[];
  };

  // Validate username
  if (!username || username.length < 1) {
    throw new Error('Username is required');
  }
  if (!/^[\w-]+$/.test(username)) {
    throw new Error('Username can only contain alphanumeric characters and hyphens');
  }

  const createUserCommand = new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,  // User name 
    TemporaryPassword: "kuro",
    MessageAction: 'SUPPRESS',
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'email_verified',
        Value: 'true',
      },
      {
        Name: 'custom:groups',  // Store groups as a custom attribute
        Value: groups.join(','),
      }
    ] as UserAttributes[],
  });

  try {
    const response: CreateUserResponse = await cognitoClient.send(createUserCommand);
    
    // Return object directly instead of using JSON.stringify
    return {
      message: 'User created successfully',
      username: response.User?.Username || username,
      email: email,
      groups: groups
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error; // Throw the original error for better debugging
  }
};
