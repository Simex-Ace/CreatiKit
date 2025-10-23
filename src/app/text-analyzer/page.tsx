'use client'

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Search, Download, Copy, Check, Trash2, Info, Code, BarChart2, Zap, Languages, Hash, FileText, RefreshCw } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { Input } from '@/components/ui/input';

// ===== SEO分析功能相关函数 =====

// 1. 关键词密度分析（已优化）

// 2. 相关关键词提取（已优化）

// 3. 标题结构分析（已优化）
interface Heading {
  text: string;
  level: number;
  line?: number;
}

// 4. 可读性评分（已优化）

// 5. 文本热力图数据生成（已优化为generateTextHeatmap）

// ===== 文本处理功能相关函数 =====

// 中文标点规范化（已优化）

// 中文排版间距优化（已优化）

// 英文标点规范化（已优化）

// 英文大小写修正（已优化）



// 辅助函数：文本分词
const tokenizeText = (text: string): string[] => {
  return text.match(/[\u4e00-\u9fa5a-zA-Z0-9_]+/g) || [];
};

// 辅助函数：提取关键词
const extractKeywords = (text: string, limit: number = 5): string[] => {
  const tokens = tokenizeText(text);
  const frequencyMap = new Map<string, number>();
  
  // 过滤掉常见的停用词
  const stopWords = new Set([
    '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要',
    '去', '你', '会', '着', '没有', '看', '好', '自己', '这', 'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were'
  ]);
  
  tokens.forEach(token => {
    if (!stopWords.has(token.toLowerCase()) && token.length > 1) {
      frequencyMap.set(token, (frequencyMap.get(token) || 0) + 1);
    }
  });
  
  return Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word]) => word);
};

// 辅助函数：计算SEO得分
const calculateSEOScore = (data: any): number => {
  let score = 0;
  let totalWeight = 0;
  
  // 关键词密度评分 (权重 30%)
  if (data.keywordDensity.length > 0) {
    const avgDensity = data.keywordDensity.reduce((sum: number, item: any) => sum + item.density, 0) / data.keywordDensity.length;
    // 理想密度：2-4%
    if (avgDensity >= 2 && avgDensity <= 4) {
      score += 30;
    } else if (avgDensity >= 1 && avgDensity < 2 || avgDensity > 4 && avgDensity <= 6) {
      score += 20;
    } else {
      score += 10;
    }
    totalWeight += 30;
  }
  
  // 相关关键词评分 (权重 20%)
  if (data.relatedKeywords.length > 0) {
    score += Math.min(data.relatedKeywords.length * 2, 20);
    totalWeight += 20;
  }
  
  // 标题结构评分 (权重 20%)
  if (data.titleStructure.hasTitle) {
    score += 10;
    if (data.titleStructure.averageTitleLength >= 20 && data.titleStructure.averageTitleLength <= 60) {
      score += 10;
    } else {
      score += 5;
    }
    totalWeight += 20;
  }
  
  // 可读性评分 (权重 20%)
  score += (data.readabilityScore.score / 100) * 20;
  totalWeight += 20;
  
  // 文本长度评分 (权重 10%)
  if (data.wordCount >= 300 && data.wordCount <= 1500) {
    score += 10;
  } else if (data.wordCount >= 100 && data.wordCount < 300 || data.wordCount > 1500 && data.wordCount <= 2500) {
    score += 7;
  } else {
    score += 5;
  }
  totalWeight += 10;
  
  const seoScore = totalWeight > 0 ? (score / totalWeight) * 100 : 0;
  // 保留一位小数
  return Math.round(seoScore * 10) / 10;
};

// 修正并扩展SEO分析功能函数
const calculateKeywordDensity = (text: string, keywords: string[]): { keyword: string; density: number; count: number }[] => {
  const results: { keyword: string; density: number; count: number }[] = [];
  const totalWords = text.length;
  
  keywords.forEach(keyword => {
    const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const matches = text.match(regex) || [];
    const occurrences = matches.length;
    const density = totalWords > 0 ? (occurrences * keyword.length) / totalWords * 100 : 0;
    // 保留一位小数
    const formattedDensity = Math.round(density * 10) / 10;
    
    results.push({
      keyword,
      density: formattedDensity,
      count: occurrences
    });
  });
  
  return results.sort((a, b) => b.density - a.density);
};

