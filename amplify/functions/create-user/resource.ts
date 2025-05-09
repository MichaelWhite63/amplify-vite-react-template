import { defineFunction } from '@aws-amplify/backend';

export const createUser = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'create-user',
  entry: './handler.ts'
});