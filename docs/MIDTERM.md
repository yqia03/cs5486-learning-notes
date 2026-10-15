# 期中复习特别篇：覆盖、依据与验证

本专题于 2026-10-15 按用户提供的考试消息编写；不是官方考试说明、真题或评分标准。先完成第05/06周增量更新（34928a1，验收记录406daae），再在该版本基础上整合本专题，未重写任一周。

- 范围：主课件 PDF 实际1–165页，第01–05周主干与第06周MAXNET及必要前置。164–165页页脚168–169；166页kWTA起不纳入核心。
- 最新重点：LS-SVM回归完整推导与分类对照、目标/约束建模、微分、线代、代数消元及关键词比较简答。“最高/最大”具体含义未确认。
- 成品：65个知识块、76个折叠例题／自测题；每块有原笔记具体小节与原资料定位。正文、例题、答案分层，正文直接可见。
- 来源：主课件；原辅助资料相关段落；SVR-tutorial实际1–4页、中文SVR实际1–4页用于核验；NPL-LS_SVM实际4–5页；LS-SVM-load实际5–8页。MAXNET另核验Lippmann实际5–6页与Box 2原图。更多具体范围见下表。
- 排除：kWTA、ART1、SOM及第07–12周算法；Nyström、ν-SVR、SMO和复杂负荷建模的研究细节。ART新资料不扩展期中范围。

## 覆盖表

