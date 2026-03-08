import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeBannerProps {
  displayName: string;
}

export default function WelcomeBanner({ displayName }: WelcomeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const greeting = displayName ? `Olá, ${displayName}! 👋` : 'Bem-vindo ao NeuroSuite! 👋';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-lg border border-primary/20 bg-primary/5 p-4 mb-4"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground"
          onClick={() => setDismissed(true)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-start gap-3 pr-6">
          <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Sparkles className="h-4.5 w-4.5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-bold text-sm text-foreground">{greeting}</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Comece fazendo seu primeiro <strong>NeuroScore</strong> — um scan facial rápido que estima seu nível de estresse usando neurociência. É seguro, privado e leva menos de 30 segundos.
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
