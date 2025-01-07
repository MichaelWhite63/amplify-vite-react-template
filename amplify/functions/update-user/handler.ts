import type { Schema } from "../../data/resource";
import { 
  CognitoIdentityProviderClient, 
  AdminUpdateUserAttributesCommand,
  AdminAddUserToGroupCommand,
  AdminRemoveUserFromGroupCommand,
  AdminListGroupsForUserCommand
} from "@aws-sdk/client-cognito-identity-provider";

export const USER_POOL_ID = process.env.USER_POOL_ID || 'us-east-1_oy1KeDlsD';
export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const client = new CognitoIdentityProviderClient({ region: AWS_REGION });

async function updateCognitoUser(userPoolId: string, username: string, attributes: Record<string, string>) {
  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: userPoolId,
    Username: username,
    UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({ Name, Value }))
  });
  return await client.send(command);
}

async function updateUserGroups(userPoolId: string, username: string, newGroups: string[]) {
  const listCommand = new AdminListGroupsForUserCommand({
    UserPoolId: userPoolId,
    Username: username
  });
  const currentGroups = await client.send(listCommand);
  const currentGroupNames = (currentGroups.Groups || []).map(g => g.GroupName!);

  const groupsToAdd = newGroups.filter(g => !currentGroupNames.includes(g));
  const groupsToRemove = currentGroupNames.filter(g => !newGroups.includes(g));

  const operations = [
    ...groupsToAdd.map(groupName =>
      client.send(new AdminAddUserToGroupCommand({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: groupName
      }))
    ),
    ...groupsToRemove.map(groupName =>
      client.send(new AdminRemoveUserFromGroupCommand({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: groupName
      }))
    )
  ];

  if (operations.length > 0) {
    await Promise.all(operations);
  }
}

export const handler: Schema["updateUser"]["functionHandler"] = async (event) => {
  const { username, email, lastName, groups } = event.arguments;
  
  try {
    if (!email) {
      throw new Error('Email is required for updating user');
    }

    if (email || lastName || username) {
      const attributes: Record<string, string> = {};
      if (email) {
        attributes['email'] = email;
        //attributes['email_verified'] = 'false';
      }
      if (lastName) attributes['family_name'] = lastName;
      if (username) attributes['given_name'] = username;
      
      await updateCognitoUser('us-east-1_oy1KeDlsD', email, attributes);
    }
    /*
    if (groups) {
      await updateUserGroups('us-east-1_oy1KeDlsD', email, groups.filter((group): group is string => group !== null && group !== undefined));
    }
*/
    return JSON.stringify({ success: true, username });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}