|复习块|类型|完整笔记小节|原资料实际页|
|---|---|---|---|
|math-dimensions · Dimensions / Linear and affine maps（维度、线性与仿射映射）|两者|Week01 #vectors、Week01 #weighted-sum、Week04 #feature|Lecture_slides_full semester.pdf 160（矩阵系统的课程应用；本块运算为前置补充）；new-study-files/LS-SVM-load.pdf 5–6（显式非线性映射与核内积）|
|math-derivatives · Derivative / Gradient / Chain rule（微分、梯度与链式法则）|计算|Week03 #loss-gradient、Week03 #chain、Week03 #lms|Lecture_slides_full semester.pdf 84–85（LMS与梯度下降；二次型为所需数学补充）；Lecture_slides_full semester.pdf 159–160（LS-SVM二次目标与求导）|
|math-extrema · Stationarity / Optimality（驻点、极值与约束最优性）|两者|Week03 #local-minimum、Week04 #canonical、Week04 #primal、Week04 #kkt|Lecture_slides_full semester.pdf 135–140（最大间隔、原始/对偶与KKT；标量反例为前置补充）|
|math-elimination · Gaussian elimination（高斯消元与线性方程组）|计算|Week04 #least-squares、Week05 #ls-example|Lecture_slides_full semester.pdf 160（LS-SVM线性系统；消元与解的分类为前置补充）|
|w1-task · Intelligent systems（智能系统）：先识别任务与方法|理解|Week01 #system、Week01 #ai-ci、Week01 #hard-soft、Week01 #three-paradigms|Lecture_slides_full semester.pdf 7–9、24–30（主课件 · PDF 实际第 7–9、24–30 页）|
|w1-arch · ARCH（结构）：节点、状态、权重与维度|两者|Week01 #ann-architecture、Week01 #weights|Lecture_slides_full semester.pdf 31–36、43–44（主课件 · PDF 实际第 31–36、43–44 页）|
|w1-rules · RULE（规则）：加权和 → 激活 → 输出 → 评价 → 学习|两者|Week01 #rules、Week01 #aggregation、Week01 #evaluation|Lecture_slides_full semester.pdf 35–38、40（主课件 · PDF 实际第 35–38、40 页）|
|w1-supervision · Supervision（监督信息）：训练、推理与泛化|理解|Week01 #supervision、Week01 #generalization|Lecture_slides_full semester.pdf 4、9、38、42（主课件 · PDF 实际第 4、9、38、42 页）|
|w1-categories · Network categories（网络分类）：连接、随机性与时间尺度|理解|Week01 #categories、Week01 #feedforward、Week01 #two-timescales、Week01 #discrete-continuous|Lecture_slides_full semester.pdf 40–42（主课件 · PDF 实际第 40–42 页）|
|w1-properties · Network properties（网络性质）：能力必须连同条件解释|理解|Week01 #properties、Week01 #nonlinearity、Week01 #fault-tolerance|Lecture_slides_full semester.pdf 43–45（主课件 · PDF 实际第 43–45 页）|
|w2-veto · M-P neuron（M-P 神经元）：veto 与普通负权|两者|Week02 #mp、Week02 #veto|Lecture_slides_full semester.pdf 46–47（主课件 · PDF 实际第 46–47 页）|
|w2-gates · Threshold design（阈值设计）：AND、OR、NOT 与真值表|两者|Week02 #step、Week02 #gates|Lecture_slides_full semester.pdf 48–50、54、71、75（主课件 · PDF 实际第 48–50、54、71、75 页）|
|w2-decoder · Decoder（解码器）与多层逻辑：表示能力从哪里增加|两者|Week02 #decoder、Week02 #two-layers、Week02 #monotone|Lecture_slides_full semester.pdf 51–54（主课件 · PDF 实际第 51–54 页）|
|w2-state · Recurrent state（循环状态）与有限自动机|两者|Week02 #binary-scaler、Week02 #automaton|Lecture_slides_full semester.pdf 55–57（主课件 · PDF 实际第 55–57 页）|
|w2-perceptron · Perceptron（感知机）与 bias：一条可学习的边界|两者|Week02 #classic、Week02 #bias|Lecture_slides_full semester.pdf 58–61、69（主课件 · PDF 实际第 58–61、69 页）|
|w2-geometry · Input / weight space（输入/权重空间）与线性可分|两者|Week02 #input-space、Week02 #separability、Week02 #dual、Week02 #feasible|Lecture_slides_full semester.pdf 62–63、72–78（主课件 · PDF 实际第 62–63、72–78 页）|
|w2-learning · Perceptron learning rule（感知机学习规则）：逐样本纠错|计算|Week02 #training、Week02 #update、Week02 #and-training、Week02 #epoch|Lecture_slides_full semester.pdf 64–70（主课件 · PDF 实际第 64–70 页）|
|w2-convergence · Convergence（收敛）与 XOR：先问解是否存在|两者|Week02 #theorem、Week02 #xor-algebra、Week02 #xor-geometry、Week02 #nonconverge|Lecture_slides_full semester.pdf 63、70、79–80（主课件 · PDF 实际第 63、70、79–80 页）|
|w2-coding · Unipolar / bipolar coding（单极/双极编码）|两者|Week02 #coding、Week02 #bipolar|Lecture_slides_full semester.pdf 81–82（主课件 · PDF 实际第 81–82 页）|
|w3-adaline · ADALINE 与 LMS：最小化线性输出残差|两者|Week03 #adaline-model、Week03 #lms、Week03 #adaline-example|Lecture_slides_full semester.pdf 83–85、87（主课件 · PDF 实际第 83–85、87 页）|
|w3-training-modes · Online / batch（逐样本/整批）：时机与损失缩放|计算|Week03 #training-modes|Lecture_slides_full semester.pdf 84–87（主课件 · PDF 实际第 84–87 页）；course_files_export/Tutorials/Perceptron_Adaline.pdf 15–16（原辅助资料 · LMS 逐样本更新，PDF 实际第 15–16 页）|
|w3-capacity · Representation capacity（表示容量）：分区数与布尔函数|两者|Week03 #weight-space、Week03 #region-count、Week03 #boolean|Lecture_slides_full semester.pdf 88–92（主课件 · PDF 实际第 88–92 页）|
|w3-mlp · MLP（多层感知机）与 XOR：非线性中间表示|两者|Week03 #architecture、Week03 #xor-three、Week03 #xor-alternatives|Lecture_slides_full semester.pdf 93–100（主课件 · PDF 实际第 93–100 页）|
|w3-activation · Differentiable activation（可微激活）与链式法则|两者|Week03 #activation、Week03 #chain、Week03 #credit|Lecture_slides_full semester.pdf 101–104、106–108（主课件 · PDF 实际第 101–104、106–108 页）|
|w3-bp · Backpropagation（反向传播）：输出层与隐藏层梯度|计算|Week03 #bp-notation、Week03 #bp-output、Week03 #bp-hidden、Week03 #bp-first|Lecture_slides_full semester.pdf 105–108（主课件 · PDF 实际第 105–108 页）|
|w3-bp-complete · One complete BP step（完整一次 BP）：前向、反向、同步更新|计算|Week03 #mlp-calculation、Week03 #numeric-forward、Week03 #numeric-backward、Week03 #numeric-update|Lecture_slides_full semester.pdf 105–109（主课件 · PDF 实际第 105–109 页）|
|w3-momentum · Momentum（动量）与局部优化|两者|Week03 #local-minimum、Week03 #momentum|Lecture_slides_full semester.pdf 110–111（主课件 · PDF 实际第 110–111 页）|
|w3-generalization · Representation / optimization / generalization（表示/优化/泛化）|两者|Week03 #kolmogorov、Week03 #universal、Week03 #overfitting、Week03 #regularization|Lecture_slides_full semester.pdf 112–114（主课件 · PDF 实际第 112–114 页）|
|w4-rbf · RBF（径向基）：用到中心的距离产生特征|两者|Week04 #radial、Week04 #families、Week04 #architecture|Lecture_slides_full semester.pdf 115（主课件实际第115–119页）|
|w4-rbf-solve · 固定特征后的输出求解：插值、近似与偏置|计算|Week04 #interpolation、Week04 #least-squares|Lecture_slides_full semester.pdf 115（主课件实际第115–119页）；course_files_export/CS-Broomhead-Lowe1988.pdf 3（固定基函数与线性输出求解（实际第3–9页））|
|w4-phi · φ-separability（φ 可分性）：XOR 如何换表示|两者|Week04 #separability、Week04 #xor-rbf、Week04 #xor-bias|Lecture_slides_full semester.pdf 120（主课件实际第120–123页）|
|w4-fln · FLN（函数连接网络）：预设展开与参数角色|两者|Week04 #fln、Week04 #compare|Lecture_slides_full semester.pdf 124（主课件实际第124–125页）|
|w4-elm · ELM（极限学习机）：随机固定隐藏层、学习输出层|理解|Week04 #elm、Week04 #compare|Lecture_slides_full semester.pdf 126（主课件实际第126页）|
|w4-margin · SVM 间隔：函数分数、几何距离与最大化|两者|Week04 #hyperplane、Week04 #two-margins、Week04 #canonical、Week04 #why-margin|Lecture_slides_full semester.pdf 127（主课件实际第127–136页）|
|w4-svm-dual · 硬间隔 SVM：从原始最小化推到对偶最大化|两者|Week04 #primal、Week04 #lagrange、Week04 #dual|Lecture_slides_full semester.pdf 134（主课件实际第134–139页）|
|w4-kkt · KKT、支持向量与新点预测：用条件检查答案|两者|Week04 #kkt、Week04 #support-vectors、Week04 #decision-function、Week04 #small-svm|Lecture_slides_full semester.pdf 140（主课件实际第140–141页）|
|w5-soft · Soft-margin SVM（软间隔）：松弛与 C 的作用|两者|Week05 #slack、Week05 #soft-primal|Lecture_slides_full semester.pdf 142（主课件实际第142–143页）|
|w5-soft-kkt · 软间隔 KKT：盒约束和自由支持向量|两者|Week05 #soft-dual|Lecture_slides_full semester.pdf 144（主课件实际第144页）|
|w5-kernel-map · Kernel trick（核技巧）：显式特征与内积|两者|Week05 #feature-map、Week05 #kernel-inner-product、Week05 #polynomial|Lecture_slides_full semester.pdf 145（主课件实际第145–148页）|
|w5-gram · Gram matrix（格拉姆矩阵）与有效核|两者|Week05 #gram、Week05 #common-kernels|Lecture_slides_full semester.pdf 149（主课件实际第149–150页）|
|w5-width · Kernel width（核宽度）与两种 RBF 模型|两者|Week05 #width、Week05 #rbf-network|Lecture_slides_full semester.pdf 149（主课件实际第149、153页）|
|w5-kernel-predict · 核分类：从 Gram 矩阵到有标签的预测|两者|Week05 #kernel-qp|Lecture_slides_full semester.pdf 151（主课件实际第151–152页）|
|w5-svr-primal · SVR（支持向量回归）：管道、残差与两类松弛|两者|Week05 #epsilon、Week05 #svr-primal|Lecture_slides_full semester.pdf 155（主课件实际第155–156页）；new-study-files/SVR.pdf 1（偏置记号与 primal 核验（实际第1–2页））；new-study-files/SVR-tutorial.pdf 1（SVR 基本建模与损失（实际第1–2页））|
|w5-svr-dual · SVR 推导与预测：为什么用 α−α*|两者|Week05 #svr-dual|Lecture_slides_full semester.pdf 157（主课件实际第157–158页）；new-study-files/SVR-tutorial.pdf 2（对偶、支持向量展开及偏置（实际第2–3页））|
|w5-svr-boundaries · SVR 边界：稀疏、ε=0 与没有自由支持向量|两者|Week05 #svr-dual|Lecture_slides_full semester.pdf 157（主课件实际第157–158页）；new-study-files/SVR.pdf 4（偏置范围疑似笔误位置（实际第4页））；new-study-files/SVR-tutorial.pdf 3（KKT 与偏置界交叉核验（实际第3页））|
|w5-selection · Model selection（模型选择）：泛化、评估与数据泄漏|理解|Week05 #selection、Week05 #leakage、Week05 #spiral、Week05 #load|Lecture_slides_full semester.pdf 152（主课件实际第152–154、162–163页）|
|ls-model · LS-SVM modelling（最小二乘支持向量机：从任务构建目标）|两者|Week05 #ls-primal、Week05 #notation|Lecture_slides_full semester.pdf 159（回归形式的原始目标与约束）；new-study-files/LS-SVM-load.pdf 7（回归模型式11–13）|
|ls-derivation · LS-SVM Lagrangian（拉格朗日函数、四组偏导与消元）|计算|Week05 #ls-derivation|Lecture_slides_full semester.pdf 160（Lagrangian与驻点条件）；new-study-files/LS-SVM-load.pdf 8（式14–20逐步消元）|
|ls-system · Block linear system（分块线性系统：维度与未知量排序）|计算|Week05 #ls-derivation|Lecture_slides_full semester.pdf 160–161（分块系统与预测式）|
|ls-regression · Worked LS-SVM regression（回归全链条：核、消元、预测与回代）|计算|Week05 #ls-example、Week05 #ls-primal、Week05 #ls-derivation|Lecture_slides_full semester.pdf 159–161（回归建模与系统；数据为自拟复习示例）；new-study-files/LS-SVM-load.pdf 7–8（回归原始模型和消元依据）|
|ls-classification · LS-SVM classification（分类对照：标签矩阵、间隔残差与sign）|两者|Week05 #ls-sparsity|new-study-files/NPL-LS_SVM.pdf 4–5（分类原始问题、四组导数、带标签核矩阵；式15–21）|
|ls-conditions · Validity / Density（有效核、唯一解、稠密性与求解自检）|两者|Week05 #ls-derivation、Week05 #ls-sparsity|Lecture_slides_full semester.pdf 159–161（标准LS-SVM模型）；new-study-files/NPL-LS_SVM.pdf 4–5（等式乘子与误差关系）；new-study-files/LS-SVM-load.pdf 7–8（正正则化参数和回归求导）|
|ls-transfer · Transfer / Error diagnosis（换参数迁移与推导纠错）|计算|Week05 #ls-primal、Week05 #ls-derivation、Week05 #ls-example、Week05 #ls-sparsity|Lecture_slides_full semester.pdf 159–161（迁移题依据：回归模型）；new-study-files/NPL-LS_SVM.pdf 4–5（纠错题依据：分类模型）|
|mx-structure · MAXNET structure（最大输入选择网络与固定连接）|两者|Week06 #maxnet、Week06 #maxnet-connections|Lecture_slides_full semester.pdf 164（实际第164–165页（页脚168–169））；course_files_export/ASSPM-Lippmann1987.pdf 5（实际第5–6页、Box 2）|
|mx-iteration · Synchronous update（同步状态迭代）|计算|Week06 #maxnet-calc|Lecture_slides_full semester.pdf 164（实际第164–165页（页脚168–169））；course_files_export/ASSPM-Lippmann1987.pdf 5（实际第5–6页、Box 2）|
|mx-boundaries · Ties and zero inputs（并列与全零边界）|两者|Week06 #maxnet-limits、Week06 #maxnet-calc|Lecture_slides_full semester.pdf 164（实际第164–165页（页脚168–169））；course_files_export/ASSPM-Lippmann1987.pdf 5（实际第5–6页、Box 2）|
|cmp-mp-perceptron · M-P / Perceptron（固定逻辑与可学习阈值）|理解|Week02 #mp、Week02 #training|Lecture_slides_full semester.pdf 46（实际第46–54、58–70、79–80页）|
|cmp-perceptron-adaline · Perceptron / ADALINE（判错更新与线性残差）|理解|Week03 #adaline、Week03 #lms、Week02 #training|Lecture_slides_full semester.pdf 83（实际第83–87页；感知机学习见64、69–70页）|
|cmp-mlp-rbf · MLP / RBF（仿射激活与径向局部响应）|理解|Week03 #mlp-xor、Week03 #bp、Week04 #rbf|Lecture_slides_full semester.pdf 93（实际第93–109、115–119页；限制见110–114页）|
|cmp-rbf-fln-elm · RBF / FLN / ELM（特征从哪里来）|理解|Week04 #architecture、Week04 #fln-elm|Lecture_slides_full semester.pdf 115（实际第115–119、124–126页）|
|cmp-rbf-kernel · RBF network / RBF-kernel SVM（相似性相同，训练问题不同）|理解|Week04 #rbf、Week05 #kernels、Week05 #kernel-training|Lecture_slides_full semester.pdf 115（实际第115–119、137–141、147–152页）|
|cmp-hard-soft · Hard-margin / Soft-margin SVM（严格分离与允许违约）|理解|Week04 #optimization、Week05 #soft|Lecture_slides_full semester.pdf 131（实际第131–144页）|
|cmp-svm-svr-ls · SVM / SVR / LS-SVM（任务、损失、约束与稀疏性）|理解|Week05 #comparison、Week05 #svr-primal、Week05 #ls-sparsity|Lecture_slides_full semester.pdf 142（实际第142–144、147–152、155–161页）；new-study-files/NPL-LS_SVM.pdf 4（实际第4–5页，LS-SVM分类）|
|cmp-maxnet · MAXNET / Feedforward prediction（竞争状态与前馈预测）|理解|Week06 #maxnet、Week01 #ann-architecture、Week03 #mlp-xor|Lecture_slides_full semester.pdf 164（实际第164–165页；前馈/循环与状态/权重见40–42页，MLP见93–109页）|
|cmp-cross-model · Cross-model concepts（跨模型关键词与判断）|理解|Week01 #supervision、Week01 #generalization、Week03 #limits、Week04 #feature|Lecture_slides_full semester.pdf 38（实际第38–42、112–114、120–123、145–148页）|

