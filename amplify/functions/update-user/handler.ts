import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

async function updateCognitoUser(userPoolId: string, username: string, attributes: Record<string, string>) {
  return await cognito.adminUpdateUserAttributes({
    UserPoolId: userPoolId,
    Username: username,
    UserAttributes: Object.entries(attributes).map(([Name, Value]) => ({ Name, Value }))
  }).promise();
}

async function updateUserGroups(userPoolId: string, username: string, newGroups: string[]) {
  // Get current group memberships
  const currentGroups = await cognito.adminListGroupsForUser({
    UserPoolId: userPoolId,
    Username: username
  }).promise();

  const currentGroupNames = (currentGroups.Groups || []).map(g => g.GroupName!);
  
  // Calculate groups to add and remove
  const groupsToAdd = newGroups.filter(g => !currentGroupNames.includes(g));
  const groupsToRemove = currentGroupNames.filter(g => !newGroups.includes(g));

  const operations = [
    ...groupsToAdd.map(groupName =>
      cognito.adminAddUserToGroup({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: groupName
      }).promise()
    ),
    ...groupsToRemove.map(groupName =>
      cognito.adminRemoveUserFromGroup({
        UserPoolId: userPoolId,
        Username: username,
        GroupName: groupName
      }).promise()
    )
  ];

  if (operations.length > 0) {
    await Promise.all(operations);
  }
}

export const handler: Schema["updateUser"]["functionHandler"] = async (event) => {
  const { username, attributes, groups } = event.arguments as { 
    username: string, 
    attributes?: Record<string, string>,
    groups?: string[]
  };
  
  try {
    if (attributes) {
      await updateCognitoUser('us-east-1_oy1KeDlsD', username, attributes);
    }
    
    if (groups) {
      await updateUserGroups('us-east-1_oy1KeDlsD', username, groups);
    }

    return JSON.stringify({ success: true, username });
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
}