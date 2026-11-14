import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SectionTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const COCKPIT_TABS = ['bridge-console', 'checkin'];
const COUNTERMEASURE_TABS = ['neurocoach', 'gamification', 'cognitive-fatigue'];

export function SectionTabs({ activeTab, onTabChange }: SectionTabsProps) {
  if (COCKPIT_TABS.includes(activeTab)) {
    return (
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full max-w-xs grid-cols-2">
          <TabsTrigger value="bridge-console" onClick={() => onTabChange('bridge-console')}>
            Painel
          </TabsTrigger>
          <TabsTrigger value="checkin" onClick={() => onTabChange('checkin')}>
            Avaliação de Turno
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  if (COUNTERMEASURE_TABS.includes(activeTab)) {
    return (
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="neurocoach" onClick={() => onTabChange('neurocoach')}>
            AstroAssist
          </TabsTrigger>
          <TabsTrigger value="gamification" onClick={() => onTabChange('gamification')}>
            Disciplina
          </TabsTrigger>
          <TabsTrigger value="cognitive-fatigue" onClick={() => onTabChange('cognitive-fatigue')}>
            Métricas de Carga
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  return null;
}

export default SectionTabs;
