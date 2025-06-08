import { defineFunction } from '@aws-amplify/backend';

export const getTopTen = defineFunction({
  // optionally specify a name for the Function (defaults to directory name)
  name: 'getTopTen',
  // optionally specify a path to your handler (defaults to "./handler.ts")
  entry: './handler.ts',
  // Increase timeout from default 3 seconds to 30 seconds
  timeoutSeconds: 30,
  // Optionally increase memory if needed for large datasets
  memoryMB: 512
});