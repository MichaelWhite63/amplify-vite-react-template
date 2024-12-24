import { defineFunction } from '@aws-amplify/backend';

export const getUnpublished = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'get-unpublished',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts'
});