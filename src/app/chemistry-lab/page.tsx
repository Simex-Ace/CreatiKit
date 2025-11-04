'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';

// 定义化学物品接口
interface ChemicalItem {
  id: string;
  type: 'beaker' | 'testTube' | 'flask' | 'buret' | 'erlenmeyer' | 'crucible' | 'watchGlass' | 'graduatedCylinder';
  x: number;
  y: number;
  liquidType: string;
  liquidAmount: number; // 0-100
  liquidColor: string;
  isSelected: boolean;
  isHeated?: boolean;
  hasPrecipitate?: boolean;
}

// 定义实验任务接口
interface ExperimentTask {
  id: string;
  title: string;
  description: string;
  steps: string[];
  completed: boolean;
  rewardPoints: number;
}

// 定义化学反应接口
interface ChemicalReaction {
  reactants: string[];
  products: string[];
  equation: string;
  conditions?: 'heat' | 'mix' | 'catalyst';
  colorChange?: string;
  precipitate?: boolean;
  gasProduction?: boolean;
  energyChange?: 'exothermic' | 'endothermic';
  reactionRate?: 'slow' | 'normal' | 'fast';
  specialNote?: string;
}

// 定义溶液接口
interface Solution {
  name: string;
  type: string;
  color: string;
  amount: number;
  isSolid?: boolean;
}

// 定义化学反应数据库
const chemicalReactions: ChemicalReaction[] = [
  // 酸碱中和反应
  {
    reactants: ['HCl', 'NaOH'],
    products: ['NaCl', 'H2O'],
    equation: 'HCl + NaOH → NaCl + H2O',
    conditions: 'mix',
    colorChange: '#ADD8E6', // 浅蓝色
    energyChange: 'exothermic'
  },
  {
    reactants: ['H2SO4', 'NaOH'],
    products: ['Na2SO4', 'H2O'],
    equation: 'H2SO4 + 2NaOH → Na2SO4 + 2H2O',
    conditions: 'mix',
    colorChange: '#ADD8E6', // 浅蓝色
    energyChange: 'exothermic'
  },
  // 酸与碳酸盐反应
  {
    reactants: ['HCl', 'CaCO3'],
    products: ['CaCl2', 'H2O', 'CO2'],
    equation: 'CaCO3 + 2HCl → CaCl2 + H2O + CO2↑',
    conditions: 'mix',
    colorChange: '#FFFFFF',
    gasProduction: true
  },
  {
    reactants: ['H2SO4', 'CaCO3'],
    products: ['CaSO4', 'H2O', 'CO2'],
    equation: 'H2SO4 + CaCO3 → CaSO4 + H2O + CO2↑',
    conditions: 'mix',
    colorChange: '#FFFFFF',
    gasProduction: true,
    specialNote: '硫酸钙是微溶物，会覆盖在碳酸钙表面，阻止反应进一步进行'
  },
  // 金属与酸的反应
  {
    reactants: ['Fe', 'HCl'],
    products: ['FeCl2', 'H2'],
    equation: 'Fe + 2HCl → FeCl2 + H2↑',
    conditions: 'mix',
    colorChange: '#90EE90', // 浅绿色溶液（修正为准确的浅绿色）
    gasProduction: true,
    energyChange: 'exothermic'
  },
  {
    reactants: ['Fe', 'H2SO4'],
    products: ['FeSO4', 'H2'],
    equation: 'Fe + H2SO4 → FeSO4 + H2↑',
    conditions: 'mix',
    colorChange: '#90EE90', // 浅绿色溶液（修正为准确的浅绿色）
    gasProduction: true,
    energyChange: 'exothermic'
  },
  {
    reactants: ['Zn', 'HCl'],
    products: ['ZnCl2', 'H2'],
    equation: 'Zn + 2HCl → ZnCl2 + H2↑',
    conditions: 'mix',
    colorChange: '#FFFFFF',
    gasProduction: true,
    energyChange: 'exothermic',
    reactionRate: 'fast' // 比铁反应剧烈
  },
  {
    reactants: ['Zn', 'H2SO4'],
    products: ['ZnSO4', 'H2'],
    equation: 'Zn + H2SO4 → ZnSO4 + H2↑',
    conditions: 'mix',
    colorChange: '#FFFFFF',
    gasProduction: true,
    energyChange: 'exothermic',
    reactionRate: 'fast' // 比铁反应剧烈
  },
  // 金属置换反应
  {
    reactants: ['Fe', 'CuSO4'],
    products: ['FeSO4', 'Cu'],
    equation: 'Fe + CuSO4 → FeSO4 + Cu↓',
    conditions: 'mix',
    colorChange: '#90EE90', // 浅绿色溶液，红色铜沉淀（修正为准确的浅绿色）
    precipitate: true,
    energyChange: 'exothermic'
  },
  {
    reactants: ['Zn', 'CuSO4'],
    products: ['ZnSO4', 'Cu'],
    equation: 'Zn + CuSO4 → ZnSO4 + Cu↓',
    conditions: 'mix',
    colorChange: '#FFFFFF', // 无色溶液，红色铜沉淀
    precipitate: true,
    energyChange: 'exothermic'
  },
  // 沉淀反应
  {
    reactants: ['CuSO4', 'NaOH'],
    products: ['Cu(OH)2', 'Na2SO4'],
    equation: 'CuSO4 + 2NaOH → Cu(OH)2↓ + Na2SO4',
    conditions: 'mix',
    colorChange: '#0000AA', // 蓝色沉淀（修正为更准确的蓝色）
    precipitate: true
  },
  {
    reactants: ['NaCl', 'AgNO3'],
    products: ['AgCl', 'NaNO3'],
    equation: 'NaCl + AgNO3 → AgCl↓ + NaNO3',
    conditions: 'mix',
    colorChange: '#C0C0C0', // 白色沉淀
    precipitate: true
  },
  // 氧化还原反应
  {
    reactants: ['KMnO4', 'H2O2', 'H2SO4'],
    products: ['K2SO4', 'MnSO4', 'O2', 'H2O'],
    equation: '2KMnO4 + 5H2O2 + 3H2SO4 → K2SO4 + 2MnSO4 + 5O2↑ + 8H2O',
    conditions: 'mix',
    colorChange: '#FFFFFF',
    gasProduction: true,
    energyChange: 'exothermic'
  },
  {
    reactants: ['KMnO4', 'HCl'],
    products: ['KCl', 'MnCl2', 'H2O', 'Cl2'],
    equation: '2KMnO4 + 16HCl(浓) → 2KCl + 2MnCl2 + 8H2O + 5Cl2↑',
    conditions: 'mix',
    colorChange: '#FFFFFF', // 紫色溶液褪色变为接近无色
    gasProduction: true,
    energyChange: 'exothermic'
  },
  {
    reactants: ['KMnO4', 'NaOH'],
    products: ['K2MnO4', 'Na2MnO4', 'O2', 'H2O'],
    equation: '4KMnO4 + 4NaOH → 2K2MnO4 + 2Na2MnO4 + O2↑ + 2H2O',
    conditions: 'mix',
    colorChange: '#008000', // 绿色溶液（修正为准确的绿色）
    gasProduction: true,
    energyChange: 'exothermic'
  },
  // 催化分解反应
  {
    reactants: ['H2O2'],
    products: ['H2O', 'O2'],
    equation: '2H2O2 --(催化剂)--> 2H2O + O2↑',
    conditions: 'mix',
    colorChange: '#FFFFFF',
    gasProduction: true,
    specialNote: '需要催化剂如铁盐或锰的化合物'
  },
  // 加热分解反应 - 固体加热
  {
    reactants: ['Cu(OH)2'],
    products: ['CuO', 'H2O'],
    equation: 'Cu(OH)2 → CuO + H2O',
    conditions: 'heat',
    colorChange: '#8B4513', // 黑色氧化铜
    energyChange: 'endothermic'
  },
  {
    reactants: ['CaCO3'],
    products: ['CaO', 'CO2'],
    equation: 'CaCO3(固) --(高温)--> CaO(固) + CO2↑',
    conditions: 'heat',
    colorChange: '#FFFFFF', // 白色固体保持白色
    gasProduction: true,
    energyChange: 'endothermic',
    specialNote: '高温分解，产生能使澄清石灰水变浑浊的二氧化碳气体'
  },
  {
    reactants: ['KMnO4'],
    products: ['K2MnO4', 'MnO2', 'O2'],
    equation: '2KMnO4(固) --(加热)--> K2MnO4(固) + MnO2(固) + O2↑',
    conditions: 'heat',
    colorChange: '#8B4513', // 紫色固体变为黑色粉末
    gasProduction: true,
    energyChange: 'endothermic',
    specialNote: '产生能使带火星木条复燃的氧气'
  },
  {
    reactants: ['AgNO3'],
    products: ['Ag', 'NO2', 'O2'],
    equation: '2AgNO3(固) --(加热)--> 2Ag(固) + 2NO2↑ + O2↑',
    conditions: 'heat',
    colorChange: '#C0C0C0', // 白色固体变为银白色金属
    gasProduction: true,
    energyChange: 'endothermic',
    specialNote: '产生红棕色的二氧化氮气体'
  },
  // 液体加热分解反应
  {
    reactants: ['H2O2'],
    products: ['H2O', 'O2'],
    equation: '2H2O2(液) --(加热)--> 2H2O(液) + O2↑',
    conditions: 'heat',
    colorChange: '#FFFFFF', // 保持无色
    gasProduction: true,
    reactionRate: 'fast',
    energyChange: 'exothermic',
    specialNote: '加热大大加速过氧化氢分解，产生大量氧气气泡'
  },
  // 挥发性物质物理变化
  {
    reactants: ['HCl'],
    products: ['HCl(气)'],
    equation: 'HCl(液) --(加热)--> HCl(气)',
    conditions: 'heat',
    colorChange: '#FFFFFF', // 保持无色
    gasProduction: true,
    reactionRate: 'slow',
    specialNote: '物理变化，HCl气体逸出形成白雾'
  },
  {
    reactants: ['H2O'],
    products: ['H2O(气)'],
    equation: 'H2O(液) --(加热)--> H2O(气)',
    conditions: 'heat',
    colorChange: '#FFFFFF', // 保持无色
    gasProduction: true,
    reactionRate: 'normal',
    specialNote: '水沸腾变为水蒸气，基础加热现象'
  },
  // 其他可能的反应
  {
    reactants: ['CuO', 'HCl'],
    products: ['CuCl2', 'H2O'],
    equation: 'CuO + 2HCl → CuCl2 + H2O',
    conditions: 'mix',
    colorChange: '#0000FF', // 蓝色溶液（修正为准确的蓝色）
    energyChange: 'exothermic'
  },
  {
    reactants: ['FeSO4', 'NaOH'],
    products: ['Fe(OH)2', 'Na2SO4'],
    equation: 'FeSO4 + 2NaOH → Fe(OH)2↓ + Na2SO4',
    conditions: 'mix',
    colorChange: '#00FF00', // 绿色沉淀（修正为准确的绿色）
    precipitate: true
  },
  {
    reactants: ['CuCl2', 'NaOH'],
    products: ['Cu(OH)2', 'NaCl'],
    equation: 'CuCl2 + 2NaOH → Cu(OH)2↓ + 2NaCl',
    conditions: 'mix',
    colorChange: '#0000FF', // 蓝色沉淀（修正为准确的蓝色）
    precipitate: true
  }
];

