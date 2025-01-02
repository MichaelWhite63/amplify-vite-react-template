import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

// Selects users by group. Grouping is done by type: steel, auto, aluminum
export async function selectSingleUser(userPoolId: string, email: string): Promise<CognitoIdentityServiceProvider.UserType[]> {
  return await cognito.listUsers({
    UserPoolId: userPoolId,
    Filter: `email ^= "${email}"`, // Use ^= for a prefix wildcard match
  }).promise().then((data) => data.Users || []);
}

export const handler: Schema["getUser"]["functionHandler"] = async (event) => {
  const { name } = event.arguments as { name: string };

  const user = selectSingleUser('us-east-1_oy1KeDlsD', name);
  return JSON.stringify(user);
 }