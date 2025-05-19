import { defineFunction } from '@aws-amplify/backend';

export const resetAllUserPasswords = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'resetAllUserPasswords',
  entry: './handler.ts'
});