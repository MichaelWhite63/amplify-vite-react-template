import { defineFunction } from '@aws-amplify/backend';

/**
 * Define the changeUserPassword function resource
 * - This connects the handler.ts implementation with Amplify's resource system
 * - Makes the function accessible from the schema in data/resource.ts
 */
export const changeUserPassword = defineFunction({
  name: 'changeUserPassword',
  entry: './handler.ts'
});
