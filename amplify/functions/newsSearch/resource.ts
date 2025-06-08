import { defineFunction } from '@aws-amplify/backend';

export const newsSearch = defineFunction({
  name: 'newsSearch',
  entry: './handler.ts',
  timeoutSeconds: 30,
  memoryMB: 512
});