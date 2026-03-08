import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Activity, MessageCircle, Trophy, Users, Zap, Target, Shield, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import neuroSuiteLogo from '@/assets/neurosuite-logo.jpg';
import { FEEDBACK_FORM_URL, APP_CONFIG } from '@/lib/constants';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const features = [
  { icon: Activity, title: 'Scan Webcam Inteligente', desc: 'Detecta piscadas + HRV sem pulseira usando tecnologia MIT. Análise precisa do seu nível de estresse em tempo real.', border: 'border-primary/20' },
  { icon: MessageCircle, title: 'Coach IA Personalizado', desc: '"Ei, o que te trava?" – Respiração 4-7-8, PNL e técnicas de neurociência pra você alcançar pico de energia.', border: 'border-secondary/20' },
  { icon: Trophy, title: 'Gamificação Envolvente', desc: 'Conquiste badges "Zen Master", mantenha streaks 🔥 diários e transforme bem-estar em hábito.', border: 'border-accent/20' },
  { icon: Users, title: 'Dashboard RH Preditivo', desc: 'Predições de burnout, métricas de bem-estar da equipe e insights acionáveis pra reduzir turnover.', border: 'border-primary/20' },
];

const testimonials = [
  { text: '"Mudou minha semana! O scan detectou meu estresse antes mesmo de eu perceber. O coach IA me deu ferramentas práticas que uso todo dia."', name: 'João Silva', role: 'Analista de RH, Tech Corp', gradient: 'from-primary/5 to-secondary/5' },
  { text: '"Finalmente consigo gerenciar meu estresse de forma científica. Os badges me motivam a manter a consistência. ON FIRE! 🔥"', name: 'Maria Oliveira', role: 'Desenvolvedora, StartupXYZ', gradient: 'from-secondary/5 to-accent/5' },
  { text: '"Dashboard RH transformou nossa gestão de bem-estar. Reduzimos 25% do absenteísmo em 3 meses com insights preditivos."', name: 'Carlos Mendes', role: 'Diretor de Pessoas, FinanceGroup', gradient: 'from-accent/5 to-primary/5' },
];

const highlights = [
  { icon: Zap, title: 'Resultados em 60s', desc: 'Scan rápido via webcam + análise instantânea do seu estado de estresse' },
  { icon: Target, title: 'Planos Personalizados', desc: 'Coach IA cria estratégias sob medida com PNL e neurociência aplicada' },
  { icon: Shield, title: 'NR-1 Compliant', desc: 'Conformidade total com normas de gestão de riscos psicossociais' },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <nav className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between" aria-label="Navegação principal">
          <div className="flex items-center gap-3">
            <img
              src={neuroSuiteLogo}
              alt="NeuroSuite - Plataforma de Wellness Corporativo"
              className="h-10 sm:h-12 md:h-14 w-auto object-contain"
              loading="eager"
              width={56}
              height={56}
            />
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="hidden sm:flex gap-2">
            Entrar <ArrowRight className="h-4 w-4" />
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-8 sm:py-12 md:py-16 max-w-6xl">
        {/* Hero */}
        <motion.section
          initial="hidden"
          animate="visible"
          className="text-center mb-12 sm:mb-16 md:mb-20 space-y-4 sm:space-y-6"
          aria-labelledby="hero-heading"
        >
          <motion.h1
            variants={fadeUp}
            custom={0}
            id="hero-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight px-2"
          >
            Detecção de Estresse via Webcam em <span className="bg-gradient-hero bg-clip-text text-transparent">60 segundos! 🚀</span>
          </motion.h1>
          <motion.p variants={fadeUp} custom={1} className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto px-4">
            Webcam lê piscadas + HRV, IA coach te dá plano PNL pra alta performance.
            <span className="font-semibold text-foreground"> Reduz turnover 30%, NR-1 compliant.</span>
          </motion.p>
          <motion.div variants={fadeUp} custom={2} className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 sm:pt-6 px-4">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-elegant hover:shadow-glow transition-all w-full sm:w-auto"
            >
              Teste Grátis Agora 😊
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => document.getElementById('beneficios')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto"
            >
              Saiba Mais
            </Button>
          </motion.div>
        </motion.section>

        {/* Features */}
        <section id="beneficios" className="mb-12 sm:mb-16 md:mb-20 px-4" aria-labelledby="features-heading">
          <h2 id="features-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            Como o NeuroSuite Transforma Seu Bem-Estar 💪
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className={`${f.border} hover:shadow-elegant transition-all h-full`}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-gradient-hero rounded-lg flex-shrink-0" aria-hidden="true">
                        <f.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle>{f.title}</CardTitle>
                        <CardDescription className="mt-2">{f.desc}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-12 sm:mb-16 md:mb-20 px-4" aria-labelledby="testimonials-heading">
          <h2 id="testimonials-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            O Que Nossos Usuários Dizem 💬
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className={`bg-gradient-to-br ${t.gradient} h-full`}>
                  <CardContent className="pt-6">
                    <blockquote>
                      <p className="text-muted-foreground italic mb-4">{t.text}</p>
                      <footer>
                        <p className="font-semibold">— {t.name}</p>
                        <p className="text-sm text-muted-foreground">{t.role}</p>
                      </footer>
                    </blockquote>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center mb-12 sm:mb-16 md:mb-20 p-6 sm:p-8 md:p-12 bg-gradient-hero rounded-xl sm:rounded-2xl shadow-elegant mx-4" aria-labelledby="cta-heading">
          <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
            Bora Virar o Jogo? 🚀
          </h2>
          <p className="text-white/90 text-sm sm:text-base md:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-2">
            Teste grátis agora e descubra como neurociência + IA podem transformar seu bem-estar e performance em minutos.
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => navigate('/auth')}
            className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-soft w-full sm:w-auto"
          >
            Começar Agora — É Grátis! 😊
          </Button>
        </section>

        {/* Highlights */}
        <section className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 md:mb-20 px-4" aria-label="Destaques do produto">
          {highlights.map((h, i) => (
            <motion.div key={h.title} className="text-center space-y-3" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
              <div className="mx-auto w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center" aria-hidden="true">
                <h.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-semibold text-lg">{h.title}</h3>
              <p className="text-sm text-muted-foreground">{h.desc}</p>
            </motion.div>
          ))}
        </section>
      </main>

      <footer className="border-t bg-card/50 backdrop-blur-sm" role="contentinfo">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Testou? Dê seu Feedback! 💭</h3>
              <p className="text-muted-foreground mb-4">
                Sua opinião é valiosa! Ajude-nos a evoluir o NeuroSuite.
              </p>
              <Button variant="outline" onClick={() => window.open(FEEDBACK_FORM_URL, '_blank')}>
                Enviar Feedback
              </Button>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-4">Contato</h3>
              <p className="text-muted-foreground mb-2">Dúvidas ou quer saber mais?</p>
              <address className="text-muted-foreground not-italic space-y-1">
                <p>📧 {APP_CONFIG.contact.email}</p>
                <p>📱 {APP_CONFIG.contact.whatsapp}</p>
              </address>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p className="mb-2">{APP_CONFIG.name} v{APP_CONFIG.version} (Beta) | {APP_CONFIG.company}</p>
            <p>Neurociência + IA para Wellness Corporativo | Dados protegidos por LGPD 🔒</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
