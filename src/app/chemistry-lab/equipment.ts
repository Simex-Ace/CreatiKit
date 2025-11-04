import { EquipmentProperties } from './types';

// 设备属性定义
export const equipmentProperties: Record<string, EquipmentProperties> = {
  beaker: {
    canHeat: true,
    canReact: true,
    canHoldSolids: true,
    canHoldLiquids: true,
    name: '烧杯',
    description: '可加热和进行反应的通用容器，适合固体和液体'
  },
  testTube: {
    canHeat: true,
    canReact: true,
    canHoldSolids: true,
    canHoldLiquids: true,
    name: '试管',
    description: '小容量反应容器，适合加热和小规模反应'
  },
  flask: {
    canHeat: true,
    canReact: true,
    canHoldSolids: false,
    canHoldLiquids: true,
    name: '圆底烧瓶',
    description: '适合加热液体和蒸馏操作'
  },
  buret: {
    canHeat: false,
    canReact: false,
    canHoldSolids: false,
    canHoldLiquids: true,
    name: '滴定管',
    description: '精确量取和滴加液体的仪器，不可加热和反应'
  },
  erlenmeyer: {
    canHeat: true,
    canReact: true,
    canHoldSolids: true,
    canHoldLiquids: true,
    name: '锥形瓶',
    description: '适合反应和滴定操作，可加热'
  },
  crucible: {
    canHeat: true,
    canReact: true,
    canHoldSolids: true,
    canHoldLiquids: false,
    name: '坩埚',
    description: '专用于加热固体的容器，不适合液体'
  },
  watchGlass: {
    canHeat: false,
    canReact: false,
    canHoldSolids: true,
    canHoldLiquids: false,
    name: '表面皿',
    description: '用于放置少量固体，不可加热和反应'
  },
  graduatedCylinder: {
    canHeat: false,
    canReact: false,
    canHoldSolids: false,
    canHoldLiquids: true,
    name: '量杯',
    description: '用于量取液体体积，不可加热和反应'
  }
};

// 设备尺寸定义
export const equipmentSizes = {
  beaker: { width: 80, height: 100 },
  testTube: { width: 30, height: 120 },
  flask: { width: 100, height: 120 },
  buret: { width: 40, height: 180 },
  erlenmeyer: { width: 70, height: 110 },
  crucible: { width: 50, height: 50 },
  watchGlass: { width: 70, height: 20 },
  graduatedCylinder: { width: 60, height: 140 }
};