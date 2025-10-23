'use client'

import { useState, useRef } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Copy, Check, Download, Code } from 'lucide-react';

interface CodeExporterProps {
  colors: string[];
  primaryColor: string;
}

type ExportFormat = 'css-variables' | 'tailwind' | 'javascript' | 'react-theme' | 'scss' | 'json';

type Framework = 'react' | 'vue' | 'angular' | 'none';

// 生成CSS变量代码
function generateCSSVariables(colors: string[], primaryColor: string): string {
  // 为颜色分配语义化名称
  const colorNames = [
    'primary',
    'secondary',
    'accent',
    'success',
    'warning',
    'error',
    'info',
    'light',
    'dark'
  ];
  
  let css = ':root {\n';
  
  // 确保主色调是第一个
  if (colors.length > 0 && colors[0] !== primaryColor) {
    const primaryIndex = colors.indexOf(primaryColor);
    if (primaryIndex > -1) {
      colors = [primaryColor, ...colors.filter(c => c !== primaryColor)];
    } else {
      colors = [primaryColor, ...colors];
    }
  }
  
  // 生成CSS变量
  colors.forEach((color, index) => {
    const name = index < colorNames.length ? colorNames[index] : `color-${index + 1}`;
    css += `  --color-${name}: ${color};\n`;
  });
  
  css += '}\n';
  return css;
}

// 生成Tailwind配置代码
function generateTailwindConfig(colors: string[], primaryColor: string): string {
  // 为颜色分配语义化名称
  const colorNames = [
    'primary',
    'secondary',
    'accent',
    'success',
    'warning',
    'error',
    'info'
  ];
  
  let config = 'module.exports = {\n';
  config += '  theme: {\n';
  config += '    extend: {\n';
  config += '      colors: {\n';
  
  // 确保主色调是第一个
  if (colors.length > 0 && colors[0] !== primaryColor) {
    const primaryIndex = colors.indexOf(primaryColor);
    if (primaryIndex > -1) {
      colors = [primaryColor, ...colors.filter(c => c !== primaryColor)];
    } else {
      colors = [primaryColor, ...colors];
    }
  }
  
  // 生成颜色配置
  colors.forEach((color, index) => {
    const name = index < colorNames.length ? colorNames[index] : `color${index + 1}`;
    config += `        ${name}: '${color}',\n`;
  });
  
  config += '      },\n';
  config += '    },\n';
  config += '  },\n';
  config += '}\n';
  return config;
}

// 生成JavaScript对象代码
function generateJavaScriptObject(colors: string[], primaryColor: string): string {
  // 为颜色分配语义化名称
  const colorNames = [
    'primary',
    'secondary',
    'accent',
    'success',
    'warning',
    'error',
    'info'
  ];
  
  let js = 'const colors = {\n';
  
  // 确保主色调是第一个
  if (colors.length > 0 && colors[0] !== primaryColor) {
    const primaryIndex = colors.indexOf(primaryColor);
    if (primaryIndex > -1) {
      colors = [primaryColor, ...colors.filter(c => c !== primaryColor)];
    } else {
      colors = [primaryColor, ...colors];
    }
  }
  
  // 生成对象属性
  colors.forEach((color, index) => {
    const name = index < colorNames.length ? colorNames[index] : `color${index + 1}`;
    js += `  ${name}: '${color}',\n`;
  });
  
  js += '};\n\n';
  js += 'export default colors;\n';
  return js;
}

// 生成React主题代码
function generateReactTheme(colors: string[], primaryColor: string, framework: Framework): string {
  switch (framework) {
    case 'react':
      return generateReactThemeCode(colors, primaryColor);
    case 'vue':
      return generateVueThemeCode(colors, primaryColor);
    case 'angular':
      return generateAngularThemeCode(colors, primaryColor);
    default:
      return generateReactThemeCode(colors, primaryColor);
  }
}

// 生成React主题代码
function generateReactThemeCode(colors: string[], primaryColor: string): string {
  // 为颜色分配语义化名称
  const colorNames = [
    'primary',
    'secondary',
    'accent',
    'success',
    'warning',
    'error',
    'info'
  ];
  
  let theme = '// React Theme Object\n';
  theme += 'const theme = {\n';
  theme += '  colors: {\n';
  
  // 确保主色调是第一个
  if (colors.length > 0 && colors[0] !== primaryColor) {
    const primaryIndex = colors.indexOf(primaryColor);
    if (primaryIndex > -1) {
      colors = [primaryColor, ...colors.filter(c => c !== primaryColor)];
    } else {
      colors = [primaryColor, ...colors];
    }
  }
  
  // 生成颜色属性
  colors.forEach((color, index) => {
    const name = index < colorNames.length ? colorNames[index] : `color${index + 1}`;
    theme += `    ${name}: '${color}',\n`;
  });
  
  theme += '  },\n';
  theme += '};\n\n';
  theme += 'export default theme;\n';
  return theme;
}

