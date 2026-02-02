'use client'

import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { useI18n } from '@/contexts/I18nContext';

export default function MarkdownEditor() {
  const { t } = useI18n();
  
  // 初始Markdown内容 - 使用翻译键
  const [markdownContent, setMarkdownContent] = useState('');
  const [initialized, setInitialized] = useState(false);

  const [htmlContent, setHtmlContent] = useState('');
  const [activeTab, setActiveTab] = useState('edit'); // 'edit', 'preview', 'split'
  // 移除确认模态框状态

  // 初始化Markdown内容 - 在翻译加载后设置
  useEffect(() => {
    if (!initialized) {
      const initialContent = t('markdownEditorPage.initialContent');
      if (initialContent && initialContent !== 'markdownEditorPage.initialContent') {
        setMarkdownContent(initialContent.replace(/\\n/g, '\n'));
        setInitialized(true);
      }
    }
  }, [t, initialized]);

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
      '@media (prefers-color-scheme: dark) { body { color: #e2e8f0; } } ' +
      'h1, h2, h3, h4, h5, h6 { color: #1a202c; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 600; } ' +
      '@media (prefers-color-scheme: dark) { h1, h2, h3, h4, h5, h6 { color: #f7fafc; } } ' +
      'h1 { font-size: 2em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; } ' +
      '@media (prefers-color-scheme: dark) { h1 { border-bottom-color: #4a5568; } } ' +
      'h2 { font-size: 1.5em; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.3em; } ' +
      '@media (prefers-color-scheme: dark) { h2 { border-bottom-color: #4a5568; } } ' +
      'h3 { font-size: 1.25em; } ' +
      'p { margin-bottom: 1em; } ' +
      'a { color: #3182ce; text-decoration: none; } ' +
      '@media (prefers-color-scheme: dark) { a { color: #63b3ed; } } ' +
      'a:hover { text-decoration: underline; } ' +
      'img { max-width: 100%; height: auto; } ' +
      'hr { border: 0; border-top: 1px solid #e2e8f0; margin: 1.5em 0; } ' +
      '@media (prefers-color-scheme: dark) { hr { border-top-color: #4a5568; } } ' +
      'blockquote { border-left: 4px solid #e2e8f0; padding-left: 1em; margin-left: 0; color: #718096; } ' +
      '@media (prefers-color-scheme: dark) { blockquote { border-left-color: #4a5568; color: #a0aec0; } } ' +
      'pre { background: white; padding: 16px; border-radius: 6px; overflow-x: auto; margin-bottom: 1em; border: 1px solid #e2e8f0; } ' +
      '@media (prefers-color-scheme: dark) { pre { background: white; border-color: #e2e8f0; } } ' +
      'code { font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace; background: #f7fafc; padding: 2px 4px; border-radius: 3px; color: #d69e2e; } ' +
      '@media (prefers-color-scheme: dark) { code { background: #f7fafc; color: #d69e2e; } } ' +
      'pre code { background: none; padding: 0; color: inherit; } ' +
      'table { border-collapse: collapse; width: 100%; margin-bottom: 1em; } ' +
      'th, td { padding: 0.5em; border: 1px solid #e2e8f0; text-align: left; } ' +
      '@media (prefers-color-scheme: dark) { th, td { border-color: #4a5568; } } ' +
      'th { background-color: #f7fafc; font-weight: 600; } ' +
      '@media (prefers-color-scheme: dark) { th { background-color: #2d3748; } } ' +
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
      notification.textContent = t('markdownEditorPage.copiedToClipboard');
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
          <h1 className="text-3xl font-bold mb-4 text-gray-800">{t('markdownEditorPage.title')}</h1>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6 shadow-sm">
            <p className="text-gray-700 mb-3">
              {t('markdownEditorPage.welcome')}
            </p>
            <p className="text-gray-600 mb-3">
              <span className="font-medium text-blue-700">{t('markdownEditorPage.editMode')}</span> {t('markdownEditorPage.editModeDesc')}
            </p>
            <p className="text-gray-600 mb-3">
              <span className="font-medium text-blue-700">{t('markdownEditorPage.previewMode')}</span> {t('markdownEditorPage.previewModeDesc')}
            </p>
            <p className="text-gray-600 mb-3">
              <span className="font-medium text-blue-700">{t('markdownEditorPage.splitMode')}</span> {t('markdownEditorPage.splitModeDesc')}
            </p>
            <p className="text-gray-600">
              <span className="font-medium text-blue-700">{t('markdownEditorPage.tip')}</span> {t('markdownEditorPage.tipDesc')}
            </p>
          </div>
        
        <div className="mb-4 flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 rounded-md ${activeTab === 'edit' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {t('markdownEditorPage.edit')}
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 rounded-md ${activeTab === 'preview' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {t('markdownEditorPage.preview')}
            </button>
            <button
              onClick={() => setActiveTab('split')}
              className={`px-4 py-2 rounded-md ${activeTab === 'split' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              {t('markdownEditorPage.split')}
            </button>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100"
            >
              {t('markdownEditorPage.copy')}
            </button>
            <button
              onClick={downloadMarkdown}
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100"
            >
              {t('markdownEditorPage.download')}
            </button>
            <button
              onClick={resetContent}
              className="px-4 py-2 bg-white text-black border border-gray-300 rounded-md hover:bg-gray-100"
            >
              {t('markdownEditorPage.reset')}
            </button>
            

          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {activeTab === 'edit' && (
            <textarea
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              className="w-full h-[600px] p-6 bg-white dark:bg-white text-gray-800 dark:text-gray-800 font-mono focus:outline-none resize-none"
              placeholder={t('markdownEditorPage.placeholder')}
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
                className="w-1/2 p-6 bg-white dark:bg-white text-gray-800 dark:text-gray-800 font-mono focus:outline-none resize-none border-r dark:border-gray-300"
                placeholder={t('markdownEditorPage.placeholder')}
              />
              <div 
                className="w-1/2 p-6 overflow-y-auto"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          )}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800">{t('markdownEditorPage.syntaxGuide')}</h2>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">{t('markdownEditorPage.textFormatting')}</h3>
                <pre className="bg-white border border-gray-200 p-4 rounded-md overflow-x-auto text-sm mb-4">
{`**粗体文本** 或 __粗体文本__
*斜体文本* 或 _斜体文本_
***粗斜体文本*** 或 ___粗斜体文本___
~~删除线文本~~
\`内联代码\``}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">{t('markdownEditorPage.lists')}</h3>
                <pre className="bg-white border border-gray-200 p-4 rounded-md overflow-x-auto text-sm mb-4">
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
                <h3 className="text-lg font-semibold mb-3 text-gray-700">{t('markdownEditorPage.linksAndImages')}</h3>
                <pre className="bg-white border border-gray-200 p-4 rounded-md overflow-x-auto text-sm mb-4">
{`# 链接
[链接文本](https://example.com)

# 图片
![图片描述](https://via.placeholder.com/150)

# 自动链接
<https://www.example.com>`}
                </pre>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-700">{t('markdownEditorPage.codeBlocks')} & {t('markdownEditorPage.tables')}</h3>
                <pre className="bg-white border border-gray-200 p-4 rounded-md overflow-x-auto text-sm mb-4">
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
                <pre className="bg-white border border-gray-200 p-4 rounded-md overflow-x-auto text-sm">
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