# CS5486 智能系统学习手册

个人整理的十二周智能系统学习资料。保留已有教材的完整讲解、推导、例题、图表、练习、折叠答案、重要性评级与来源索引；不是官方课程网站。使用模型为GPT-6-Astra-Ultra

- 网站：<https://yqia03.github.io/cs5486-learning-notes/>
- 仓库：<https://github.com/yqia03/cs5486-learning-notes>

## 阅读功能

十二周独立页面、分级章节锚点、前后周导航、中文／英文／周次全文搜索、浅色／深色主题、本机阅读位置保存、移动端折叠目录和打印样式。全文搜索包含答案；链接到答案时自动展开。正文以原生 HTML、MathML、SVG 呈现，不依赖 iframe 或外部公式 CDN。禁用 JavaScript 后，正文、目录和折叠答案仍然可用。

数学排版面向支持原生 MathML 的现代 Chromium、Safari/WebKit 和 Firefox。图形保留原配色，深色主题中使用浅色图面；宽表格及公式在各自区域横向滚动。

## 教材增量更新

原始 HTML 当前位于本项目同级的“学习笔记”目录。编辑前在仓库之外备份对应周，再运行例如 `npm run import -- --source ../学习笔记 --week 05`；省略 `--source` 时也默认使用该目录。不要直接编辑 `source/weeks/` 或 `source/manifest.json`。

导入后执行 `npm test`、`npm run check -- --originals ../学习笔记` 和 `npm run test:browser`；本地构建沿用正式 `/cs5486-learning-notes/` 子路径。推送后等待既有 Actions 成功，再验收实际站点。

本轮第05、06周的资料覆盖、计算核验与待核对事项见 [新增资料记录](docs/NEW_MATERIALS.md) 和 [内容修正记录](docs/CONTENT_REVIEW.md)。导入只转换当前教材的呈现形式，知识增补在原教材中完成。

## 文件与许可

- scripts/：导入、静态生成、预览和验证程序。
- web/：网站界面、搜索 Worker 和阅读功能。
- source/：教材副本、无损图片及保真清单。
- docs/：导入记录、内容疑点和外部链接检查。
- .github/workflows/：验证和 Pages 部署。

网站代码使用 MIT License。教材正文、课程图片、第三方图文和原教材样式不适用该许可证；来源与许可边界见 THIRD_PARTY_NOTICES.md
