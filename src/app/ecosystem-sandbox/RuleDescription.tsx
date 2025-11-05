import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// 规则说明组件 - 提取自主页面，实现关注点分离
export const RuleDescription = () => {
  return (
    <div className="max-w-7xl mx-auto w-full mt-6">
      <Card className="overflow-hidden">
        <div className="p-4 bg-slate-50">
          <h3 className="text-lg font-medium flex items-center">
            <span className="text-2xl mr-2">📋</span>
            生物沙盒规则说明
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌟</span>
              <div>
                <strong className="font-medium">饥饿机制</strong>
                <p className="text-slate-600">每个生物有0-100的饥饿值，会随时间减少。饥饿时生物会加速寻找食物，极度饥饿时会减速甚至死亡。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🍃</span>
              <div>
                <strong className="font-medium">基础生物 (蓝绿色系)</strong>
                <p className="text-slate-600">初始生物类型，可以进化为其他类型。饥饿消耗适中，速度中等。颜色范围：蓝绿到青色。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🐺</span>
              <div>
                <strong className="font-medium">捕食者 (红色系)</strong>
                <p className="text-slate-600">速度更快，感知范围更大，但饥饿消耗也更快。有内圈标记。颜色范围：红到橙红。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🦅</span>
              <div>
                <strong className="font-medium">清道夫 (紫色系)</strong>
                <p className="text-slate-600">吃食物效率更高，饥饿消耗更慢。有半圆标记。颜色范围：紫到粉紫。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🦋</span>
              <div>
                <strong className="font-medium">进化条件</strong>
                <p className="text-slate-600">基础生物年龄达到500帧且饥饿值高于60时，有几率进化为捕食者或清道夫。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">💀</span>
              <div>
                <strong className="font-medium">死亡与循环</strong>
                <p className="text-slate-600">当饥饿值降至0时，生物死亡并70%几率转化为新食物，形成生态循环。</p>
              </div>
            </div>
            
            <div className="flex items-start md:col-span-2">
              <span className="text-2xl mr-2">🎮</span>
              <div>
                <strong className="font-medium">操作提示</strong>
                <p className="text-slate-600">点击沙盒区域添加生物，使用控制面板调整速度和重置生态系统。</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};