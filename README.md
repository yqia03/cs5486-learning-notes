# CS5486 智能系统学习手册

个人整理的十二周智能系统学习资料。保留已有教材的完整讲解、推导、例题、图表、练习、折叠答案、重要性评级与来源索引；不是官方课程网站。

- 网站：<https://yqia03.github.io/cs5486-learning-notes/>
- 仓库：<https://github.com/yqia03/cs5486-learning-notes>

## 阅读功能

十二周独立页面、分级章节锚点、前后周导航、中文／英文／周次全文搜索、浅色／深色主题、本机阅读位置保存、移动端折叠目录和打印样式。全文搜索包含答案；链接到答案时自动展开。正文以原生 HTML、MathML、SVG 呈现，不依赖 iframe 或外部公式 CDN。禁用 JavaScript 后，正文、目录和折叠答案仍然可用。

数学排版面向支持原生 MathML 的现代 Chromium、Safari/WebKit 和 Firefox。图形保留原配色，深色主题中使用浅色图面；宽表格及公式在各自区域横向滚动。

## 本地构建与预览

需要 Node.js 24 或更新版本。克隆仓库后即可构建，无需获取原始课件或父目录教材。

```sh
npm ci
npm test
npm run preview
```

打开终端输出的 Local 地址。默认地址为 `http://127.0.0.1:4173/cs5486-learning-notes/`，故意保留与 GitHub Pages 一致的仓库子路径。

构建输出在 dist/，不提交 Git。站点配置在 site.config.json。若修改仓库名，更新 repository、base 及 README 地址；构建也可指定路径：

```sh
npm run build -- --base /another-repository/
npm run check
npm run preview
```

预览服务器读取构建后的路径配置，拒绝从域名根路径误读资源。首页、各周页面及深层小节链接均为真实静态地址。

## 更新某周教材并发布

在原有项目布局中，十二份原始 HTML 位于本项目的父目录。先更新原教材，然后在本项目目录运行：

```sh
npm run import -- --source .. --week 03
npm test
git add source docs/IMPORT_REPORT.md
git commit -m "Update week 03 textbook"
git push
```

推送 main 后，GitHub Actions 自动重新构建、检查和部署。等待仓库 Actions 中 **Deploy course website** 成功后，打开网站确认更新。

全部十二周重新导入时，省略 `--week 03`：

```sh
npm run import -- --source ..
```

从其他目录导入时，将 `--source` 改成原教材目录。文件命名必须为 `CS5486-Week01-学习教材.html` 至 `CS5486-Week12-学习教材.html`。命令读取原件但不修改原件；不会递归复制父目录，也不会导入 PDF 或提示词。

不要手工编辑 source/weeks/、source/assets/、source/manifest.json 或 dist/。教材变更应通过导入流程完成。新增外部图片、脚本或文档结构不符合约定时，导入会要求先检查依赖；不要为让检查通过而直接更新基线哈希。

导入过程保存源文件 SHA-256，规范化全文及 MathML/SVG 指纹，提取 PNG 原始字节，并写入转换记录。重复导入相同输入会产生相同结果。源码仓库只保存已清理本机路径的教材副本和必要资源，Actions 无需访问原件。

## 验证

```sh
# 构建 + 全部内容、图片、ID、链接和搜索检查
npm test

# 额外确认项目外的原始教材哈希未改变
npm run check -- --originals ..

# 安装浏览器后运行完整真实浏览器验收
npx playwright install chromium webkit
npm run test:browser
npm run test:browser -- --engine webkit

# 对实际部署地址运行同一套验收
npm run test:browser -- --url https://yqia03.github.io/cs5486-learning-notes/

# 对教材外部来源链接作可访问性检查（先构建）
npm run check:links
```

浏览器检查覆盖首页和全部十二周，包含 1440、834、390 像素宽度与浅深主题，并检查中文／英文／周次搜索、答案跳转、深层链接刷新、前后周、阅读位置、键盘、打印和存储不可用时的降级。报告、截图及打印样张保存在 output/，不提交。

外部网站的访问保护、超时与证书问题列为未验证，不自动当作失效链接或擅自改写来源。当前记录见 docs/LINK_REPORT.md；教材内容疑点见 docs/CONTENT_REVIEW.md。

## 自动部署

Pages 的发布源设置为 **GitHub Actions**。工作流使用锁文件、固定 Node 主版本及固定提交的官方 Actions，依次运行构建、内容检查、Chromium 浏览器验收、上传 Pages artifact 和部署。也可在 Actions 页面手动运行 `workflow_dispatch`，无需空提交。

首次部署须由仓库管理员启用 Pages；日常教材更新只需上述导入、检查与推送步骤。失败时在 Actions 查看失败步骤日志，本地修复后再次推送。

## 文件与许可

- scripts/：导入、静态生成、预览和验证程序。
- web/：网站界面、搜索 Worker 和阅读功能。
- source/：教材副本、无损图片及保真清单。
- docs/：导入记录、内容疑点和外部链接检查。
- .github/workflows/：验证和 Pages 部署。

新编写的网站代码使用 MIT License。教材正文、课程图片、第三方图文和原教材样式不适用该许可证；来源与许可边界见 THIRD_PARTY_NOTICES.md。原始课件、Tutorial PDF、提示词、凭据、机器路径和临时产物不上传。
