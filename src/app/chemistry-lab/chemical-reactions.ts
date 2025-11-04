import { ChemicalReaction } from './types';

// 定义化学反应数据库
export const chemicalReactions: ChemicalReaction[] = [
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
    colorChange: '#90EE90', // 浅绿色溶液
    gasProduction: true,
    energyChange: 'exothermic'
  },
  {
    reactants: ['Fe', 'H2SO4'],
    products: ['FeSO4', 'H2'],
    equation: 'Fe + H2SO4 → FeSO4 + H2↑',
    conditions: 'mix',
    colorChange: '#90EE90', // 浅绿色溶液
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
    colorChange: '#90EE90', // 浅绿色溶液，红色铜沉淀
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
    colorChange: '#0000AA', // 蓝色沉淀
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
    colorChange: '#008000', // 绿色溶液
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
    colorChange: '#0000FF', // 蓝色溶液
    energyChange: 'exothermic'
  },
  {
    reactants: ['FeSO4', 'NaOH'],
    products: ['Fe(OH)2', 'Na2SO4'],
    equation: 'FeSO4 + 2NaOH → Fe(OH)2↓ + Na2SO4',
    conditions: 'mix',
    colorChange: '#00FF00', // 绿色沉淀
    precipitate: true
  },
  {
    reactants: ['CuCl2', 'NaOH'],
    products: ['Cu(OH)2', 'NaCl'],
    equation: 'CuCl2 + 2NaOH → Cu(OH)2↓ + 2NaCl',
    conditions: 'mix',
    colorChange: '#0000FF', // 蓝色沉淀
    precipitate: true
  },
  {
    reactants: ['AgNO3', 'NaOH'],
    products: ['Ag2O', 'NaNO3', 'H2O'],
    equation: '2AgNO₃ + 2NaOH → Ag₂O↓ + 2NaNO₃ + H₂O',
    conditions: 'mix',
    colorChange: '#8B4513', // 棕褐色沉淀
    precipitate: true,
    specialNote: '首先生成白色的氢氧化银(AgOH)，但迅速分解为棕褐色的氧化银(Ag₂O)'
  }
];