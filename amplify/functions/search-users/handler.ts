import type { Schema } from "../../data/resource"
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

export async function queryCognito(userPoolId: string, searchString: string): Promise<CognitoIdentityServiceProvider.UserType[]> {
  let allUsers: CognitoIdentityServiceProvider.UserType[] = [];
  let paginationToken: string | undefined;
  
  const isEmptySearch = !searchString || searchString.trim() === '';
  console.log(`Searching for users with email containing: "${searchString}" (empty search: ${isEmptySearch})`);

  try {
    if (isEmptySearch) {
      // Return ALL users when no search criteria provided
      console.log('No search criteria provided, fetching all users...');
      
      do {
        const response = await cognito.listUsers({
          UserPoolId: userPoolId,
          PaginationToken: paginationToken,
          Limit: 60
        }).promise();

        if (response.Users) {
          allUsers = [...allUsers, ...response.Users];
        }

        paginationToken = response.PaginationToken;
        console.log(`Fetched ${response.Users?.length || 0} users, total so far: ${allUsers.length}`);
        
      } while (paginationToken);
      
    } else {
      // Existing search logic for when searchString is provided
      const response = await cognito.listUsers({
        UserPoolId: userPoolId,
        Filter: `email ^= "${searchString}"`,
        Limit: 60
      }).promise();

      const users = response.Users || [];
      console.log(`Found ${users.length} users with prefix filter`);

      if (users.length === 0) {
        console.log('No prefix matches, trying broader search...');
        
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
      } else {
        allUsers = users;
      }
    }

    console.log(`Total matching users found: ${allUsers.length}`);

    // Fetch groups for users with rate limiting
    // For all users scenario, process in batches to prevent timeouts
    const maxUsersToProcess = isEmptySearch ? 100 : 20; // Limit for performance
    const usersToProcess = allUsers.slice(0, maxUsersToProcess);
    
    console.log(`Processing group memberships for ${usersToProcess.length} users`);

    const usersWithGroups = await Promise.all(
      usersToProcess.map(async (user, index) => {
        if (!user.Username) return user;
        
        try {
          // Add delay to prevent rate limiting
          if (index > 0 && index % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 200)); // Longer delay every 10 users
          } else if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 50)); // Shorter delay between users
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