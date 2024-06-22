

This is the document branch of Checkdown. You can find everything needed to host this app yourself.

## Setup

This app uses environment variables for deployment, you can provide them using `.env` file or system environment variables. 
the `.env.sample` file describes all variables needed.

> more information: [Next.js Environment Variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)

- set up a MySQL database and create tables using `sample/init.sql`. Provide evs started with `DB` for database connection.
- set up a auth app in [Auth0](https://auth0.com) ,follow their instructions.  evs started with `AUTH0` will be provided.
- generate a [AES](https://en.m.wikipedia.org/wiki/Advanced_Encryption_Standard) key, and provide ev `AES_KEY`.
- set up a document summarization service in [Azure](https://learn.microsoft.com/en-us/azure/ai-services/language-service/summarization/overview?tabs=document-summarization) , provide evs started with `AZURE_LANGUAGE`

🎉you are good to go!
use the following commands to start the Next server on `http:\\localhost:3000` ,and see if any error occurs.

```bash
npm install
npm run dev
````

## CI&CD

this app uses github actions to automatically package docker image and deploy to azure. 
you can checkout to main branch and check the workflow file which is preconfigured by Azure.

when moving this app to cloud, you have to either configure your auth0 app to allow new auth locations, or set up a new one and provide new evs.

database and other secrets are also recommended to reset for security and performance.

