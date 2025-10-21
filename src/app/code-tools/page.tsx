'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
// 使用标准textarea元素替代自定义组件
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCode, Copy, Check, RotateCcw, Download } from 'lucide-react';



export default function CodeTools() {
  const [code, setCode] = useState(`// JavaScript 示例
function hello() {
console.log("Hello, CreatiKit!");
if (true) {
console.log("这是一个示例");
}}`);
  const [formattedCode, setFormattedCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [emptyLineMode, setEmptyLineMode] = useState<'keepOne' | 'removeAll'>('keepOne');
  const [copySuccess, setCopySuccess] = useState(false);

  // 语言示例代码
  const languageExamples = {
    javascript: `// JavaScript 示例
function hello() {
console.log("Hello, CreatiKit!");
if (true) {
console.log("这是一个示例");
}}`,
    typescript: `// TypeScript 示例
interface User {
name: string;
age: number;
}
const user: User = {
name: "CreatiKit",
age: 1
};`,
    html: `<!DOCTYPE html>
<html>
<head>
<title>示例</title>
</head>
<body>
<h1>Hello World</h1>
<p>这是一个HTML示例</p>
</body>
</html>`,
    css: `.container {
width: 100%;
max-width: 1200px;
margin: 0 auto;
padding: 20px;
}
.title {
font-size: 24px;
color: #333;
}`,
    python: `# Python 示例
def greet(name):
print(f"Hello, {name}!")

if __name__ == "__main__":
greet("CreatiKit")
for i in range(3):
print(f"数字: {i}")`,
    json: `{
"name": "CreatiKit",
"version": "1.0.0",
"description": "示例JSON",
"features": ["格式化", "编辑", "下载"],
"settings": {
"theme": "light",
"autoSave": true
}
}`,
    xml: `<?xml version="1.0" encoding="UTF-8"?>
<document>
<name>CreatiKit</name>
<version>1.0.0</version>
<description>示例XML</description>
<features>
<feature>格式化</feature>
<feature>编辑</feature>
<feature>下载</feature>
</features>
<settings>
<theme>light</theme>
<autoSave>true</autoSave>
</settings>
</document>`
  };

  // 切换语言时更新示例代码
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(languageExamples[newLanguage as keyof typeof languageExamples]);
    setFormattedCode('');
  };

  // 简单的代码格式化逻辑（实际项目中可以集成更强大的格式化库）
  const formatCode = () => {
    // 预处理：处理空行
    const preprocessedLines = [];

    if (emptyLineMode === 'keepOne') {
      // 模式1：保留一个空行
      let lastLineEmpty = false;

      for (const line of code.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) {
          // 如果当前行是空行，且上一行也是空行，则跳过
          if (lastLineEmpty) continue;
          lastLineEmpty = true;
          preprocessedLines.push('');
        } else {
          lastLineEmpty = false;
          preprocessedLines.push(line);
        }
      }
    } else {
      // 模式2：移除所有空行
      for (const line of code.split('\n')) {
        const trimmed = line.trim();
        if (trimmed) {
          preprocessedLines.push(line);
        }
      }
    }

    let formatted = '';

    // Python特殊处理
    if (language === 'python') {
      let indentLevel = 0;
      const INDENT_SIZE = 4; // Python标准4空格缩进

      for (const line of preprocessedLines) {
        const trimmed = line.trim();
        if (!trimmed) {
          // 如果是空行模式为'keepOne'，则添加空行
          if (emptyLineMode === 'keepOne') {
            formatted += '\n';
          }
          continue;
        }

        // 检查是否是需要减少缩进的行（如elif, else, except, finally等）
        const dedentKeywords = /^(elif|else|except|finally):/;
        if (dedentKeywords.test(trimmed)) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // 添加缩进和代码行
        formatted += ' '.repeat(INDENT_SIZE * indentLevel) + trimmed + '\n';

        // 如果行以冒号结尾，下一行需要增加缩进
        if (trimmed.endsWith(':')) {
          indentLevel++;
        }
      }
    }
    // HTML特殊处理
    else if (language === 'html') {
      let indentLevel = 0;
      const INDENT_SIZE = 2; // HTML使用2空格缩进

      for (const line of preprocessedLines) {
        const trimmed = line.trim();
        if (!trimmed) {
          // 如果是空行模式为'keepOne'，则添加空行
          if (emptyLineMode === 'keepOne') {
            formatted += '\n';
          }
          continue;
        }

        // 处理自闭合标签或单行标签
        const selfClosingTag = /<\w+[^>]*\/>/;
        const closingTag = /^<\/([^>]+)>/;
        const openingTag = /^<(?!\/)(\w+)[^>]*>/;

        // 先检查是否是结束标签，减少缩进
        const closingMatch = trimmed.match(closingTag);
        if (closingMatch) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // 添加缩进和代码行
        formatted += ' '.repeat(INDENT_SIZE * indentLevel) + trimmed + '\n';

        // 检查是否是开始标签且不是自闭合标签，增加缩进
        const openingMatch = trimmed.match(openingTag);
        if (openingMatch && !selfClosingTag.test(trimmed) &&
          !trimmed.includes('</') && // 不处理同一行有闭合标签的情况
          !['br', 'hr', 'img', 'input', 'meta', 'link'].includes(openingMatch[1])) {
          indentLevel++;
        }
      }
    }
    // JSON特殊处理
    else if (language === 'json') {
      try {
        // 尝试使用JSON.parse和JSON.stringify来格式化
        const parsed = JSON.parse(code);
        formatted = JSON.stringify(parsed, null, 2);
        
        // 处理空行模式
        if (emptyLineMode === 'removeAll') {
          formatted = formatted.split('\n').filter(line => line.trim()).join('\n');
        }
        
        formatted += '\n';
      } catch (e) {
        // 如果JSON解析失败，回退到基本的括号缩进格式化
        let indentLevel = 0;
        const INDENT_SIZE = 2;
        
        for (const line of preprocessedLines) {
          const trimmed = line.trim();
          if (!trimmed) {
            if (emptyLineMode === 'keepOne') {
              formatted += '\n';
            }
            continue;
          }
          
          // 处理结束括号
          if (trimmed.match(/^[}\]]/)) {
            indentLevel = Math.max(0, indentLevel - 1);
          }
          
          // 添加缩进和代码行
          formatted += ' '.repeat(INDENT_SIZE * indentLevel) + trimmed + '\n';
          
          // 处理开始括号
          if (trimmed.match(/[\[{]$/)) {
            indentLevel++;
          }
        }
      }
    }
    // XML特殊处理（与HTML类似，但有细微差异）
    else if (language === 'xml') {
      let indentLevel = 0;
      const INDENT_SIZE = 2; // XML使用2空格缩进

      for (const line of preprocessedLines) {
        const trimmed = line.trim();
        if (!trimmed) {
          // 如果是空行模式为'keepOne'，则添加空行
          if (emptyLineMode === 'keepOne') {
            formatted += '\n';
          }
          continue;
        }

        // 处理XML声明
        if (trimmed.startsWith('<?xml')) {
          formatted += trimmed + '\n';
          continue;
        }

        // 处理自闭合标签或单行标签
        const selfClosingTag = /<\w+[^>]*\/>/;
        const closingTag = /^<\/([^>]+)>$/;
        const openingTag = /^<(?!\/|\?)\w+[^>]*>$/;

        // 先检查是否是结束标签，减少缩进
        const closingMatch = trimmed.match(closingTag);
        if (closingMatch) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // 添加缩进和代码行
        formatted += ' '.repeat(INDENT_SIZE * indentLevel) + trimmed + '\n';

        // 检查是否是开始标签且不是自闭合标签，增加缩进
        const openingMatch = trimmed.match(openingTag);
        if (openingMatch && !selfClosingTag.test(trimmed) && !trimmed.includes('</')) {
          indentLevel++;
        }
      }
    }
    // 其他语言（使用花括号的语言）的处理
    else {
      let indentLevel = 0;

      for (const line of preprocessedLines) {
        const trimmed = line.trim();
        if (!trimmed) {
          // 如果是空行模式为'keepOne'，则添加空行
          if (emptyLineMode === 'keepOne') {
            formatted += '\n';
          }
          continue;
        }

        // 复杂情况处理：同一行中同时有结束和开始括号
        const hasClosingBracket = trimmed.match(/^[}\]\)]/);
        const hasOpeningBracket = trimmed.match(/[\{\[\(]$/);
        const hasBothBrackets = hasClosingBracket && hasOpeningBracket;

        // 如果有结束括号但不是同时有开闭括号，先减少缩进
        if (hasClosingBracket && !hasBothBrackets) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // 添加缩进和代码行
        formatted += '  '.repeat(indentLevel) + trimmed + '\n';

        // 如果有开始括号，增加缩进
        if (hasOpeningBracket) {
          indentLevel++;
        }
      }
    }

    // 移除最后多余的换行符
    formatted = formatted.trimEnd() + '\n';
    setFormattedCode(formatted);
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // 下载代码文件
  const downloadCode = () => {
    const blob = new Blob([formattedCode || code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `code.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 获取文件扩展名
  const getFileExtension = (lang: string) => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      html: 'html',
      css: 'css',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      json: 'json',
      xml: 'xml',
    };
    return extensions[lang] || 'txt';
  };

  // 清空代码
  const clearCode = () => {
    setCode('');
    setFormattedCode('');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-2 rounded-full bg-blue-100 mb-4">
          <FileCode className="h-8 w-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold">代码工具</h1>
        <p className="text-gray-600">简单的代码格式化和编辑工具</p>
      </div>

      <Tabs defaultValue="formatter" className="w-full">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-1 mb-4">
          <TabsTrigger value="formatter">代码格式化</TabsTrigger>
        </TabsList>

        <TabsContent value="formatter" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 输入区域 */}
            <Card className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="language-select">编程语言</Label>
                  <div className="custom-select-wrapper">
                    <select
                      id="language-select"
                      value={language}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white cursor-pointer"
                    >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="python">Python</option>
                      <option value="json">JSON</option>
                      <option value="xml">XML</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <Label htmlFor="empty-line-mode-select">空行处理</Label>
                  <div className="custom-select-wrapper">
                    <select
                      id="empty-line-mode-select"
                      value={emptyLineMode}
                      onChange={(e) => setEmptyLineMode(e.target.value as 'keepOne' | 'removeAll')}
                      className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white cursor-pointer"
                    >
                      <option value="keepOne">保留一行空格</option>
                      <option value="removeAll">移除所有空格行</option>
                    </select>
                  </div>
                </div>
              </div>
              <textarea
                id="code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] font-mono text-sm resize-none w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`输入${language}代码...`}
              />
              <div className="flex gap-2">
                <Button onClick={formatCode} className="flex-1">格式化代码</Button>
                <Button variant="secondary" onClick={clearCode} size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* 输出区域 */}
            <Card className="p-4 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <Label htmlFor="code-output">格式化结果</Label>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(formattedCode || code)}
                    className="flex items-center gap-1"
                  >
                    {copySuccess ? (
                      <>
                        <Check className="h-4 w-4" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>复制</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={downloadCode}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>下载</span>
                  </Button>
                </div>
              </div>
              <textarea
                id="code-output"
                value={formattedCode || code}
                readOnly
                className="min-h-[300px] font-mono text-sm resize-none w-full p-3 border border-gray-300 rounded-md bg-gray-50"
              />
            </Card>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>提示：这是一个简单的代码格式化工具，对于复杂的代码格式化，建议使用专业的IDE或更强大的工具。</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}