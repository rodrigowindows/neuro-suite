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
        <TabsList className="grid w-full max-w-xs grid-cols-2 h-11 min-h-[44px] p-1">
          <TabsTrigger
            value="bridge-console"
            onClick={() => onTabChange('bridge-console')}
            className="min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Painel
          </TabsTrigger>
          <TabsTrigger
            value="checkin"
            onClick={() => onTabChange('checkin')}
            className="min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Avaliação de Prontidão
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  if (COUNTERMEASURE_TABS.includes(activeTab)) {
    return (
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-3 h-11 min-h-[44px] p-1">
          <TabsTrigger
            value="neurocoach"
            onClick={() => onTabChange('neurocoach')}
            className="min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            AstroAssist
          </TabsTrigger>
          <TabsTrigger
            value="gamification"
            onClick={() => onTabChange('gamification')}
            className="min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Disciplina
          </TabsTrigger>
          <TabsTrigger
            value="cognitive-fatigue"
            onClick={() => onTabChange('cognitive-fatigue')}
            className="min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Métricas de Carga
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  return null;
}

export default SectionTabs;
