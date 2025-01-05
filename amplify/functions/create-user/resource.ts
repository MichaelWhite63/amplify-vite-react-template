import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { defineFunction } from '@aws-amplify/backend';

export const cognitoClient = new CognitoIdentityProviderClient({ region: 'us-east-1' });

export const createUser = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'create-user',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts'
});