const extractRelatedKeywords = (text: string, mainKeywords: string[]): { keyword: string; relevance: number }[] => {
  const tokens = tokenizeText(text);
  const frequencyMap = new Map<string, number>();
  
  // 过滤掉常见的停用词
  const stopWords = new Set([
    '的', '了', '是', '在', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要',
    '去', '你', '会', '着', '没有', '看', '好', '自己', '这', 'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were'
  ]);
  
  tokens.forEach(token => {
    if (!stopWords.has(token.toLowerCase()) && !mainKeywords.includes(token) && token.length > 1) {
      frequencyMap.set(token, (frequencyMap.get(token) || 0) + 1);
    }
  });
  
  const totalTokens = tokens.length;
  return Array.from(frequencyMap.entries())
    .map(([word, count]) => ({
      keyword: word,
      relevance: Math.round((count / totalTokens) * 100 * 10) / 10 // 简单相关性计算，保留一位小数
    }))
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 15);
};

const analyzeTitleStructure = (text: string): { hasTitle: boolean; titleCount: number; averageTitleLength: number } => {
  const headings = analyzeHeadingStructure(text);
  const hasTitle = headings.length > 0;
  const titleCount = headings.length;
  const totalLength = headings.reduce((sum, heading) => sum + heading.text.length, 0);
  const averageTitleLength = titleCount > 0 ? totalLength / titleCount : 0;
  
  return {
    hasTitle,
    titleCount,
    averageTitleLength
  };
};

const calculateReadabilityScore = (text: string): { score: number; level: string } => {
  const score = calculateReadabilityScoreImpl(text);
  // 保留一位小数
  const formattedScore = Math.round(score * 10) / 10;
  let level = '';
  
  // 调整等级划分以适应优化后的分数范围
  if (score >= 90) level = '非常易读';
  else if (score >= 80) level = '易读';
  else if (score >= 70) level = '中等易读';
  else if (score >= 60) level = '稍难读';
  else if (score >= 45) level = '难读';
  else level = '较难读'; // 调整最低等级描述，不再使用"非常难读"
  
  return { score: formattedScore, level };
};

// 辅助函数：分析标题结构
const analyzeHeadingStructure = (text: string): { level: number; text: string }[] => {
  // 简单地检测以特定模式开头的行作为标题
  const headingPatterns = [
    { regex: /^#{1}\s+(.*)/, level: 1 },  // # 一级标题
    { regex: /^#{2}\s+(.*)/, level: 2 },  // ## 二级标题
    { regex: /^#{3}\s+(.*)/, level: 3 },  // ### 三级标题
    { regex: /^\[h(\d)\](.*)/i, level: null }, // [h1] 格式标题
    { regex: /^【(.+)】/, level: 2 },      // 【】格式标题
    { regex: /^([一二三四五六七八九十]+、)/, level: 2 }, // 一、二、三格式
    { regex: /^(\d+\.)\s+/, level: 3 },  // 1. 2. 3. 格式
    { regex: /^([A-Z]+\.)\s+/i, level: 3 }, // A. B. C. 格式
    { regex: /^([a-z]+\.)\s+/i, level: 4 }, // a. b. c. 格式
    { regex: /^(\d+\))\s+/, level: 4 },  // 1) 2) 3) 格式
    { regex: /^([A-Z]+\))\s+/i, level: 4 }, // A) B) C) 格式
    { regex: /^([a-z]+\))\s+/i, level: 5 }, // a) b) c) 格式
    { regex: /^\(\d+\)\s+/, level: 5 },  // (1) (2) (3) 格式
  ];

  const lines = text.split('\n');
  const headings: { level: number; text: string }[] = [];

  lines.forEach(line => {
    for (const pattern of headingPatterns) {
      const match = line.match(pattern.regex);
      if (match) {
        let level = pattern.level;
        let text = '';
        
        if (pattern.regex.toString().includes('[h')) {
          // 处理 [h1] 格式
          level = parseInt(match[1]);
          text = match[2].trim();
        } else if (pattern.regex.toString().includes('【')) {
          // 处理 【】 格式
          text = match[1].trim();
        } else {
          // 处理其他格式
          text = line.replace(pattern.regex, '$1').trim();
        }
        
        // 确保标题级别有效
        level = Math.max(1, Math.min(6, level || 2));
        
        // 只添加有效长度的标题
        if (text.length > 0 && text.length < 200) {
          headings.push({ level, text });
        }
        break;
      }
    }
  });

  return headings;
};

