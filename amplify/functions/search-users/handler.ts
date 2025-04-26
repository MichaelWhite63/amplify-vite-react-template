import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';


const cognito = new CognitoIdentityServiceProvider();
/*
// Selects users by group. Grouping is done by type: steel, auto, aluminum
export async function queryCognito(userPoolId: string, email: string): Promise<CognitoIdentityServiceProvider.UserType[]> {
  const users = await cognito.listUsers({
    UserPoolId: userPoolId,
    Filter: `email ^=  "${email}"`, // Start with email
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
*/
export async function queryCognito(userPoolId: string, searchString: string): Promise<CognitoIdentityServiceProvider.UserType[]> {
  let allUsers: CognitoIdentityServiceProvider.UserType[] = [];
  let paginationToken: string | undefined;

  // 1. Fetch ALL users with pagination
  do {
    const response = await cognito.listUsers({
      UserPoolId: userPoolId,
      PaginationToken: paginationToken
    }).promise();

    allUsers = [...allUsers, ...(response.Users || [])];
    paginationToken = response.PaginationToken;
  } while (paginationToken);

  // 2. Client-side filtering for email contains
  const filteredUsers = allUsers.filter(user => {
    const emailAttr = user.Attributes?.find(attr => attr.Name === 'email');
    return emailAttr?.Value?.toLowerCase().includes(searchString.toLowerCase());
  });

  // 3. Fetch groups for matching users in parallel
  await Promise.all(filteredUsers.map(async (user) => {
    if (!user.Username) return;
    
    const groups = await cognito.adminListGroupsForUser({
      UserPoolId: userPoolId,
      Username: user.Username
    }).promise().then(res => res.Groups || []);

    (user as any).GroupMemberships = groups.map(g => g.GroupName);
  }));

  return filteredUsers;
}

export const handler: Schema["searchUsers"]["functionHandler"] = async (event) => {
  const { name } = event.arguments as { name: string };
  const user = await queryCognito('us-east-1_oy1KeDlsD', name); // Add await
  return JSON.stringify(user);
}