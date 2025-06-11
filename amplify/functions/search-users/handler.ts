import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

export async function queryCognito(userPoolId: string, searchString: string): Promise<CognitoIdentityServiceProvider.UserType[]> {
  let allUsers: CognitoIdentityServiceProvider.UserType[] = [];
  let paginationToken: string | undefined;
  
  console.log(`Searching for users with email containing: ${searchString}`);

  try {
    // Use Cognito's filter instead of client-side filtering
    const response = await cognito.listUsers({
      UserPoolId: userPoolId,
      Filter: `email ^= "${searchString}"`, // Server-side prefix filter
      Limit: 60 // Cognito's max per request
    }).promise();

    const users = response.Users || [];
    console.log(`Found ${users.length} users with prefix filter`);

    // If no results with prefix, try broader search with pagination
    if (users.length === 0) {
      console.log('No prefix matches, trying broader search...');
      
      do {
        const broadResponse = await cognito.listUsers({
          UserPoolId: userPoolId,
          PaginationToken: paginationToken,
          Limit: 60
        }).promise();

        if (broadResponse.Users) {
          // Filter for email contains (case-insensitive)
          const matchingUsers = broadResponse.Users.filter(user => {
            const emailAttr = user.Attributes?.find(attr => attr.Name === 'email');
            return emailAttr?.Value?.toLowerCase().includes(searchString.toLowerCase());
          });
          
          allUsers = [...allUsers, ...matchingUsers];
        }

        paginationToken = broadResponse.PaginationToken;
        
        // Break early if we find enough matches
        if (allUsers.length >= 10) {
          console.log('Found enough matches, stopping pagination');
          break;
        }
        
      } while (paginationToken);
    } else {
      allUsers = users;
    }

    console.log(`Total matching users found: ${allUsers.length}`);

    // Fetch groups for matching users with rate limiting
    const usersWithGroups = await Promise.all(
      allUsers.slice(0, 20).map(async (user, index) => { // Limit to first 20 users
        if (!user.Username) return user;
        
        try {
          // Add delay to prevent rate limiting
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 100)); // 100ms delay
          }
          
          const groups = await cognito.adminListGroupsForUser({
            UserPoolId: userPoolId,
            Username: user.Username
          }).promise();

          (user as any).GroupMemberships = groups.Groups?.map(g => g.GroupName) || [];
          return user;
        } catch (error) {
          console.error(`Error fetching groups for user ${user.Username}:`, error);
          (user as any).GroupMemberships = [];
          return user;
        }
      })
    );

    return usersWithGroups;

  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
}

export const handler: Schema["searchUsers"]["functionHandler"] = async (event) => {
  const { name } = event.arguments as { name: string };
  
  try {
    const users = await queryCognito('us-east-1_oy1KeDlsD', name);
    console.log(`Returning ${users.length} users`);
    return JSON.stringify(users);
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
}