// 实现函数
const calculateReadabilityScoreImpl = (text: string): number => {
  const words = text.match(/[\u4e00-\u9fa5]|[a-zA-Z]+/g) || [];
  const sentences = text.split(/[。！？.!?]/).filter(s => s.trim());
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim());
  
  const wordCount = words.length;
  const sentenceCount = sentences.length || 1;
  const paragraphCount = paragraphs.length || 1;
  
  // 优化的可读性公式：更平缓的计算，更大的分数区间
  const avgSentenceLength = wordCount / sentenceCount;
  const avgParagraphLength = wordCount / paragraphCount;
  
  // 基础分数
  let score = 100;
  
  // 更平缓的句子长度影响（降低系数，使用对数函数缓和）
  const sentenceLengthPenalty = Math.log10(Math.max(1, avgSentenceLength)) * 8;
  score -= sentenceLengthPenalty;
  
  // 更平缓的段落长度影响
  const paragraphLengthPenalty = Math.log10(Math.max(1, avgParagraphLength / 10)) * 5;
  score -= paragraphLengthPenalty;
  
  // 文本长度加分：太短的文本难以评估可读性
  if (wordCount >= 100 && wordCount <= 2000) {
    score += 5;
  } else if (wordCount > 2000) {
    score += 3;
  }
  
  // 段落适中加分
  if (paragraphCount >= 3 && paragraphCount <= 20) {
    score += 3;
  }
  
  // 确保分数在合理区间，最低不低于20分
  return Math.max(20, Math.min(100, score));
};

const generateTextHeatmap = (text: string, keywordData: { keyword: string; density: number; count: number }[]): any[] => {
  const keywordMap = new Map(keywordData.map(item => [item.keyword.toLowerCase(), item.density]));
  const maxDensity = Math.max(...keywordData.map(item => item.density), 1);
  
  return text.split('\n').map((line, lineIndex) => {
    const words = line.match(/[\u4e00-\u9fa5]|[a-zA-Z]+|[0-9]+|[,.!?，。！？]/g) || [];
    return {
      line: line || ' ',
      lineIndex,
      words: words.map(word => {
        const normalizedWord = word.toLowerCase();
        const keywordDensity = keywordMap.get(normalizedWord) || 0;
        return {
          word,
          heat: keywordDensity / maxDensity
        };
      })
    };
  });
};

