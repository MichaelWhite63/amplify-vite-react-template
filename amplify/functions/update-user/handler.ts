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
  // username parameter is the original email for identification
  const { username: originalEmail, email, lastName: familyName, groups, username: givenName } = event.arguments;
  
  try {
    if (!originalEmail) {
      throw new Error('Original email is required for updating user');
    }

    const attributes: Record<string, string> = {};
    if (email) {
      attributes['email'] = email;
      attributes['email_verified'] = 'false';
    }
    if (familyName) attributes['family_name'] = familyName;
    if (givenName) attributes['given_name'] = givenName;
    
    if (Object.keys(attributes).length > 0) {
      await updateCognitoUser(USER_POOL_ID, originalEmail, attributes);
    }
    
    if (groups) {
      await updateUserGroups(USER_POOL_ID, originalEmail, groups);
    }

    return JSON.stringify({ 
      success: true, 
      email: email || originalEmail,
      familyName,
      givenName
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}