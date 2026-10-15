# 教材导入记录

导入程序只读取当前版本的原始教材，不修改原件；以下转换仅发生于网站导入副本，不进行知识性改写。教材在导入前的增补、纠正及资料限制另见 docs/CONTENT_REVIEW.md。当前原文件 SHA-256、正文与公式指纹详见 source/manifest.json；它们用于核验本次导入保真，不表示教材自首次发布后从未更新。

## 第 01 周

- Namespace references within 3 SVGs.

## 第 02 周

- Namespace references within 9 SVGs.
- Extract 2 PNG images without recompression; retain pixel dimensions and alt text.

## 第 03 周

- Add stable anchors to 3 headings.
- Namespace references within 7 SVGs.
- Extract 1 PNG images without recompression; retain pixel dimensions and alt text.

## 第 04 周

- Add stable anchors to 6 headings.
- Namespace references within 6 SVGs.

## 第 05 周

- Add stable anchors to 4 headings.
- Namespace references within 5 SVGs.
- Extract 2 PNG images without recompression; retain pixel dimensions and alt text.

## 第 06 周

- Add stable anchors to 12 headings.
- Namespace references within 5 SVGs.
- Extract 6 PNG images without recompression; retain pixel dimensions and alt text.

## 第 07 周

- Add stable anchors to 8 headings.
- Namespace references within 4 SVGs.
- Extract 1 PNG images without recompression; retain pixel dimensions and alt text.

## 第 08 周

- Add stable anchors to 9 headings.
- Namespace references within 3 SVGs.
- Extract 4 PNG images without recompression; retain pixel dimensions and alt text.

## 第 09 周

- Add stable anchors to 9 headings.
- Namespace references within 4 SVGs.
- Extract 3 PNG images without recompression; retain pixel dimensions and alt text.

## 第 10 周

- Namespace references within 10 SVGs.

## 第 11 周

- Replace local absolute path with 资料根目录; teaching content unchanged.
- Add stable anchors to 6 headings.
- Namespace references within 4 SVGs.
- Extract 1 PNG images without recompression; retain pixel dimensions and alt text.

## 第 12 周

- Add stable anchors to 4 headings.
- Namespace references within 2 SVGs.
- Extract 8 PNG images without recompression; retain pixel dimensions and alt text.

构建时另外将同目录教材 HTML 链接转换为对应周页面并保留锚点，将本地 PDF 引用改为站内来源条目，保留引用文字、文件名及实际页码；来源条目忽略前导相对目录段，以兼容教材移动目录前已发布的来源链接。为行内公式增加 HTML 滚动容器，以适配 WebKit，MathML 节点本身不变。教材的旧交付说明原样保留，由网站页脚说明当前资源布局。
