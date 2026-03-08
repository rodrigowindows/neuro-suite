import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Activity, MessageCircle, Trophy, Users, Zap, Target, Shield, ArrowRight, Star, TrendingUp, Brain, ChevronDown, HeartPulse, BarChart3, FileText, Bell, Sparkles, CalendarCheck } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import neuroSuiteLogo from '@/assets/neurosuite-logo.jpg';
import { FEEDBACK_FORM_URL, APP_CONFIG } from '@/lib/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.12, duration: 0.6, ease: "easeOut" as const } }),
};

const features = [
  { icon: Activity, title: 'Scan Webcam Inteligente', desc: 'Detecta piscadas + HRV sem pulseira. Análise precisa do nível de estresse em tempo real com tecnologia de ponta.', stat: '60s', statLabel: 'scan rápido' },
  { icon: MessageCircle, title: 'Coach IA Personalizado', desc: 'Respiração 4-7-8, PNL e neurociência — coaching adaptativo que evolui com você a cada sessão.', stat: '24/7', statLabel: 'disponível' },
  { icon: Trophy, title: 'Gamificação Envolvente', desc: 'Badges, streaks 🔥 e rankings. Transforme o cuidado com bem-estar em um hábito recompensador.', stat: '12+', statLabel: 'conquistas' },
  { icon: Users, title: 'Dashboard RH Preditivo', desc: 'Predição de burnout, métricas de equipe e insights acionáveis para reduzir turnover em até 30%.', stat: '30%', statLabel: 'menos turnover' },
];

const testimonials = [
  { text: '"O scan detectou meu estresse antes de eu perceber. O coach IA me deu ferramentas práticas que uso todo dia."', name: 'João Silva', role: 'Analista de RH, Tech Corp', stars: 5 },
  { text: '"Gerencio estresse de forma científica agora. Os badges me motivam a manter a consistência."', name: 'Maria Oliveira', role: 'Desenvolvedora, StartupXYZ', stars: 5 },
  { text: '"Reduzimos 25% do absenteísmo em 3 meses. Os insights preditivos são game-changer."', name: 'Carlos Mendes', role: 'Diretor de Pessoas, FinanceGroup', stars: 5 },
];

const stats = [
  { value: '10k+', label: 'Scans Realizados', icon: Brain },
  { value: '94%', label: 'Satisfação', icon: Star },
  { value: '-30%', label: 'Turnover', icon: TrendingUp },
  { value: 'NR-1', label: 'Compliant', icon: Shield },
];

const modules = [
  { icon: CalendarCheck, title: 'Check-in Diário', desc: 'Triagem emocional de 30s com IA que gera micro-coaching personalizado baseado no humor e energia.', tag: 'Colaborador' },
  { icon: Activity, title: 'NeuroScore', desc: 'Scan facial via webcam detecta piscadas e estima HRV para calcular nível de estresse sem wearable.', tag: 'Colaborador' },
  { icon: MessageCircle, title: 'NeuroCoach IA', desc: 'Coach de alta performance com PNL, neurociência e respiração 4-7-8 adaptado ao seu nível de estresse.', tag: 'Colaborador' },
  { icon: Trophy, title: 'Gamificação', desc: 'Streaks, badges e rankings que transformam o cuidado com bem-estar em hábito motivador.', tag: 'Colaborador' },
  { icon: HeartPulse, title: 'Mini Meditação', desc: 'Sessões guiadas de 2 minutos ativadas automaticamente quando HRV está baixo.', tag: 'Colaborador' },
  { icon: BarChart3, title: 'Dashboard RH', desc: 'Visão agregada e anônima da equipe com distribuição de estresse, HRV médio e análise preditiva.', tag: 'Gestor' },
  { icon: Brain, title: 'IA Insights', desc: 'Predição de burnout, análise de sentimento e geração automática de relatório PGR (NR-1).', tag: 'Gestor' },
  { icon: Bell, title: 'Alertas Proativos', desc: 'Notificações inteligentes quando colaboradores atingem estresse crítico por dias consecutivos.', tag: 'Gestor' },
  { icon: TrendingUp, title: 'Predição de Turnover', desc: 'IA analisa padrões da equipe e estima risco de rotatividade com impacto financeiro.', tag: 'Gestor' },
  { icon: Shield, title: 'NR-1 Compliance', desc: 'Geração automática de relatório PGR com inventário de riscos e plano de ação técnico.', tag: 'Compliance' },
  { icon: FileText, title: 'Relatório PDF', desc: 'Exportação completa de métricas, gráficos e histórico de bem-estar para documentação.', tag: 'Compliance' },
  { icon: Sparkles, title: 'Coaching Liderança', desc: 'Módulo premium de desenvolvimento de liderança com IA para gestores e C-level.', tag: 'Premium' },
];