// 文本处理功能核心函数
// 中文标点规范化
const normalizeChinesePunctuation = (text: string): string => {
  // 保护引号内的内容不被处理
  const placeholders: string[] = [];
  let protectedText = text.replace(/"([^"]+)"/g, (match, content) => {
    placeholders.push(content);
    return `"${placeholders.length - 1}"`;
  });
  
  protectedText = protectedText.replace(/'([^']+)'/g, (match, content) => {
    placeholders.push(content);
    return `'${placeholders.length - 1}'`;
  });
  
  // 中文标点规范化
  let normalized = protectedText
    // 将英文标点替换为中文标点（在适当的上下文中）
    .replace(/\,([^a-zA-Z0-9])/g, '，$1') // 逗号
    .replace(/\.([^a-zA-Z0-9\.])/g, '。$1') // 句号
    .replace(/\!([^a-zA-Z0-9])/g, '！$1') // 感叹号
    .replace(/\?([^a-zA-Z0-9])/g, '？$1') // 问号
    .replace(/\;([^a-zA-Z0-9])/g, '；$1') // 分号
    .replace(/\:([^a-zA-Z0-9])/g, '：$1') // 冒号
    .replace(/\(([^)]+)\)/g, '（$1）') // 括号
    .replace(/\[([^\]]+)\]/g, '［$1］') // 方括号
    .replace(/\{([^}]*)\}/g, '｛$1｝') // 大括号
    .replace(/\"([^\"]*)\"/g, '“$1”') // 引号
    .replace(/\'([^\']*)\'/g, '‘$1’') // 单引号
    
    // 处理特殊情况
    .replace(/\.\.\./g, '……') // 省略号
    .replace(/\-\-/g, '——') // 破折号
    .replace(/\s+([，。！？；：）】’”])/g, '$1') // 移除标点前的空格
    .replace(/([（［‘“])\s+/g, '$1') // 移除标点后的空格
    .replace(/\s+/g, ' '); // 合并多余空格
    
  // 恢复引号内的内容
  for (let i = placeholders.length - 1; i >= 0; i--) {
    normalized = normalized.replace(`"${i}"`, `"${placeholders[i]}"`);
    normalized = normalized.replace(`'${i}'`, `'${placeholders[i]}'`);
  }
  
  return normalized;
};

// 中文排版间距优化 - 恢复空格添加功能
const optimizeChineseSpacing = (text: string): string => {
  // 保护引号内的内容
  const placeholders: string[] = [];
  let protectedText = text.replace(/"([^"]+)"/g, (match, content) => {
    placeholders.push(content);
    return `"${placeholders.length - 1}"`;
  });
  
  protectedText = protectedText.replace(/'([^']+)'/g, (match, content) => {
    placeholders.push(content);
    return `'${placeholders.length - 1}'`;
  });
  
  // 优化中英文之间的空格
  let optimized = protectedText
    // 在中文与英文之间添加空格
    .replace(/([\u4e00-\u9fa5])([a-zA-Z])/g, '$1 $2')
    .replace(/([a-zA-Z])([\u4e00-\u9fa5])/g, '$1 $2')
    // 在中文与数字之间添加空格
    .replace(/([\u4e00-\u9fa5])([0-9])/g, '$1 $2')
    .replace(/([0-9])([\u4e00-\u9fa5])/g, '$1 $2')
    // 在数字与单位之间添加空格（常用单位）
    .replace(/([0-9])([kmgbKMGB]?[b])/g, '$1 $2')
    .replace(/([0-9])([年月日天时分秒])/g, '$1$2'); // 中文时间单位不加空格
  
  // 恢复引号内的内容
  for (let i = placeholders.length - 1; i >= 0; i--) {
    optimized = optimized.replace(`"${i}"`, `"${placeholders[i]}"`);
    optimized = optimized.replace(`'${i}'`, `'${placeholders[i]}'`);
  }
  
  return optimized;
};

// 英文标点规范化 - 添加标点后空格和其他空格处理
const normalizeEnglishPunctuation = (text: string): string => {
  // 保护引号内的内容
  const placeholders: string[] = [];
  let protectedText = text.replace(/"([^"]+)"/g, (match, content) => {
    placeholders.push(content);
    return `"${placeholders.length - 1}"`;
  });
  
  // 英文标点规范化
  let normalized = protectedText
    // 将中文标点替换为英文标点
    .replace(/，/g, ',')
    .replace(/。/g, '.')
    .replace(/！/g, '!')
    .replace(/？/g, '?')
    .replace(/；/g, ';')
    .replace(/：/g, ':')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .replace(/［/g, '[')
    .replace(/］/g, ']')
    .replace(/｛/g, '{')
    .replace(/｝/g, '}')
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/‘/g, "'")
    .replace(/’/g, "'")
    .replace(/……/g, '...')
    .replace(/——/g, '--')
    
    // 英文标点后添加空格
    .replace(/([.!?,;:])([^\s])/g, '$1 $2')
    
    // 修复括号周围的空格
    .replace(/\s*\(\s*/g, ' (')
    .replace(/\s*\)\s*/g, ') ');
  
  // 恢复引号内的内容
  for (let i = placeholders.length - 1; i >= 0; i--) {
    normalized = normalized.replace(`"${i}"`, `"${placeholders[i]}"`);
  }
  
  return normalized;
};

