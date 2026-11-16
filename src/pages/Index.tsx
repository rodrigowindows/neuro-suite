import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { Activity, MessageCircle, Trophy, Rocket, Zap, Target, Shield, ArrowRight, Brain, ChevronDown, Moon, Dumbbell, Bell, Sparkles, CalendarCheck, Orbit, Eye } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import neuroSuiteLogo from '@/assets/neurosuite-logo.jpg';
import { APP_CONFIG } from '@/lib/constants';
import { useI18n } from '@/i18n';
import LanguageToggle from '@/components/LanguageToggle';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const } }),
};

const features = [
  { icon: Eye, titleKey: 'landing.features.fatigue.title', descKey: 'landing.features.fatigue.desc' },
  { icon: MessageCircle, titleKey: 'landing.features.astroAssist.title', descKey: 'landing.features.astroAssist.desc' },
  { icon: Trophy, titleKey: 'landing.features.discipline.title', descKey: 'landing.features.discipline.desc' },
  { icon: Rocket, titleKey: 'landing.features.commandDeck.title', descKey: 'landing.features.commandDeck.desc' },
];

const contextCards = [
  { icon: Orbit, titleKey: 'landing.context.latency.title', descKey: 'landing.context.latency.desc' },
  { icon: Moon, titleKey: 'landing.context.isolation.title', descKey: 'landing.context.isolation.desc' },
  { icon: Dumbbell, titleKey: 'landing.context.microgravity.title', descKey: 'landing.context.microgravity.desc' },
];

const stats = [
  { valueKey: 'landing.stats.rls.value', labelKey: 'landing.stats.rls.label', icon: Shield },
  { valueKey: 'landing.stats.autonomous.value', labelKey: 'landing.stats.autonomous.label', icon: Orbit },
  { valueKey: 'landing.stats.webcam.value', labelKey: 'landing.stats.webcam.label', icon: Eye },
  { valueKey: 'landing.stats.dss.value', labelKey: 'landing.stats.dss.label', icon: Brain },
];

const modules = [
  { icon: CalendarCheck, titleKey: 'landing.modules.readiness.title', descKey: 'landing.modules.readiness.desc', tagKey: 'crew' as const },
  { icon: Activity, titleKey: 'landing.modules.bioscore.title', descKey: 'landing.modules.bioscore.desc', tagKey: 'crew' as const },
  { icon: MessageCircle, titleKey: 'landing.modules.astroassist.title', descKey: 'landing.modules.astroassist.desc', tagKey: 'crew' as const },
  { icon: Trophy, titleKey: 'landing.modules.discipline.title', descKey: 'landing.modules.discipline.desc', tagKey: 'crew' as const },
  { icon: Moon, titleKey: 'landing.modules.sleep.title', descKey: 'landing.modules.sleep.desc', tagKey: 'crew' as const },
  { icon: Dumbbell, titleKey: 'landing.modules.exercise.title', descKey: 'landing.modules.exercise.desc', tagKey: 'crew' as const },
  { icon: Brain, titleKey: 'landing.modules.insights.title', descKey: 'landing.modules.insights.desc', tagKey: 'command' as const },
  { icon: Bell, titleKey: 'landing.modules.alerts.title', descKey: 'landing.modules.alerts.desc', tagKey: 'command' as const },
  { icon: Sparkles, titleKey: 'landing.modules.commandSupport.title', descKey: 'landing.modules.commandSupport.desc', tagKey: 'command' as const },
];

const steps = [
  { step: '01', badgeKey: 'landing.howItWorks.step1.badge', titleKey: 'landing.howItWorks.step1.title', descKey: 'landing.howItWorks.step1.desc', icon: Eye },
  { step: '02', badgeKey: 'landing.howItWorks.step2.badge', titleKey: 'landing.howItWorks.step2.title', descKey: 'landing.howItWorks.step2.desc', icon: Brain },
  { step: '03', badgeKey: 'landing.howItWorks.step3.badge', titleKey: 'landing.howItWorks.step3.title', descKey: 'landing.howItWorks.step3.desc', icon: Target },
];

