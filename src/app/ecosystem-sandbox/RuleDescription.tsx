import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/contexts/I18nContext';

// 规则说明组件 - 提取自主页面，实现关注点分离
export const RuleDescription = () => {
  const { t } = useI18n();
  return (
    <div className="max-w-7xl mx-auto w-full mt-6">
      <Card className="overflow-hidden">
        <div className="p-4 bg-slate-50 text-center">
          <h3 className="text-lg font-medium inline-flex items-center">
            <span className="text-2xl mr-2">📋</span>
            {t('ecosystemSandboxPage.rulesTitle')}
          </h3>
          <p className="text-sm text-slate-600 mt-2">{t('ecosystemSandboxPage.rulesSubtitle')}</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {/* 基础机制 */}
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌟</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.hungerMechanism')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.hungerMechanismDesc')}</p>
              </div>
            </div>
            
            <Separator className="my-4 md:col-span-2" />
            
            {/* 生物类型 */}
            <div className="flex items-start">
              <span className="text-2xl mr-2">🍃</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.basicOrganism')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.basicOrganismDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🐺</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.predator')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.predatorDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🦅</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.scavenger')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.scavengerDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🦋</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.evolution')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.evolutionDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">💀</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.deathCycle')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.deathCycleDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">💞</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.reproduction')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.reproductionDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">👪</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.inheritance')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.inheritanceDesc')}</p>
              </div>
            </div>
            
            <Separator className="my-4 md:col-span-2" />
            
            {/* 地形效果 */}
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌊</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.ocean')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.oceanDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🏖️</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.beach')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.beachDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌲</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.forest')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.forestDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">⛰️</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.mountain')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.mountainDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🌾</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.plains')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.plainsDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🏞️</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.terrainAdaptation')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.terrainAdaptationDesc')}</p>
              </div>
            </div>
            
            <Separator className="my-4 md:col-span-2" />
            
            {/* 交互控制 */}
            <div className="flex items-start">
              <span className="text-2xl mr-2">🔍</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.zoomFeature')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.zoomFeatureDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🖱️</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.dragPan')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.dragPanDesc')}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <span className="text-2xl mr-2">🔄</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.resetViewDesc')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.resetViewDescDesc')}</p>
              </div>
            </div>
            
            {/* 分隔线 */}
            <Separator className="my-4 md:col-span-2" />
            
            {/* 操作指南 */}
            <div className="flex items-start md:col-span-2">
              <span className="text-2xl mr-2">🎮</span>
              <div>
                <strong className="font-medium">{t('ecosystemSandboxPage.operationGuide')}</strong>
                <p className="text-slate-600">{t('ecosystemSandboxPage.operationGuideDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};