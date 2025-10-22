'use client'

import { useState, useEffect } from 'react';
import { marked } from 'marked';

export default function MarkdownEditor() {
  // 初始Markdown内容 - 使用基础语法避免转义问题
  const [markdownContent, setMarkdownContent] = useState(
    '# Markdown编辑器\n\n' +
    '## 文本格式化\n\n' +
    '**粗体文本** 或者 __粗体文本__\n' +
    '*斜体文本* 或者 _斜体文本_\n' +
    '***粗斜体文本*** 或者 ___粗斜体文本___\n' +
    '~~删除线文本~~\n' +
    '\\`内联代码\\`\n\n' +
    '## 列表\n\n' +
    '### 无序列表\n' +
    '- 项目1\n' +
    '- 项目2\n' +
    '- 项目3\n\n' +
    '### 有序列表\n' +
    '1. 第一项\n' +
    '2. 第二项\n' +
    '3. 第三项\n\n' +
    '### 任务列表\n' +
    '- [x] 已完成任务\n' +
    '- [ ] 未完成任务\n' +
    '- [x] 另一个已完成任务\n\n' +
    '### 嵌套列表\n' +
    '- 父项1\n' +
    '  - 子项1\n' +
    '  - 子项2\n' +
    '    - 孙项1\n' +
    '- 父项2\n\n' +
    '## 代码块\n\n' +
    '### JavaScript代码块\n' +
    '```javascript\n' +
    'function greet(name) {\n' +
    '  return \`Hello, \${name}!\`;\n' +
    '}\n\n' +
    'console.log(greet(\'World\'));\n' +
    '```\n\n' +
    '### Python代码块\n' +
    '```python\n' +
    'def factorial(n):\n' +
    '    if n <= 1:\n' +
    '        return 1\n' +
    '    return n * factorial(n-1)\n\n' +
    'print(factorial(5))\n' +
    '```\n\n' +
    '## 表格\n\n' +
    '| 姓名 | 年龄 | 职业 |\n' +
    '|------|------|------|\n' +
    '| 张三 | 28   | 工程师 |\n' +
    '| 李四 | 32   | 设计师 |\n' +
    '| 王五 | 45   | 产品经理 |\n\n' +
    '## 链接和图片\n\n' +
    '[百度](https://www.baidu.com)\n\n' +
    '![图片描述](https://i.postimg.cc/yNDJYjmw/wmremove-transformed-1.png)\n\n' +
    '## 引用\n\n' +
    '> 这是一段引用文字。\n' +
    '> \n' +
    '> 这是引用的第二行。\n\n' +
    '### 嵌套引用\n' +
    '> 外层引用\n' +
    '>> 内层引用\n' +
    '>>> 更深层引用\n\n' +
    '## 水平线\n\n' +
    '---\n\n' +
    '## 脚注\n\n' +
    '这里有一个脚注引用[^1]。\n\n' +
    '[^1]: 这是脚注的内容。\n\n' +
    '## 标题锚点\n\n' +
    '# 这是一个带锚点的标题\n' +
    '## 这是第二个带锚点的标题\n\n' +
    '## 自动链接\n\n' +
    '<https://www.example.com>\n' +
    '<example@example.com>\n\n' +
    '## 特殊符号\n\n' +
    '```\n' +
    '* 这样就不会被解析为斜体\n' +
    '` 这样就不会被解析为代码\n' +
    '_ 这样就不会被解析为强调\n' +
    '```\n'
  );

  const [htmlContent, setHtmlContent] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit', 'preview', 'split'
  // 移除确认模态框状态

  // 配置marked选项
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
      // headerPrefix 已移除，marked v4+ 不再支持该选项
    });

    // 解析Markdown为HTML
    const parsedHtml = marked.parse(markdownContent);
    
    // 添加样式 - 使用简单字符串连接避免嵌套模板字符串问题
    const cssStyles = 
      'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; } ' +
      'h1, h2, h3, h4, h5, h6 { color: #1a202c; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; } ' +
      'h1 { font-size: 2em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; } ' +
      'h2 { font-size: 1.5em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; } ' +
      'h3 { font-size: 1.25em; } ' +
      'p { margin-bottom: 1em; } ' +
      'a { color: #3182ce; text-decoration: none; } ' +
      'a:hover { text-decoration: underline; } ' +
      'img { max-width: 100%; height: auto; } ' +
      'hr { border: 0; border-top: 1px solid #e2e8f0; margin: 1.5em 0; } ' +
      'blockquote { border-left: 4px solid #e2e8f0; padding-left: 1em; margin-left: 0; color: #718096; } ' +
      'pre { background: #f7fafc; padding: 16px; border-radius: 6px; overflow-x: auto; margin-bottom: 1em; } ' +
      'code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; background: #f7fafc; padding: 2px 4px; border-radius: 3px; } ' +
      'pre code { background: none; padding: 0; } ' +
      'table { border-collapse: collapse; width: 100%; margin-bottom: 1em; } ' +
      'th, td { padding: 0.5em; border: 1px solid #e2e8f0; text-align: left; } ' +
      'th { background-color: #f7fafc; font-weight: 600; } ' +
      'ul { list-style-type: disc; padding-left: 2em; margin-bottom: 1em; } ' +
      'ol { list-style-type: decimal; padding-left: 2em; margin-bottom: 1em; } ' +
      'li { margin-bottom: 0.5em; } ' +
      'input[type="checkbox"] { margin-right: 0.5em; }';
    
    // 组合HTML和样式
    const styledHtml = '<style>' + cssStyles + '</style>' + parsedHtml;
    setHtmlContent(styledHtml);
  }, [markdownContent]);

  // 复制到剪贴板
  const copyToClipboard = () => {
    navigator.clipboard.writeText(markdownContent).then(() => {
      // 创建临时提示元素
      const notification = document.createElement('div');
      notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50 transition-opacity duration-300';
      notification.textContent = '已复制到剪贴板';
      document.body.appendChild(notification);
      
      // 2秒后自动消失
      setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
          document.body.removeChild(notification);
        }, 300);
      }, 2000);
    }).catch((error) => {
      console.error('复制失败:', error);
    });
  };

  // 下载Markdown文件
  const downloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 重置内容
  const resetContent = () => {
    setMarkdownContent('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-4 text-gray-800">Markdown编辑器</h1>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6 shadow-sm">
            <p className="text-gray-700 mb-3">
              👋 欢迎来到Markdown编辑器！即使你是第一次使用，也能轻松上手！
            </p>
            <p className="text-gray-600 mb-3">
              <span className="font-medium text-blue-700">• 编辑模式：</span> 在这里输入Markdown代码（看看左侧的初始内容作为示例）
            </p>
            <p className="text-gray-600 mb-3">
              <span className="font-medium text-blue-700">• 预览模式：</span> 查看你的内容渲染后的样子
            </p>
            <p className="text-gray-600 mb-3">
              <span className="font-medium text-blue-700">• 分屏模式：</span> 边写边看效果，超方便！
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-blue-700">💡 小提示：</span> 向下滚动页面，查看底部的Markdown语法指南，包含了所有常用语法和示例！
            </p>
          </div>
        
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-md ${activeTab === 'edit' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              编辑
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-md ${activeTab === 'preview' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              预览
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-4 py-2 rounded-md ${activeTab === 'split' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              分屏
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100"
            >
              复制
            </button>
            <button
              onClick={downloadMarkdown}
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100"
            >
              下载
            </button>
            <button
              onClick={resetContent}
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100"
            >
              重置
            </button>
            

          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {activeTab === 'edit' && (
            <textarea
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              className="w-full h-[600px] p-6 text-gray-800 font-mono focus:outline-none resize-none"
              placeholder="在此输入Markdown内容..."
            />
          )}

          {activeTab === 'preview' && (
            <div 
              className="w-full h-[600px] p-6 overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )}

          {activeTab === 'split' && (
            <div className="flex h-[600px]">
              <textarea
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                className="w-1/2 p-6 text-gray-800 font-mono focus:outline-none resize-none border-r"
                placeholder="在此输入Markdown内容..."
              />
              <div 
                className="w-1/2 p-6 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">📝 Markdown语法指南</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">✨ 文本格式化</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm mb-4">
{`**粗体文本** 或 __粗体文本__
*斜体文本* 或 _斜体文本_
***粗斜体文本*** 或 ___粗斜体文本___
~~删除线文本~~
\`内联代码\``}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">📋 列表</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm mb-4">
{`# 无序列表
- 项目1
- 项目2

# 有序列表
1. 第一项
2. 第二项

# 任务列表
- [x] 已完成任务
- [ ] 未完成任务`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">🔗 链接和图片</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm mb-4">
{`# 链接
[链接文本](https://example.com)

# 图片
![图片描述](https://via.placeholder.com/150)

# 自动链接
<https://www.example.com>`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">💻 代码和表格</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm mb-4">
{`# 代码块
\`\`\`javascript
function example() {
  return "Hello";
}
\`\`\`

# 表格
| 列1 | 列2 |
|-----|-----|
| 内容1 | 内容2 |`}
                </pre>
              </div>
              
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-3 text-gray-700">🎯 其他功能</h3>
                <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-sm">
{`# 引用
> 这是一段引用
>> 嵌套引用

# 水平线
--- 或 *** 或 ___

# 脚注
这是一个脚注引用[^1]

[^1]: 这是脚注内容

# 标题锚点
# 这是一个带锚点的标题
## 这是第二个带锚点的标题`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}