import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { sayHello } from './functions/say-hello/resource';
import { sendEmail } from './functions/sendEmail/resource';
import { newsSearch } from './functions/newsSearch/resource';
import { getUnpublished } from './functions/get-unpublished/resource';
import { getUser }     from './functions/get-user/resource';
import { searchUsers } from './functions/search-users/resource';
import { updateUser } from './functions/update-user/resource';
import { createUser } from './functions/create-user/resource';
import { getTopTen } from "./functions/get-TopTen/resource";
import { changeUserPassword } from './functions/changeUserPassword/resource';

const backend = defineBackend({
  auth,
  data,
  sayHello,
  sendEmail,
  newsSearch,
  getUnpublished,
  getUser,
  searchUsers,
  updateUser,
  createUser,
  getTopTen,
  changeUserPassword
});

// Grant scan permissions to newsSearch function
backend.newsSearch.addToRolePolicy({
  Effect: "Allow",
  Action: [
    "dynamodb:Scan",
    "dynamodb:Query"
  ],
  Resource: [
    backend.data.resources.tables.News.tableArn,
    `${backend.data.resources.tables.News.tableArn}/index/*`
  ]
});
