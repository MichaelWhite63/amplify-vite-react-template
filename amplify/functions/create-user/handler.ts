import { type AppContext } from '@aws-amplify/backend';
import { AdminCreateUserCommandInput, CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

interface CreateUserEvent {
  arguments: {
    username: string;
    email: string;
    groups: string[];
  };
}

interface CreateUserResponse {
  success: boolean;
  message: string;
}

export const handler = async (event: CreateUserEvent, context: AppContext): Promise<CreateUserResponse> => {
  const { username, email, groups } = event.arguments;
  
  try {
    const cognito = context.amplify.auth.resources.userPool.client as CognitoIdentityProviderClient;
    
    const createUserParams: AdminCreateUserCommandInput = {
      UserPoolId: context.amplify.auth.resources.userPool.id,
      Username: username,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'true' }
      ]
    };

    await cognito.adminCreateUser(createUserParams);

    for (const group of groups) {
      await cognito.adminAddUserToGroup({
        UserPoolId: context.amplify.auth.resources.userPool.id,
        Username: username,
        GroupName: group
      });
    }

    return {
      success: true,
      message: 'User created successfully'
    };
  } catch (error: unknown) {
    console.error('Error creating user:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};
