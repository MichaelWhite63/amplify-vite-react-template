import { defineFunction } from '@aws-amplify/backend';

export const searchUsers = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'searchUsers',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts',
  timeoutSeconds: 120, // Increase to 2 minutes for all-users scenario
  memoryMB: 512
});