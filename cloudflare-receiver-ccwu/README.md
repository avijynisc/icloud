# ChatGPT 专属邮箱接码

Cloudflare Worker + Durable Object 版本的 iCloud 接码面板。后端由一个 `MailWorker`
统一连接 iCloud IMAP，独立接码页和集中面板都只读缓存，避免每个页面重复扫邮箱。

## 功能

- `/code/:accessToken`：邮箱专属接码页，URL 不暴露邮箱地址。
- `/`：管理员集中面板，需要登录密码。
- 一次收信，多端显示：同一封邮件会同时写入验证码缓存和匹配中的独立 session。
- 只处理近期邮件，并按 OpenAI/ChatGPT 验证码格式提取 6 位验证码。
- 每个邮箱使用独立随机 `accessToken`，可在后台重置。

## 本地配置

真实 `wrangler.toml` 已加入 `.gitignore`，不要上传。首次部署时复制模板：

```powershell
Copy-Item .\wrangler.example.toml .\wrangler.toml
```

把 `wrangler.toml` 里的域名和非敏感配置改成你的值。密码不要写进 GitHub，使用
Cloudflare Worker Secret：

```powershell
npx wrangler secret put HME_IMAP_PASSWORD
npx wrangler secret put PANEL_PASSWORD
```

## 部署

```powershell
npx wrangler deploy
```

## 安全注意

- 不要提交 `wrangler.toml`、`.dev.vars`、`.wrangler/`、`cookies.txt`、`emails.txt`、`receiver_urls.txt`。
- 不要把 iCloud App 专用密码、Cloudflare API Token、Apple Cookie 写进 README 或公开日志。
- 如果泄露过 `PANEL_PASSWORD` 或邮箱专属链接，请在后台重置。
