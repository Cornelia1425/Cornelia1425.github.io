# Yiran Shu · 3D + 2D Portfolio

同一个仓库：3D 首页、原来的 2D 作品集，以及现有 Studio 页面。此迁移分支供审阅；保存源码不等于发布网站。

One repository: the 3D homepage, original 2D portfolio, and existing Studio page. This migration branch is for review; saving source does not publish the website.

仓库 / Repository: [Cornelia1425/Cornelia1425.github.io](https://github.com/Cornelia1425/Cornelia1425.github.io)

## 用哪个分支？ / Which branch?

3D 和 2D 是同一个源码分支里的不同文件夹，不需要两个仓库。/ 3D and 2D are folders in the same source branch, not separate repositories.

| 分支 / Branch | 用途 / Purpose |
| --- | --- |
| `codex/portfolio-3d-home` | **当前迁移与审阅分支；合并前 push 到这里。** Current migration/review branch; push here before merging. |
| `react-version` | 原 2D 源码分支；**迁移合并后，日常 3D、2D、Studio 修改都 push 到这里。** Original 2D source; after merging the migration, maintain all views here. |
| `gh-pages` | 正式网站的生成文件，由 `npm run deploy` 更新。 Generated live-site files, updated by `npm run deploy`. |
| `master` | 更早的旧版 HTML，不用于这次迁移。 Older HTML version, not used for this migration. |

## 文件在哪里？ / Where are the files?

以下地址对应**发布后的**网站。/ These URLs describe the site **after deployment**.

| 内容 / View | 编辑位置 / Source | 访问地址 / URL |
| --- | --- | --- |
| 3D 空间作品集 / Spatial portfolio | [`spatial/`](spatial/README.md) | `https://www.yiranshu.com/` |
| 原 2D 作品集 / Original flat portfolio | [`src/`](src/README.md) | `https://www.yiranshu.com/2d/` |
| Studio 跨学科作品集 / Interdisciplinary portfolio | [`public/studio/`](public/studio/README.md) | `https://www.yiranshu.com/studio/` |
| 原站共享图片 / Shared original images | `public/images/` | `/images/` |
| 域名文件 / Domain file | `public/CNAME` | `www.yiranshu.com` |

`dist/` 是自动生成的网站，不要在里面改源码。`/nuwa-creation/` 是另行发布的项目，保留原地址；源码不在这些文件夹里。

`dist/` is generated output, not source. `/nuwa-creation/` remains a separately published project; its source is not in these folders.

## 本地放在哪里？ / Local folder

建议沿用电脑 `Documents/Dev/` 下现有的 Portfolio React 文件夹，前提是在该文件夹运行 `git remote get-url origin`，确认连接的是上面的仓库。不要在里面再嵌套 clone 一个完整仓库。切换分支前先运行 `git status`，保存已有修改。

Reuse the existing Portfolio React folder under `Documents/Dev/` if `git remote get-url origin` confirms the repository above. Do not clone a second repository inside it. Run `git status` and save existing work before switching branches.

## 查看与保存修改 / Preview and push

在仓库根目录运行；此次使用 Node.js 24 验证。/ Run from the repository root; validated with Node.js 24.

```sh
npm ci
npm run build
npm run preview
```

打开命令输出的本地地址查看 3D；加 `/2d/` 或 `/studio/` 查看其他版本。`npm run dev` 只启动 2D 开发页面；`npm run check` 检查已有构建。

Open the printed local URL for 3D, then `/2d/` or `/studio/` for the other views. `npm run dev` starts only the 2D development app; `npm run check` checks an existing build.

**迁移合并前 / Before the migration is merged:**

```sh
git fetch origin
git switch codex/portfolio-3d-home
# 修改文件后 / After editing files:
git status
git add .
git commit -m "Update portfolio"
git push -u origin codex/portfolio-3d-home
```

**迁移合并到 `react-version` 后**，日常修改用这个分支：

**After the migration is merged into `react-version`**, use that branch for ongoing edits:

```sh
git switch react-version
git pull --ff-only origin react-version
# 修改文件后 / After editing files:
git add .
git commit -m "Update portfolio"
git push origin react-version
```

## 发布正式网站 / Publish the live site

目前 push 源码不会自动发布。准备公开已检查的版本时，在包含已合并迁移代码的 `react-version` 分支运行：

Pushing source does not currently publish automatically. To publish a reviewed version, run this on `react-version` after it includes the merged migration:

```sh
npm ci
npm run deploy
```

此命令会重新构建，再把 `dist/` 发布到 **`gh-pages`**，改变正式网站。电脑上的 Git 需要已登录有写权限的 GitHub 账号。继续使用同一个 GitHub Pages 站点和 `www.yiranshu.com` 时，保留现有域名与 DNS 配置。

This rebuilds and publishes `dist/` to **`gh-pages`**, changing the live website. Local Git needs authentication with repository write access. Keep the existing domain and DNS configuration when continuing to use the same GitHub Pages site and `www.yiranshu.com`.

迁移来源、检查结果和回退依据见 [MIGRATION.md](MIGRATION.md)。/ See [MIGRATION.md](MIGRATION.md) for provenance, verification, and rollback notes.