## 准确性与解释约定

- 统一预测偏置使用 +b；单样本平方误差采用 1/2 因子。BP 使用损失对净输入的导数，配负梯度更新；所有层梯度用同一套旧参数计算。
- RBF网络与核的宽度按所在块明确定义；不同指数分母不直接混用同名σ。
- SVR偏置由四类KKT条件分别推导；不照录中文材料的偏置号、上界max及两类±ε混用。ε=0与无自由支持向量另有例题。
- LS-SVM以回归的K+γ⁻¹I和全1向量为主线；分类另用带标签Gram与标签向量，右端为全1。等式乘子不设非负或盒约束；标准LS-SVM通常稠密。
- MAXNET课件实际165页的负连接措辞以同页上下文和Lippmann Box 2核正为侧向抑制；固定矩阵与同步活动迭代分开。唯一正最大、并列、全零、赢家索引与幅值均有明确边界。
- 数学工具是本课所需前置补充，不将任何可微驻点自动视为极值或全局最优；二次型简式明示对称条件。

## 验证方法

`npm test`保留原十二周的结构、规范化正文、MathML、SVG、图像与链接保真检查，并增加专题原件指纹、每块例题、具体笔记锚点、来源和搜索索引检查。`npm run check -- --originals ../学习笔记`检查十二周和独立专题原文件哈希。