// HTML标签清理函数
const cleanHTML = (text: string): { cleaned: string; missingAltImages: string[] } => {
  let cleaned = text;
  const missingAltImages: string[] = [];
  
  // 1. 扫描所有缺少alt属性的img标签
  const imgRegex = /<img[^>]*>/g;
  let match;
  let imageIndex = 0;
  
  while ((match = imgRegex.exec(text)) !== null) {
    const imgTag = match[0];
    if (!imgTag.match(/alt=["'][^"']*["']/i)) {
      missingAltImages.push(`图片 ${++imageIndex}: ${imgTag}`);
    }
  }
  
  // 2. 保护<a>、<img>等保留标签内容
  const placeholders: string[] = [];
  
  // 保护<a>标签
  cleaned = cleaned.replace(/<a[^>]*>.*?<\/a>/gi, (match) => {
    placeholders.push(match);
    return `__A_TAG_PLACEHOLDER_${placeholders.length - 1}__`;
  });
  
  // 保护<img>标签
  cleaned = cleaned.replace(/<img[^>]*>/gi, (match) => {
    placeholders.push(match);
    return `__IMG_TAG_PLACEHOLDER_${placeholders.length - 1}__`;
  });
  
  // 3. 保留所有HTML标签（不删除任何标签）
  // 不再删除任何非语义标签，保留原始HTML结构
  
  // 4. 恢复保留标签并处理
  // 恢复并处理<a>标签
  for (let i = 0; i < placeholders.length; i++) {
    if (placeholders[i].match(/^<a[^>]*>/i)) {
      // 为<a>标签添加或替换target和rel属性
      let aTag = placeholders[i];
      if (!aTag.match(/target=["'][^"']*["']/i)) {
        aTag = aTag.replace(/<a/, '<a target="_blank"');
      } else {
        aTag = aTag.replace(/target=["'][^"']*["']/i, 'target="_blank"');
      }
      
      if (!aTag.match(/rel=["'][^"']*["']/i)) {
        aTag = aTag.replace(/<a[^>]*>/, (match) => match.replace('>', ' rel="noopener noreferrer">'));
      } else {
        aTag = aTag.replace(/rel=["'][^"']*["']/i, 'rel="noopener noreferrer"');
      }
      
      cleaned = cleaned.replace(`__A_TAG_PLACEHOLDER_${i}__`, aTag);
    } else if (placeholders[i].match(/^<img[^>]*>/i)) {
      // 恢复<img>标签（不做修改，但已记录缺少alt的图片）
      cleaned = cleaned.replace(`__IMG_TAG_PLACEHOLDER_${i}__`, placeholders[i]);
    }
  }
  
  // 5. 保留所有样式属性
  // 不再删除任何样式或类属性，保留原始样式信息
  
  return { cleaned, missingAltImages };
};

