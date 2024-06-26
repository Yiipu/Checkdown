中文 | [English](./README.md)

这是 Checkdown 的文档分支。你可以在这里找到自己托管这个应用所需的一切信息。

## 🛠️ 设置

这个应用使用环境变量进行部署。你可以使用 `.env` 文件或系统环境变量提供。[`.env.sample`](command:_github.copilot.openRelativePath?%5B%7B%22scheme%22%3A%22file%22%2C%22authority%22%3A%22%22%2C%22path%22%3A%22%2Fworkspaces%2Fnodejs%2Fcheckdown%2F.env.sample%22%2C%22query%22%3A%22%22%2C%22fragment%22%3A%22%22%7D%5D "/workspaces/nodejs/checkdown/.env.sample") 文件描述了所有必要的变量。

> 更多信息：[Next.js 环境变量](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)

1. 新建 MySQL 数据库并使用 `sample/init.sql` 初始化表。填写以 `DB` 开头的环境变量。
2. 在 [Auth0](https://auth0.com) 设置一个认证应用并按照他们的指示操作。填写以 `AUTH0` 开头的环境变量。
3. 生成一个 [AES-256](https://en.m.wikipedia.org/wiki/Advanced_Encryption_Standard) 密钥并提供环境变量 `AES_KEY`。
4. 在 [Azure](https://learn.microsoft.com/en-us/azure/ai-services/language-service/summarization/overview?tabs=document-summarization) 设置一个文档摘要服务并提供以 `AZURE_LANGUAGE` 开头的环境变量。
5. 在 Auth0 中添加 `Login Flow`，使用 `sample/loginflow.js` 将用户添加到数据库。

🎉 万事俱备！使用以下命令在 `http://localhost:3000` 上启动 Next.js 服务器并检查是否有任何错误。

```bash
npm install
npm run dev
```

## 💚 持续集成与持续部署

这个应用使用 GitHub Actions 自动打包 Docker 镜像并将其部署到 Azure。你可以切换到主分支并检查由 Azure 预配置的工作流文件。

当将这个应用移动到云端时，你需要配置你的 Auth0 应用以允许新的认证位置，或者设置一个新的 Auth 应用并提供新的环境变量。

出于安全和性能的考虑，还建议重置数据库和其他机密。
