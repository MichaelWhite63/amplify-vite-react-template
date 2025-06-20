import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { sayHello }   from "../functions/say-hello/resource"
import { sendEmail }  from "../functions/sendEmail/resource"
import { newsSearch } from "../functions/newsSearch/resource";
import { getUnpublished } from "../functions/get-unpublished/resource";
import { getTopTen } from "../functions/get-TopTen/resource";
import { searchUsers } from "../functions/search-users/resource";
import { getUser } from "../functions/get-user/resource";
import { updateUser } from "../functions/update-user/resource";
import { createUser } from "../functions/create-user/resource";
import { changeUserPassword } from "../functions/changeUserPassword/resource";
import { deleteUser } from "../functions/deleteUser/resource";
import { resetAllUserPasswords } from "../functions/resetAllUserPasswords/resource";

const schema = a.schema({
  
  resetAllUserPasswords: a
    .query()
    .arguments({
      dryRun: a.boolean(),
    })
    .returns(a.string()) // Changed from object to string
    .handler(a.handler.function(resetAllUserPasswords))
    .authorization((allow) => [allow.publicApiKey()]),

  deleteUser: a
    .query()
    .arguments({
      email: a.string(),
    })
    .returns(a.string())
    .handler(a.handler.function(deleteUser))
    .authorization((allow) => [allow.publicApiKey()]),

  changeUserPassword: a
    .query()
    .arguments({
      username: a.string(),
      password: a.string(),
    })
    .returns(a.string())
    .handler(a.handler.function(changeUserPassword))
    .authorization((allow) => [allow.publicApiKey()]),

  getUser: a
  .query()
  .arguments({
    name: a.string(),
  })
  .returns(a.string())
  .handler(a.handler.function(getUser))
  .authorization((allow) => [allow.publicApiKey()]),

  searchUsers: a
  .query()
  .arguments({
    name: a.string(),
    pageSize: a.integer(),
    nextToken: a.string(),
  })
  .returns(a.string())
  .handler(a.handler.function(searchUsers))
  .authorization((allow) => [allow.publicApiKey()]),

  newsSearch: a
    .query()
    .arguments({
      searchString: a.string(),
      date: a.string(),
      type: a.enum(['Steel', 'Auto', 'Aluminum']),
    })
    .returns(a.string())
    .handler(a.handler.function(newsSearch))
    .authorization((allow) => [allow.publicApiKey()]),
      
  sendEmail: a
    .query()
    .arguments({
      name: a.string(),
      email: a.string(),
      type: a.enum(['Steel', 'Auto', 'Aluminum']),
      title: a.string(),
      header: a.string(),  // Add header field
      selectedNewsIDs: a.string().array(),
    })
    .returns(a.string())
    .handler(a.handler.function(sendEmail))
    .authorization((allow) => [allow.publicApiKey()]),
      
  getUnpublished: a
    .query()
    .arguments({
      type: a.enum(['Steel', 'Auto', 'Aluminum']),
      date: a.string(),  // Add date parameter
    })
    .returns(a.string())
    .handler(a.handler.function(getUnpublished))
    .authorization((allow) => [allow.publicApiKey()]),
  
  getTopTen: a
    .query()
    .arguments({
      type: a.enum(['Steel', 'Auto', 'Aluminum']),
      count: a.integer(),  // Add the number of rows to return
    })
    .returns(a.string())
    .handler(a.handler.function(getTopTen))
    .authorization((allow) => [allow.publicApiKey()]),
  
  sayHello: a
    .query()
    .arguments({
      name: a.string(),
      type: a.enum(['Steel', 'Auto', 'Aluminum']),
    })
    .returns(a.string())
    .handler(a.handler.function(sayHello))
    .authorization((allow) => [allow.publicApiKey()]),

  updateUser: a
    .query()
    .arguments({
      email: a.string(),        // new email address
      name: a.string(),        // name
      company: a.string(),     // family_name
      department: a.string(),  // given_name
      groups: a.string().array()
    })
    .returns(a.string())
    .handler(a.handler.function(updateUser))
    .authorization((allow) => [allow.publicApiKey()]),

  createUser: a
    .query()
    .arguments({
      email: a.string(),
      name: a.string(),        // name
      company: a.string(),     // family_name
      department: a.string(),  // given_name
      groups: a.string().array(),
    })
    .returns(a.string())
    .handler(a.handler.function(createUser))
    .authorization((allow) => [allow.publicApiKey()]),
    
  Todo: a
    .model({
      content: a.string(),
      isDone: a.boolean(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

    News: a
    .model({
      title: a.string(),
      group: a.integer(),
      writtenBy: a.string(),
      date: a.date(),
      lDate: a.string(), // ✅ Confirmed: Change from a.date() to a.string()
      source: a.string(),
      memo: a.string(),
      ord: a.integer(),
      rank: a.integer(),
      header: a.string(),
      published: a.boolean(),
      newField: a.boolean(),
      type: a.enum(['Steel', 'Auto', 'Aluminum']),
  }).secondaryIndexes((index) => [
    index('type')
      .sortKeys(['date'])
      .queryField('listNewsByTypeAndDate'),
    index('type')
      .sortKeys(['lDate'])  // ✅ This will work now with string lDate
      .queryField('listNewsByTypeAndLDate')
  ])
    .authorization((allow) => [allow.publicApiKey()]),

  NewsGroup: a
    .model({
      name: a.string(),
      nameJ: a.string(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

  Chart1: a
    .model({
      Order: a.integer(),
      Title: a.string(),
      ThisWeek: a.float(),
      LastWeek: a.float(),
      LastYear: a.float(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

    Chart2: a
    .model({
      Order: a.integer(),
      Title: a.string(),
      ThisMonth: a.integer(),
      LastMonth: a.integer(),
      LastYear: a.integer(),
      Month: a.integer(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

    Chart3: a
    .model({
      Order: a.integer(),
      Title: a.string(),
      Import: a.integer(),
      MillPrice: a.integer(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

    Chart4: a
    .model({
      Order: a.integer(),
      Title: a.string(),
      ThisMonth: a.integer(),
      LastMonth: a.integer(),
      LastYear: a.integer(),
      Month: a.integer(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

    Chart5: a
    .model({
      Order: a.integer(),
      Title: a.string(),
      ThisMonth: a.integer(),
      LastMonth: a.integer(),
      LastYear: a.integer(),
      Month: a.integer(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

    Chart6: a
    .model({
      Order: a.integer(),
      Title: a.string(),
      ThisMonth: a.integer(),
      LastMonth: a.integer(),
      LastYear: a.integer(),
      Month: a.integer(),
    })
    .authorization((allow) => [allow.publicApiKey()]),

});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: "apiKey",
    // API Key is used for a.allow.public() rules
    apiKeyAuthorizationMode: {
      expiresInDays: 364,
    },
  },
});

// Remove or comment out the old config object
// export const config = {
//   tableName: 'News-xvm6ipom2jd45jq7boxzeki5bu-NONE',
//   indexes: {
//     byDate: {
//       indexName: 'byDate',
//       partitionKey: ['date'],
//       sortKey: ['date'],
//       queryField: 'newsByDate'
//     }
//   }
// };

/*== STEP 2 ===============================================================
Go to your frontend source code. From your client-side code, generate a
Data client to make CRUDL requests to your table. (THIS SNIPPET WILL ONLY
WORK IN THE FRONTEND CODE FILE.)

Using JavaScript or Next.js React Server Components, Middleware, Server 
Actions or Pages Router? Review how to generate Data clients for those use
cases: https://docs.amplify.aws/gen2/build-a-backend/data/connect-to-API/
=========================================================================*/

/*
"use client"
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>() // use this Data client for CRUDL requests
*/

/*== STEP 3 ===============================================================
Fetch records from the database and use them in your frontend component.
(THIS SNIPPET WILL ONLY WORK IN THE FRONTEND CODE FILE.)
=========================================================================*/

/* For example, in a React component, you can use this snippet in your
  function's RETURN statement */
// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