// 生成Vue主题代码
function generateVueThemeCode(colors: string[], primaryColor: string): string {
  // 为颜色分配语义化名称
  const colorNames = [
    'primary',
    'secondary',
    'accent',
    'success',
    'warning',
    'error',
    'info'
  ];
  
  let theme = '// Vue Theme Plugin\n';
  theme += 'export default {\n';
  theme += '  install(app) {\n';
  theme += '    app.provide(\'theme\', {\n';
  theme += '      colors: {\n';
  
  // 确保主色调是第一个
  if (colors.length > 0 && colors[0] !== primaryColor) {
    const primaryIndex = colors.indexOf(primaryColor);
    if (primaryIndex > -1) {
      colors = [primaryColor, ...colors.filter(c => c !== primaryColor)];
    } else {
      colors = [primaryColor, ...colors];
    }
  }
  
  // 生成颜色属性
  colors.forEach((color, index) => {
    const name = index < colorNames.length ? colorNames[index] : `color${index + 1}`;
    theme += `        ${name}: '${color}',\n`;
  });
  
  theme += '      }\n';
  theme += '    });\n';
  theme += '  }\n';
  theme += '};\n';
  return theme;
}

// 生成Angular主题代码
function generateAngularThemeCode(colors: string[], primaryColor: string): string {
  // 为颜色分配语义化名称
  const colorNames = [
    'primary',
    'secondary',
    'accent',
    'success',
    'warning',
    'error',
    'info'
  ];
  
  let theme = '// Angular Theme\n';
  theme += 'import { ThemePalette } from \'@angular/material/core\';\n\n';
  theme += 'export const appTheme = {\n';
  theme += '  palette: {\n';
  
  // 确保主色调是第一个
  if (colors.length > 0 && colors[0] !== primaryColor) {
    const primaryIndex = colors.indexOf(primaryColor);
    if (primaryIndex > -1) {
      colors = [primaryColor, ...colors.filter(c => c !== primaryColor)];
    } else {
      colors = [primaryColor, ...colors];
    }
  }
  
  // 生成颜色属性
  colors.forEach((color, index) => {
    const name = index < colorNames.length ? colorNames[index] : `color${index + 1}`;
    theme += `    ${name}: {\n`;
    theme += `      main: '${color}'\n`;
    theme += `    },\n`;
  });
  
  theme += '  }\n';
  theme += '};\n';
  return theme;
}

// 生成SCSS代码
function generateSCSS(colors: string[], primaryColor: string): string {
  // 为颜色分配语义化名称
  const colorNames = [
    'primary',
    'secondary',
    'accent',
    'success',
    'warning',
    'error',
    'info'
  ];
  
  let scss = '// Color Variables\n';
  
  // 确保主色调是第一个
  if (colors.length > 0 && colors[0] !== primaryColor) {
    const primaryIndex = colors.indexOf(primaryColor);
    if (primaryIndex > -1) {
      colors = [primaryColor, ...colors.filter(c => c !== primaryColor)];
    } else {
      colors = [primaryColor, ...colors];
    }
  }
  
  // 生成SCSS变量
  colors.forEach((color, index) => {
    const name = index < colorNames.length ? colorNames[index] : `color-${index + 1}`;
    scss += `$${name}: ${color};\n`;
  });
  
  scss += '\n';
  scss += '// Color Map\n';
  scss += '$colors: (\n';
  
  colors.forEach((color, index) => {
    const name = index < colorNames.length ? colorNames[index] : `color-${index + 1}`;
    const comma = index < colors.length - 1 ? ',' : '';
    scss += `  '${name}': $${name}${comma}\n`;
  });
  
  scss += ');\n';
  return scss;
}

// 生成JSON代码
function generateJSON(colors: string[], primaryColor: string): string {
  // 为颜色分配语义化名称
  const colorNames = [
    'primary',
    'secondary',
    'accent',
    'success',
    'warning',
    'error',
    'info'
  ];
  
  const colorObj: Record<string, string> = {};
  
  // 确保主色调是第一个
  if (colors.length > 0 && colors[0] !== primaryColor) {
    const primaryIndex = colors.indexOf(primaryColor);
    if (primaryIndex > -1) {
      colors = [primaryColor, ...colors.filter(c => c !== primaryColor)];
    } else {
      colors = [primaryColor, ...colors];
    }
  }
  
  // 生成颜色对象
  colors.forEach((color, index) => {
    const name = index < colorNames.length ? colorNames[index] : `color${index + 1}`;
    colorObj[name] = color;
  });
  
  return JSON.stringify({ colors: colorObj }, null, 2);
}

