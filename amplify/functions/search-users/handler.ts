import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

export async function queryCognito(
  userPoolId: string, 
  searchString: string,
  pageSize: number = 20,
  startToken?: string
): Promise<{users: CognitoIdentityServiceProvider.UserType[], nextToken?: string}> {
  
  console.log(`=== HANDLER queryCognito ===`);
  console.log('Input params:', { searchString, pageSize, startToken });

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
        console.log('Using pagination token:', startToken.substring(0, 50) + '...');
      } else {
        console.log('No pagination token - starting from beginning');
      }
      
      console.log('Calling cognito.listUsers with params:', {
        UserPoolId: params.UserPoolId,
        Limit: params.Limit,
        hasPaginationToken: !!params.PaginationToken
      });
      
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
      console.log('Performing substring search with string:', searchString);
      
      let allMatchingUsers: CognitoIdentityServiceProvider.UserType[] = [];
      let paginationToken: string | undefined = undefined;
      
      // Since Cognito filters are limited, we need to fetch all users and filter client-side
      console.log('Fetching all users to perform substring search...');
      
      do {
        const listParams = {
          UserPoolId: userPoolId,
          Limit: 60, // Fetch in larger chunks for efficiency
          PaginationToken: paginationToken
        };
        
        const response = await cognito.listUsers(listParams).promise();
        const users = response.Users || [];
        
        console.log(`Fetched ${users.length} users for filtering`);
        
        // Filter users that contain the search string in their email (case-insensitive)
        const matchingUsers = users.filter(user => {
          const emailAttr = user.Attributes?.find(attr => attr.Name === 'email');
          const email = emailAttr?.Value || '';
          
          // Check if search string is contained anywhere in the email (case-insensitive)
          return email.toLowerCase().includes(searchString.toLowerCase());
        });
        
        console.log(`Found ${matchingUsers.length} matching users in this batch`);
        allMatchingUsers = [...allMatchingUsers, ...matchingUsers];
        
        paginationToken = response.PaginationToken;
        
        // Continue until we have enough results or no more pages
        if (allMatchingUsers.length >= pageSize * 3) {
          console.log('Found enough matching users, stopping search');
          break;
        }
        
      } while (paginationToken);
      
      console.log(`Total matching users found: ${allMatchingUsers.length}`);
      
      // Limit to requested page size
      const paginatedUsers = allMatchingUsers.slice(0, pageSize);
      
      // Fetch groups for matching users
      const usersWithGroups = await Promise.all(
        paginatedUsers.map(async (user, index) => {
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

      console.log(`Returning ${usersWithGroups.length} users with groups for search: "${searchString}"`);

      return {
        users: usersWithGroups,
        nextToken: undefined // No pagination for search results since we're filtering client-side
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
  console.log('Handler received params:', { name, pageSize, nextToken: nextToken?.substring(0, 50) + '...' });
  
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