export default function Index() {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Sticky Nav */}
      <header className="border-b bg-card/80 backdrop-blur-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3 flex items-center justify-between max-w-6xl" aria-label="Navegação principal">
          <div className="flex items-center gap-3">
            <img src={neuroSuiteLogo} alt="NeuroSuite" className="h-10 sm:h-12 w-auto object-contain rounded-lg" loading="eager" width={48} height={48} />
            <span className="font-display font-bold text-lg hidden sm:block">NeuroSuite</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth' })} className="hidden md:flex">
              Benefícios
            </Button>
            <Button variant="ghost" size="sm" onClick={() => document.getElementById('modulos')?.scrollIntoView({ behavior: 'smooth' })} className="hidden md:flex">
              Módulos
            </Button>
            <Button variant="ghost" size="sm" onClick={() => document.getElementById('depoimentos')?.scrollIntoView({ behavior: 'smooth' })} className="hidden md:flex">
              Depoimentos
            </Button>
            <Button onClick={() => navigate('/auth')} className="gap-2 shadow-elegant">
              Entrar <ArrowRight className="h-4 w-4" />
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
              <Zap className="h-4 w-4" /> Beta Gratuita — Acesso Limitado
            </motion.div>

            <motion.h1 variants={fadeUp} custom={1} id="hero-heading" className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6">
              Detecte Estresse via Webcam em{' '}
              <span className="text-gradient">60 segundos</span>
            </motion.h1>

            <motion.p variants={fadeUp} custom={2} className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              IA analisa piscadas + HRV, coach personalizado com PNL e neurociência.
              <span className="font-semibold text-foreground"> Reduza turnover 30% e mantenha NR-1 compliance.</span>
            </motion.p>

            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8 py-6 shadow-elegant hover:shadow-glow transition-all">
                Começar Grátis 🚀
              </Button>
              <Button size="lg" variant="outline" onClick={() => document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth' })} className="text-lg px-8 py-6">
                Ver Benefícios
              </Button>
            </motion.div>

            <motion.p variants={fadeUp} custom={4} className="text-[11px] text-muted-foreground max-w-md mx-auto">
              ⚠️ ATENÇÃO — NÃO SUBSTITUI TERAPIA. Ferramenta de apoio ao bem-estar corporativo.
            </motion.p>

            <motion.div variants={fadeUp} custom={5} className="mt-12">
              <ChevronDown className="h-6 w-6 text-muted-foreground mx-auto animate-bounce" />
            </motion.div>
          </motion.div>
        </motion.section>

        {/* Stats Bar */}
        <section className="border-y bg-card/50 backdrop-blur-sm py-8">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                  <s.icon className="h-6 w-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl sm:text-3xl font-display font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
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
                Tudo que você precisa para Alta Performance 💪
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Neurociência + IA integradas em uma plataforma completa de wellness corporativo.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-5">
              {features.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}>
                  <Card className="h-full hover:shadow-elegant transition-all duration-300 group border-border/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/15 transition-colors" aria-hidden="true">
                          <f.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-display font-bold text-primary">{f.stat}</p>
                          <p className="text-[10px] text-muted-foreground">{f.statLabel}</p>
                        </div>
                      </div>
                      <CardTitle className="text-lg mt-3">{f.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">{f.desc}</CardDescription>
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
                12 Módulos Integrados 🧩
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">Do colaborador ao C-level, cada módulo foi projetado com neurociência e IA para máximo impacto.</p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m, i) => {
                const tagColors: Record<string, string> = {
                  Colaborador: 'bg-primary/10 text-primary',
                  Gestor: 'bg-accent/20 text-accent-foreground',
                  Compliance: 'bg-emerald-500/10 text-emerald-600',
                  Premium: 'bg-amber-500/10 text-amber-600',
                };
                return (
                  <motion.div
                    key={m.title}
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
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-sm">{m.title}</h3>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tagColors[m.tag] || 'bg-muted text-muted-foreground'}`}>
                              {m.tag}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
              <Button size="lg" onClick={() => navigate('/auth')} className="gap-2 shadow-elegant">
                Experimentar Todos os Módulos <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="depoimentos" className="py-16 sm:py-24 bg-muted/30" aria-labelledby="testimonials-heading">
          <div className="container mx-auto px-4 max-w-5xl">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 id="testimonials-heading" className="text-3xl sm:text-4xl font-display font-bold mb-4">
                Quem Usa, Recomenda 💬
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-5">
              {testimonials.map((t, i) => (
                <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12 }}>
                  <Card className="h-full border-border/50">
                    <CardContent className="pt-6">
                      <div className="flex gap-0.5 mb-3">
                        {Array.from({ length: t.stars }).map((_, j) => (
                          <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                        ))}
                      </div>
                      <blockquote>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{t.text}</p>
                        <footer>
                          <p className="font-semibold text-sm">— {t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </footer>
                      </blockquote>
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
                  Bora Virar o Jogo? 🚀
                </h2>
                <p className="text-white/80 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                  Teste grátis agora. Neurociência + IA transformando seu bem-estar em minutos.
                </p>
                <Button size="lg" variant="secondary" onClick={() => navigate('/auth')} className="text-lg px-8 py-6 shadow-soft">
                  Começar Agora — É Grátis! 😊
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 sm:py-24 border-t" aria-label="Como funciona">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-center mb-12">Como Funciona em 3 Passos</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: '01', title: 'Scan Facial', desc: 'Ative sua webcam e faça um scan de 60 segundos. Sem pulseira, sem equipamento extra.', icon: Activity },
                { step: '02', title: 'IA Analisa', desc: 'Algoritmos de neurociência processam piscadas e HRV para calcular seu NeuroScore.', icon: Brain },
                { step: '03', title: 'Coach Ação', desc: 'Receba um plano personalizado com técnicas PNL e respiração para alta performance.', icon: Target },
              ].map((s, i) => (
                <motion.div key={s.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="text-center">
                  <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs font-bold text-primary mb-1">PASSO {s.step}</p>
                  <h3 className="font-display font-bold text-lg mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-card/50 backdrop-blur-sm" role="contentinfo">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={neuroSuiteLogo} alt="" className="h-8 w-8 rounded-md" />
                <span className="font-display font-bold">{APP_CONFIG.name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Neurociência + IA para wellness corporativo. Dados protegidos por LGPD 🔒
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Feedback</h3>
              <p className="text-sm text-muted-foreground mb-3">Sua opinião é valiosa!</p>
              <Button variant="outline" size="sm" onClick={() => window.open(FEEDBACK_FORM_URL, '_blank')}>
                Enviar Feedback
              </Button>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Contato</h3>
              <address className="text-sm text-muted-foreground not-italic space-y-1">
                <p>📧 {APP_CONFIG.contact.email}</p>
                <p>📱 {APP_CONFIG.contact.whatsapp}</p>
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
