# Studio 跨学科作品集 / Interdisciplinary Portfolio

这里保留现有 Studio 页面的静态源码，地址仍是 **https://www.yiranshu.com/studio/**。它与 3D、原 2D 作品集一起发布。

This preserves the existing static Studio page at **https://www.yiranshu.com/studio/**. It is published together with the 3D and original 2D portfolios.

| 想改什么 / Change | 文件 / File |
| --- | --- |
| 页面内容与结构 / Page content and structure | `index.html` |
| 中英文文字、项目数据、交互 / Translations, project data, interaction | `app.js` |
| 页面样式 / Styles | `style.css` |
| 标识 / Mark | `mark.svg` |

部分图片使用共享 `/images/` 地址，对应 `public/images/`。构建时此文件夹复制到 `dist/studio/`；修改此处的源码，不要直接改 `dist/`。

Some images use shared `/images/` URLs from `public/images/`. The build copies this folder to `dist/studio/`; edit this source, not `dist/`.

**分支 / Branch:** 合并前 push 到 `codex/portfolio-3d-home`；合并后 push 到 `react-version`。

Push to `codex/portfolio-3d-home` before merging the migration, then to `react-version`.

在**仓库根目录**运行 `npm run build`、`npm run preview`，打开 `/studio/`。根目录的 `npm run deploy` 会发布整个网站到 `gh-pages`，包括此页面。

Run `npm run build` and `npm run preview` from the **repository root**, then open `/studio/`. The root `npm run deploy` publishes the whole site, including this page, to `gh-pages`.

[返回总说明 / Main README](../../README.md)
