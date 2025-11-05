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
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">💞</span>
              <div>
                <strong className="font-medium">生物繁殖</strong>
                <p className="text-slate-600">当生物年龄达到200帧且饥饿值高于70时，会进入繁殖状态并寻找配偶。繁殖中的生物会互相靠近并保持相对静止，完成后会在父母周围随机位置诞生新生物。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">👪</span>
              <div>
                <strong className="font-medium">后代遗传</strong>
                <p className="text-slate-600">新诞生的生物会继承父母的类型和部分特性，但也会有少量随机变化，形成生物多样性。</p>
              </div>
            </div>
            
            {/* 新增地形效果说明 */}
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌊</span>
              <div>
                <strong className="font-medium">海洋</strong>
                <p className="text-slate-600">移动速度减慢（30%），饥饿消耗加快（200%），极低的繁殖概率（10%），无健康恢复，食物检测范围减小（80%）。生物会带有轻微蓝色调。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🏖️</span>
              <div>
                <strong className="font-medium">沙滩</strong>
                <p className="text-slate-600">移动速度略快（110%），饥饿消耗略快（120%），略高的繁殖概率（120%），轻微健康恢复。食物检测范围轻微增加（110%）。生物会带有沙滩色调。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌲</span>
              <div>
                <strong className="font-medium">森林</strong>
                <p className="text-slate-600">移动速度略慢（80%），饥饿消耗减缓（90%），高繁殖概率（150%），中等健康恢复。食物检测范围大幅增加（130%）。生物会带有绿色调。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">⛰️</span>
              <div>
                <strong className="font-medium">山地</strong>
                <p className="text-slate-600">移动速度减慢（50%），饥饿消耗加快（150%），稍低的繁殖概率（90%），高健康恢复。食物检测范围减小（70%）。生物会带有灰色调。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌾</span>
              <div>
                <strong className="font-medium">平原</strong>
                <p className="text-slate-600">移动速度最快（130%），饥饿消耗正常，较高的繁殖概率（130%），轻微健康恢复。食物检测范围增加（120%）。生物会带有草原绿色调。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🏞️</span>
              <div>
                <strong className="font-medium">地形适应性</strong>
                <p className="text-slate-600">不同地形会影响生物的移动速度、饥饿消耗、繁殖概率、健康恢复和食物检测能力。生物会根据所在地形显示相应的颜色变化。</p>
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