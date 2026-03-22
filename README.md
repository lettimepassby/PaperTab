# PaperTab

**PaperTab** 是一款极简、美观、且无后端的纯前端网页工具。旨在将 Markdown 表格一键转换为符合学术论文排版规范的**LaTeX 三线表 (Three-line Table)**，或直接生成**可无缝复制到 Microsoft Word 的三线富文本表格**。

## ✨ 特性 (Features)

- **纯前端解析**：0 依赖，直接在浏览器中解析 Markdown 表格，无后端传输，保障数据隐私安全。
- **动态列对齐 (Heuristic Alignment)**：自动识别“说明”、“描述”等较长的字段并采用**左对齐 (Left-align)**，其他常规短文本字段默认使用**居中 (Center)**，确保表格排版优美。
- **专业的 LaTeX 输出**：基于 `booktabs` 宏包标准，准确分配 `\\toprule`，`\\midrule`，`\\bottomrule`，并彻底剔除不符合规范的竖线 `|`。
- **Word 原生富文本兼容**：应用生成的 HTML 预览表格可以直接通过 `Ctrl+C` 和 `Ctrl+V` **完美复制到 Word**，自动携带“顶部与底部 2.25 磅、表头底侧 0.75 磅”的三线表格式。
- **现代美观 UI**：采用 Dark Mode (深色模式) 与 Glassmorphism (玻璃拟物化) 的现代前沿设计，提供极佳的交互体验。

## 🚀 快速使用 (Get Started)

1. 下载或克隆本仓库到本地：
   \`\`\`bash
   git clone https://github.com/lettimepassby/PaperTab.git
   \`\`\`
2. 直接通过浏览器打开项目文件夹中的 `index.html`。
3. 将您的 Markdown 格式表格粘贴到输入框中。
4. 点击 **“✨ 转换为三线表”**。
5. 在右侧面板中，您可以：
   - 查看并复制对应的 LaTeX 源码（需确保您的 LaTeX 环境引入了 `\\usepackage{booktabs}`）。
   - 切换到 **“Word 预览复制”** 标签，直接一键复制结果病粘贴于 Microsoft Word 中！

## 🛠️ 技术栈 (Tech Stack)

- **结构**：纯原生 HTML5
- **样式**：原生 Vanilla CSS3（融合 CSS 变量、毛玻璃特效过滤、弹性网格布局）
- **逻辑**：原生 JavaScript（ES6+ 特性，Clipboard API 支持剪贴板写入）

## 📜 许可证 (License)

本项目基于 [MIT License](LICENSE) 许可开源。欢迎自行修改和分发。
