# www.yiranshu.com 迁移说明

目前状态：迁移代码和生产构建已准备好，等待审阅与发布；主域名仍显示原站。

## 已确认的来源

- GitHub 仓库：https://github.com/Cornelia1425/Cornelia1425.github.io
- 当前 React 源码分支：`react-version`，提交 `e4122beaba8cf24fadf326a1df422833a2bbe611`。
- 当前发布分支：`gh-pages`，提交 `8946b2bf8c128f581667fa48abfd1d7c974cf177`；该提交在原站基础上增加了 `/studio/`。原站首页对应提交为 `92d1a1a2e9b43fcbdd2c7c8b9ce6f1f19f81291d`。
- 线上 HTML 与该发布提交的 `index.html` 完全一致；其 `CNAME` 为 `www.yiranshu.com`。
- 3D 来源：已确认的 Sites 第 23 版，提交 `f434e073cd2165638c2a8f889e0e6ba0e9659c22`。
- 迁移分支：`codex/portfolio-3d-home`，基于 `react-version`。

## 发布后的结构

| 地址 | 内容 |
| --- | --- |
| `https://www.yiranshu.com/` | 新的 3D 首页 |
| `https://www.yiranshu.com/2d/` | 原来的平面作品集 |
| `https://www.yiranshu.com/2d/#/architecture` | 原建筑分类 |
| `https://www.yiranshu.com/nuwa-creation/` | 保留原女娲项目地址 |
| `https://www.yiranshu.com/studio/` | 保留新加入的跨学科作品集 |

两个版本都有 `3D / 2D` 入口。原站的分类顺序、页面内容、图片和 Developer 项目地址保留。旧分类书签会跳到对应的 2D 页面。图片仍在 `/images/`，避免破坏已有链接，也避免复制两套原图。新 3D 的相机、层布局和图像比例与已确认的第 23 版一致。

## 已验证

- TypeScript 检查和 Vite 生产构建通过。
- 104 个原站图片文件、48 张 3D 展示图片及 9 个 Developer 目标链接通过检查。
- 两个首页、脚本和本地资源路径、域名文件、UI 元素引用通过检查。
- 11 个路由案例通过：旧分类、查询参数、3D 作品链接、未知路径和独立项目路径。
- 女娲项目在准备迁移时返回 HTTP 200，项目链接保持原值。
- 本环境未进行浏览器视觉与交互验证；发布前仍需检查 3D/2D 切换、Orbit、移动端与图片查看器。联系表单未实际提交。

## 后续发布

1. GitHub 插件已连接至 `Cornelia1425`，已确认此仓库的读写权限。
2. 审阅 `codex/portfolio-3d-home` 的改动，通过后合并到 `react-version`；单独 push 源码不会自动发布网站。
3. 在浏览器检查构建结果，再使用现有发布流程将 `dist/` 发布到 `gh-pages`。
4. 确认 GitHub Pages 的发布来源和域名配置。当前域名继续使用同一 Pages 站点时，保留现有 DNS；无需把它改指向 ChatGPT Sites。

当前没有更改 GoDaddy DNS，也没有更改 GitHub Pages 设置或覆盖发布分支。`/studio/` 的四个文件已原样加入 `public/studio/`，后续构建会保留。此前 `eanbills.com` 的验证记录不用于此域名。

根目录、`spatial/`、`src/`、`public/studio/` 各有中英文 README，说明对应版本、源码位置、分支与更新方法。建议沿用本机 `Documents/Dev/` 下现有的 Portfolio React 文件夹，但需要先在本机确认其 Git remote 对应本仓库；云端准备工作不会自动写入电脑的 Documents 文件夹。

## 回退依据

保留上面的原始发布提交与 React 源码提交。需要回退时，可从原始发布提交准备恢复提交，将原来的静态文件重新发布到 `gh-pages`，域名保持不变。本次迁移不直接更新 `gh-pages`；独立迁移分支供审阅。
