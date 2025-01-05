import type { Schema } from "../../data/resource";
export const USER_POOL_ID = process.env.USER_POOL_ID || 'us-east-1_oy1KeDlsD';
/*
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
}*/

export const handler: Schema["createUser"]["functionHandler"] = async (event) => {
  const { email, password } = event.arguments as { email: string; password: string };

  return (USER_POOL_ID + " " + email + " " + password);
/*
  const createUserCommand = new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,
    TemporaryPassword: password,
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
    ] as UserAttributes[],
  });

  const response: CreateUserResponse = await cognitoClient.send(createUserCommand);

  return JSON.stringify({
    message: 'User created successfully',
    username: response.User?.Username,
  });
  */
};