// 生成代码
function generateCode(colors: string[], primaryColor: string, format: ExportFormat, framework: Framework): string {
  if (colors.length === 0) {
    colors = [primaryColor];
  }
  
  switch (format) {
    case 'css-variables':
      return generateCSSVariables(colors, primaryColor);
    case 'tailwind':
      return generateTailwindConfig(colors, primaryColor);
    case 'javascript':
      return generateJavaScriptObject(colors, primaryColor);
    case 'react-theme':
      return generateReactTheme(colors, primaryColor, framework);
    case 'scss':
      return generateSCSS(colors, primaryColor);
    case 'json':
      return generateJSON(colors, primaryColor);
    default:
      return '';
  }
}

// 下载代码文件
function downloadCode(code: string, format: ExportFormat): void {
  const fileExtensions: Record<ExportFormat, string> = {
    'css-variables': 'css',
    'tailwind': 'js',
    'javascript': 'js',
    'react-theme': 'js',
    'scss': 'scss',
    'json': 'json'
  };
  
  const fileName = `colors.${fileExtensions[format]}`;
  const blob = new Blob([code], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 0);
}

export function CodeExporter({ colors, primaryColor }: CodeExporterProps) {
  const [format, setFormat] = useState<ExportFormat>('css-variables');
  const [framework, setFramework] = useState<Framework>('react');
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // 生成当前格式的代码
  const code = generateCode(colors, primaryColor, format, framework);
  
  // 复制代码到剪贴板
  const copyCode = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  // 处理下载
  const handleDownload = () => {
    downloadCode(code, format);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="flex-1 space-y-2">
            <Label htmlFor="export-format">导出格式</Label>
            <Select value={format} onValueChange={(value) => setFormat(value as ExportFormat)}>
              <SelectTrigger id="export-format">
                <SelectValue placeholder="选择导出格式" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="css-variables">CSS 变量</SelectItem>
                <SelectItem value="tailwind">Tailwind CSS</SelectItem>
                <SelectItem value="javascript">JavaScript 对象</SelectItem>
                <SelectItem value="react-theme">React 主题</SelectItem>
                <SelectItem value="scss">SCSS 变量</SelectItem>
                <SelectItem value="json">JSON 格式</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {format === 'react-theme' && (
            <div className="w-full md:w-64 space-y-2">
              <Label htmlFor="framework">框架选择</Label>
              <Select value={framework} onValueChange={(value) => setFramework(value as Framework)}>
                <SelectTrigger id="framework">
                  <SelectValue placeholder="选择框架" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="react">React</SelectItem>
                  <SelectItem value="vue">Vue</SelectItem>
                  <SelectItem value="angular">Angular</SelectItem>
                  <SelectItem value="none">通用 JavaScript</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {colors.length === 0 && (
          <Alert variant="destructive">
            <AlertDescription>调色板为空，请先添加颜色再导出代码</AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* 代码展示区 */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Code size={18} />
            生成的代码
          </h3>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm"
              onClick={copyCode}
              disabled={colors.length === 0}
              className="flex items-center gap-1"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? '已复制' : '复制'}
            </Button>
            <Button 
              size="sm"
              onClick={handleDownload}
              disabled={colors.length === 0}
              className="flex items-center gap-1"
            >
              <Download size={16} />
              下载
            </Button>
          </div>
        </div>
        
        <Textarea
          ref={textareaRef}
          value={code}
          readOnly
          className="font-mono text-sm min-h-[200px] resize-y"
        />
      </div>
      
      {/* 使用说明 */}
      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-2">
        <h4 className="font-medium text-gray-700 dark:text-gray-300">使用说明：</h4>
        {format === 'css-variables' && (
          <>
            <p>• 将生成的CSS变量添加到你的样式文件中</p>
            <p>• 在样式中使用：<code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">color: var(--color-primary);</code></p>
          </>
        )}
        {format === 'tailwind' && (
          <>
            <p>• 将配置添加到你的 tailwind.config.js 文件中</p>
            <p>• 在HTML中使用：<code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">bg-primary</code> 或 <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">text-primary</code></p>
          </>
        )}
        {format === 'javascript' && (
          <>
            <p>• 将生成的文件导入到你的JavaScript项目中</p>
            <p>• 使用：<code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">colors.primary</code></p>
          </>
        )}
        {format === 'react-theme' && (
          <>
            <p>• 将生成的主题文件导入到你的{framework === 'react' ? 'React' : framework === 'vue' ? 'Vue' : 'Angular'}项目中</p>
            <p>• 根据框架文档进行主题配置和使用</p>
          </>
        )}
        {format === 'scss' && (
          <>
            <p>• 将生成的SCSS变量添加到你的样式文件中</p>
            <p>• 使用：<code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">color: $primary;</code> 或 <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">color: map-get($colors, 'primary');</code></p>
          </>
        )}
        {format === 'json' && (
          <>
            <p>• 将生成的JSON文件导入到你的项目中</p>
            <p>• 使用：<code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">data.colors.primary</code></p>
          </>
        )}
      </div>
    </div>
  );
}