`scripts/numerical/`为独立编写的Python标准库数值检查，不导入内容生成逻辑：涵盖感知机轨迹、LMS online/batch、BP全部梯度（含有限差分）、momentum、RBF与FLN、间隔及SVM KKT、核矩阵与预测、SVR两类松弛/free b/无free区间/ε=0反例、LS-SVM回归/分类/参数迁移、微分/高斯消元与MAXNET完整轨迹。

浏览器套件保留原十二周验收；专题增加三种屏宽、浅深主题、键盘折叠、全部展开/收起、中文/英文/答案搜索、命中祖先展开、锚点刷新、回笔记与返回、独立进度、打印前后状态和无JavaScript降级。运行报告、截图及打印样张位于忽略的output目录。独立HTML另用file://测试，不依赖服务器或公式CDN。

## 本地验收记录（2026-10-15）

- `npm test`及带`--originals`的检查通过；17个页面、3,080条内部链接通过，十二周源文件与导入清单未改动。
- 专题65个知识块、76道折叠例题／自测题、66个内层解析；完整覆盖索引包含末尾六道自测。正文168条原笔记链接，连同索引共366处，实际锚点均已验证。
- 原十二周浏览器检查在Chromium、WebKit各92项通过；最终专题检查在两浏览器各12组通过，覆盖1440／834／390像素、浅深主题、搜索与折叠、打印恢复、深链返回、独立进度和无脚本阅读。无控制台错误或资源404。
- 独立HTML以本地文件方式在Chromium／WebKit、1440／390像素共32项通过；另目视检查浅深主题、LS-SVM回归／分类和数学工具消元、打印第64–65页。
- 全部709个MathML公式与1幅原创SVG随专题源保存；长公式和表格在窄屏局部滚动。打印消元步骤采用分行矩阵、显式增广分隔线，避免长箭头标签挤压。
- 四套独立数值脚本通过；另由独立审读从LS-SVM原始目标重新求解，验证回归与分类答案。原资料8个PDF的所有引用页序均在文件页数范围内，原PDF不提交。

## 仍待核对

用户消息尚未明确“最高/最大”的具体所指、LS-SVM题型侧重、题型比例、分值、考试时长或具体题目。正文将其如实标为未知，不以自拟题推断考试概率。新论文高级实验中仍存的研究细节疑点不进入本专题核心训练；参见原有NEW_MATERIALS.md与CONTENT_REVIEW.md。
