import { ExperimentTask, Solution } from './types';

// 预定义实验任务
export const predefinedTasks: ExperimentTask[] = [
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

// 定义预设物质
export const predefinedSolutions: Solution[] = [
  // 液体
  { name: '硫酸铜溶液', type: 'CuSO4', color: '#00FFFF', amount: 80, description: '蓝色溶液' },
  { name: '氢氧化钠溶液', type: 'NaOH', color: '#FFFFFF', amount: 80, description: '无色溶液' },
  { name: '盐酸溶液', type: 'HCl', color: '#FFFFFF', amount: 80, description: '无色溶液，有刺激性气味' },
  { name: '硫酸溶液', type: 'H2SO4', color: '#FFFFFF', amount: 80, description: '无色油状液体' },
  { name: '高锰酸钾溶液', type: 'KMnO4', color: '#9400D3', amount: 60, description: '紫色溶液' },
  { name: '过氧化氢溶液', type: 'H2O2', color: '#FFFFFF', amount: 80, description: '无色溶液' },
  { name: '硝酸银溶液', type: 'AgNO3', color: '#FFFFFF', amount: 70, description: '无色溶液' },
  { name: '水', type: 'H2O', color: '#FFFFFF', amount: 100, description: '无色液体' },
  // 固体
  { name: '碳酸钙固体', type: 'CaCO3', color: '#FFFFFF', amount: 30, isSolid: true, description: '白色固体' },
  { name: '铁粉', type: 'Fe', color: '#708090', amount: 30, isSolid: true, description: '黑色粉末' },
  { name: '氯化钠固体', type: 'NaCl', color: '#FFFFFF', amount: 40, isSolid: true, description: '白色晶体' },
  { name: '锌粒', type: 'Zn', color: '#C0C0C0', amount: 30, isSolid: true, description: '银白色金属颗粒' },
  { name: '高锰酸钾固体', type: 'KMnO4(固)', color: '#9400D3', amount: 30, isSolid: true, description: '暗紫色晶体' },
  { name: '氧化铜固体', type: 'CuO', color: '#8B4513', amount: 30, isSolid: true, description: '黑色粉末' }
];