// 预定义实验任务
const predefinedTasks: ExperimentTask[] = [
  {
    id: 'task1',
    title: '制备氢氧化铜沉淀',
    description: '混合硫酸铜溶液和氢氧化钠溶液，观察蓝色沉淀的形成。',
    steps: [
      '添加一个烧杯',
      '添加一个试管',
      '在烧杯中加入硫酸铜溶液',
      '在试管中加入氢氧化钠溶液',
      '将试管中的溶液倒入烧杯中'
    ],
    completed: false,
    rewardPoints: 100
  },
  {
    id: 'task2',
    title: '中和反应实验',
    description: '用氢氧化钠溶液中和盐酸，观察酸碱中和反应。',
    steps: [
      '添加一个锥形瓶',
      '在锥形瓶中加入盐酸',
      '使用滴定管添加氢氧化钠溶液'
    ],
    completed: false,
    rewardPoints: 150
  },
  {
    id: 'task3',
    title: '铁与硫酸铜的置换反应',
    description: '观察铁置换出硫酸铜中的铜的化学反应。',
    steps: [
      '添加一个烧杯',
      '在烧杯中加入硫酸铜溶液',
      '放入一个铁片'
    ],
    completed: false,
    rewardPoints: 200
  },
  {
    id: 'task4',
    title: '碳酸盐与酸的反应',
    description: '观察碳酸钙与盐酸反应产生二氧化碳气体。',
    steps: [
      '添加一个锥形瓶',
      '添加碳酸钙固体',
      '加入盐酸',
      '观察气泡产生'
    ],
    completed: false,
    rewardPoints: 250
  },
  {
    id: 'task5',
    title: '加热分解氢氧化铜',
    description: '加热氢氧化铜沉淀，观察其分解为氧化铜和水。',
    steps: [
      '先完成第一个任务制得氢氧化铜',
      '开启加热源',
      '将盛有氢氧化铜的烧杯放在加热源上',
      '观察颜色变化'
    ],
    completed: false,
    rewardPoints: 300
  }
];

// 定义预设溶液
const predefinedSolutions: Solution[] = [
  { name: '硫酸铜', type: 'CuSO4', color: '#00FFFF', amount: 80 },
  { name: '氢氧化钠', type: 'NaOH', color: '#FFFFFF', amount: 80 },
  { name: '盐酸', type: 'HCl', color: '#FFFFFF', amount: 80 },
  { name: '硫酸', type: 'H2SO4', color: '#FFFFFF', amount: 80 },
  { name: '高锰酸钾', type: 'KMnO4', color: '#9400D3', amount: 60 },
  { name: '过氧化氢', type: 'H2O2', color: '#FFFFFF', amount: 80 },
  { name: '碳酸钙', type: 'CaCO3', color: '#FFFFFF', amount: 30, isSolid: true },
  { name: '铁粉', type: 'Fe', color: '#708090', amount: 30, isSolid: true },
  { name: '氯化钠', type: 'NaCl', color: '#FFFFFF', amount: 40, isSolid: true },
  { name: '硝酸银', type: 'AgNO3', color: '#FFFFFF', amount: 70 },
  { name: '锌粒', type: 'Zn', color: '#C0C0C0', amount: 30, isSolid: true },
  { name: '水', type: 'H2O', color: '#FFFFFF', amount: 100 }
];

