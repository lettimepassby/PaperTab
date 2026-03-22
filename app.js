document.addEventListener('DOMContentLoaded', () => {
    const convertBtn = document.getElementById('convert-btn');
    const mdInput = document.getElementById('markdown-input');
    const titleInput = document.getElementById('table-title');
    const latexOutput = document.getElementById('latex-output');
    const wordPreview = document.getElementById('word-preview');
    const copyLatexBtn = document.getElementById('copy-latex-btn');
    const copyWordBtn = document.getElementById('copy-word-btn');
    const tabs = document.querySelectorAll('.tab-btn');
    const toast = document.getElementById('toast');

    // 默认数据填充
    mdInput.value = `| 字段名称 | 数据类型 | 长度 | 约束/索引 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| phone | varchar | 20 | 主键 | 无 | 用户手机号（唯一标识） |
| nickname | varchar | 50 | 无 | 无 | 昵称 |
| address | json | - | 无 | NULL | 收货地址列表（JSON格式） |
| wishlist | json | - | 无 | NULL | 心愿单（bookid数组） |`;
    
    // Tab 切换逻辑
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(tab.dataset.target).classList.add('active');
        });
    });

    // 解析并转换
    convertBtn.addEventListener('click', () => {
        const text = mdInput.value.trim();
        if (!text) {
            showToast('请输入 Markdown 格式的数据！', '#ef4444');
            return;
        }

        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        let headers = [];
        let dataRows = [];
        
        // 简单解析器
        let foundSeparator = false;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.startsWith('|')) {
                // 如果遇到分隔行 (如 |---|---|)
                if (line.match(/^\|?\s*[:\-]+\s*\|/)) {
                    foundSeparator = true;
                    continue;
                }
                
                // 清理头尾分隔符
                let rowData = line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
                
                if (!foundSeparator) {
                    headers = rowData;
                } else {
                    dataRows.push(rowData);
                }
            }
        }

        if (headers.length === 0 || dataRows.length === 0) {
            showToast('无法解析表格，请确保格式正确（包含表头、分隔线和数据行）', '#ef4444');
            return;
        }

        // 推断对齐方式
        // “说明”、“描述”等长文本列居左(l)，其他短文本如字段名等居中(c)
        const alignments = headers.map(header => {
            if (header.includes('说明') || header.includes('描述') || header.includes('详情') || header.includes('备注')) {
                return 'l';
            }
            return 'c';
        });

        // 获取表题
        const caption = titleInput.value.trim() || '数据库设计表';

        // 生成 LaTeX
        const latexStr = generateLatex(headers, dataRows, alignments, caption);
        latexOutput.value = latexStr;

        // 生成 HTML (适用于复制到 Word)
        const htmlStr = generateHtml(headers, dataRows, alignments, caption);
        wordPreview.innerHTML = htmlStr;

        showToast('转换成功！');
    });

    // 复制 LaTeX
    copyLatexBtn.addEventListener('click', () => {
        if (!latexOutput.value) return;
        navigator.clipboard.writeText(latexOutput.value).then(() => {
            showToast('LaTeX 代码已复制！');
        });
    });

    // 复制 Word 富文本
    copyWordBtn.addEventListener('click', () => {
        const tableWrapper = wordPreview.querySelector('.word-table-wrapper');
        if (!tableWrapper) return;
        
        try {
            // 使用 Clipboard API 的富文本复制支持，以确保在 Word 内能够保持最精确的样式
            const htmlType = "text/html";
            const plainType = "text/plain";
            const htmlStr = wordPreview.innerHTML;
            const plainStr = wordPreview.innerText;
            
            const blobHtml = new Blob([htmlStr], { type: htmlType });
            const blobPlain = new Blob([plainStr], { type: plainType });
            
            const data = [new ClipboardItem({
                [htmlType]: blobHtml,
                [plainType]: blobPlain,
            })];
            
            navigator.clipboard.write(data).then(() => {
                showToast('富文本表格已复制！请直接在 Word 中粘贴');
            });
        } catch (e) {
            // 回退方案：通过选择器复制
            const range = document.createRange();
            range.selectNodeContents(tableWrapper);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
            showToast('富文本表格已复制！请直接在 Word 中粘贴');
        }
    });

    function generateLatex(headers, rows, alignments, caption) {
        let latex = '\\begin{table}[htbp]\n';
        latex += '    \\centering\n';
        latex += `    \\caption{${caption}}\n`;
        latex += `    \\begin{tabular}{${alignments.join('')}}\n`;
        latex += '        \\toprule\n';
        
        // 逸出 LaTeX 特殊字符
        const escapeLatex = (str) => {
            return str.replace(/_/g, '\\_')
                      .replace(/&/g, '\\&')
                      .replace(/%/g, '\\%')
                      .replace(/#/g, '\\#')
                      .replace(/\\$/g, '\\\\$');
        };

        latex += '        ' + headers.map(h => escapeLatex(h)).join(' & ') + ' \\\\\n';
        latex += '        \\midrule\n';
        
        rows.forEach(row => {
            latex += '        ' + row.map(cell => escapeLatex(cell)).join(' & ') + ' \\\\\n';
        });
        
        latex += '        \\bottomrule\n';
        latex += '    \\end{tabular}\n';
        latex += '\\end{table}';
        
        return latex;
    }

    function generateHtml(headers, rows, alignments, caption) {
        // 利用内联样式实现完美的三线表，这样粘贴到 Word 即带有原生三线表效果
        // 顶部粗线 2px, 底部粗线 2px, 栏目中线 1px。没有竖线。
        let alignMap = { 'c': 'center', 'l': 'left', 'r': 'right' };
        
        let html = `<div class="word-table-wrapper" style="font-family: 'Times New Roman', SimSun, serif; display: flex; flex-direction: column; align-items: center; width: 100%;">`;
        html += `<div class="word-caption" style="text-align: center; font-weight: bold; margin-bottom: 8px; font-size: 11pt;">${caption}</div>`;
        html += `<table style="border-collapse: collapse; min-width: 80%; max-width: 100%; border: none; align-self: center;">`;
        html += `<thead><tr>`;
        
        headers.forEach((h, idx) => {
            let align = alignMap[alignments[idx]];
            html += `<th style="border-top: 2.25pt solid windowtext; border-bottom: 0.75pt solid windowtext; border-left: none; border-right: none; padding: 6px 10px; font-weight: bold; text-align: ${align};">${h}</th>`;
        });
        
        html += `</tr></thead>`;
        html += `<tbody>`;
        
        rows.forEach((row, i) => {
            html += `<tr>`;
            let isLastRow = i === rows.length - 1;
            row.forEach((cell, idx) => {
                let align = alignMap[alignments[idx]];
                let bottomBorderStyle = isLastRow ? 'border-bottom: 2.25pt solid windowtext;' : 'border-bottom: none;';
                html += `<td style="border-top: none; ${bottomBorderStyle} border-left: none; border-right: none; padding: 4px 10px; text-align: ${align};">${cell}</td>`;
            });
            html += `</tr>`;
        });
        
        html += `</tbody></table></div>`;
        return html;
    }

    function showToast(msg, bg = '#10b981') {
        toast.textContent = msg;
        toast.style.background = bg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }
});
