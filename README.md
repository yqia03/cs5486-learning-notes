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

## 期中考试复习特别篇

专题入口为 `/cs5486-learning-notes/midterm/`，覆盖主课件实际第 1–165 页，止于 MAXNET。它是独立复习专题，不改变十二周次序。LS-SVM 以回归建模、求导、消元、线性系统和回代为主线，并对照分类；所有例题均为自拟复习材料。

### 更新、导入与发布

先修改本地独立成品 `../学习笔记/CS5486-期中考试复习特别篇-至MAXNET.html`，保留稳定知识块、例题和答案 ID。再执行：

```sh
npm run import:midterm -- --source ../学习笔记
npm test
npm run check -- --originals ../学习笔记
npm run test:browser
npm run test:browser -- --engine webkit
```

也可用 `--file` 指定另一位置的完整 HTML。导入器只保存正文、标题和样式，去掉独立文件的阅读脚本；网站共用搜索、主题和导航，并加载专题折叠控制。导入不修改原件。仓库保存 `source/topics/midterm.html` 和保真清单，CI 直接使用这些已清理的文件，不需要本机教材目录或原始 PDF。不要手改 dist 或为内容修改直接改哈希基线。

首页有“期中复习”入口；搜索条目标记“期中复习”，例题和内层答案分别索引、独立定位并自动展开。`midterm-reading:v1` 使用单独的阅读进度键，不写入任何周的进度。打印前展开所有解答，打印后还原折叠状态；回到完整笔记的链接保留真实小节锚点，浏览器返回恢复专题阅读位置。

发布前确认没有另一个对话正在修改／推送同一站点。只精确暂存本次专题源、脚本、资源与文档，再提交并推送 main，等待既有 **Deploy course website** 成功。在线验证：

```sh
npm run test:browser -- --url https://yqia03.github.io/cs5486-learning-notes/
```

`npm test` 同时运行原十二周检查和专题检查，`--originals` 参数会传给两套检查。`npm run test:browser` 同时运行原十二周验收与专题验收，URL／浏览器参数也传给两套。专题核心数值由 `scripts/numerical/` 中独立编写的 Python 标准库脚本校验（需要 Python 3；GitHub 托管 runner 已提供），不依赖内容生成逻辑。覆盖、勘误和验收范围见 `docs/MIDTERM.md`。专题文字、第三方资料与原教材样式不适用代码 MIT 许可。
