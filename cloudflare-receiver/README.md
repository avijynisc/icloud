# 旧域名代理 Worker

这个 Worker 用来把旧域名转发到新的集中接码 Worker，方便保留之前已经生成的专属链接。

## 配置

真实 `wrangler.toml` 已加入 `.gitignore`。首次部署时复制模板：

```powershell
Copy-Item .\wrangler.example.toml .\wrangler.toml
```

把 `CENTRAL_API_ORIGIN` 改成主接码面板域名，例如：

```toml
[vars]
CENTRAL_API_ORIGIN = "https://your-main-domain.example.com"
```

## 部署

```powershell
npx wrangler deploy
```
