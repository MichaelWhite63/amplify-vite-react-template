import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sayHello } from './functions/say-hello/resource';
import { sendEmail } from './functions/sendEmail/resource';
import { newsSearch } from './functions/newsSearch/resource';
import { getUnpublished } from './functions/get-unpublished/resource';
import { getUser } from './functions/get-user/resource';
import { searchUsers } from './functions/search-users/resource';

defineBackend({
  auth,
  data,
  sayHello,
  sendEmail,
  newsSearch,
  getUnpublished,
  getUser,
  searchUsers
});
