This is the document branch of Checkdown. You can find everything needed to host this app yourself.

## Setup

This app uses environment variables for deployment. You can provide them using a `.env` file or system environment variables. The `.env.sample` file describes all the necessary variables.

> More information: [Next.js Environment Variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)

1. Set up a MySQL database and create tables using `sample/init.sql`. Provide environment variables starting with `DB` for database connection.
2. Set up an Auth app in [Auth0](https://auth0.com) and follow their instructions. Provide environment variables starting with `AUTH0`.
3. Generate an [AES](https://en.m.wikipedia.org/wiki/Advanced_Encryption_Standard) key and provide the environment variable `AES_KEY`.
4. Set up a document summarization service in [Azure](https://learn.microsoft.com/en-us/azure/ai-services/language-service/summarization/overview?tabs=document-summarization) and provide environment variables starting with `AZURE_LANGUAGE`.
5. Add `Login Flow` in Auth0 to add user to database using `sample/loginflow.js`.

🎉 You are good to go! Use the following commands to start the Next.js server on `http://localhost:3000` and check for any errors.

```bash
npm install
npm run dev
```

## CI & CD

This app uses GitHub Actions to automatically package a Docker image and deploy it to Azure. You can switch to the main branch and check the workflow file, which is preconfigured by Azure.

When moving this app to the cloud, you need to either configure your Auth0 app to allow new authentication locations or set up a new one and provide the new environment variables.

It is also recommended to reset the database and other secrets for security and performance.
