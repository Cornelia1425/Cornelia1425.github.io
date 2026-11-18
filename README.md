# 3D 空间作品集 / 3D Spatial Portfolio

这里是 3D 网站源码。发布后访问 **https://www.yiranshu.com/**；原 2D 网站保留在 `/2d/`。

This is the 3D site source. After deployment, visit **https://www.yiranshu.com/**; the original 2D site remains at `/2d/`.

| 想改什么 / Change | 文件 / File |
| --- | --- |
| 项目、图片路径、Developer 外链 / Projects, images, Developer links | `projects.json` |
| 分层、排列、相机 / Layers, layout, camera | `layout.js`, `scene.js` |
| 页面结构、静态项目索引 / Page structure, static project index | `index.html` |
| 交互与语言切换 / Interaction and language switching | `app.js` |
| 字体、颜色、样式 / Typography, colors, styles | `style.css` |
| 图片与缩略图 / Images and thumbnails | `assets/` |
| 旧分类链接兼容 / Legacy category redirects | `legacy-routes.js` |

添加项目时，也检查 `index.html` 中的静态索引和 `app.js` 中相关文字。保留图片原比例，缩略图使用 16:9 裁切。

When adding projects, also check the static index in `index.html` and related text in `app.js`. Keep original image proportions; thumbnails use a 16:9 crop.

**分支 / Branch:** 合并前 push 到 `codex/portfolio-3d-home`；合并后 push 到 `react-version`。3D 和 2D 使用同一个源码分支。

Push to `codex/portfolio-3d-home` before merging the migration, then to `react-version`. 3D and 2D share the same source branch.

在**仓库根目录**运行 `npm run dev`，打开打印出的本地地址就是这个 3D 首页；`/2d/` 是平面作品集。完整构建用 `npm run build`、`npm run preview`。正式发布使用根目录的 `npm run deploy`，它会一起发布所有版本到 `gh-pages`。

Run `npm run dev` from the **repository root** and open the printed local address for this 3D homepage; `/2d/` is the flat portfolio. Use `npm run build` and `npm run preview` for a full build. The root `npm run deploy` publishes all views together to `gh-pages`.

运行时不需要 ChatGPT 登录或 API key。Three.js 许可证在 `vendor/THREE-LICENSE.txt`。

No ChatGPT login or API key is required at runtime. The Three.js license is in `vendor/THREE-LICENSE.txt`.

[返回总说明 / Main README](../README.md)
