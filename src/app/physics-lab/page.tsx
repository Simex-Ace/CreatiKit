'use client';
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import PhysicsLab from '@/components/physics-lab/PhysicsLab';

const PhysicsLabPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">交互式2D物理实验室</h1>
        <p className="text-muted-foreground">使用React和Matter.js构建的物理模拟环境，体验经典力学实验</p>
      </div>
      
      <Card className="w-full max-w-6xl mx-auto">
        <CardHeader>
          <CardTitle>物理沙盒模拟器</CardTitle>
          <CardDescription>
            在这个虚拟实验室中，你可以创建、交互和观察符合物理规律的物体运动。
            选择不同的实验场景，调整物理参数，探索力学世界的奥秘。
          </CardDescription>
        </CardHeader>
        <CardContent className="h-[70vh]">
          <PhysicsLab />
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>使用说明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>• 点击画布可以创建选定形状的物体</p>
            <p>• 使用鼠标可以拖拽、移动和投掷物体</p>
            <p>• 通过工具栏选择不同的实验场景</p>
            <p>• 调整质量、摩擦系数和弹性等物理参数</p>
            <p>• 点击"清除所有"按钮可以重置当前场景</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>实验场景</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>• <strong>杠杆平衡</strong>：探索力臂与力的关系</p>
            <p>• <strong>弹簧振子</strong>：观察简谐运动，调整劲度系数</p>
            <p>• <strong>单摆实验</strong>：体验摆的周期性运动</p>
            <p>• <strong>斜面实验</strong>：研究倾角和摩擦力对物体运动的影响</p>
            <p>• <strong>自定义模式</strong>：自由创建和探索</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PhysicsLabPage;