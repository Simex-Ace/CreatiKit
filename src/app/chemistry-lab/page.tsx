'use client';

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { ChemicalItem, EquipmentProperties, ExperimentTask, Solution } from './types';
import { chemicalReactions } from './chemical-reactions';
import { predefinedTasks, predefinedSolutions } from './experiments';
import { equipmentProperties as importedEquipmentProperties, equipmentSizes } from './equipment';
import { useI18n } from '@/contexts/I18nContext';

// 化学反应数据库已从chemical-reactions.ts导入

// 预定义实验任务和预设物质已从experiments.ts导入

const ChemistryLab: React.FC = () => {
  const { t, locale } = useI18n();
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

  // 使用导入的设备属性定义
  const equipmentProperties = importedEquipmentProperties;

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

    // 绘制烧杯轮廓（移除了手柄）
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(x - width / 2, y - height);
    ctx.lineTo(x - width / 2 + 10, y);
    ctx.lineTo(x + width / 2 - 10, y);
    ctx.lineTo(x + width / 2, y - height);
    ctx.closePath();
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

    // 绘制试管轮廓 - 修改底部为完整椭圆
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    // 上部直线
    ctx.moveTo(x - width / 2, y - height);
    ctx.lineTo(x - width / 2, y - 20);
    // 底部椭圆
    ctx.ellipse(x, y - 20, width / 2, width / 3, 0, Math.PI, 0);
    // 右侧直线
    ctx.lineTo(x + width / 2, y - height);
    ctx.closePath();
    ctx.stroke();

    // 绘制液体 - 修复为从底部开始填充
    if (item.liquidAmount > 0) {
      const liquidHeightPercentage = item.liquidAmount / 100;
      const liquidHeight = (height - 20) * liquidHeightPercentage;
      ctx.fillStyle = item.liquidColor;
      ctx.beginPath();
      // 液体顶部
      ctx.moveTo(x - width / 2 + 2, y - 20 - liquidHeight + 20);
      ctx.lineTo(x + width / 2 - 2, y - 20 - liquidHeight + 20);
      // 右侧直线
      ctx.lineTo(x + width / 2 - 2, y - 20);
      // 底部椭圆
      ctx.ellipse(x, y - 20, width / 2 - 2, width / 3 - 2, 0, Math.PI, 0);
      // 左侧直线
      ctx.lineTo(x - width / 2 + 2, y - 20);
      ctx.closePath();
      ctx.fill();

      // 绘制沉淀
      if (item.hasPrecipitate) {
        ctx.fillStyle = '#0000AA';
        ctx.beginPath();
        ctx.moveTo(x - width / 2 + 3, y - 20 - liquidHeight / 4);
        ctx.lineTo(x + width / 2 - 3, y - 20 - liquidHeight / 4);
        ctx.lineTo(x + width / 2 - 3, y - 20);
        ctx.ellipse(x, y - 20, width / 2 - 3, width / 3 - 3, 0, Math.PI, 0);
        ctx.lineTo(x - width / 2 + 3, y - 20);
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

  // 绘制锥形瓶 - 上部分使用圆底烧瓶设计，底部改为三角形
  const drawErlenmeyer = useCallback((ctx: CanvasRenderingContext2D, item: ChemicalItem) => {
    const { width, height } = equipmentSizes.erlenmeyer;
    const x = item.x;
    const y = item.y;
    
    // 绘制锥形瓶轮廓 - 简化为小正梯形+瓶颈设计
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    
    // 瓶颈（保持细试管状）
    const neckWidth = width / 10;
    const neckHeight = height * 0.3;
    const neckBottomY = y - height * 0.7;
    
    // 绘制瓶颈
    ctx.moveTo(x - neckWidth, y - height);
    ctx.lineTo(x - neckWidth, neckBottomY);
    ctx.lineTo(x + neckWidth, neckBottomY);
    ctx.lineTo(x + neckWidth, y - height);
    
    // 小正梯形瓶身（避免溢出）
    const bodyHeight = height * 0.7;
    const topWidth = width * 0.4; // 梯形顶部宽度
    const bottomWidth = width * 0.6; // 梯形底部宽度
    
    // 从瓶颈到梯形顶部
    ctx.moveTo(x - neckWidth, neckBottomY);
    ctx.lineTo(x - topWidth / 2, neckBottomY);
    // 梯形左侧边
    ctx.lineTo(x - bottomWidth / 2, y);
    // 梯形底部
    ctx.lineTo(x + bottomWidth / 2, y);
    // 梯形右侧边
    ctx.lineTo(x + topWidth / 2, neckBottomY);
    // 从梯形顶部回到瓶颈
    ctx.lineTo(x + neckWidth, neckBottomY);
    
    ctx.stroke();
    
    // 绘制液体 - 使用简单的矩形填充，确保平整且不溢出
    if (item.liquidAmount > 0) {
      const maxLiquidHeight = bodyHeight * 0.9; // 最大液体高度
      const liquidHeightPercentage = item.liquidAmount / 100;
      const liquidHeight = Math.min(liquidHeightPercentage * maxLiquidHeight, maxLiquidHeight);
      const liquidTopY = y - liquidHeight;
      
      ctx.fillStyle = item.liquidColor;
      ctx.beginPath();
      
      // 简单的矩形填充，宽度根据梯形形状动态调整
      if (liquidTopY >= neckBottomY) {
        // 液体只在梯形部分
        const liquidWidth = bottomWidth - ((bottomWidth - topWidth) * 
          Math.max(0, (y - liquidTopY) / bodyHeight));
        const halfWidth = liquidWidth / 2;
        
        ctx.fillRect(x - halfWidth + 2, liquidTopY, liquidWidth - 4, liquidHeight);
      } else {
        // 液体进入瓶颈部分
        // 梯形部分
        ctx.fillRect(x - topWidth / 2 + 2, neckBottomY, topWidth - 4, neckBottomY - liquidTopY);
        // 瓶颈部分
        ctx.fillRect(x - neckWidth + 2, liquidTopY, neckWidth * 2 - 4, neckHeight);
      }
    }

      // 显示液体类型标签
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

  // 绘制圆底烧瓶 - 改为之前的锥形瓶设计
  const drawFlask = useCallback((ctx: CanvasRenderingContext2D, item: ChemicalItem) => {
    const { width, height } = equipmentSizes.flask;
    const x = item.x;
    const y = item.y;

    // 绘制圆底烧瓶轮廓 - 使用之前的锥形瓶设计
    ctx.strokeStyle = item.isSelected ? '#FF4500' : '#FFFFFF';
    ctx.lineWidth = item.isSelected ? 3 : 2;
    ctx.beginPath();
    // 瓶颈 - 稍微扩大
    ctx.moveTo(x - width / 5, y - height);
    ctx.lineTo(x - width / 5, y - height * 0.6);
    // 曲线连接到瓶底
    ctx.quadraticCurveTo(x - width / 2, y - height * 0.3, x - width / 2 + 10, y);
    // 底部直线
    ctx.lineTo(x + width / 2 - 10, y);
    // 另一侧曲线连接
    ctx.quadraticCurveTo(x + width / 2, y - height * 0.3, x + width / 5, y - height * 0.6);
    // 右侧瓶颈
    ctx.lineTo(x + width / 5, y - height);
    ctx.closePath();
    ctx.stroke();

    // 绘制液体 - 修复为从底部开始填充
    if (item.liquidAmount > 0) {
      const liquidHeightPercentage = item.liquidAmount / 100;
      const liquidHeight = height * liquidHeightPercentage;
      ctx.fillStyle = item.liquidColor;
      ctx.beginPath();
      
      // 计算液体位置 - 确保从底部开始填充
      const liquidBottomY = y;
      const liquidTopY = y - liquidHeight;
      
      // 底部直线
      const bottomWidth = width - 20;
      const bottomLeftX = x - bottomWidth / 2;
      const bottomRightX = x + bottomWidth / 2;
      ctx.moveTo(bottomLeftX, liquidBottomY);
      ctx.lineTo(bottomRightX, liquidBottomY);
      
      // 右侧曲线 - 根据液体高度调整曲线形状
      if (liquidHeight > height * 0.4) {
        // 当液体较高时
        ctx.quadraticCurveTo(x + width / 2, y - height * 0.3, x + width / 5, Math.max(y - height * 0.6, liquidTopY));
        // 如果液体超出瓶颈
        if (liquidTopY < y - height * 0.6) {
          ctx.lineTo(x + width / 5, liquidTopY);
        }
      } else {
        // 当液体较低时
        const rightControlX = x + width / 2 * (liquidHeight / (height * 0.4));
        ctx.quadraticCurveTo(rightControlX, y - liquidHeight / 2, x + width / 5 * (liquidHeight / (height * 0.4)), liquidTopY);
      }
      
      // 顶部直线
      if (liquidTopY >= y - height * 0.6) {
        ctx.lineTo(x - width / 5 * (liquidHeight / (height * 0.4)), liquidTopY);
      } else {
        // 如果液体超出瓶颈
        ctx.lineTo(x - width / 5, liquidTopY);
      }
      
      // 左侧曲线
      if (liquidHeight > height * 0.4) {
        // 当液体较高时
        ctx.quadraticCurveTo(x - width / 2, y - height * 0.3, bottomLeftX, liquidBottomY);
      } else {
        // 当液体较低时
        const leftControlX = x - width / 2 * (liquidHeight / (height * 0.4));
        ctx.quadraticCurveTo(leftControlX, y - liquidHeight / 2, bottomLeftX, liquidBottomY);
      }
      
      ctx.closePath();
      ctx.fill();

      // 显示液体类型标签
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
            // 获取两个设备的属性
            const props1 = equipmentProperties[item1.type];
            const props2 = equipmentProperties[item2.type];
            
            // 检查两个设备是否都可以反应
            if (!props1.canReact || !props2.canReact) {
              // 显示错误提示
              setToast({
                message: '这些设备不能用于化学反应！',
                visible: true
              });
              setTimeout(() => {
                setToast(prev => ({ ...prev, visible: false }));
              }, 3000);
              return;
            }
            
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
        
        // 获取设备属性
        const props = equipmentProperties[item.type];
        
        // 如果设备在加热源上方且有物质
        if (distance < 50 && item.liquidAmount > 0) {
          // 检查设备是否可以加热
          if (!props.canHeat) {
            // 显示错误提示
            if (!item.isHeated) {
              setToast({
                message: `${props.name}不能直接加热！`,
                visible: true
              });
              setTimeout(() => {
                setToast(prev => ({ ...prev, visible: false }));
              }, 3000);
            }
            return;
          }
          
          // 标记为加热状态
          if (!item.isHeated) {
            setItems(prevItems => prevItems.map(i => 
              i.id === item.id ? { ...i, isHeated: true } : i
            ));
          }
          
          // 只有可反应的设备才会发生反应
          if (props.canReact) {
            // 查找匹配的加热反应
            const reaction = chemicalReactions.find(r => 
              r.conditions === 'heat' && 
              r.reactants.some(reactant => item.liquidType.includes(reactant))
            );
            
            if (reaction && temperature > 80) { // 需要达到一定温度
              // 计算减少的液体量，气体产生的反应减少更多
              let reduceAmount = 20; // 默认减少量
              if (reaction.gasProduction) {
                reduceAmount = 30; // 有气体产生时减少更多
              }
              
              const newItem = {
                ...item,
                liquidType: reaction.products.join(', '),
                liquidColor: reaction.colorChange || '#FFFFFF',
                hasPrecipitate: reaction.precipitate,
                liquidAmount: Math.max(0, item.liquidAmount - reduceAmount)
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

  // 复制提示状态
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);

  // 复制反应方程式
  const copyEquation = (equation: string) => {
    navigator.clipboard.writeText(equation);
    setShowCopiedNotification(true);
    setTimeout(() => {
      setShowCopiedNotification(false);
    }, 2000);
  };

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

  // 获取翻译后的设备名称
  const getTranslatedEquipmentName = useCallback((equipmentType: string): string => {
    return t(`chemistryLabPage.equipmentNames.${equipmentType}`) || equipmentProperties[equipmentType]?.name || equipmentType;
  }, [t]);

  // 获取翻译后的物质名称
  const getTranslatedSolutionName = useCallback((solutionType: string): string => {
    const key = solutionType.replace('(固)', '_solid') as keyof typeof predefinedSolutions;
    return t(`chemistryLabPage.solutions.${key}`) || predefinedSolutions.find(s => s.type === solutionType)?.name || solutionType;
  }, [t]);

  // 显示toast提示
  const showToast = useCallback((message: string) => {
    setToast({message, visible: true});
    // 3秒后自动隐藏
    setTimeout(() => {
      setToast(prev => ({...prev, visible: false}));
    }, 3000);
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
    
    // 显示设备说明
    const props = equipmentProperties[type];
    const description = t(`chemistryLabPage.equipmentDescriptions.${type}`) || props.description;
    showToast(`${getTranslatedEquipmentName(type)}: ${description}`);
  }, [t, getTranslatedEquipmentName, showToast]);

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
         
         // 先找到选中的设备
         const selectedItem = prevItems.find(item => item && item.id === selectedItemId);
         if (!selectedItem) {
           showToast(t('chemistryLabPage.equipmentNotFound'));
           setShowSolutionPanel(false);
           return prevItems;
         }
         
         // 获取设备属性
         const props = equipmentProperties[selectedItem.type];
         
         // 检查设备是否可以容纳该状态的物质
         if (solution.isSolid && !props.canHoldSolids) {
           showToast(t('chemistryLabPage.notSuitableForSolid', { name: getTranslatedEquipmentName(selectedItem.type) }));
           setShowSolutionPanel(false);
           return prevItems;
         }
         
         if (!solution.isSolid && !props.canHoldLiquids) {
           showToast(t('chemistryLabPage.notSuitableForLiquid', { name: getTranslatedEquipmentName(selectedItem.type) }));
           setShowSolutionPanel(false);
           return prevItems;
         }
         
         // 检查设备中是否已有不同状态的物质
         const currentIsSolid = prevItems.find(item => item.id === selectedItemId)?.liquidType.includes('固体') || 
                                prevItems.find(item => item.id === selectedItemId)?.liquidType.includes('Solid') || false;
         if (selectedItem.liquidAmount > 0 && currentIsSolid !== !!solution.isSolid) {
           showToast(t('chemistryLabPage.cannotMixStates'));
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
      console.error('添加物质时发生错误:', error);
      setShowSolutionPanel(false);
      showToast(t('chemistryLabPage.addSubstanceFailed'));
    }
  }, [selectedItemId, showToast, t, getTranslatedEquipmentName]);

  // 清空单个容器内的物质
  const clearContainer = useCallback((equipmentId: string) => {
    setItems(prev => prev.map(item => 
      item.id === equipmentId 
        ? { ...item, liquidType: '', liquidAmount: 0, liquidColor: '#FFFFFF', hasPrecipitate: false } 
        : item
    ));
    showToast(t('chemistryLabPage.containerCleared'));
  }, [showToast, t]);

  // 移除整个容器
  const removeContainer = useCallback((equipmentId: string) => {
    setItems(prev => prev.filter(item => item.id !== equipmentId));
    setSelectedItemId(null);
    showToast(t('chemistryLabPage.containerRemoved'));
  }, [showToast, t]);

  // 清空整个实验台
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

  // 获取翻译后的任务
  const getTranslatedTasks = useCallback((): ExperimentTask[] => {
    return predefinedTasks.map(task => {
      const translatedTask = t(`chemistryLabPage.tasks.${task.id}`, { returnObjects: true }) as any;
      if (translatedTask && typeof translatedTask === 'object' && translatedTask.title) {
        return {
          ...task,
          title: translatedTask.title,
          description: translatedTask.description,
          steps: translatedTask.steps || task.steps
        };
      }
      return task;
    });
  }, [t]);

  // 重置任务进度
  const resetTasks = useCallback(() => {
    setTasks(getTranslatedTasks());
    setScore(0);
    setCurrentStep({taskId: null, stepIndex: 0});
  }, [getTranslatedTasks]);

  // 开始新任务
  const startTask = useCallback((taskId: string) => {
    setCurrentTask(taskId);
    setCurrentStep({taskId, stepIndex: 0});
  }, []);

  // 初始化翻译后的任务
  useEffect(() => {
    setTasks(getTranslatedTasks());
  }, [getTranslatedTasks, locale]);

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white p-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 flex-shrink-0">
        <h1 className="text-2xl font-bold text-cyan-400">{t('chemistryLabPage.title')}</h1>
        <div className="flex flex-wrap gap-2">
          <span className="text-yellow-400">{t('chemistryLabPage.score')}: {score}</span>
          <button 
            onClick={() => setShowTaskPanel(!showTaskPanel)}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
          >
            {t('chemistryLabPage.taskPanel')}
          </button>
          <button 
            onClick={() => setShowElementPanel(!showElementPanel)}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
          >
            {t('chemistryLabPage.equipmentPanel')}
          </button>
          <button 
            onClick={clearLab}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
          >
            {t('chemistryLabPage.clearLab')}
          </button>
          <button 
            onClick={resetTasks}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded text-sm"
          >
            {t('chemistryLabPage.resetTask')}
          </button>
        </div>
      </div>
      
      <div className="flex flex-1 gap-4 min-h-0 overflow-hidden">
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
              <h3 className="text-lg font-semibold mb-2">{t('chemistryLabPage.equipmentInfo')}</h3>
              {(() => {
                const selectedItem = items.find(item => item.id === selectedItemId);
                if (!selectedItem) return <p>{t('chemistryLabPage.equipmentNotFound')}</p>;
                
                const props = equipmentProperties[selectedItem.type];
                const isSolidContent = selectedItem.liquidType.includes('固体') || selectedItem.liquidType.includes('Solid') || selectedItem.liquidType.includes('(固)');
                
                return (
                  <div>
                    <p>{t('chemistryLabPage.name')}: {getTranslatedEquipmentName(selectedItem.type)}</p>
                    <p>{t('chemistryLabPage.substance')}: {selectedItem.liquidType ? getTranslatedSolutionName(selectedItem.liquidType) : t('chemistryLabPage.empty')}</p>
                    <p>{t('chemistryLabPage.status')}: {isSolidContent ? t('chemistryLabPage.solid') : t('chemistryLabPage.liquid')}</p>
                    <p>{t('chemistryLabPage.amount')}: {selectedItem.liquidAmount}%</p>
                    {selectedItem.isHeated && (
                      <p className="text-red-400">{t('chemistryLabPage.heating')}</p>
                    )}
                    {selectedItem.hasPrecipitate && (
                      <p className="text-blue-400">{t('chemistryLabPage.hasPrecipitate')}</p>
                    )}
                    <div className="mt-2 text-xs text-gray-400">
                      <p>{t('chemistryLabPage.canHeat')}: {props.canHeat ? t('chemistryLabPage.yes') : t('chemistryLabPage.no')}</p>
                      <p>{t('chemistryLabPage.canReact')}: {props.canReact ? t('chemistryLabPage.yes') : t('chemistryLabPage.no')}</p>
                    </div>
                    <button 
                      onClick={() => setShowSolutionPanel(true)}
                      className="mt-2 bg-cyan-600 hover:bg-cyan-700 px-3 py-1 rounded text-sm"
                    >
                      {t('chemistryLabPage.addSubstance')}
                    </button>
                    <button 
                      onClick={() => clearContainer(selectedItem.id)}
                      className="mt-2 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-sm ml-2"
                    >
                      {t('chemistryLabPage.clearContainer')}
                    </button>
                    <button 
                      onClick={() => removeContainer(selectedItem.id)}
                      className="mt-2 bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded text-sm ml-2"
                    >
                      {t('chemistryLabPage.removeContainer')}
                    </button>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* 反应历史 */}
          <div className="absolute bottom-4 left-4 w-64 bg-gray-800 bg-opacity-90 p-4 rounded-lg border border-green-500">
            <h3 className="text-lg font-semibold mb-2">{t('chemistryLabPage.reactionHistory')}</h3>
            <div className="max-h-40 overflow-y-auto">
              {reactionHistory.length > 0 ? (
                reactionHistory.map((reaction, index) => (
                  <div key={index} className="mb-2 text-sm border-b border-gray-700 pb-1">
                    <div className="flex items-center justify-between">
                      <p>{reaction.equation}</p>
                      <button 
                        onClick={() => copyEquation(reaction.equation)}
                        className="p-1 text-cyan-400 hover:text-cyan-300 focus:outline-none"
                        title={t('chemistryLabPage.copyEquation')}
                      >
                        📋
                      </button>
                    </div>
                    <p className="text-xs text-gray-400">
                      {reaction.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">{t('chemistryLabPage.noReactionRecords')}</p>
              )}
            </div>
          </div>
        </div>
        
        {/* 复制成功提示 */}
        {showCopiedNotification && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300">
            {t('chemistryLabPage.copied')}
          </div>
        )}

        {/* 设备面板 */}
        {showElementPanel && (
          <div className="w-64 bg-gray-800 rounded-lg p-4 flex flex-col overflow-hidden flex-shrink-0">
            <h2 className="text-xl font-bold mb-4 text-green-400 flex-shrink-0">{t('chemistryLabPage.equipment')}</h2>
            <div className="grid grid-cols-2 gap-2 flex-shrink-0">
              <button onClick={() => addEquipment('beaker')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm">{t('chemistryLabPage.equipmentNames.beaker')}</button>
              <button onClick={() => addEquipment('testTube')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm">{t('chemistryLabPage.equipmentNames.testTube')}</button>
              <button onClick={() => addEquipment('flask')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm">{t('chemistryLabPage.equipmentNames.flask')}</button>
              <button onClick={() => addEquipment('buret')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm">{t('chemistryLabPage.equipmentNames.buret')}</button>
              <button onClick={() => addEquipment('erlenmeyer')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm">{t('chemistryLabPage.equipmentNames.erlenmeyer')}</button>
              <button onClick={() => addEquipment('crucible')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm">{t('chemistryLabPage.equipmentNames.crucible')}</button>
              <button onClick={() => addEquipment('watchGlass')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm">{t('chemistryLabPage.equipmentNames.watchGlass')}</button>
              <button onClick={() => addEquipment('graduatedCylinder')} className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-sm">{t('chemistryLabPage.equipmentNames.graduatedCylinder')}</button>
            </div>
            
            <h3 className="text-lg font-semibold mt-6 mb-2 text-yellow-400 flex-shrink-0">{t('chemistryLabPage.heatingControl')}</h3>
            <div className="space-y-2 flex-shrink-0">
              <button 
                onClick={() => setHeatingSourceActive(!heatingSourceActive)}
                className={`w-full p-2 rounded text-sm ${heatingSourceActive ? 'bg-red-600' : 'bg-gray-700 hover:bg-gray-600'}`}
              >
                {heatingSourceActive ? t('chemistryLabPage.stopHeating') : t('chemistryLabPage.startHeating')}
              </button>
              <div>
                <label className="text-sm block mb-1">{t('chemistryLabPage.temperature')}: {temperature}°C</label>
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
          <div className="w-80 bg-gray-800 rounded-lg p-4 flex flex-col overflow-hidden flex-shrink-0">
            <h2 className="text-xl font-bold mb-4 text-blue-400 flex-shrink-0">{t('chemistryLabPage.experimentalTasks')}</h2>
            <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
              {tasks.map(task => (
                <div 
                  key={task.id} 
                  className={`p-3 rounded-lg border ${task.completed ? 'border-green-500 bg-green-900 bg-opacity-30' : 'border-gray-700'}`}
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">{task.title}</h3>
                    <span className="text-yellow-400">{task.rewardPoints}{t('chemistryLabPage.points')}</span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{task.description}</p>
                  {!task.completed && !currentTask && (
                    <button 
                      onClick={() => startTask(task.id)}
                      className="mt-2 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
                    >
                      {t('chemistryLabPage.startTask')}
                    </button>
                  )}
                  {currentTask === task.id && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-cyan-300">{t('chemistryLabPage.taskSteps')}:</h4>
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
                          {t('chemistryLabPage.nextStep')}
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setCurrentTask(null);
                          setCurrentStep({taskId: null, stepIndex: 0});
                        }}
                        className="mt-2 bg-gray-600 hover:bg-gray-700 px-3 py-1 rounded text-sm ml-2"
                      >
                        {t('chemistryLabPage.cancelTask')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* 物质选择面板 */}
      {showSolutionPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-cyan-400">{t('chemistryLabPage.selectSubstance')}</h2>
            
            {/* 固体物质 */}
            <h3 className="text-lg font-semibold mb-2 text-yellow-400">{t('chemistryLabPage.solidSubstances')}</h3>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {predefinedSolutions.filter(s => s.isSolid).map((solution, index) => {
                const solutionKey = solution.type.replace('(固)', '_solid') as keyof typeof predefinedSolutions;
                return (
                <button
                  key={index}
                  onClick={() => addSolution(solution)}
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded flex flex-col items-center"
                >
                  <div
                    className="w-12 h-12 rounded-md border border-gray-500 mb-1 flex items-center justify-center"
                    style={{ backgroundColor: solution.color }}
                  >
                    <span className="text-gray-300">⚫</span>
                  </div>
                  <span className="text-xs font-medium">{getTranslatedSolutionName(solution.type)}</span>
                  <span className="text-xs text-yellow-400">{t('chemistryLabPage.solid')}</span>
                  {solution.description && (
                    <span className="text-xs text-gray-500 line-clamp-2 text-center">{t(`chemistryLabPage.solutionDescriptions.${solutionKey}`) || solution.description}</span>
                  )}
                </button>
              )})}
            </div>
            
            {/* 液体物质 */}
            <h3 className="text-lg font-semibold mb-2 text-blue-400">{t('chemistryLabPage.liquidSubstances')}</h3>
            <div className="grid grid-cols-4 gap-2">
              {predefinedSolutions.filter(s => !s.isSolid).map((solution, index) => (
                <button
                  key={index}
                  onClick={() => addSolution(solution)}
                  className="bg-gray-700 hover:bg-gray-600 p-2 rounded flex flex-col items-center"
                >
                  <div
                    className="w-12 h-12 rounded-full mb-1 border border-gray-500"
                    style={{ backgroundColor: solution.color }}
                  />
                  <span className="text-xs font-medium">{getTranslatedSolutionName(solution.type)}</span>
                  <span className="text-xs text-blue-400">{t('chemistryLabPage.liquid')}</span>
                  {solution.description && (
                    <span className="text-xs text-gray-500 line-clamp-2 text-center">{t(`chemistryLabPage.solutionDescriptions.${solution.type}`) || solution.description}</span>
                  )}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowSolutionPanel(false)}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 py-2 rounded"
            >
              {t('chemistryLabPage.close')}
            </button>
          </div>
        </div>
      )}
      
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