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
      
      const params = {
        UserPoolId: userPoolId,
        Limit: pageSize
      };
      
      // CRITICAL: Only add PaginationToken if it exists and is not empty
      if (startToken && startToken.trim() !== '') {
        (params as any).PaginationToken = startToken;
        console.log('Using pagination token:', startToken);
      } else {
        console.log('No pagination token - starting from beginning');
      }
      
      const response = await cognito.listUsers(params).promise();
      
      console.log('Cognito response:', {
        usersCount: response.Users?.length || 0,
        hasNextToken: !!response.PaginationToken,
        nextToken: response.PaginationToken
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

      return {
        users: usersWithGroups,
        nextToken: response.PaginationToken
      };
      
    } else {
      // Existing search logic for when searchString is provided
      // ... your search logic ...
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
    
    // Always return the paginated structure
    const response = {
      users: result.users || result, // Handle both structures
      nextToken: result.nextToken || null
    };
    
    console.log(`Returning response with ${response.users.length} users, nextToken: ${response.nextToken}`);
    return JSON.stringify(response);
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
};