export default function TextAnalyzer() {
  // 状态管理
  const [inputText, setInputText] = useState('');
  const [targetKeywords, setTargetKeywords] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    // 文本统计
    wordCount: number;
    charCount: number;
    paragraphCount: number;
    
    // SEO 分析
    keywordDensity: { keyword: string; density: number; count: number }[];
    relatedKeywords: { keyword: string; relevance: number }[];
    titleStructure: { hasTitle: boolean; titleCount: number; averageTitleLength: number };
    readabilityScore: { score: number; level: string };
    seoScore: number;
    
    // 文本处理
    heatmapData: any[];
  } | null>(null);
  const [optimizedText, setOptimizedText] = useState('');
  const [activeTab, setActiveTab] = useState('analysis');
  const [isChineseMode, setIsChineseMode] = useState(true);
  const [notifications, setNotifications] = useState<{id: string; type: 'success' | 'warning'; message: string}[]>([]);
  
  // 显示通知
  const showNotification = (type: 'success' | 'warning', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, {id, type, message}]);
    
    // 3秒后自动移除通知
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 3000);
  };
  
  // SEO 分析处理函数
  const handleAnalyze = () => {
    if (!inputText.trim()) {
      return;
    }
    
    // 文本统计
    const words = tokenizeText(inputText);
    const wordCount = words.length;
    const charCount = inputText.length;
    const paragraphCount = inputText.split(/\n+/).filter(p => p.trim()).length;
    
    // 提取目标关键词
    const keywords = targetKeywords.split(/[,，]/).map(k => k.trim()).filter(k => k.length > 0);
    
    // 关键词密度分析
    const keywordDensity = calculateKeywordDensity(inputText, keywords.length > 0 ? keywords : extractKeywords(inputText, 5));
    
    // LSI/相关关键词提取
    const relatedKeywords = extractRelatedKeywords(inputText, keywordDensity.map(k => k.keyword));
    
    // 标题结构分析
    const titleStructure = analyzeTitleStructure(inputText);
    
    // 可读性评分
    const readabilityScore = calculateReadabilityScore(inputText);
    
    // 计算总体SEO得分（基于各项指标的加权平均）
    const seoScore = calculateSEOScore({
      keywordDensity,
      relatedKeywords,
      titleStructure,
      readabilityScore,
      wordCount
    });
    
    // 生成热力图数据
    const heatmapData = generateTextHeatmap(inputText, keywordDensity);
    
    setAnalysisResult({
      wordCount,
      charCount,
      paragraphCount,
      keywordDensity,
      relatedKeywords,
      titleStructure,
      readabilityScore,
      seoScore,
      heatmapData
    });
    
    setActiveTab('analysis');
  };
  
  // 文本优化处理函数 - 增强版
  const handleOptimize = () => {
    if (!inputText.trim()) {
      return;
    }
    
    let optimized = inputText;
    
    // 1. 首先进行HTML清理
    const { cleaned, missingAltImages } = cleanHTML(optimized);
    optimized = cleaned;
    
    // 显示缺少alt属性的图片提示
    if (missingAltImages.length > 0) {
      showNotification('warning', `检测到 ${missingAltImages.length} 张缺少alt属性的图片。建议为这些图片添加alt属性以提高SEO效果。`);
    }
    
    // 2. 根据语言模式应用不同的优化规则
    if (isChineseMode) {
      // 中文模式：标点规范化 + 中英文/数字之间添加空格
      optimized = normalizeChinesePunctuation(optimized);
      optimized = optimizeChineseSpacing(optimized);
    } else {
      // 英文模式：标点规范化 + 标点后添加空格（移除大小写修正）
      optimized = normalizeEnglishPunctuation(optimized);
      // 移除英文大小写修正，按照用户要求
    }
    
    setOptimizedText(optimized);
    setActiveTab('optimized');
  };
  
  // 辅助交互函数
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('success', '文本已复制到剪贴板');
    });
  };
  
  const handleDownload = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleClear = () => {
    setInputText('');
    setTargetKeywords('');
    setAnalysisResult(null);
    setOptimizedText('');
  };
  
  // 渲染SEO分数指示器
  const renderSEOScoreIndicator = (score: number) => {
    let color = 'text-red-500';
    if (score >= 80) color = 'text-green-500';
    else if (score >= 60) color = 'text-yellow-500';
    
    return (
      <div className="flex items-center gap-2">
        <div className={`text-3xl font-bold ${color}`}>{Math.round(score)}</div>
        <div className="w-40 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`} 
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
    );
  };
  
  // 渲染关键词密度进度条
  const renderKeywordDensityBar = (density: number) => {
    let color = 'bg-red-500';
    if (density >= 2 && density <= 4) color = 'bg-green-500';
    else if (density >= 1 && density < 2 || density > 4 && density <= 6) color = 'bg-yellow-500';
    
    return (
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${color}`} 
          style={{ width: `${Math.min(density * 10, 100)}%` }}
        />
      </div>
    );
  };
  
  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">SEO文本分析与优化工具</h1>
        
        <div className="grid grid-cols-1 gap-6">
        {/* 输入区域 */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold">输入文本</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <div className="flex items-center gap-3 w-full sm:w-auto bg-gray-100 rounded-full p-1">
                <button 
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${isChineseMode ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => setIsChineseMode(true)}
                >
                  中文
                </button>
                <button 
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!isChineseMode ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
                  onClick={() => setIsChineseMode(false)}
                >
                  英文
                </button>
              </div>
              <Button onClick={handleClear} variant="secondary" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                清空
              </Button>
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="targetKeywords">目标关键词（用逗号分隔）</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                id="targetKeywords"
                value={targetKeywords}
                onChange={(e) => setTargetKeywords(e.target.value)}
                placeholder={isChineseMode ? "输入您的目标关键词，用逗号分隔" : "Enter your target keywords, separated by commas"}
                className="pl-10"
              />
            </div>
          </div>
          
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isChineseMode ? "请输入要分析的文本内容..." : "Please enter the text to analyze..."}
            rows={10}
            className="w-full resize-none"
          />
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button 
              onClick={handleAnalyze} 
              disabled={!inputText.trim()}
              className="flex-1 transition-all duration-200 hover:brightness-105 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            >
              <Code className="h-4 w-4 mr-1" />
              SEO分析
            </Button>
            <Button 
              onClick={handleOptimize} 
              disabled={!inputText.trim()}
              variant="secondary" 
              className="flex-1 transition-all duration-200 hover:brightness-105 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
            >
              <Zap className="h-4 w-4 mr-1" />
              文本优化
            </Button>
          </div>
        </Card>
        
        {/* 结果标签页 */}
        <Tabs defaultValue="analysis" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3">
            <TabsTrigger 
              value="analysis"
              className="transition-all duration-200 hover:bg-primary/10 focus:ring-2 focus:ring-primary/50 focus:ring-offset-0"
            >
              SEO分析
            </TabsTrigger>
            <TabsTrigger 
              value="keywords"
              className="transition-all duration-200 hover:bg-primary/10 focus:ring-2 focus:ring-primary/50 focus:ring-offset-0"
            >
              关键词分析
            </TabsTrigger>
            <TabsTrigger 
              value="optimized"
              className="transition-all duration-200 hover:bg-primary/10 focus:ring-2 focus:ring-primary/50 focus:ring-offset-0"
            >
              文本优化
            </TabsTrigger>
          </TabsList>
          
          {/* SEO分析结果 */}
          <TabsContent value="analysis" className="mt-4">
            {analysisResult && (
              <div className="grid grid-cols-1 gap-6">
                {/* SEO总体评分 */}
                <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">SEO总体评分</h2>
                      <p className="text-muted-foreground">基于多项指标的综合评估</p>
                    </div>
                    {renderSEOScoreIndicator(analysisResult.seoScore)}
                  </div>
                </Card>
                
                {/* 基本指标卡片 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">单词数</span>
                      <span className="text-2xl font-bold">{analysisResult.wordCount}</span>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">字符数</span>
                      <span className="text-2xl font-bold">{analysisResult.charCount}</span>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">段落数</span>
                      <span className="text-2xl font-bold">{analysisResult.paragraphCount}</span>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">可读性</span>
                      <span className="text-2xl font-bold">{analysisResult.readabilityScore.score}</span>
                    </div>
                  </Card>
                </div>
                
                {/* 标题结构分析 */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    <FileText className="h-5 w-5 inline-block mr-2" />
                    标题结构分析
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>包含标题</span>
                      <span className={`font-medium ${analysisResult.titleStructure.hasTitle ? 'text-green-500' : 'text-red-500'}`}>
                        {analysisResult.titleStructure.hasTitle ? "是" : "否"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>标题数量</span>
                      <span>{analysisResult.titleStructure.titleCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>平均标题长度</span>
                      <span>{analysisResult.titleStructure.averageTitleLength.toFixed(1)} 字符</span>
                    </div>
                  </div>
                </Card>
                
                {/* 可读性分析 */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    <Languages className="h-5 w-5 inline-block mr-2" />
                    可读性分析
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>可读性得分</span>
                        <span className="font-medium">{analysisResult.readabilityScore.score}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r from-green-500 to-blue-500 rounded-full`} 
                          style={{ width: `${analysisResult.readabilityScore.score}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">可读性等级：</span>
                      <span className="font-medium">{analysisResult.readabilityScore.level}</span>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
          
          {/* 关键词分析 */}
          <TabsContent value="keywords" className="mt-4">
            {analysisResult && (
              <div className="grid grid-cols-1 gap-6">
                {/* 关键词密度分析 */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    <BarChart2 className="h-5 w-5 inline-block mr-2" />
                    关键词密度分析
                  </h3>
                  <div className="space-y-4">
                    {analysisResult.keywordDensity.length > 0 ? (
                      analysisResult.keywordDensity.map((item, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex justify-between">
                            <span className="font-medium">{item.keyword}</span>
                            <span className="text-sm">{item.density.toFixed(2)}% ({item.count}次)</span>
                          </div>
                          {renderKeywordDensityBar(item.density)}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">未检测到关键词密度</p>
                    )}
                  </div>
                </Card>
                
                {/* 相关关键词建议 */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">相关关键词建议</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.relatedKeywords.length > 0 ? (
                      analysisResult.relatedKeywords.map((item, index) => (
                        <span 
                          key={index} 
                          className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm text-primary cursor-pointer hover:bg-primary/10 transition-colors duration-200"
                          onClick={() => setTargetKeywords(prev => prev ? `${prev}, ${item.keyword}` : item.keyword)}
                        >
                          {item.keyword} ({item.relevance.toFixed(1)})
                        </span>
                      ))
                    ) : (
                      <p className="text-muted-foreground">未生成相关关键词建议</p>
                    )}
                  </div>
                </Card>
                
                {/* 文本热力图 */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">文本热力图</h3>
                  <div className="overflow-auto max-h-[500px] font-mono text-sm border rounded p-4">
                    {analysisResult.heatmapData.map((lineData) => (
                      <div key={lineData.lineIndex} className="mb-2">
                        {lineData.words.map((wordData: any, wordIndex: number) => (
                          <span 
                            key={wordIndex}
                            className="inline-block mr-1 px-1 rounded"
                            style={{ 
                              backgroundColor: `rgba(79, 70, 229, ${wordData.heat * 0.8 + 0.1})`,
                              color: wordData.heat > 0.5 ? '#fff' : '#000',
                              transition: 'all 0.2s'
                            }}
                            title={`${wordData.word}: ${Math.round(wordData.heat * 100)}%`}
                          >
                            {wordData.word}
                          </span>
                        ))}
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>
          
          {/* 文本优化结果 */}
          <TabsContent value="optimized" className="mt-4">
            {optimizedText && (
              <Card className="p-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h2 className="text-xl font-semibold">优化后文本</h2>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleCopy(optimizedText)} 
                      variant="secondary" 
                      size="sm"
                      className="transition-all duration-200 hover:brightness-105 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      复制
                    </Button>
                    <Button 
                      onClick={() => handleDownload(optimizedText, 'optimized_text.txt')} 
                      variant="secondary" 
                      size="sm"
                      className="transition-all duration-200 hover:brightness-105 focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                  </div>
                </div>
                
                <Textarea
                  value={optimizedText}
                  readOnly
                  rows={10}
                  className="w-full resize-none font-mono"
                />
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="p-2 bg-primary/5 rounded">
                      <p>字符减少: {inputText.length - optimizedText.length} ({((inputText.length - optimizedText.length) / inputText.length * 100).toFixed(1)}%)</p>
                    </div>
                    <div className="p-2 bg-primary/5 rounded">
                      <p>处理类型: {isChineseMode ? '中文文本优化' : '英文文本优化'}</p>
                    </div>
                  </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
        </div>
      </div>
      
      {/* 通知弹窗组件 */}
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {notifications.map((notification) => (
        <Alert 
          key={notification.id} 
          className={`${notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-yellow-50 border-yellow-200 text-yellow-800'} shadow-lg transform transition-all duration-300 animate-slide-in-right`}
        >
          <AlertDescription className="flex items-center">
            {notification.type === 'success' && (
              <Check className="h-4 w-4 mr-2" />
            )}
            {notification.message}
          </AlertDescription>
        </Alert>
      ))}
    </div>
    </>
  );
}