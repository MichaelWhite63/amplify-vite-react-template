import type { Schema } from "../../data/resource";
import { CognitoIdentityProviderClient, AdminCreateUserCommand, AdminAddUserToGroupCommand } 
    from "@aws-sdk/client-cognito-identity-provider";

export const USER_POOL_ID = process.env.USER_POOL_ID || 'us-east-1_oy1KeDlsD';
export const AWS_REGION = process.env.AWS_REGION || 'us-east-1';

const config = { region: AWS_REGION };
const client = new CognitoIdentityProviderClient(config);

interface UserAttributes {
  Name: string;
  Value: string;
}

export const handler: Schema["createUser"]["functionHandler"] = async (event): Promise<string | null> => {
  const { email, name, department, groups, company } = event.arguments as { 
    email: string; 
    name: string;
    department: string;
    groups: string[];
    company: string;
  };

  // Validate email
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Invalid email format.');
  }

  const createUserCommand = new AdminCreateUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: email,  // Changed from username to email
    TemporaryPassword: "kuro611",
//    MessageAction: 'SUPPRESS',
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'email_verified', Value: 'false' },
      { Name: 'name', Value: name },
      { Name: 'family_name', Value: company },
      { Name: 'given_name', Value: department }, 
    ] as UserAttributes[],
  });

  try {
    await client.send(createUserCommand);

    // Update group assignments to use email as Username
    for (const group of groups) {
      const addUserToGroupCommand = new AdminAddUserToGroupCommand({
        UserPoolId: USER_POOL_ID,
        Username: email,  // Changed from username to email
        GroupName: group,
      });
      await client.send(addUserToGroupCommand);
    }

    return 'User created successfully';
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('false:' + error);
  }
};