import { type ClientSchema, a, defineData } from "@aws-amplify/backend";
import { sayHello } from "../functions/say-hello/resource"

/*== STEP 1 ===============================================================
The section below creates a Todo database table with a "content" field. Try
adding a new "isDone" field as a boolean. The authorization rule below
specifies that any user authenticated via an API key can "create", "read",
"update", and "delete" any "Todo" records.
=========================================================================*/
const schema = a.schema({
  
  sayHello: a
    .query()
    .arguments({
      name: a.string(),
      type: a.enum(['Steel', 'Auto', 'Aluminum']),
    })
    .returns(a.string())
    .handler(a.handler.function(sayHello))
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
      lDate: a.date(),
      source: a.string(),
      memo: a.string(),
      ord: a.integer(),
      rank: a.integer(),
      header: a.string(),
      published: a.boolean(),
      newField: a.boolean(),
      type: a.enum(['Steel', 'Auto', 'Aluminum']),
    })
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
      expiresInDays: 30,
    },
  },
});

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
