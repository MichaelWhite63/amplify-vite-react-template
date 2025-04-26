import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

// Selects users by group. Grouping is done by type: steel, auto, aluminum
export async function queryCognito(userPoolId: string, email: string): Promise<CognitoIdentityServiceProvider.UserType[]> {
  const users = await cognito.listUsers({
    UserPoolId: userPoolId,
    Filter: `email contains "${email}"`,  // Using proper 'contains' operator
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

export const handler: Schema["searchUsers"]["functionHandler"] = async (event) => {
  const { name } = event.arguments as { name: string };
  const user = await queryCognito('us-east-1_oy1KeDlsD', name); // Add await
  return JSON.stringify(user);
}