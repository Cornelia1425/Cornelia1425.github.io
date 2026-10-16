# 2D 平面作品集 / 2D Portfolio

这里保留原来的 React / TypeScript 源码。发布迁移后访问 **https://www.yiranshu.com/2d/**；例如建筑页面是 `/2d/#/architecture`。

This preserves the original React / TypeScript source. After deploying the migration, visit **https://www.yiranshu.com/2d/**; the architecture page is `/2d/#/architecture`.

| 想改什么 / Change | 文件 / File |
| --- | --- |
| 各类别的项目与页面 / Category projects and pages | `pages/` |
| 导航、3D/2D 入口、页脚 / Navigation, view switch, footer | `components/Header.tsx`, `components/Footer.tsx` |
| 页面路由 / Page routes | `App.tsx` |
| 全局样式 / Global styles | `App.css`, `index.css` |
| 原站图片 / Original images | `../public/images/` |

图片仍用 `/images/...`，不需要改为 `/2d/images/...`。根目录的 `vite.config.ts` 将 React 生产版本生成到 `dist/2d/`。

Keep image URLs as `/images/...`, not `/2d/images/...`. The root `vite.config.ts` builds the production React app into `dist/2d/`.

**分支 / Branch:** 合并前 push 到 `codex/portfolio-3d-home`；合并后 push 到 `react-version`。在此处修改源码，不直接编辑 `gh-pages` 的生成文件。

Push to `codex/portfolio-3d-home` before merging the migration, then to `react-version`. Edit source here rather than generated files on `gh-pages`.

在**仓库根目录**运行 `npm run dev` 开发 2D 页面。检查完整网站时，运行 `npm run build`、`npm run preview`，打开 `/2d/`。根目录的 `npm run deploy` 会一起发布所有版本。

Run `npm run dev` from the **repository root** for 2D development. To review the complete site, run `npm run build`, then `npm run preview`, and open `/2d/`. The root `npm run deploy` publishes all views together.

[返回总说明 / Main README](../README.md)
