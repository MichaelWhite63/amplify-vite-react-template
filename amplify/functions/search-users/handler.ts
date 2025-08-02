import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

export async function queryCognito(
  userPoolId: string, 
  searchString: string,
  pageSize: number = 20,
  startToken?: string
): Promise<{users: CognitoIdentityServiceProvider.UserType[], nextToken?: string}> {
  
  try {
    const isEmptySearch = !searchString || searchString.trim() === '';
    
    if (isEmptySearch) {
      const params: any = {
        UserPoolId: userPoolId,
        Limit: pageSize
      };
      
      if (startToken && startToken.trim() !== '') {
        params.PaginationToken = startToken;
      }
      
      const response = await cognito.listUsers(params).promise();
      const users = response.Users || [];
      
      // Fetch groups for users
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
      // SEARCH MODE: Get all users and filter client-side for substring matching
      let allMatchingUsers: CognitoIdentityServiceProvider.UserType[] = [];
      let paginationToken: string | undefined = undefined;
      
      // Fetch all users in batches and filter client-side
      do {
        const listParams: CognitoIdentityServiceProvider.ListUsersRequest = {
          UserPoolId: userPoolId,
          Limit: 60,
          PaginationToken: paginationToken
        };
        
        const response = await cognito.listUsers(listParams).promise();
        const users = response.Users || [];
        
        // Filter users that contain the search string anywhere in their email OR name
        const matchingUsers = users.filter(user => {
          const emailAttr = user.Attributes?.find(attr => attr.Name === 'email');
          const email = emailAttr?.Value || '';
          
          const nameAttr = user.Attributes?.find(attr => attr.Name === 'name');
          const name = nameAttr?.Value || '';
          
          // Case-insensitive substring match for either email or name
          return email.toLowerCase().includes(searchString.toLowerCase()) ||
                 name.toLowerCase().includes(searchString.toLowerCase());
        });
        
        allMatchingUsers = [...allMatchingUsers, ...matchingUsers];
        paginationToken = response.PaginationToken;
        
      } while (paginationToken);
      
      // Sort search results alphabetically by email
      allMatchingUsers.sort((a, b) => {
        const emailA = a.Attributes?.find(attr => attr.Name === 'email')?.Value || '';
        const emailB = b.Attributes?.find(attr => attr.Name === 'email')?.Value || '';
        return emailA.toLowerCase().localeCompare(emailB.toLowerCase());
      });
      
      // Fetch groups for all matching users
      const usersWithGroups = await Promise.all(
        allMatchingUsers.map(async (user, index) => {
          if (!user.Username) return user;
          
          try {
            if (index > 0 && index % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 100));
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
        nextToken: undefined
      };
    }

  } catch (error) {
    console.error('Error in queryCognito:', error);
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
    const result = await queryCognito(
      'us-east-1_oy1KeDlsD', 
      name, 
      pageSize, 
      nextToken || undefined
    );
    
    const response = {
      users: result.users || [],
      nextToken: result.nextToken || null
    };
    
    return JSON.stringify(response);
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
};