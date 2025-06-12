import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

export async function queryCognito(
  userPoolId: string, 
  searchString: string,
  pageSize: number = 20,
  startToken?: string
): Promise<{users: CognitoIdentityServiceProvider.UserType[], nextToken?: string}> {
  
  console.log(`Fetching users: search="${searchString}", pageSize=${pageSize}`);

  try {
    const isEmptySearch = !searchString || searchString.trim() === '';
    
    if (isEmptySearch) {
      // Return paginated results for all users
      const response = await cognito.listUsers({
        UserPoolId: userPoolId,
        PaginationToken: startToken,
        Limit: pageSize // Use requested page size
      }).promise();

      const users = response.Users || [];
      
      // Fetch groups for this page only
      const usersWithGroups = await Promise.all(
        users.map(async (user, index) => {
          if (!user.Username) return user;
          
          try {
            if (index > 0) {
              await new Promise(resolve => setTimeout(resolve, 50));
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

      return {
        users: usersWithGroups,
        nextToken: response.PaginationToken
      };
      
    } else {
      // Existing search logic - return all matches since searches are typically smaller
      const response = await cognito.listUsers({
        UserPoolId: userPoolId,
        Filter: `email ^= "${searchString}"`,
        Limit: 60
      }).promise();

      const users = response.Users || [];
      console.log(`Found ${users.length} users with prefix filter`);

      if (users.length === 0) {
        console.log('No prefix matches, trying broader search...');
        
        let allUsers: CognitoIdentityServiceProvider.UserType[] = [];
        let paginationToken: string | undefined;

        do {
          const broadResponse = await cognito.listUsers({
            UserPoolId: userPoolId,
            PaginationToken: paginationToken,
            Limit: 60
          }).promise();

          if (broadResponse.Users) {
            const matchingUsers = broadResponse.Users.filter(user => {
              const emailAttr = user.Attributes?.find(attr => attr.Name === 'email');
              return emailAttr?.Value?.toLowerCase().includes(searchString.toLowerCase());
            });
            
            allUsers = [...allUsers, ...matchingUsers];
          }

          paginationToken = broadResponse.PaginationToken;
          
          if (allUsers.length >= 10) {
            console.log('Found enough matches, stopping pagination');
            break;
          }
          
        } while (paginationToken);

        return {
          users: allUsers,
          nextToken: undefined // No pagination for search results
        };
      } else {
        return {
          users,
          nextToken: undefined // No pagination for search results
        };
      }
    }

  } catch (error) {
    console.error('Error querying users:', error);
    throw error;
  }
}

export const handler: Schema["searchUsers"]["functionHandler"] = async (event) => {
  const { 
    name, 
    pageSize = 20, 
    nextToken 
  } = event.arguments as { 
    name: string; 
    pageSize?: number; 
    nextToken?: string; 
  };
  
  try {
    const users = await queryCognito(
      'us-east-1_oy1KeDlsD', 
      name, 
      pageSize || 20, 
      nextToken || undefined
    );
    console.log(`Returning ${users.length} users`);
    return JSON.stringify(users);
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
};