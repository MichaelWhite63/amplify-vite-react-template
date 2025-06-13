import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

export async function queryCognito(
  userPoolId: string, 
  searchString: string,
  pageSize: number = 20,
  startToken?: string
): Promise<{users: CognitoIdentityServiceProvider.UserType[], nextToken?: string}> {
  
  console.log(`queryCognito called with:`, { searchString, pageSize, startToken });

  try {
    const isEmptySearch = !searchString || searchString.trim() === '';
    
    if (isEmptySearch) {
      console.log('Empty search - listing all users with pagination');
      
      const params: any = {
        UserPoolId: userPoolId,
        Limit: pageSize
      };
      
      // CRITICAL: Add PaginationToken if it exists
      if (startToken && startToken.trim() !== '') {
        params.PaginationToken = startToken;
        console.log('Using pagination token:', startToken);
      } else {
        console.log('No pagination token - starting from beginning');
      }
      
      console.log('Calling cognito.listUsers with params:', params);
      
      const response = await cognito.listUsers(params).promise();
      
      console.log('Cognito listUsers response:', {
        usersCount: response.Users?.length || 0,
        hasNextToken: !!response.PaginationToken,
        nextTokenPreview: response.PaginationToken?.substring(0, 50) + '...'
      });

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

      console.log('Returning users with groups:', {
        count: usersWithGroups.length,
        nextToken: response.PaginationToken ? 'exists' : 'null'
      });

      return {
        users: usersWithGroups,
        nextToken: response.PaginationToken
      };
      
    } else {
      // Search logic for when searchString is provided
      console.log('Performing search with string:', searchString);
      
      const response = await cognito.listUsers({
        UserPoolId: userPoolId,
        Filter: `email ^= "${searchString}"`,
        Limit: pageSize
      }).promise();

      const users = response.Users || [];
      console.log(`Found ${users.length} users with prefix filter`);

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
        nextToken: undefined // No pagination for search results
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
  
  console.log('=== HANDLER DEBUG ===');
  console.log('Handler received params:', { name, pageSize, nextToken });
  
  try {
    const result = await queryCognito(
      'us-east-1_oy1KeDlsD', 
      name, 
      pageSize, 
      nextToken || undefined
    );
    
    console.log('Handler result:', {
      usersCount: result.users?.length || 0,
      hasNextToken: !!result.nextToken,
      nextTokenPreview: result.nextToken?.substring(0, 50) + '...'
    });
    
    const response = {
      users: result.users || [],
      nextToken: result.nextToken || null
    };
    
    console.log(`=== HANDLER RESPONSE ===`);
    console.log(`Returning ${response.users.length} users`);
    console.log(`NextToken exists: ${!!response.nextToken}`);
    
    return JSON.stringify(response);
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
};