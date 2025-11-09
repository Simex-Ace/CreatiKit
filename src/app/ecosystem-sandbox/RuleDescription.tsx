import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

// 规则说明组件 - 提取自主页面，实现关注点分离
export const RuleDescription = () => {
  return (
    <div className="max-w-7xl mx-auto w-full mt-6">
      <Card className="overflow-hidden">
        <div className="p-4 bg-slate-50 text-center">
          <h3 className="text-lg font-medium inline-flex items-center">
            <span className="text-2xl mr-2">📋</span>
            生物沙盒规则说明
          </h3>
          <p className="text-sm text-slate-600 mt-2">理解生态系统的运作机制，观察生物的生存、进化与互动</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* 基础机制 */}
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌟</span>
              <div>
                <strong className="font-medium">饥饿机制</strong>
                <p className="text-slate-600">每个生物有0-100的饥饿值，会随时间减少。饥饿时生物会加速寻找食物，极度饥饿时会减速甚至死亡。</p>
              </div>
            </div>
            
            <Separator className="my-4 md:col-span-2" />
            
            {/* 生物类型 */}
            <div className="flex items-start">
              <span className="text-2xl mr-2">🍃</span>
              <div>
                <strong className="font-medium">基础生物 (basic)</strong>
                <p className="text-slate-600">初始生物类型，蓝绿色系（从蓝绿到青色）。饥饿消耗适中，速度中等，可进化为其他高级类型。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🐺</span>
              <div>
                <strong className="font-medium">捕食者 (predator)</strong>
                <p className="text-slate-600">红色系（红到橙红），有内圈标记。速度更快，感知范围更大，但饥饿消耗也更快，是生态系统中的顶级消费者。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🦅</span>
              <div>
                <strong className="font-medium">清道夫 (scavenger)</strong>
                <p className="text-slate-600">紫色系（紫到粉紫），有半圆标记。吃食物效率更高，饥饿消耗更慢，是生态系统中的高效生存者。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🦋</span>
              <div>
                <strong className="font-medium">进化条件</strong>
                <p className="text-slate-600">基础生物年龄达到500帧且饥饿值高于60时，有几率进化为捕食者或清道夫。进化后获得新的特性和外观标记。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">💀</span>
              <div>
                <strong className="font-medium">死亡与循环</strong>
                <p className="text-slate-600">当饥饿值降至0时，生物死亡并70%几率转化为新食物，形成生态循环，维持系统平衡。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">💞</span>
              <div>
                <strong className="font-medium">生物繁殖</strong>
                <p className="text-slate-600">当生物年龄达到200帧且饥饿值高于70时，会进入繁殖状态并寻找配偶。繁殖中的生物会互相靠近并保持相对静止，完成后会在父母周围随机位置诞生新生物。繁殖概率会受到地形影响。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">👪</span>
              <div>
                <strong className="font-medium">后代遗传</strong>
                <p className="text-slate-600">新诞生的生物会继承父母的类型和部分特性，但也会有少量随机变化，形成生物多样性。</p>
              </div>
            </div>
            
            <Separator className="my-4 md:col-span-2" />
            
            {/* 地形效果 */}
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌊</span>
              <div>
                <strong className="font-medium">海洋 (蓝色)</strong>
                <p className="text-slate-600">生物可以通过海洋区域，在海洋中会加速移动（基础速度的3倍）。不能在海洋中生成生物或食物。饥饿消耗加快（200%），极低的繁殖概率（10%），无健康恢复。生物会带有轻微蓝色调。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🏖️</span>
              <div>
                <strong className="font-medium">沙滩 (黄色)</strong>
                <p className="text-slate-600">食物生成率较低（基础的0.7倍），生物移动速度正常，适合基础生物生存，进化概率相对较低。饥饿消耗略快（120%），略高的繁殖概率（120%），轻微健康恢复。生物会带有沙滩色调。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌲</span>
              <div>
                <strong className="font-medium">森林 (绿色)</strong>
                <p className="text-slate-600">食物生成率高（基础的1.3倍），生物移动速度较快（基础的1.1倍），生物密度高，进化概率增加，是生态系统最活跃区域。饥饿消耗减缓（90%），高繁殖概率（150%），中等健康恢复。生物会带有绿色调。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">⛰️</span>
              <div>
                <strong className="font-medium">山脉 (灰色)</strong>
                <p className="text-slate-600">生物不能跳过或通过山脉，会被阻挡。如果生物生成在山脉上，移动速度会大幅降低（基础的30%）。不能在山脉上生成食物。饥饿消耗加快（150%），但健康恢复率高（1.5%/帧）。生物会带有灰色调。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌾</span>
              <div>
                <strong className="font-medium">平原 (浅绿色)</strong>
                <p className="text-slate-600">食物生成率适中（基础的1.1倍），生物移动速度最快（基础的1.3倍），捕食者在此区域能发挥最大优势，适合快速移动和捕猎。饥饿消耗正常，较高的繁殖概率（130%），轻微健康恢复。生物会带有草原绿色调。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🏞️</span>
              <div>
                <strong className="font-medium">地形适应性</strong>
                <p className="text-slate-600">不同地形会影响生物的移动能力、速度、饥饿消耗、繁殖概率、健康恢复和食物检测能力。山脉区域有通行限制，生物无法通过这些障碍。海洋区域生物可以通过，但有其他特殊影响。每种地形都有独特的生态特性，影响生物的生存策略。</p>
              </div>
            </div>
            
            <Separator className="my-4 md:col-span-2" />
            
            {/* 交互控制 */}
            <div className="flex items-start">
              <span className="text-2xl mr-2">🔍</span>
              <div>
                <strong className="font-medium">缩放功能</strong>
                <p className="text-slate-600">将鼠标悬停在沙盒区域内，按住Ctrl键并滚动鼠标滚轮可以放大或缩小视图。缩放限制为1x-3x，以鼠标位置为中心进行缩放。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🖱️</span>
              <div>
                <strong className="font-medium">拖动平移</strong>
                <p className="text-slate-600">视图放大后，可以点击并拖动鼠标来平移沙盒视角，鼠标光标会变成抓取状态指示可拖动。</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🔄</span>
              <div>
                <strong className="font-medium">重置视角</strong>
                <p className="text-slate-600">使用控制面板中的"重置视角"按钮可以一键将地图恢复到原始比例和位置。</p>
              </div>
            </div>
            
            {/* 分隔线 */}
            <Separator className="my-4 md:col-span-2" />
            
            {/* 操作指南 */}
            <div className="flex items-start md:col-span-2">
              <span className="text-2xl mr-2">🎮</span>
              <div>
                <strong className="font-medium">操作指南</strong>
                <p className="text-slate-600">点击沙盒区域添加生物，使用控制面板调整速度、添加/重置生物和食物，以及控制生态系统状态。</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};