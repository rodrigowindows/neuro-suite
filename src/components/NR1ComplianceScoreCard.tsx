import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNR1ComplianceScore, type ComplianceItem } from '@/hooks/useNR1ComplianceScore';

function RadialGauge({ score, color }: { score: number; color: string }) {
  const size = 120;
  const strokeWidth = 9;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color}
          strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - progress }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="font-display font-bold text-2xl text-foreground"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          {score}%
        </motion.span>
        <span className="text-[9px] text-muted-foreground font-medium">CONFORMIDADE</span>
      </div>
    </div>
  );
}

const statusConfig = {
  compliant: { icon: CheckCircle2, color: 'text-[hsl(var(--success))]', bg: 'bg-[hsl(var(--success))]/10', label: 'Conforme' },
  partial: { icon: AlertTriangle, color: 'text-[hsl(var(--warning))]', bg: 'bg-[hsl(var(--warning))]/10', label: 'Parcial' },
  non_compliant: { icon: XCircle, color: 'text-[hsl(var(--destructive))]', bg: 'bg-[hsl(var(--destructive))]/10', label: 'Não conforme' },
};

function ChecklistItem({ item }: { item: ComplianceItem }) {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[item.status];
  const Icon = config.icon;

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2.5 p-2.5 hover:bg-muted/30 transition-colors text-left"
      >
        <Icon className={`h-4 w-4 flex-shrink-0 ${config.color}`} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{item.requirement}</p>
          <p className="text-[10px] text-muted-foreground">{item.category}</p>
        </div>
        {expanded ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-2.5 pb-2.5 space-y-1 border-t pt-2">
              <p className="text-[10px] text-muted-foreground">
                <Scale className="h-3 w-3 inline mr-1" />
                {item.legalRef}
              </p>
              {item.detail && (
                <p className="text-[10px] text-muted-foreground">📋 {item.detail}</p>
              )}
              <span className={`inline-block text-[9px] font-semibold px-1.5 py-0.5 rounded ${config.color}`}>
                {config.label} • Peso: {'●'.repeat(item.weight)}{'○'.repeat(3 - item.weight)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function NR1ComplianceScoreCard() {
  const {
    score, label, color, items, compliantCount, partialCount,
    nonCompliantCount, totalItems, loading,
  } = useNR1ComplianceScore();

  if (loading) {
    return (
      <Card className="shadow-soft border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-[3px] border-primary border-t-transparent rounded-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-soft border-primary/20 bg-gradient-card overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="h-5 w-5 text-primary" />
          Score de Conformidade NR-1
        </CardTitle>
        <CardDescription className="text-xs">
          Aderência à Portaria MTE 1.419/2024 — Riscos psicossociais no PGR
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Score + Summary */}
        <div className="flex flex-col sm:flex-row items-center gap-5">
          <RadialGauge score={score} color={color} />
          <div className="flex-1 w-full space-y-3">
            <div className="text-center sm:text-left">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {label}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-[hsl(var(--success))]/10 rounded-lg">
                <p className="text-lg font-bold text-[hsl(var(--success))]">{compliantCount}</p>
                <p className="text-[9px] text-muted-foreground">Conforme</p>
              </div>
              <div className="p-2 bg-[hsl(var(--warning))]/10 rounded-lg">
                <p className="text-lg font-bold text-[hsl(var(--warning))]">{partialCount}</p>
                <p className="text-[9px] text-muted-foreground">Parcial</p>
              </div>
              <div className="p-2 bg-[hsl(var(--destructive))]/10 rounded-lg">
                <p className="text-lg font-bold text-[hsl(var(--destructive))]">{nonCompliantCount}</p>
                <p className="text-[9px] text-muted-foreground">Não conforme</p>
              </div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground">
            Checklist de Conformidade ({compliantCount}/{totalItems} itens)
          </p>
          <div className="space-y-1">
            {items.map(item => (
              <ChecklistItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
