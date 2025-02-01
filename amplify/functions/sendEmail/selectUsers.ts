import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

export async function selectUsers(userPoolId: string): Promise<CognitoIdentityServiceProvider.UserType[]> {
  const params = {
    UserPoolId: userPoolId,
  };

  try {
    const data = await cognito.listUsers(params).promise();
    return data.Users || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Error fetching users');
  }
}
