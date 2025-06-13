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
      
      if (startToken && startToken.trim() !== '') {
        params.PaginationToken = startToken;
        console.log('Using pagination token for browse mode');
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

      console.log(`Browse mode: returning ${usersWithGroups.length} users`);

      return {
        users: usersWithGroups,
        nextToken: response.PaginationToken
      };
      
    } else {
      // SEARCH MODE: Get all users and filter client-side for substring matching
      console.log(`Search mode: looking for "${searchString}" anywhere in email`);
      
      let allMatchingUsers: CognitoIdentityServiceProvider.UserType[] = [];
      let paginationToken: string | undefined = undefined;
      
      // Fetch all users in batches and filter client-side
      do {
        const listParams = {
          UserPoolId: userPoolId,
          Limit: 60, // Fetch in chunks
          PaginationToken: paginationToken
        };
        
        console.log(`Fetching batch with ${listParams.Limit} users...`);
        const response = await cognito.listUsers(listParams).promise();
        const users = response.Users || [];
        
        // Filter users that contain the search string anywhere in their email
        const matchingUsers = users.filter(user => {
          const emailAttr = user.Attributes?.find(attr => attr.Name === 'email');
          const email = emailAttr?.Value || '';
          
          // Case-insensitive substring match
          const isMatch = email.toLowerCase().includes(searchString.toLowerCase());
          
          if (isMatch) {
            console.log(`Match found: ${email} contains "${searchString}"`);
          }
          
          return isMatch;
        });
        
        console.log(`Found ${matchingUsers.length} matching users in this batch of ${users.length}`);
        allMatchingUsers = [...allMatchingUsers, ...matchingUsers];
        
        paginationToken = response.PaginationToken;
        
        // Continue until we've searched all users (no limit for search)
        
      } while (paginationToken);
      
      console.log(`Search completed: found ${allMatchingUsers.length} total users matching "${searchString}"`);
      
      // Fetch groups for all matching users
      const usersWithGroups = await Promise.all(
        allMatchingUsers.map(async (user, index) => {
          if (!user.Username) return user;
          
          try {
            if (index > 0 && index % 10 === 0) {
              await new Promise(resolve => setTimeout(resolve, 100)); // Throttle every 10 requests
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

      console.log(`Returning all ${usersWithGroups.length} search results for "${searchString}"`);

      return {
        users: usersWithGroups,
        nextToken: undefined // No pagination for search results - return all matches
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
  
  console.log('=== HANDLER START ===');
  console.log('Handler params:', { name, pageSize, nextToken: nextToken ? 'exists' : 'none' });
  
  try {
    const result = await queryCognito(
      'us-east-1_oy1KeDlsD', 
      name, 
      pageSize, 
      nextToken || undefined
    );
    
    console.log('=== HANDLER RESULT ===');
    console.log(`Found ${result.users?.length || 0} users`);
    console.log(`Search term: "${name}"`);
    console.log(`Has nextToken: ${!!result.nextToken}`);
    
    // Log first few user emails to verify results
    if (result.users && result.users.length > 0) {
      const firstEmails = result.users.slice(0, 3).map(user => {
        const emailAttr = user.Attributes?.find(attr => attr.Name === 'email');
        return emailAttr?.Value || 'no-email';
      });
      console.log('First few emails:', firstEmails);
    }
    
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