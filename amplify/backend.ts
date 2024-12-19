import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sayHello } from './functions/say-hello/resource';
import { sendEmail } from './functions/sendEmail/resource';
import { newsSearch } from './functions/newsSearch/resource';

defineBackend({
  auth,
  data,
  sayHello,
  sendEmail,
  newsSearch
});
