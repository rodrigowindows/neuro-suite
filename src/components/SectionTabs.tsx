import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useI18n } from '@/i18n';

interface SectionTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const COCKPIT_TABS = ['bridge-console', 'checkin'];
const COUNTERMEASURE_TABS = ['neurocoach', 'gamification', 'cognitive-fatigue'];

export function SectionTabs({ activeTab, onTabChange }: SectionTabsProps) {
  const { t } = useI18n();

  if (COCKPIT_TABS.includes(activeTab)) {
    return (
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full"
        aria-label={t('nav.aria.cockpitTabs')}
      >
        <TabsList
          className="grid w-full max-w-xs grid-cols-2 h-11 min-h-[44px] p-1"
          aria-label={t('nav.aria.cockpitTabs')}
        >
          <TabsTrigger
            value="bridge-console"
            onClick={() => onTabChange('bridge-console')}
            className="min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t('nav.tabs.panel')}
          </TabsTrigger>
          <TabsTrigger
            value="checkin"
            onClick={() => onTabChange('checkin')}
            className="min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t('nav.tabs.readinessAssessment')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  if (COUNTERMEASURE_TABS.includes(activeTab)) {
    return (
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="w-full"
        aria-label={t('nav.aria.countermeasureTabs')}
      >
        <TabsList
          className="grid w-full max-w-md grid-cols-3 h-11 min-h-[44px] p-1"
          aria-label={t('nav.aria.countermeasureTabs')}
        >
          <TabsTrigger
            value="neurocoach"
            onClick={() => onTabChange('neurocoach')}
            className="min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t('nav.tabs.astroAssist')}
          </TabsTrigger>
          <TabsTrigger
            value="gamification"
            onClick={() => onTabChange('gamification')}
            className="min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t('nav.tabs.discipline')}
          </TabsTrigger>
          <TabsTrigger
            value="cognitive-fatigue"
            onClick={() => onTabChange('cognitive-fatigue')}
            className="min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {t('nav.tabs.workloadMetrics')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
  }

  return null;
}

export default SectionTabs;
