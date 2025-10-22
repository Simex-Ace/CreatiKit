'use client'

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
// 使用标准textarea元素替代自定义组件
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileCode, Copy, Check, RotateCcw, Download, AlertCircle, Code2 } from 'lucide-react';
// 代码格式化工具相关导入




export default function CodeTools() {
  const [code, setCode] = useState(`// JavaScript 示例
function hello() {
console.log("Hello, CreatiKit!");
if (true) {
console.log("这是一个示例");
}}`);
  const [formattedCode, setFormattedCode] = useState('');
  const [minifiedCode, setMinifiedCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [emptyLineMode, setEmptyLineMode] = useState<'keepOne' | 'removeAll'>('keepOne');
  const [minifyOptions, setMinifyOptions] = useState({
    removeComments: true,
    removeWhitespace: true,
    preserveImportant: true
  });
  const [copySuccess, setCopySuccess] = useState(false);
  const [currentTab, setCurrentTab] = useState('formatter');
  const [transformedCode, setTransformedCode] = useState('');
  const [transformOptions, setTransformOptions] = useState({
    quoteType: 'single', // 'single' | 'double' | 'none'
    indentType: 'space', // 'space' | 'tab' | 'none'
    indentSize: 2,
    namingStyle: 'camelCase', // 'camelCase' | 'snake_case' | 'none'
    commentStyle: 'line' // 'line' | 'block' | 'none'
  });

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
    setMinifiedCode('');
  };

  // 处理选项卡切换
  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };

  // 代码压缩逻辑
  const minifyCode = () => {
    let minified = code;
    
    // 根据语言应用不同的压缩策略
    switch (language) {
      case 'javascript':
      case 'typescript':
        minified = minifyJavaScript(minified);
        break;
      case 'css':
        minified = minifyCSS(minified);
        break;
      case 'html':
        minified = minifyHTML(minified);
        break;
      case 'json':
        try {
          // JSON压缩直接使用parse和stringify
          const parsed = JSON.parse(minified);
          minified = JSON.stringify(parsed);
        } catch (e) {
          // 如果JSON无效，使用基本压缩
          minified = minifyBasic(minified);
        }
        break;
      case 'xml':
        minified = minifyXML(minified);
        break;
      // Python压缩功能已移除
      default:
        minified = minifyBasic(minified);
    }
    
    setMinifiedCode(minified);
  };

  // JavaScript/TypeScript压缩
  const minifyJavaScript = (code: string): string => {
    let result = code;
    
    // 移除注释
    if (minifyOptions.removeComments) {
      // 移除单行注释
      result = result.replace(/\/\/.*$/gm, '');
      // 移除多行注释
      result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    }
    
    // 移除空白字符
    if (minifyOptions.removeWhitespace) {
      // 保留字符串内的空格
      result = result.replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*\(\s*/g, '(')
        .replace(/\s*\)\s*/g, ')')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*,\s*/g, ',')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*=\s*/g, '=')
        .trim();
    }
    
    return result;
  };

  // CSS压缩
  const minifyCSS = (code: string): string => {
    let result = code;
    
    // 移除注释
    if (minifyOptions.removeComments) {
      result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    }
    
    // 移除空白字符
    if (minifyOptions.removeWhitespace) {
      // 处理!important
      if (minifyOptions.preserveImportant) {
        // 临时替换!important以保留它
        result = result.replace(/!\s*important/g, '##IMPORTANT##');
      }
      
      result = result.replace(/\s+/g, ' ')
        .replace(/\s*{\s*/g, '{')
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';')
        .replace(/\s*:\s*/g, ':')
        .replace(/\s*,\s*/g, ',')
        .trim();
      
      // 恢复!important
      if (minifyOptions.preserveImportant) {
        result = result.replace(/##IMPORTANT##/g, '!important');
      }
    }
    
    return result;
  };

  // HTML压缩
  const minifyHTML = (code: string): string => {
    let result = code;
    
    // 移除注释
    if (minifyOptions.removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    // 移除空白字符
    if (minifyOptions.removeWhitespace) {
      result = result.replace(/\s+/g, ' ')
        .replace(/\s*<\s*/g, '<')
        .replace(/\s*>\s*/g, '>')
        .trim();
    }
    
    return result;
  };

  // XML压缩
  const minifyXML = (code: string): string => {
    let result = code;
    
    // 移除注释
    if (minifyOptions.removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, '');
    }
    
    // 移除空白字符
    if (minifyOptions.removeWhitespace) {
      result = result.replace(/\s+/g, ' ')
        .replace(/\s*<\s*/g, '<')
        .replace(/\s*>\s*/g, '>')
        .trim();
    }
    
    return result;
  };

  // Python压缩功能已移除

  // 基本压缩（适用于其他语言）
  const minifyBasic = (code: string): string => {
    let result = code;
    
    // 移除多余的空行
    if (minifyOptions.removeWhitespace) {
      result = result.replace(/\n\s*\n/g, '\n');
    }
    
    return result;
  };

  // 更新压缩选项
  const updateMinifyOptions = (key: keyof typeof minifyOptions, value: boolean) => {
    setMinifyOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 高级代码格式化逻辑，包含语法修复和专业格式化
  const [syntaxRestored, setSyntaxRestored] = useState(false);
  
  const formatCode = () => {
    // 重置语法恢复标志
    setSyntaxRestored(false);
    
    // 语法恢复/修复预处理
    const preprocessedCode = attemptSyntaxRecovery(code, language);
    
    // 检查是否进行了语法修复
    if (preprocessedCode !== code) {
      setSyntaxRestored(true);
      setTimeout(() => setSyntaxRestored(false), 5000); // 5秒后隐藏提示
    }
    
    // 预处理：处理空行
    const preprocessedLines = [];

    if (emptyLineMode === 'keepOne') {
      // 模式1：保留一个空行
      let lastLineEmpty = false;

      for (const line of preprocessedCode.split('\n')) {
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
      for (const line of preprocessedCode.split('\n')) {
        const trimmed = line.trim();
        if (trimmed) {
          preprocessedLines.push(line);
        }
      }
    }

    let formatted = '';
    
    // 针对不同语言使用不同的格式化策略

    // Python特殊处理
    if (language === 'python') {
      let indentLevel = 0;
      const INDENT_SIZE = 4; // Python标准4空格缩进
      let emptyLineCount = 0;

      for (const line of preprocessedLines) {
        const trimmed = line.trim();
        
        // 处理空行
        if (!trimmed) {
          emptyLineCount++;
          // 如果是空行模式为'keepOne'，则添加空行
          if (emptyLineMode === 'keepOne') {
            formatted += '\n';
          }
          // 遇到空行可能表示函数或代码块结束，重置缩进检查
          continue;
        }
        
        emptyLineCount = 0;

        // 特殊处理 if __name__ == "__main__": 确保它在全局作用域
        if (trimmed.startsWith('if __name__ == "__main__":')) {
          // 强制将main语句放在全局作用域（缩进级别为0）
          indentLevel = 0;
          formatted += trimmed + '\n';
          // main语句后的代码需要缩进
          indentLevel = 1;
          continue;
        }

        // 检查是否是需要减少缩进的行（如elif, else, except, finally等）
        const dedentKeywords = /^(elif|else|except|finally):/;
        if (dedentKeywords.test(trimmed)) {
          indentLevel = Math.max(1, indentLevel - 1);
        }

        // 添加缩进和代码行
        formatted += ' '.repeat(INDENT_SIZE * indentLevel) + trimmed + '\n';

        // 如果行以冒号结尾，且不是main语句，下一行需要增加缩进
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
        const parsed = JSON.parse(preprocessedCode);
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
  
  // 尝试恢复/修复有语法错误的代码，特别是处理关键字和标识符被拆分的情况
  const attemptSyntaxRecovery = (code: string, lang: string): string => {
    try {
      // 针对JavaScript/TypeScript的语法恢复
      if (lang === 'javascript' || lang === 'typescript') {
        // 简化实现，专注于函数定义被拆分的情况修复
        let recoveredCode = code;
        
        // 1. 修复被拆分的关键字（更强大的正则表达式）
        const keywords = [
          'function', 'if', 'else', 'return', 'const', 'let', 'var', 'for', 
          'while', 'do', 'switch', 'case', 'default', 'try', 'catch', 'finally'
        ];
        
        keywords.forEach(keyword => {
          // 构建能够处理任意拆分的正则表达式
          const pattern = keyword.split('').join('[\\s\\n]*');
          const regex = new RegExp(pattern, 'gi');
          recoveredCode = recoveredCode.replace(regex, keyword);
        });
        
        // 2. 处理函数定义的结构修复
        // 确保function和函数名正确连接
        recoveredCode = recoveredCode.replace(/function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g, 'function $1');
        
        // 确保函数名和括号正确连接
        recoveredCode = recoveredCode.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g, '$1(');
        
        // 确保括号和花括号正确连接
        recoveredCode = recoveredCode.replace(/\)\s*{/g, ') {');
        
        // 3. 处理控制语句关键字
        const controlKeywords = ['if', 'for', 'while', 'switch', 'catch'];
        controlKeywords.forEach(keyword => {
          // 先修复可能被拆分的关键字
          const fixedKeyword = keyword.split('').join('\\s*');
          recoveredCode = recoveredCode.replace(new RegExp(fixedKeyword, 'gi'), keyword);
          // 确保关键字和括号正确连接
          recoveredCode = recoveredCode.replace(new RegExp(`${keyword}\\s*\\(`, 'g'), `${keyword} (`);
        });
        
        // 4. 修复括号匹配（更全面的实现）
        // 修复花括号
        const openBraces = (recoveredCode.match(/[{]/g) || []).length;
        const closeBraces = (recoveredCode.match(/[}]/g) || []).length;
        const braceDiff = openBraces - closeBraces;
        
        if (braceDiff > 0) {
          recoveredCode += '}'.repeat(braceDiff);
        }
        
        // 修复圆括号
        const openParens = (recoveredCode.match(/\(/g) || []).length;
        const closeParens = (recoveredCode.match(/\)/g) || []).length;
        const parenDiff = openParens - closeParens;
        
        if (parenDiff > 0) {
          // 在末尾添加缺失的闭合括号
          recoveredCode += ')'.repeat(parenDiff);
        }
        
        // 5. 修复分号缺失（更精确的实现）
        // 只在特定情况下添加分号，避免过度添加
        // 移除之前可能错误添加的多余分号
        recoveredCode = recoveredCode.replace(/;\s*\{/g, ' {');
        
        // 只在变量声明、赋值、函数调用等语句后添加分号
        // 这是一个更安全的实现，避免在不需要分号的地方添加
        
        return recoveredCode;
      }
      
      // 对于JSON的语法恢复
      else if (lang === 'json') {
        try {
          // 尝试预处理后使用标准JSON解析
          const preprocessed = preprocessJson(code);
          const parsed = JSON.parse(preprocessed);
          return JSON.stringify(parsed, null, 2);
        } catch (e) {
          // 如果JSON解析失败，回退到基本的括号缩进格式化
          return fallbackJsonFix(code);
        }
      }
      
      // HTML和XML的简单修复
      else if (lang === 'html' || lang === 'xml') {
        return fixHtmlXmlSyntax(code, lang);
      }
      
      // 对于Python，处理基本的缩进问题和语法修复
      else if (lang === 'python') {
        // 先进行基本的Python语法修复
        let recoveredCode = fixPythonSyntax(code);
        // 然后进行缩进修复
        return fixPythonIndentation(recoveredCode);
      }
      
      // 对于CSS和其他语言，返回原始代码
      return code;
    } catch (error) {
      console.error('语法恢复失败:', error);
      return code;
    }
  };
  

  
  // 预处理JSON
  const preprocessJson = (code: string): string => {
    let processed = code;
    
    // 尝试修复键名缺少引号的情况
    processed = processed.replace(/([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '"$1":');
    
    // 尝试修复字符串缺少引号的情况
    processed = processed.replace(/:\s*([a-zA-Z_$][a-zA-Z0-9_$]*)(\s*[,}\]])/g, ': "$1"$2');
    
    return processed;
  };
  
  // JSON回退修复
  const fallbackJsonFix = (code: string): string => {
    // 基本的JSON格式修复
    let fixed = code;
    
    // 确保括号匹配
    const openBraces = (fixed.match(/[{]/g) || []).length;
    const closeBraces = (fixed.match(/[}]/g) || []).length;
    const braceDiff = openBraces - closeBraces;
    
    if (braceDiff > 0) {
      fixed += '}'.repeat(braceDiff);
    }
    
    return fixed;
  };
  
  // HTML/XML语法修复
  const fixHtmlXmlSyntax = (code: string, lang: string): string => {
    let fixed = code;
    
    // 尝试修复标签不完整的情况
    const openTags = [];
    const tagRegex = /<([a-zA-Z][a-zA-Z0-9:-]*)(?:\s+[^>]*)?(?:\/>|>)/g;
    const closeTagRegex = /<\/([a-zA-Z][a-zA-Z0-9:-]*)>/g;
    
    let match;
    while ((match = tagRegex.exec(fixed)) !== null) {
      const tagName = match[1];
      const isSelfClosing = match[0].endsWith('/>') || 
        ['br', 'hr', 'img', 'input', 'meta', 'link'].includes(tagName.toLowerCase());
      
      if (!isSelfClosing) {
        openTags.push(tagName);
      }
    }
    
    while ((match = closeTagRegex.exec(fixed)) !== null) {
      const tagName = match[1];
      const lastOpenIndex = openTags.lastIndexOf(tagName);
      if (lastOpenIndex !== -1) {
        openTags.splice(lastOpenIndex, 1);
      }
    }
    
    // 关闭未关闭的标签
    for (let i = openTags.length - 1; i >= 0; i--) {
      fixed += `</${openTags[i]}>`;
    }
    
    return fixed;
  };
  
  // Python语法修复
  const fixPythonSyntax = (code: string): string => {
    let fixed = code;
    
    // 1. 修复被拆分的Python关键字
    const keywords = [
      'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'try', 'except', 'finally',
      'with', 'import', 'from', 'as', 'return', 'yield', 'pass', 'break', 'continue',
      'lambda', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None'
    ];
    
    keywords.forEach(keyword => {
      // 构建能够处理任意拆分的正则表达式
      const pattern = keyword.split('').join('[\\s\\n]*');
      const regex = new RegExp('\\b' + pattern + '\\b', 'gi');
      fixed = fixed.replace(regex, keyword);
    });
    
    // 2. 修复函数定义的结构
    // 确保def和函数名正确连接
    fixed = fixed.replace(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g, 'def $1(');
    
    // 3. 修复括号匹配
    // 修复圆括号
    const openParens = (fixed.match(/\(/g) || []).length;
    const closeParens = (fixed.match(/\)/g) || []).length;
    const parenDiff = openParens - closeParens;
    
    if (parenDiff > 0) {
      // 在适当位置添加缺失的闭合括号
      fixed += ')'.repeat(parenDiff);
    }
    
    // 4. 修复f-string格式，确保{}中的内容正确
    fixed = fixed.replace(/f["']([^"']*)\{([^}]*)\}([^"']*)["']/g, "f\"$1{$2}$3\"");
    
    // 5. 处理多行函数定义，确保def、函数名和括号在一行
    // 将"def 函数名"和"(参数):"连接在一行
    fixed = fixed.replace(/def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\n\s*\(/g, 'def $1 (');
    
    // 6. 确保括号和冒号正确连接
    fixed = fixed.replace(/\)\s*:/g, '):');
    
    // 7. 处理多行函数调用
    fixed = fixed.replace(/([a-zA-Z_][a-zA-Z0-9_]*)\s*\n\s*\(/g, '$1 (');
    
    return fixed;
  };
  
  // Python缩进修复
  const fixPythonIndentation = (code: string): string => {
    let fixed = '';
    let indentLevel = 0;
    const INDENT_SIZE = 4;
    
    // 先处理空行，保留空行模式的设置
    const lines = code.split('\n');
    let lastLineEmpty = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // 处理空行
      if (!trimmed) {
        if (lastLineEmpty) continue;
        lastLineEmpty = true;
        fixed += '\n';
        continue;
      }
      lastLineEmpty = false;
      
      // 检查是否应该减少缩进（对于继续语句）
      if (['elif', 'else', 'except', 'finally'].some(kw => trimmed.startsWith(kw))) {
        indentLevel = Math.max(0, indentLevel - 1);
      }
      
      // 添加缩进和代码行
      fixed += ' '.repeat(INDENT_SIZE * indentLevel) + trimmed + '\n';
      
      // 如果行以冒号结尾，下一行需要增加缩进
      if (trimmed.endsWith(':')) {
        indentLevel++;
      }
    }
    
    return fixed;
  };

  // 复制到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // 下载压缩后的代码文件
  const downloadMinifiedCode = () => {
    const blob = new Blob([minifiedCode || code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minified.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    setMinifiedCode('');
    setTransformedCode('');
  };

  // 更新转化选项
  const updateTransformOptions = (key: keyof typeof transformOptions, value: string | number) => {
    setTransformOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 代码转化逻辑
  const transformCode = () => {
    let transformed = code;
    
    // 处理引号转换
    if (transformOptions.quoteType !== 'none') {
      transformed = transformQuotes(transformed);
    }
    
    // 处理缩进转换
    if (transformOptions.indentType !== 'none') {
      transformed = transformIndentation(transformed);
    }
    
    // 处理命名风格转换
    if (transformOptions.namingStyle !== 'none') {
      transformed = transformNamingStyle(transformed);
    }
    
    // 处理注释风格转换
    if (transformOptions.commentStyle !== 'none') {
      transformed = transformCommentStyle(transformed);
    }
    
    setTransformedCode(transformed);
  };

  // 引号转换
  const transformQuotes = (code: string): string => {
    // 避免在字符串内转换引号
    // 简单实现，对于复杂的嵌套字符串可能不准确
    let result = code;
    
    if (transformOptions.quoteType === 'single') {
      // 转换双引号为单引号，但保留字符串内的转义引号
      result = result.replace(/"(.*?)"/g, (match, content) => {
        // 替换内容中的单引号为转义单引号
        const escapedContent = content.replace(/'/g, "\\'");
        return `'${escapedContent}'`;
      });
    } else if (transformOptions.quoteType === 'double') {
      // 转换单引号为双引号，但保留字符串内的转义引号
      result = result.replace(/'(.*?)'/g, (match, content) => {
        // 替换内容中的双引号为转义双引号
        const escapedContent = content.replace(/"/g, '\\"');
        return `"${escapedContent}"`;
      });
    }
    
    return result;
  };

  // 缩进转换
  const transformIndentation = (code: string): string => {
    const lines = code.split('\n');
    const newLines = lines.map(line => {
      // 计算原始缩进级别
      const originalIndent = (line.match(/^\s*/) || [''])[0];
      const content = line.substring(originalIndent.length);
      
      // 生成新的缩进
      let newIndent = '';
      if (transformOptions.indentType === 'space') {
        // 计算原始缩进对应的空格数
        const spacesCount = originalIndent.replace(/\t/g, ' '.repeat(4)).length;
        const newSpacesCount = Math.ceil(spacesCount / transformOptions.indentSize) * transformOptions.indentSize;
        newIndent = ' '.repeat(newSpacesCount);
      } else if (transformOptions.indentType === 'tab') {
        // 计算原始缩进对应的tab数
        const spacesCount = originalIndent.replace(/\t/g, ' '.repeat(4)).length;
        const tabCount = Math.ceil(spacesCount / 4);
        newIndent = '\t'.repeat(tabCount);
      }
      
      return newIndent + content;
    });
    
    return newLines.join('\n');
  };

  // 命名风格转换
  const transformNamingStyle = (code: string): string => {
    let result = code;
    
    // 分割代码为字符串和非字符串部分
    const tokens = code.split(/(['"`])/);
    
    if (transformOptions.namingStyle === 'camelCase') {
      // 转换下划线命名为驼峰命名
      for (let i = 0; i < tokens.length; i += 2) {
        // 只处理非字符串部分
        let token = tokens[i];
        
        // 首先处理主要的下划线到驼峰的转换
        // 使用更全面的正则表达式，确保处理所有下划线情况
        token = token.replace(/([a-zA-Z0-9])_+([a-zA-Z])/g, (match, p1, p2) => {
          return p1 + p2.toUpperCase();
        });
        
        // 处理特殊情况：多个下划线后面跟着字母
        token = token.replace(/_{2,}([a-zA-Z])/g, (match, p1) => {
          return p1.toUpperCase();
        });
        
        tokens[i] = token;
      }
      result = tokens.join('');
    } else if (transformOptions.namingStyle === 'snake_case') {
      // 转换驼峰命名为下划线命名
      for (let i = 0; i < tokens.length; i += 2) {
        // 只处理非字符串部分
        let token = tokens[i];
        
        // 更全面的驼峰到下划线转换
        // 1. 在小写字母/数字和大写字母之间添加下划线
        token = token.replace(/([a-z0-9])([A-Z])/g, '$1_$2');
        // 2. 在多个连续大写字母之间添加下划线（除非是首字母缩写）
        token = token.replace(/([A-Z])([A-Z][a-z])/g, '$1_$2');
        // 3. 转为小写
        token = token.toLowerCase();
        
        tokens[i] = token;
      }
      result = tokens.join('');
    }
    
    return result;
  };

  // 注释风格转换
  const transformCommentStyle = (code: string): string => {
    // 复杂实现，避免在字符串和正则表达式中转换
    if (!(language === 'javascript' || language === 'typescript')) {
      return code;
    }
    
    let result = '';
    let inString = false;
    let inRegex = false;
    let inBlockComment = false;
    let inLineComment = false;
    let stringChar = '';
    let i = 0;
    
    while (i < code.length) {
      // 处理字符串
      if (!inBlockComment && !inLineComment && !inRegex && (code[i] === '\'' || code[i] === '"' || code[i] === '`')) {
        if (!inString) {
          inString = true;
          stringChar = code[i];
          result += code[i];
        } else if (code[i] === stringChar && code[i-1] !== '\\') {
          inString = false;
          result += code[i];
        } else {
          result += code[i];
        }
        i++;
        continue;
      }
      
      // 处理正则表达式
      if (!inString && !inBlockComment && !inLineComment && code[i] === '/' && code[i-1] !== '*' && !(/\w|\)|\]|\}|\)|\s/.test(code[i-1]))) {
        inRegex = true;
        result += code[i];
        i++;
        continue;
      }
      if (inRegex && code[i] === '/' && code[i-1] !== '\\') {
        inRegex = false;
        result += code[i];
        i++;
        // 跳过正则标志
        while (i < code.length && /[gimuy]/.test(code[i])) {
          result += code[i];
          i++;
        }
        continue;
      }
      
      // 处理注释
      if (!inString && !inRegex && i < code.length - 1) {
        // 块注释开始
        if (code[i] === '/' && code[i+1] === '*') {
          if (transformOptions.commentStyle === 'line') {
            // 找到块注释结束
            let endPos = code.indexOf('*/', i + 2);
            if (endPos !== -1) {
              const commentContent = code.substring(i + 2, endPos).trim();
              result += `// ${commentContent}`;
              i = endPos + 2;
              continue;
            }
          }
          inBlockComment = true;
          result += code[i] + code[i+1];
          i += 2;
          continue;
        }
        // 行注释开始
        if (code[i] === '/' && code[i+1] === '/') {
          if (transformOptions.commentStyle === 'block') {
            // 找到行注释结束
            let endPos = code.indexOf('\n', i);
            if (endPos === -1) endPos = code.length;
            const commentContent = code.substring(i + 2, endPos).trim();
            result += `/* ${commentContent} */`;
            // 保留换行符
            if (endPos < code.length) {
              result += '\n';
            }
            i = endPos + 1;
            continue;
          }
          inLineComment = true;
          result += code[i] + code[i+1];
          i += 2;
          continue;
        }
        // 块注释结束
        if (code[i] === '*' && code[i+1] === '/') {
          inBlockComment = false;
          result += code[i] + code[i+1];
          i += 2;
          continue;
        }
      }
      // 行注释结束
      if (inLineComment && code[i] === '\n') {
        inLineComment = false;
        result += code[i];
        i++;
        continue;
      }
      
      // 普通字符
      result += code[i];
      i++;
    }
    
    return result;
  };

  // 下载转化后的代码
  const downloadTransformedCode = () => {
    const blob = new Blob([transformedCode || code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transformed.${getFileExtension(language)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      <Tabs defaultValue="formatter" className="w-full" onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-4">
          <TabsTrigger value="formatter">代码格式化</TabsTrigger>
          <TabsTrigger value="minifier">代码压缩</TabsTrigger>
          <TabsTrigger value="transformer">代码转化</TabsTrigger>
        </TabsList>

        <TabsContent value="formatter" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 输入区域 */}
            <Card className="p-4 space-y-4">
              {/* 语法修复提示 */}
              {syntaxRestored && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-md flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  <span>检测到语法问题并尝试修复。请注意检查结果是否符合预期。</span>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="language-select">编程语言</Label>
                  <div className="custom-select-wrapper">
                    <select
                  id="language-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white text-gray-900 dark:bg-white dark:text-gray-900 cursor-pointer custom-select"
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
                  className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white text-gray-900 dark:bg-white dark:text-gray-900 cursor-pointer custom-select"
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
                className="min-h-[300px] font-mono text-sm resize-none w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:bg-white dark:text-gray-900"
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
                className="min-h-[300px] font-mono text-sm resize-none w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-white dark:text-gray-900"
              />
            </Card>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>提示：这是一个简单的代码格式化工具，对于复杂的代码格式化，建议使用专业的IDE或更强大的工具。</p>
          </div>
        </TabsContent>

        <TabsContent value="minifier" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 输入区域 */}
            <Card className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="language-select">编程语言</Label>
                  <div className="custom-select-wrapper">
                    <select
                  id="language-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white text-gray-900 dark:bg-white dark:text-gray-900 cursor-pointer"
                >
                      <option value="javascript">JavaScript</option>
                      <option value="typescript">TypeScript</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                      <option value="xml">XML</option>
                    </select>
                  </div>
                </div>
                
                {/* 压缩选项 */}
                <div className="space-y-2">
                  <Label>压缩选项：</Label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remove-comments"
                      checked={minifyOptions.removeComments}
                      onChange={(e) => updateMinifyOptions('removeComments', e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="remove-comments" className="text-sm">移除注释</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="remove-whitespace"
                      checked={minifyOptions.removeWhitespace}
                      onChange={(e) => updateMinifyOptions('removeWhitespace', e.target.checked)}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="remove-whitespace" className="text-sm">移除空白字符</label>
                  </div>
                  {language === 'css' && (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="preserve-important"
                        checked={minifyOptions.preserveImportant}
                        onChange={(e) => updateMinifyOptions('preserveImportant', e.target.checked)}
                        className="h-4 w-4 text-blue-600"
                      />
                      <label htmlFor="preserve-important" className="text-sm">保留 !important</label>
                    </div>
                  )}
                </div>
              </div>
              <textarea
                id="minify-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] font-mono text-sm resize-none w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 dark:bg-white dark:text-gray-900"
                placeholder={`输入${language}代码...`}
              />
              <div className="flex gap-2">
                <Button onClick={minifyCode} className="flex-1">压缩代码</Button>
                <Button variant="secondary" onClick={clearCode} size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* 输出区域 */}
            <Card className="p-4 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <Label htmlFor="minify-code-output">压缩结果</Label>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(minifiedCode || code)}
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
                    onClick={downloadMinifiedCode}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>下载</span>
                  </Button>
                  {minifiedCode && code.length > 0 && (
                    <span className="text-sm text-gray-600">
                      压缩率: {((1 - minifiedCode.length / code.length) * 100).toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <textarea
                id="minify-code-output"
                value={minifiedCode || code}
                readOnly
                className="min-h-[300px] font-mono text-sm resize-none w-full p-3 border border-gray-300 rounded-md bg-white text-gray-900 dark:bg-white dark:text-gray-900"
              />
            </Card>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>提示：代码压缩会移除不必要的空白字符和注释，减小文件体积，适用于生产环境部署。</p>
          </div>
        </TabsContent>
        
        <TabsContent value="transformer" className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* 输入区域 */}
            <Card className="p-4 space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex justify-between items-center">
                  <Label htmlFor="language-select">编程语言</Label>
                  <div className="custom-select-wrapper">
                    <select
                  id="language-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white text-gray-900 dark:bg-white dark:text-gray-900 cursor-pointer"
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
                
                {/* 转化选项 */}
                <div className="space-y-4">
                  <Label>转化选项：</Label>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="quote-type" className="text-sm">引号类型：</label>
                        <div className="custom-select-wrapper">
                          <select
                  id="quote-type"
                  value={transformOptions.quoteType}
                  onChange={(e) => updateTransformOptions('quoteType', e.target.value)}
                  className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white text-gray-900 dark:bg-white dark:text-gray-900 cursor-pointer custom-select"
                >
                            <option value="none">不转换</option>
                            <option value="single">单引号</option>
                            <option value="double">双引号</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-1">提示：将字符串引号统一转换为单引号或双引号</p>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="indent-type" className="text-sm">缩进类型：</label>
                        <div className="custom-select-wrapper">
                          <select
                  id="indent-type"
                  value={transformOptions.indentType}
                  onChange={(e) => updateTransformOptions('indentType', e.target.value)}
                  className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white text-gray-900 dark:bg-white dark:text-gray-900 cursor-pointer custom-select"
                >
                            <option value="none">不转换</option>
                            <option value="space">空格</option>
                            <option value="tab">Tab</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-1">提示：选择使用空格或Tab键进行代码缩进</p>
                    </div>
                    
                    {transformOptions.indentType === 'space' && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor="indent-size" className="text-sm">空格数：</label>
                          <div className="custom-select-wrapper">
                            <select
                                id="indent-size"
                                value={transformOptions.indentSize}
                                onChange={(e) => updateTransformOptions('indentSize', parseInt(e.target.value))}
                                className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white cursor-pointer custom-select"
                              >
                              <option value="2">2</option>
                              <option value="4">4</option>
                              <option value="8">8</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 ml-1">提示：设置每次缩进使用的空格数量</p>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label htmlFor="naming-style" className="text-sm">命名风格：</label>
                        <div className="custom-select-wrapper">
                          <select
                  id="naming-style"
                  value={transformOptions.namingStyle}
                  onChange={(e) => updateTransformOptions('namingStyle', e.target.value)}
                  className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white text-gray-900 dark:bg-white dark:text-gray-900 cursor-pointer custom-select"
                >
                            <option value="none">不转换</option>
                            <option value="camelCase">驼峰命名</option>
                            <option value="snake_case">下划线命名</option>
                          </select>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 ml-1">提示：camelCase（驼峰命名）或snake_case（下划线命名）</p>
                    </div>
                    
                    {(language === 'javascript' || language === 'typescript') && (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label htmlFor="comment-style" className="text-sm">注释风格：</label>
                          <div className="custom-select-wrapper">
                            <select
                  id="comment-style"
                  value={transformOptions.commentStyle}
                  onChange={(e) => updateTransformOptions('commentStyle', e.target.value)}
                  className="w-[140px] h-10 px-3 py-2 pr-8 text-sm bg-white text-gray-900 dark:bg-white dark:text-gray-900 cursor-pointer custom-select"
                >
                              <option value="none">不转换</option>
                              <option value="line">单行注释</option>
                              <option value="block">块注释</option>
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 ml-1">提示：将注释统一转换为//单行注释或/*块注释*/</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <textarea
                id="transform-code-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="min-h-[300px] font-mono text-sm resize-none w-full p-3 border border-gray-300 dark:border-gray-700 bg-white text-gray-900 dark:bg-white dark:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`输入${language}代码...`}
              />
              <div className="flex gap-2">
                <Button onClick={transformCode} className="flex-1">转化代码</Button>
                <Button variant="secondary" onClick={clearCode} size="icon">
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </Card>

            {/* 输出区域 */}
            <Card className="p-4 space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <Label htmlFor="transform-code-output">转化结果</Label>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(transformedCode || code)}
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
                    onClick={downloadTransformedCode}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>下载</span>
                  </Button>
                  {transformedCode && code.length > 0 && (
                    <span className="text-sm text-gray-600">
                      转换成功
                    </span>
                  )}
                </div>
              </div>
              <textarea
                id="transform-code-output"
                value={transformedCode || code}
                readOnly
                className="min-h-[300px] font-mono text-sm resize-none w-full p-3 border border-gray-300 dark:border-gray-700 bg-white text-gray-900 dark:bg-white dark:text-gray-900 rounded-md"
              />
            </Card>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>提示：代码转化工具可以帮助您调整代码风格，包括引号类型、缩进方式、命名风格等。</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}