export default function Index() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sticky Nav */}
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between max-w-6xl" aria-label={t('landing.nav.aria')}>
          <div className="flex items-center gap-3">
            <img src={neuroSuiteLogo} alt="CrewVitals" className="h-10 sm:h-12 w-auto object-contain rounded-lg" loading="eager" width={48} height={48} />
            <span className="font-display font-bold text-lg">CrewVitals</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth' })} className="hidden md:flex">
              {t('landing.nav.features')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => document.getElementById('modulos')?.scrollIntoView({ behavior: 'smooth' })} className="hidden md:flex">
              {t('landing.nav.systems')}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' })} className="hidden md:flex">
              {t('landing.nav.context')}
            </Button>
            <LanguageToggle />
            <Button onClick={() => navigate('/auth')} className="gap-2 shadow-elegant">
              {t('landing.nav.access')} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="relative py-16 sm:py-24 md:py-32 overflow-hidden"
          aria-labelledby="hero-heading"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
          <div className="absolute top-20 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 -right-32 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />

          <motion.div initial="hidden" animate="visible" className="container mx-auto px-4 max-w-5xl text-center relative z-10">
            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="h-4 w-4" /> {t('landing.hero.badge')}
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
              {t('landing.hero.title')}{' '}
              <span className="text-gradient">{t('landing.hero.titleHighlight')}</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              {t('landing.hero.subtitle')}
              <span className="font-semibold text-foreground">{t('landing.hero.subtitleBold')}</span>
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
              <Button
                asChild
                size="lg"
                className="text-lg px-8 py-6 min-h-[44px] shadow-elegant hover:shadow-glow transition-all"
              >
                <Link to="/demo">{t('landing.hero.demoButton')}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6 min-h-[44px]"
              >
                {t('landing.hero.startMissionButton')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-6 min-h-[44px]"
              >
                {t('landing.hero.viewFeaturesButton')}
              </Button>
            </motion.div>

            <motion.p variants={fadeUp} custom={4} className="text-xs text-muted-foreground max-w-md mx-auto mb-2">
              {t('landing.hero.demoDisclaimer')}
            </motion.p>

            <motion.p variants={fadeUp} custom={5} className="text-[11px] text-muted-foreground max-w-md mx-auto">
              {t('landing.hero.medicalDisclaimer')}
            </motion.p>

            <motion.div variants={fadeUp} custom={6} className="mt-12">
              <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto animate-bounce" />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Stats Bar */}
        <section className="border-y bg-card/50 backdrop-blur-sm py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s) => (
                <motion.div key={s.valueKey} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="text-center">
                  <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-display font-bold">{t(s.valueKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(s.labelKey)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="beneficios" className="py-16 sm:py-24" aria-labelledby="features-heading">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 id="features-heading" className="text-3xl sm:text-4xl font-display font-bold mb-4">
                {t('landing.features.heading')}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t('landing.features.subheading')}</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <motion.div key={f.titleKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                  <Card className="h-full hover:shadow-elegant transition-all duration-300 group border-border/50">
                    <CardHeader className="pb-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg w-fit group-hover:bg-primary/15 transition-colors" aria-hidden="true">
                        <f.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg mt-3">{t(f.titleKey)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">{t(f.descKey)}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section id="modulos" className="py-16 sm:py-24 bg-muted/30" aria-labelledby="modules-heading">
          <div className="container mx-auto px-4 max-w-6xl">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 id="modules-heading" className="text-3xl sm:text-4xl font-display font-bold mb-4">
                {t('landing.modules.heading')}
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{t('landing.modules.subheading')}</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m, i) => {
                const tagColors: Record<'crew' | 'command', string> = {
                  crew: 'bg-primary/10 text-primary',
                  command: 'bg-accent/20 text-accent-foreground',
                };
                return (
                  <motion.div
                    key={m.titleKey}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, duration: 0.4 }}
                  >
                    <Card className="h-full border-border/50 hover:shadow-soft transition-all duration-300">
                      <CardContent className="p-4 flex gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg h-fit shrink-0">
                          <m.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{t(m.titleKey)}</h3>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tagColors[m.tagKey] || 'bg-muted text-muted-foreground'}`}>
                              {t(m.tagKey === 'crew' ? 'landing.modules.tag.crew' : 'landing.modules.tag.command')}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{t(m.descKey)}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
              <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 shadow-elegant">
                {t('landing.modules.exploreButton')} <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Contexto da missão */}
        <section id="depoimentos" className="py-16 sm:py-24 bg-muted/30" aria-labelledby="contexto-heading">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 id="contexto-heading" className="text-3xl sm:text-4xl font-display font-bold mb-4">
                {t('landing.context.heading')}
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              {contextCards.map((c, i) => (
                <motion.div key={c.titleKey} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                  <Card className="h-full border-border/50">
                    <CardHeader className="pb-3">
                      <div className="p-2.5 bg-primary/10 rounded-lg w-fit" aria-hidden="true">
                        <c.icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base mt-3">{t(c.titleKey)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">{t(c.descKey)}</CardDescription>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 sm:py-24" aria-labelledby="cta-heading">
          <div className="container mx-auto px-4 max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-2xl overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-hero" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_60%)]" />
              <div className="relative z-10 text-center py-12 sm:py-16 px-6 sm:px-12">
                <h2 id="cta-heading" className="text-3xl sm:text-4xl font-display font-bold text-white mb-4">
                  {t('landing.cta.heading')}
                </h2>
                <p className="text-white/80 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                  {t('landing.cta.subheading')}
                </p>
                <Button size="lg" variant="secondary" onClick={() => navigate('/auth')} className="text-lg px-8 py-6 shadow-soft">
                  {t('landing.cta.button')}
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24 border-t" aria-label={t('landing.howItWorks.aria')}>
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-12">{t('landing.howItWorks.heading')}</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-bold text-primary mb-1">{t(s.badgeKey)}</p>
                  <h3 className="font-display font-bold text-lg mb-2">{t(s.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">{t(s.descKey)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card/50 backdrop-blur-sm" role="contentinfo">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={neuroSuiteLogo} alt="" className="h-8 w-8 rounded-md" />
                <span className="font-display font-bold">{APP_CONFIG.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('landing.footer.privacy')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">{t('landing.footer.contact')}</h3>
              <address className="text-sm text-muted-foreground not-italic space-y-1">
                <p>{APP_CONFIG.contact.email}</p>
                <p>{APP_CONFIG.contact.whatsapp}</p>
              </address>
            </div>
          </div>
          <div className="border-t pt-6 text-center text-xs text-muted-foreground">
            <p>{APP_CONFIG.name} v{APP_CONFIG.version} (Beta) · {APP_CONFIG.company}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
