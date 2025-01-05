import { defineFunction } from '@aws-amplify/backend';

export const createUser = defineFunction({
  name: 'createUser',
  entry: './handler.ts',
});
