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
      // Search logic for when searchString is provided
      console.log('Performing search with string:', searchString);
      
      let allUsers: CognitoIdentityServiceProvider.UserType[] = [];
      
      // Use Cognito's filter for prefix matching
      const response = await cognito.listUsers({
        UserPoolId: userPoolId,
        Filter: `email ^= "${searchString}"`,
        Limit: pageSize
      }).promise();

      const users = response.Users || [];
      console.log(`Found ${users.length} users with prefix filter`);

      // If no results with prefix, try broader search
      if (users.length === 0) {
        console.log('No prefix matches, trying broader search...');
        
        let searchPaginationToken: string | undefined = undefined;
        
        do {
          const broadResponse = await cognito.listUsers({
            UserPoolId: userPoolId,
            PaginationToken: searchPaginationToken,
            Limit: 60
          }).promise();

          if (broadResponse.Users) {
            const matchingUsers = broadResponse.Users.filter(user => {
              const emailAttr = user.Attributes?.find(attr => attr.Name === 'email');
              return emailAttr?.Value?.toLowerCase().includes(searchString.toLowerCase());
            });
            
            allUsers = [...allUsers, ...matchingUsers];
          }

          searchPaginationToken = broadResponse.PaginationToken;
          
          if (allUsers.length >= 10) {
            console.log('Found enough matches, stopping pagination');
            break;
          }
          
        } while (searchPaginationToken);
        
        // For search results, we don't use pagination tokens
        const usersWithGroups = await Promise.all(
          allUsers.slice(0, 20).map(async (user, index) => {
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
        
      } else {
        // Process prefix match results
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
      nextToken: result.nextToken
    });
    
    const response = {
      users: result.users || [],
      nextToken: result.nextToken || null
    };
    
    console.log(`Returning response with ${response.users.length} users, nextToken: ${response.nextToken}`);
    return JSON.stringify(response);
  } catch (error) {
    console.error('Handler error:', error);
    throw error;
  }
};