const ChemistryLab: React.FC = () => {
  // 状态管理
  const [items, setItems] = useState<ChemicalItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [reactionHistory, setReactionHistory] = useState<{equation: string, timestamp: Date}[]>([]);
  const [tasks, setTasks] = useState<ExperimentTask[]>(predefinedTasks);
  const [currentTask, setCurrentTask] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [showTaskPanel, setShowTaskPanel] = useState(true);
  const [showElementPanel, setShowElementPanel] = useState(true);
  const [heatingSourceActive, setHeatingSourceActive] = useState(false);
  const [heatingPosition, setHeatingPosition] = useState({ x: 400, y: 450 });
  const [showHeatingControls, setShowHeatingControls] = useState(false);
  const [showSolutionPanel, setShowSolutionPanel] = useState(false);
  const [toast, setToast] = useState<{message: string, visible: boolean}>({message: '', visible: false});
  const [selectedSolution, setSelectedSolution] = useState<Solution | null>(null);
  const [currentStep, setCurrentStep] = useState<{taskId: string | null, stepIndex: number}>({taskId: null, stepIndex: 0});
  const [temperature, setTemperature] = useState(25); // 摄氏度

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const dropsRef = useRef<{x: number, y: number, size: number, color: string, speed: number}[]>([]);
  const bubblesRef = useRef<{x: number, y: number, size: number, speed: number}[]>([]);

  // 设备尺寸定义
  const equipmentSizes = {
    beaker: { width: 80, height: 100 },
    testTube: { width: 30, height: 120 },
    flask: { width: 100, height: 120 },
    buret: { width: 40, height: 180 },
    erlenmeyer: { width: 70, height: 110 },
    crucible: { width: 50, height: 50 },
    watchGlass: { width: 70, height: 20 },
    graduatedCylinder: { width: 60, height: 140 }
  };

  // 检查点击是否在设备上
  const isPointInEquipment = useCallback((x: number, y: number, item: ChemicalItem): boolean => {
    const size = equipmentSizes[item.type];
    if (!size) return false;
    
    return (
      x >= item.x - size.width / 2 &&
      x <= item.x + size.width / 2 &&
      y >= item.y - size.height &&
      y <= item.y
    );
  }, []);

  // 绘制烧杯
  const drawBeaker = useCallback((ctx: CanvasRenderingContext2D, item: ChemicalItem) => {
    const { width, height } = equipmentSizes.beaker;
    const x = item.x;
    const y = item.y;

    // 绘制烧杯轮廓
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y - height);
    ctx.lineTo(x - width / 2 + 10, y);
    ctx.lineTo(x + width / 2 - 10, y);
    ctx.lineTo(x + width / 2, y - height);
    ctx.closePath();
    ctx.stroke();

    // 绘制烧杯把手
    ctx.beginPath();
    ctx.moveTo(x + width / 2, y - height + 20);
    ctx.bezierCurveTo(x + width / 2 + 20, y - height + 20, x + width / 2 + 20, y - 20, x + width / 2, y - 20);
    ctx.stroke();

    // 绘制液体 - 修复为从底部开始填充
    if (item.liquidAmount > 0) {
      const liquidHeightPercentage = item.liquidAmount / 100;
      const liquidHeight = (height - 10) * liquidHeightPercentage;
      ctx.fillStyle = item.liquidColor;
      ctx.beginPath();
      ctx.moveTo(x - width / 2 + 2, y - liquidHeight + 5);
      ctx.lineTo(x - width / 2 + 10 - 2, y);
      ctx.lineTo(x + width / 2 - 10 + 2, y);
      ctx.lineTo(x + width / 2 - 2, y - liquidHeight + 5);
      ctx.closePath();
      ctx.fill();

      // 绘制沉淀
      if (item.hasPrecipitate) {
        ctx.fillStyle = '#0000AA';
        ctx.beginPath();
        ctx.moveTo(x - width / 2 + 5, y - 10);
        ctx.lineTo(x - width / 2 + 10 - 5, y - liquidHeight / 2);
        ctx.lineTo(x + width / 2 - 10 + 5, y - liquidHeight / 2);
        ctx.lineTo(x + width / 2 - 5, y - 10);
        ctx.closePath();
        ctx.fill();
      }

      // 显示反应式（如果有）
      const reaction = chemicalReactions.find(r => 
        r.products.some(product => item.liquidType.includes(product))
      );
      if (reaction) {
        ctx.fillStyle = '#FFFF00';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        // 计算文本宽度并截断过长的反应式
        const maxWidth = width * 1.5;
        const metrics = ctx.measureText(reaction.equation);
        let displayEquation = reaction.equation;
        if (metrics.width > maxWidth) {
          displayEquation = reaction.equation.substring(0, Math.floor(reaction.equation.length * maxWidth / metrics.width)) + '...';
        }
        ctx.fillText(displayEquation, x, y - height + 15);
      }
    }

    // 显示液体类型标签
    if (item.liquidAmount > 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.liquidType, x, y - height - 10);
    }

    // 显示加热状态
    if (item.isHeated) {
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.arc(x, y + 10, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // 绘制试管
  const drawTestTube = useCallback((ctx: CanvasRenderingContext2D, item: ChemicalItem) => {
    const { width, height } = equipmentSizes.testTube;
    const x = item.x;
    const y = item.y;

    // 绘制试管轮廓
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y - height);
    ctx.lineTo(x - width / 2, y - 10);
    ctx.arc(x, y - 10, width / 2, Math.PI, 0);
    ctx.lineTo(x + width / 2, y - height);
    ctx.closePath();
    ctx.stroke();

    // 绘制液体 - 修复为从底部开始填充
    if (item.liquidAmount > 0) {
      const liquidHeightPercentage = item.liquidAmount / 100;
      const liquidHeight = (height - 20) * liquidHeightPercentage;
      ctx.fillStyle = item.liquidColor;
      ctx.beginPath();
      ctx.moveTo(x - width / 2 + 2, y - 10 - liquidHeight + 10);
      ctx.lineTo(x - width / 2 + 2, y);
      ctx.arc(x, y, width / 2 - 2, Math.PI, 0);
      ctx.lineTo(x + width / 2 - 2, y - 10 - liquidHeight + 10);
      ctx.closePath();
      ctx.fill();

      // 绘制沉淀
      if (item.hasPrecipitate) {
        ctx.fillStyle = '#0000AA';
        ctx.beginPath();
        ctx.moveTo(x - width / 2 + 3, y - 15);
        ctx.lineTo(x - width / 2 + 3, y - liquidHeight / 2);
        ctx.arc(x, y, width / 2 - 3, Math.PI, 0);
        ctx.lineTo(x + width / 2 - 3, y - 15);
        ctx.closePath();
        ctx.fill();
      }

      // 显示反应式（如果有）
      const reaction = chemicalReactions.find(r => 
        r.products.some(product => item.liquidType.includes(product))
      );
      if (reaction) {
        ctx.fillStyle = '#FFFF00';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        // 计算文本宽度并截断过长的反应式
        const maxWidth = width * 2;
        const metrics = ctx.measureText(reaction.equation);
        let displayEquation = reaction.equation;
        if (metrics.width > maxWidth) {
          displayEquation = reaction.equation.substring(0, Math.floor(reaction.equation.length * maxWidth / metrics.width)) + '...';
        }
        ctx.fillText(displayEquation, x, y - height + 15);
      }
    }

    // 显示液体类型标签
    if (item.liquidAmount > 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.liquidType, x, y - height - 10);
    }

    // 显示加热状态
    if (item.isHeated) {
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.arc(x, y + 10, 8, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // 绘制锥形瓶
  const drawErlenmeyer = useCallback((ctx: CanvasRenderingContext2D, item: ChemicalItem) => {
    const { width, height } = equipmentSizes.erlenmeyer;
    const x = item.x;
    const y = item.y;

    // 绘制锥形瓶轮廓
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(x - width / 4, y - height);
    ctx.lineTo(x - width / 2, y - 20);
    ctx.lineTo(x - width / 2 + 10, y);
    ctx.lineTo(x + width / 2 - 10, y);
    ctx.lineTo(x + width / 2, y - 20);
    ctx.lineTo(x + width / 4, y - height);
    ctx.closePath();
    ctx.stroke();

    // 绘制液体 - 修复为从底部开始填充
    if (item.liquidAmount > 0) {
      const liquidHeightPercentage = item.liquidAmount / 100;
      ctx.fillStyle = item.liquidColor;
      ctx.beginPath();
      
      // 计算底部和侧面的液体位置
      const bottomWidth = width - 20;
      const bottomLeftX = x - bottomWidth / 2;
      const bottomRightX = x + bottomWidth / 2;
      const liquidHeightFromBottom = height * liquidHeightPercentage;
      
      // 底部直线
      ctx.moveTo(bottomLeftX, y - liquidHeightFromBottom);
      ctx.lineTo(bottomRightX, y - liquidHeightFromBottom);
      
      // 右侧曲线
      ctx.quadraticCurveTo(x + width / 2, y - 20, x + width / 4, y - height + 20 * liquidHeightPercentage);
      
      // 左侧曲线
      ctx.quadraticCurveTo(x - width / 2, y - 20, bottomLeftX, y - liquidHeightFromBottom);
      
      ctx.closePath();
      ctx.fill();
    }

    // 显示液体类型标签
    if (item.liquidAmount > 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.liquidType, x, y - height - 10);
      
      // 显示反应式（如果有）
      const reaction = chemicalReactions.find(r => 
        r.products.some(product => item.liquidType.includes(product))
      );
      if (reaction) {
        ctx.fillStyle = '#FFFF00';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        // 计算文本宽度并截断过长的反应式
        const maxWidth = width * 1.5;
        const metrics = ctx.measureText(reaction.equation);
        let displayEquation = reaction.equation;
        if (metrics.width > maxWidth) {
          displayEquation = reaction.equation.substring(0, Math.floor(reaction.equation.length * maxWidth / metrics.width)) + '...';
        }
        ctx.fillText(displayEquation, x, y - height + 15);
      }
    }
  }, []);

  // 绘制滴定管
  const drawBuret = useCallback((ctx: CanvasRenderingContext2D, item: ChemicalItem) => {
    const { width, height } = equipmentSizes.buret;
    const x = item.x;
    const y = item.y;

    // 绘制滴定管主体
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(x - width / 4, y - height);
    ctx.lineTo(x - width / 4, y - 20);
    ctx.lineTo(x + width / 4, y - 20);
    ctx.lineTo(x + width / 4, y - height);
    // 顶部漏斗
    ctx.lineTo(x - width / 2, y - height);
    ctx.lineTo(x - width / 4, y - height + 20);
    ctx.lineTo(x + width / 4, y - height + 20);
    ctx.lineTo(x + width / 2, y - height);
    ctx.closePath();
    ctx.stroke();

    // 绘制阀门
    ctx.beginPath();
    ctx.arc(x, y - 10, 5, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制液体 - 修复为从底部开始填充
    if (item.liquidAmount > 0) {
      const liquidHeightPercentage = item.liquidAmount / 100;
      const liquidHeight = (height - 40) * liquidHeightPercentage;
      const liquidBottomY = y - 20 - 2;
      const liquidTopY = liquidBottomY - liquidHeight;
      
      ctx.fillStyle = item.liquidColor;
      ctx.fillRect(x - width / 4 + 2, liquidTopY, width / 2 - 4, liquidHeight);

      // 显示反应式（如果有）
      const reaction = chemicalReactions.find(r => 
        r.products.some(product => item.liquidType.includes(product))
      );
      if (reaction) {
        ctx.fillStyle = '#FFFF00';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        // 计算文本宽度并截断过长的反应式
        const maxWidth = width * 1.5;
        const metrics = ctx.measureText(reaction.equation);
        let displayEquation = reaction.equation;
        if (metrics.width > maxWidth) {
          displayEquation = reaction.equation.substring(0, Math.floor(reaction.equation.length * maxWidth / metrics.width)) + '...';
        }
        ctx.fillText(displayEquation, x, y - height + 5);
      }
    }

    // 绘制液滴（如果滴定管有液体且处于滴定状态）
    if (item.liquidAmount > 0 && Math.random() > 0.9) {
      dropsRef.current.push({
        x: x,
        y: y,
        size: 4,
        color: item.liquidColor,
        speed: 2
      });
    }

    // 显示液体类型标签
    if (item.liquidAmount > 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.liquidType, x, y - height - 10);
    }
  }, []);

  // 绘制坩埚
  const drawCrucible = useCallback((ctx: CanvasRenderingContext2D, item: ChemicalItem) => {
    const { width, height } = equipmentSizes.crucible;
    const x = item.x;
    const y = item.y;

    // 绘制坩埚轮廓 - 使用更准确的坩埚形状
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#A9A9A9';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    // 底部椭圆
    ctx.ellipse(x, y - height / 4, width / 2, height / 6, 0, 0, Math.PI * 2);
    // 坩埚壁
    ctx.moveTo(x - width / 2, y - height / 4);
    ctx.lineTo(x - width / 2.2, y - height / 1.2);
    ctx.moveTo(x + width / 2, y - height / 4);
    ctx.lineTo(x + width / 2.2, y - height / 1.2);
    ctx.stroke();

    // 绘制坩埚内部
    ctx.strokeStyle = '#808080';
    ctx.beginPath();
    ctx.ellipse(x, y - height / 4, width / 2.4, height / 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制固体物质
    if (item.liquidAmount > 0) {
      ctx.fillStyle = item.liquidColor;
      ctx.beginPath();
      const fillSize = (width / 3) * (item.liquidAmount / 100);
      ctx.ellipse(x, y - height / 4, fillSize, fillSize / 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 显示加热状态
    if (item.isHeated) {
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.ellipse(x, y + 8, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // 绘制量杯
  const drawGraduatedCylinder = useCallback((ctx: CanvasRenderingContext2D, item: ChemicalItem) => {
    const { width, height } = equipmentSizes.graduatedCylinder;
    const x = item.x;
    const y = item.y;

    // 绘制量杯轮廓
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y - height);
    ctx.lineTo(x - width / 2, y);
    ctx.lineTo(x + width / 2, y);
    ctx.lineTo(x + width / 2, y - height);
    ctx.closePath();
    ctx.stroke();

    // 绘制刻度
    ctx.strokeStyle = '#AAAAAA';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 10; i++) {
      const pos = y - (height * i / 10);
      ctx.beginPath();
      ctx.moveTo(x - width / 2, pos);
      ctx.lineTo(x - width / 2 + 5, pos);
      ctx.moveTo(x + width / 2, pos);
      ctx.lineTo(x + width / 2 - 5, pos);
      ctx.stroke();
    }

    // 绘制液体 - 修复为从底部开始填充
    if (item.liquidAmount > 0) {
      const liquidHeightPercentage = item.liquidAmount / 100;
      const liquidHeight = height * liquidHeightPercentage;
      ctx.fillStyle = item.liquidColor;
      ctx.fillRect(x - width / 2 + 2, y - liquidHeight, width - 4, liquidHeight);

      // 显示反应式（如果有）
      const reaction = chemicalReactions.find(r => 
        r.products.some(product => item.liquidType.includes(product))
      );
      if (reaction) {
        ctx.fillStyle = '#FFFF00';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        // 计算文本宽度并截断过长的反应式
        const maxWidth = width * 1.5;
        const metrics = ctx.measureText(reaction.equation);
        let displayEquation = reaction.equation;
        if (metrics.width > maxWidth) {
          displayEquation = reaction.equation.substring(0, Math.floor(reaction.equation.length * maxWidth / metrics.width)) + '...';
        }
        ctx.fillText(displayEquation, x, y - height + 15);
      }
    }

    // 显示液体体积
    if (item.liquidAmount > 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${item.liquidAmount}ml`, x, y - height - 10);
    }
  }, []);

  // 绘制表面皿
  const drawWatchGlass = useCallback((ctx: CanvasRenderingContext2D, item: ChemicalItem) => {
    const { width, height } = equipmentSizes.watchGlass;
    const x = item.x;
    const y = item.y;

    // 绘制表面皿轮廓
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.ellipse(x, y - height / 2, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 绘制固体物质
    if (item.liquidAmount > 0) {
      ctx.fillStyle = item.liquidColor;
      ctx.beginPath();
      ctx.ellipse(x, y - height / 2, (width / 3) * (item.liquidAmount / 100), (height / 4) * (item.liquidAmount / 100), 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // 绘制圆底烧瓶
  const drawFlask = useCallback((ctx: CanvasRenderingContext2D, item: ChemicalItem) => {
    const { width, height } = equipmentSizes.flask;
    const x = item.x;
    const y = item.y;

    // 绘制烧瓶轮廓
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    // 瓶颈
    ctx.moveTo(x - width / 8, y - height);
    ctx.lineTo(x - width / 8, y - height * 0.6);
    ctx.lineTo(x + width / 8, y - height * 0.6);
    ctx.lineTo(x + width / 8, y - height);
    // 瓶颈与瓶身连接处
    ctx.moveTo(x - width / 8, y - height * 0.6);
    // 瓶身 - 更准确的圆底烧瓶形状
    ctx.ellipse(x, y, width / 2, height * 0.4, 0, Math.PI, 0);
    ctx.stroke();

    // 绘制液体 - 修复为从底部开始填充
    if (item.liquidAmount > 0) {
      const maxLiquidHeight = height * 0.4;
      const liquidHeightPercentage = item.liquidAmount / 100;
      const liquidHeight = Math.max(0, Math.min(liquidHeightPercentage * maxLiquidHeight, maxLiquidHeight));
      
      ctx.fillStyle = item.liquidColor;
      ctx.beginPath();
      // 从底部向上填充的椭圆
      const ellipseHeight = liquidHeight;
      const ellipseCenterY = y - (maxLiquidHeight - ellipseHeight);
      
      ctx.ellipse(x, ellipseCenterY, width / 2, ellipseHeight, 0, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();

      // 显示反应式（如果有）
      const reaction = chemicalReactions.find(r => 
        r.products.some(product => item.liquidType.includes(product))
      );
      if (reaction) {
        ctx.fillStyle = '#FFFF00';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        // 计算文本宽度并截断过长的反应式
        const maxWidth = width * 1.5;
        const metrics = ctx.measureText(reaction.equation);
        let displayEquation = reaction.equation;
        if (metrics.width > maxWidth) {
          displayEquation = reaction.equation.substring(0, Math.floor(reaction.equation.length * maxWidth / metrics.width)) + '...';
        }
        ctx.fillText(displayEquation, x, y - height + 15);
      }
    }

    // 显示液体类型标签
    if (item.liquidAmount > 0) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.liquidType, x, y - height - 10);
    }
  }, []);

  // 绘制加热源
  const drawHeatingSource = useCallback((ctx: CanvasRenderingContext2D) => {
    const { x, y } = heatingPosition;
    
    if (heatingSourceActive) {
      // 绘制火焰
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 15, y - 30);
      ctx.lineTo(x - 5, y - 30);
      ctx.lineTo(x, y - 45);
      ctx.lineTo(x + 5, y - 30);
      ctx.lineTo(x + 15, y - 30);
      ctx.closePath();
      ctx.fill();
      
      // 内部火焰
      ctx.fillStyle = '#FF6347';
      ctx.beginPath();
      ctx.moveTo(x, y - 10);
      ctx.lineTo(x - 10, y - 25);
      ctx.lineTo(x - 2, y - 25);
      ctx.lineTo(x, y - 40);
      ctx.lineTo(x + 2, y - 25);
      ctx.lineTo(x + 10, y - 25);
      ctx.closePath();
      ctx.fill();
    }
    
    // 绘制加热板
    ctx.fillStyle = '#696969';
    ctx.fillRect(x - 30, y, 60, 10);
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(x - 30, y, 60, 10);
    
    // 显示温度
    if (heatingSourceActive) {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(`${temperature}°C`, x, y + 25);
    }
  }, [heatingSourceActive, heatingPosition, temperature]);

  // 绘制液滴动画
  const drawDrops = useCallback((ctx: CanvasRenderingContext2D) => {
    const drops = dropsRef.current;
    for (let i = drops.length - 1; i >= 0; i--) {
      const drop = drops[i];
      ctx.fillStyle = drop.color;
      ctx.beginPath();
      ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
      ctx.fill();
      
      // 更新位置
      drop.y += drop.speed;
      
      // 检查是否碰到设备
      let hit = false;
      for (const item of items) {
        if (isPointInEquipment(drop.x, drop.y, item)) {
          // 向设备添加液体
          setItems(prevItems => prevItems.map(i => 
            i.id === item.id 
              ? { ...i, liquidAmount: Math.min(100, i.liquidAmount + 5), liquidType: i.liquidAmount === 0 ? predefinedSolutions.find(s => s.color === drop.color)?.type || '' : i.liquidType, liquidColor: drop.color }
              : i
          ));
          hit = true;
          break;
        }
      }
      
      // 移除超出画布的液滴
      if (hit || drop.y > 600) {
        drops.splice(i, 1);
      }
    }
  }, [items, isPointInEquipment]);

  // 绘制气泡动画
  const drawBubbles = useCallback((ctx: CanvasRenderingContext2D) => {
    const bubbles = bubblesRef.current;
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const bubble = bubbles[i];
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
      ctx.stroke();
      
      // 更新位置
      bubble.y -= bubble.speed;
      bubble.size += 0.05; // 气泡上升时变大
      
      // 移除超出画布的气泡
      if (bubble.y < -bubble.size) {
        bubbles.splice(i, 1);
      }
    }
  }, []);

  // 检查并触发化学反应
  const checkReactions = useCallback((items: ChemicalItem[]) => {
    // 检查液体混合反应
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const item1 = items[i];
        const item2 = items[j];
        
        // 检查两个设备是否接触（简化的碰撞检测）
        const distance = Math.sqrt(
          Math.pow(item1.x - item2.x, 2) + Math.pow(item1.y - item2.y, 2)
        );
        const minDistance = (equipmentSizes[item1.type].width + equipmentSizes[item2.type].width) / 3;
        
        if (distance < minDistance && item1.liquidAmount > 0 && item2.liquidAmount > 0) {
          // 查找匹配的反应
          const reaction = chemicalReactions.find(r => 
            r.conditions === 'mix' && 
            r.reactants.every(reactant => 
              item1.liquidType.includes(reactant) || item2.liquidType.includes(reactant)
            ) &&
            // 确保两个设备都包含反应所需的不同反应物
            r.reactants.some(reactant => item1.liquidType.includes(reactant)) &&
            r.reactants.some(reactant => item2.liquidType.includes(reactant))
          );
          
          if (reaction) {
            // 更新第一个设备的液体
            const newItem1 = {
              ...item1,
              liquidType: reaction.products.join(', '),
              liquidColor: reaction.colorChange || '#FFFFFF',
              hasPrecipitate: reaction.precipitate,
              liquidAmount: Math.min(100, item1.liquidAmount + item2.liquidAmount / 2)
            };
            
            // 更新第二个设备的液体（减少一半）
            const newItem2 = {
              ...item2,
              liquidAmount: Math.max(0, item2.liquidAmount / 2)
            };
            
            // 添加反应到历史记录
            setReactionHistory(prev => [
              { equation: reaction.equation, timestamp: new Date() },
              ...prev.slice(0, 9) // 只保留最近10个反应
            ]);
            
            // 如果是放热反应，增加温度
            if (reaction.energyChange === 'exothermic') {
              setTemperature(prev => Math.min(100, prev + 5));
            }
            
            // 如果有气体产生，添加气泡
            if (reaction.gasProduction) {
              // 根据反应速率确定气泡数量
              let bubbleCount = 5; // 默认数量
              if (reaction.reactionRate === 'fast') {
                bubbleCount = 10; // 快速反应产生更多气泡
              } else if (reaction.reactionRate === 'slow') {
                bubbleCount = 3; // 慢速反应产生较少气泡
              }
              
              for (let k = 0; k < bubbleCount; k++) {
                bubblesRef.current.push({
                  x: item1.x + (Math.random() - 0.5) * 20,
                  y: item1.y - 20,
                  size: Math.random() * 3 + 2,
                  speed: Math.random() * 2 + 1 + (reaction.reactionRate === 'fast' ? 2 : reaction.reactionRate === 'slow' ? -1 : 0)
                });
              }
            }
            
            // 如果有特殊说明，显示提示
            if (reaction.specialNote) {
              setToast({
                message: `反应提示: ${reaction.specialNote}`,
                visible: true
              });
              setTimeout(() => {
                setToast(prev => ({ ...prev, visible: false }));
              }, 5000);
            }
            
            // 更新状态
            setItems(prevItems => prevItems.map(item => 
              item.id === item1.id ? newItem1 : 
              item.id === item2.id ? newItem2 : item
            ));
            
            // 检查任务进度
            checkTaskProgress(newItem1);
          }
        }
      }
    }
    
    // 检查加热反应
    if (heatingSourceActive) {
      items.forEach(item => {
        const distance = Math.sqrt(
          Math.pow(item.x - heatingPosition.x, 2) + Math.pow(item.y - heatingPosition.y, 2)
        );
        
        // 如果设备在加热源上方
        if (distance < 50 && item.liquidAmount > 0) {
          // 标记为加热状态
          if (!item.isHeated) {
            setItems(prevItems => prevItems.map(i => 
              i.id === item.id ? { ...i, isHeated: true } : i
            ));
          }
          
          // 查找匹配的加热反应
          const reaction = chemicalReactions.find(r => 
            r.conditions === 'heat' && 
            r.reactants.some(reactant => item.liquidType.includes(reactant))
          );
          
          if (reaction && temperature > 80) { // 需要达到一定温度
            const newItem = {
              ...item,
              liquidType: reaction.products.join(', '),
              liquidColor: reaction.colorChange || '#FFFFFF',
              hasPrecipitate: reaction.precipitate
            };
            
            // 添加反应到历史记录
            setReactionHistory(prev => [
              { equation: reaction.equation, timestamp: new Date() },
              ...prev.slice(0, 9)
            ]);
            
            setItems(prevItems => prevItems.map(i => 
              i.id === item.id ? newItem : i
            ));
            
            // 检查任务进度
            checkTaskProgress(newItem);
          }
        } else if (item.isHeated) {
          // 如果不在加热源上，取消加热状态
          setItems(prevItems => prevItems.map(i => 
            i.id === item.id ? { ...i, isHeated: false } : i
          ));
        }
      });
    }
  }, [heatingSourceActive, heatingPosition, temperature]);

  // 检查任务进度
  const checkTaskProgress = useCallback((item: ChemicalItem) => {
    tasks.forEach(task => {
      if (!task.completed) {
        // 简单的任务完成检查逻辑
        if (task.id === 'task1' && item.liquidType.includes('Cu(OH)2')) {
          setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, completed: true } : t
          ));
          setScore(prev => prev + task.rewardPoints);
        } else if (task.id === 'task2' && item.liquidType.includes('NaCl')) {
          setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, completed: true } : t
          ));
          setScore(prev => prev + task.rewardPoints);
        } else if (task.id === 'task3' && item.liquidType.includes('Cu') && item.liquidType.includes('FeSO4')) {
          setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, completed: true } : t
          ));
          setScore(prev => prev + task.rewardPoints);
        } else if (task.id === 'task4' && item.liquidType.includes('CO2')) {
          setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, completed: true } : t
          ));
          setScore(prev => prev + task.rewardPoints);
        } else if (task.id === 'task5' && item.liquidType.includes('CuO')) {
          setTasks(prev => prev.map(t => 
            t.id === task.id ? { ...t, completed: true } : t
          ));
          setScore(prev => prev + task.rewardPoints);
        }
      }
    });
  }, [tasks]);

  // 渲染函数
  const render = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格背景
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 0.5;
    for (let x = 0; x < canvas.width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 绘制加热源
    drawHeatingSource(ctx);

    // 绘制所有设备
    items.forEach(item => {
      switch (item.type) {
        case 'beaker':
          drawBeaker(ctx, item);
          break;
        case 'testTube':
          drawTestTube(ctx, item);
          break;
        case 'flask':
          drawFlask(ctx, item);
          break;
        case 'buret':
          drawBuret(ctx, item);
          break;
        case 'erlenmeyer':
          drawErlenmeyer(ctx, item);
          break;
        case 'crucible':
          drawCrucible(ctx, item);
          break;
        case 'watchGlass':
          drawWatchGlass(ctx, item);
          break;
        case 'graduatedCylinder':
          drawGraduatedCylinder(ctx, item);
          break;
      }
    });

    // 绘制动画元素
    drawDrops(ctx);
    drawBubbles(ctx);

    // 显示当前反应式（如果有新反应）
    if (reactionHistory.length > 0) {
      const latestReaction = reactionHistory[0];
      const now = new Date();
      const reactionTime = now.getTime() - latestReaction.timestamp.getTime();
      
      // 显示最近3秒内的反应式
      if (reactionTime < 3000) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(latestReaction.equation, canvas.width / 2, 30);
      }
    }

    // 检查化学反应（每帧限制检查次数）
    const deltaTime = timestamp - lastTimeRef.current;
    if (deltaTime > 1000) { // 每秒检查一次
      checkReactions(items);
      lastTimeRef.current = timestamp;
    }

    // 继续动画循环
    animationFrameRef.current = requestAnimationFrame(render);
  }, [items, drawHeatingSource, drawBeaker, drawTestTube, drawFlask, drawBuret, drawErlenmeyer, drawCrucible, drawWatchGlass, drawGraduatedCylinder, drawDrops, drawBubbles, checkReactions, reactionHistory]);

  // 鼠标事件处理
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // 检查是否点击了加热源控制区
      const heatControlDistance = Math.sqrt(
        Math.pow(x - heatingPosition.x, 2) + Math.pow(y - heatingPosition.y, 2)
      );
      if (heatControlDistance < 40) {
        setHeatingSourceActive(!heatingSourceActive);
        return;
      }

      // 检查是否点击了设备 - 修复设备选择逻辑，确保所有设备类型都能被正确选中
      let clickedItem = null;
      for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        if (item && isPointInEquipment(x, y, item)) {
          clickedItem = item;
          break;
        }
      }

      if (clickedItem) {
        // 确保选中状态正确更新，修复多设备选择问题
        setItems(prevItems => {
          if (!Array.isArray(prevItems)) return [];
          return prevItems.map(item => {
            if (!item) return {
              id: 'invalid',
              type: 'beaker' as const,
              x: 0,
              y: 0,
              liquidType: '',
              liquidAmount: 0,
              liquidColor: '#FFFFFF',
              isSelected: false
            };
            return {
              ...item,
              isSelected: item.id === clickedItem.id
            };
          }).filter(item => item.id !== 'invalid');
        });
        setSelectedItemId(clickedItem.id);
        setIsDragging(true);
        setDragOffset({
          x: x - clickedItem.x,
          y: y - clickedItem.y
        });
      } else {
        // 如果没有点击设备，取消所有选中状态
        setItems(prevItems => {
          if (!Array.isArray(prevItems)) return [];
          return prevItems.map(item => {
            if (!item) return {
              id: 'invalid',
              type: 'beaker' as const,
              x: 0,
              y: 0,
              liquidType: '',
              liquidAmount: 0,
              liquidColor: '#FFFFFF',
              isSelected: false
            };
            return {
              ...item,
              isSelected: false
            };
          }).filter(item => item.id !== 'invalid');
        });
        setSelectedItemId(null);
      }
    } catch (error) {
      console.error('鼠标点击处理错误:', error);
      // 出错时重置选择状态，确保界面不会卡住
      setSelectedItemId(null);
      setIsDragging(false);
    }
  }, [items, isPointInEquipment, heatingPosition, heatingSourceActive]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !selectedItemId) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 更新选中设备的位置
    setItems(prevItems => prevItems.map(item =>
      item.id === selectedItemId
        ? { ...item, x: x - dragOffset.x, y: y - dragOffset.y }
        : item
    ));
  }, [isDragging, selectedItemId, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // 添加新设备
  const addEquipment = useCallback((type: ChemicalItem['type']) => {
    const newItem: ChemicalItem = {
      id: `${type}${Date.now()}`,
      type,
      x: 200 + Math.random() * 400,
      y: 200 + Math.random() * 200,
      liquidType: '',
      liquidAmount: 0,
      liquidColor: '#FFFFFF',
      isSelected: false
    };
    
    setItems(prev => [...prev, newItem]);
    setSelectedItemId(newItem.id);
  }, []);

  // 显示toast提示
  const showToast = useCallback((message: string) => {
    setToast({message, visible: true});
    // 3秒后自动隐藏
    setTimeout(() => {
      setToast(prev => ({...prev, visible: false}));
    }, 3000);
  }, []);

  // 向选中设备添加溶液
  const addSolution = useCallback((solution: Solution) => {
    // 添加更严格的参数验证
    if (!solution || !selectedItemId) {
      console.warn('无效的溶液或未选择设备');
      setShowSolutionPanel(false);
      return;
    }
    
    try {
      setItems(prevItems => {
         // 确保prevItems是数组
         if (!Array.isArray(prevItems)) {
           console.error('设备数组无效');
           return [];
         }
         
         // 先找到选中的设备，检查类型是否允许添加溶液
         const selectedItem = prevItems.find(item => item && item.id === selectedItemId);
         if (selectedItem && ['watchGlass', 'scale'].includes(selectedItem.type)) {
           showToast('此设备类型不支持添加溶液！');
           setShowSolutionPanel(false);
           return prevItems;
         }
         
         return prevItems.map(item => {
           // 添加空值检查
           if (!item) return {
              id: 'invalid',
              type: 'beaker' as const,
              x: 0,
              y: 0,
              liquidType: '',
              liquidAmount: 0,
              liquidColor: '#FFFFFF',
              isSelected: false
            };
           
           if (item.id === selectedItemId) {
             // 为所有属性添加默认值，确保安全赋值
             return { 
               ...item, 
               liquidType: solution.type || '', 
               liquidAmount: solution.amount || 0, 
               liquidColor: solution.color || '#FFFFFF',
               isSelected: true // 确保选中状态一致
             };
           }
           return item;
         }).filter(item => item.id !== 'invalid'); // 过滤掉无效项
       });
      
      setShowSolutionPanel(false);
    } catch (error) {
      console.error('添加溶液时发生错误:', error);
      setShowSolutionPanel(false);
    }
  }, [selectedItemId, showToast]);

  // 清空实验台
  const clearLab = useCallback(() => {
    setItems([]);
    setSelectedItemId(null);
    setReactionHistory([]);
    dropsRef.current = [];
    bubblesRef.current = [];
  }, []);

  // 组件挂载时开始渲染循环
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(render);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);

  // 重置任务进度
  const resetTasks = useCallback(() => {
    setTasks(predefinedTasks);
    setScore(0);
    setCurrentStep({taskId: null, stepIndex: 0});
  }, []);

  // 开始新任务
  const startTask = useCallback((taskId: string) => {
    setCurrentTask(taskId);
    setCurrentStep({taskId, stepIndex: 0});
  }, []);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-cyan-400">虚拟化学实验室</h1>
        <div className="flex gap-4">
          <span className="text-yellow-400">分数: {score}</span>
          <button 
            onClick={() => setShowTaskPanel(!showTaskPanel)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            任务面板
          </button>
          <button 
            onClick={() => setShowElementPanel(!showElementPanel)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
          >
            设备面板
          </button>
          <button 
            onClick={clearLab}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            清空实验台
          </button>
          <button 
            onClick={resetTasks}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            重置任务
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 gap-4">
        {/* 实验画布 */}
        <div className="flex-1 relative bg-gray-800 rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-grab active:cursor-grabbing"
          />
          
          {/* 选中设备信息 */}
          {selectedItemId && (
            <div className="absolute top-4 right-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg border border-cyan-500">
              <h3 className="text-lg font-semibold mb-2">设备信息</h3>
              {(() => {
                const selectedItem = items.find(item => item.id === selectedItemId);
                if (!selectedItem) return <p>设备不存在</p>;
                
                return (
                  <div>
                    <p>类型: {selectedItem.type}</p>
                    <p>溶液: {selectedItem.liquidType || '空'}</p>
                    <p>体积: {selectedItem.liquidAmount}%</p>
                    {selectedItem.isHeated && (
                      <p className="text-red-400">正在加热</p>
                    )}
                    {selectedItem.hasPrecipitate && (
                      <p className="text-blue-400">有沉淀</p>
                    )}
                    <button 
                      onClick={() => setShowSolutionPanel(true)}
                      className="mt-2 bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded text-sm"
                    >
                      添加溶液
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* 反应历史 */}
          <div className="absolute bottom-4 left-4 w-64 bg-gray-800 bg-opacity-90 p-4 rounded-lg border border-green-500">
            <h3 className="text-lg font-semibold mb-2">反应历史</h3>
            <div className="max-h-40 overflow-y-auto">
              {reactionHistory.length > 0 ? (
                reactionHistory.map((reaction, index) => (
                  <div key={index} className="mb-2 text-sm border-b border-gray-700 pb-1">
                    <p>{reaction.equation}</p>
                    <p className="text-xs text-gray-400">
                      {reaction.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">暂无反应记录</p>
              )}
            </div>
          </div>
        </div>
        
        {/* 设备面板 */}
        {showElementPanel && (
          <div className="w-64 bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4 text-green-400">实验设备</h2>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => addEquipment('beaker')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded">烧杯</button>
              <button onClick={() => addEquipment('testTube')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded">试管</button>
              <button onClick={() => addEquipment('flask')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded">圆底烧瓶</button>
              <button onClick={() => addEquipment('buret')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded">滴定管</button>
              <button onClick={() => addEquipment('erlenmeyer')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded">锥形瓶</button>
              <button onClick={() => addEquipment('crucible')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded">坩埚</button>
              <button onClick={() => addEquipment('watchGlass')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded">表面皿</button>
              <button onClick={() => addEquipment('graduatedCylinder')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded">量杯</button>
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-2 text-yellow-400">加热控制</h3>
            <div className="space-y-2">
              <button 
                onClick={() => setHeatingSourceActive(!heatingSourceActive)}
                className={`w-full p-2 rounded ${heatingSourceActive ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {heatingSourceActive ? '关闭加热' : '开启加热'}
              </button>
              <div>
                <label className="text-sm block mb-1">温度: {temperature}°C</label>
                <input
                  type="range"
                  min="25"
                  max="500"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full"
                  disabled={!heatingSourceActive}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* 任务面板 */}
        {showTaskPanel && (
          <div className="w-80 bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold mb-4 text-blue-400">实验任务</h2>
            <div className="space-y-4">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`p-3 rounded-lg border ${task.completed ? 'border-green-500 bg-green-900 bg-opacity-30' : 'border-gray-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{task.title}</h3>
                    <span className="text-yellow-400">{task.rewardPoints}分</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{task.description}</p>
                  {!task.completed && !currentTask && (
                    <button 
                      onClick={() => startTask(task.id)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                    >
                      开始任务
                    </button>
                  )}
                  {currentTask === task.id && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-cyan-300">任务步骤:</h4>
                      <ul className="mt-1 space-y-1">
                        {task.steps.map((step, index) => (
                          <li key={index} className={`text-sm ${index === currentStep.stepIndex ? 'text-green-400' : 'text-gray-300'}`}>
                            {step}
                          </li>
                        ))}
                      </ul>
                      {currentStep.stepIndex < task.steps.length - 1 && (
                        <button 
                          onClick={() => setCurrentStep({taskId: task.id, stepIndex: currentStep.stepIndex + 1})}
                          className="mt-2 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm"
                        >
                          下一步
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setCurrentTask(null);
                          setCurrentStep({taskId: null, stepIndex: 0});
                        }}
                        className="mt-2 bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm ml-2"
                      >
                        取消任务
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 溶液选择面板 */}
      {showSolutionPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">选择溶液</h2>
            <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {predefinedSolutions.map((solution, index) => (
                <button
                  key={index}
                  onClick={() => addSolution(solution)}
                  className="bg-gray-700 hover:bg-gray-600 p-3 rounded flex flex-col items-center justify-center"
                >
                  <div 
                    className="w-10 h-10 rounded-full mb-1 flex items-center justify-center"
                    style={{
                      backgroundColor: solution.color,
                      border: solution.isSolid ? '2px dashed #FFFFFF' : 'none'
                    }}
                  >
                    {solution.isSolid && <span className="text-black">固</span>}
                  </div>
                  <span className="text-xs text-center">{solution.name}</span>
                </button>
              ))}
            </div>
            <button 
              onClick={() => setShowSolutionPanel(false)}
              className="mt-4 w-full bg-gray-600 hover:bg-gray-500 p-2 rounded"
            >
              取消
            </button>
          </div>
        </div>
      )}
      
      {/* 提示信息 */}
      <div className="mt-4 text-sm text-gray-400">
        <p>操作提示: 点击设备可选中并拖动，将不同溶液混合可观察化学反应。点击加热源可开启/关闭加热。</p>
      </div>
      
      {/* Toast提示 */}
      {toast.visible && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fadeIn">
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default ChemistryLab;