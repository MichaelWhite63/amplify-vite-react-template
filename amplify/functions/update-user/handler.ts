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

//const VALID_GROUPS = ['Steel', 'Auto', 'Aluminum', '鉄鋼', '自動車', 'アルミ'];
const VALID_GROUPS = ['Steel', 'Auto', 'Aluminum'];
const MAX_RETRIES = 3;

async function updateUserGroups(userPoolId: string, username: string, newGroups: string[]) {
  // Validate groups
  const invalidGroups = newGroups.filter(g => !VALID_GROUPS.includes(g));
  if (invalidGroups.length > 0) {
    throw new Error(`Invalid groups: ${invalidGroups.join(', ')}`);
  }

  const listCommand = new AdminListGroupsForUserCommand({
    UserPoolId: userPoolId,
    Username: username
  });
  
  const currentGroups = await client.send(listCommand);
  const currentGroupNames = (currentGroups.Groups || []).map(g => g.GroupName!);

  const groupsToAdd = newGroups.filter(g => !currentGroupNames.includes(g));
  const groupsToRemove = currentGroupNames.filter(g => !newGroups.includes(g));

  const results = await Promise.allSettled([
    ...groupsToAdd.map(async groupName => {
      let lastError;
      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          await client.send(new AdminAddUserToGroupCommand({
            UserPoolId: userPoolId,
            Username: username,
            GroupName: groupName
          }));
          return { success: true, group: groupName, operation: 'add' };
        } catch (error) {
          lastError = error;
          if (i < MAX_RETRIES - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
      }
      throw lastError;
    }),
    ...groupsToRemove.map(async groupName => {
      let lastError;
      for (let i = 0; i < MAX_RETRIES; i++) {
        try {
          await client.send(new AdminRemoveUserFromGroupCommand({
            UserPoolId: userPoolId,
            Username: username,
            GroupName: groupName
          }));
          return { success: true, group: groupName, operation: 'remove' };
        } catch (error) {
          lastError = error;
          if (i < MAX_RETRIES - 1) await new Promise(r => setTimeout(r, 1000 * (i + 1)));
        }
      }
      throw lastError;
    })
  ]);

  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    const errors = failures.map(f => (f as PromiseRejectedResult).reason).join(', ');
    throw new Error(`Failed to update some groups: ${errors}`);
  }

  return results;
}

export const handler: Schema["updateUser"]["functionHandler"] = async (event) => {
  // Match the arguments defined in resource.ts
  const { username: originalEmail, email, familyName, givenName, groups } = event.arguments;
  
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
      await updateUserGroups(USER_POOL_ID, originalEmail, groups.filter((group): group is string => group !== null));
    }

    return JSON.stringify({ 
      success: true, 
      email: email || originalEmail,
      familyName,
      givenName
    });
  } catch (error) {
    console.error('Error updating user:', error);
    throw new Error('Error updating user:' + error);
  }
}