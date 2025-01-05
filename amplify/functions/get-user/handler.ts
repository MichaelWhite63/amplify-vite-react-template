import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();
export const USER_POOL_ID = process.env.USER_POOL_ID || 'us-east-1_oy1KeDlsD';

// Selects users by group. Grouping is done by type: steel, auto, aluminum
export async function selectSingleUser(userPoolId: string, email: string): Promise<CognitoIdentityServiceProvider.UserType[]> {
  const users = await cognito.listUsers({
    UserPoolId: userPoolId,
    Filter: `email = "${email}"`,
  }).promise().then((data) => data.Users || []);

  for (const user of users) {
    const groups = await cognito.adminListGroupsForUser({
      UserPoolId: userPoolId,
      Username: user.Username as string,
    }).promise().then((res) => res.Groups || []);
    (user as any).GroupMemberships = groups.map(g => g.GroupName);
  }

  return users;
}

export const handler: Schema["getUser"]["functionHandler"] = async (event) => {
  const { name } = event.arguments as { name: string };
  const user = await selectSingleUser(USER_POOL_ID, name);
  return JSON.stringify(user);
}