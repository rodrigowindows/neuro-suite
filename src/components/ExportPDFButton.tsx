import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface ReportSection {
  title: string;
  content: string;
}

interface ExportPDFButtonProps {
  reportTitle: string;
  sections: ReportSection[];
  stats?: { label: string; value: string }[];
  footer?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export default function ExportPDFButton({ reportTitle, sections, stats, footer, variant = 'outline', size = 'sm' }: ExportPDFButtonProps) {
  const exportAsHTML = () => {
    const now = new Date().toLocaleDateString('pt-BR');
    
    const statsHtml = stats ? `
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin:16px 0;">
        ${stats.map(s => `
          <div style="text-align:center;padding:12px;background:#f4f6f8;border-radius:8px;">
            <div style="font-size:22px;font-weight:700;color:#1a7a7a;">${s.value}</div>
            <div style="font-size:11px;color:#666;">${s.label}</div>
          </div>
        `).join('')}
      </div>
    ` : '';

    const sectionsHtml = sections.map(s => `
      <div style="margin-bottom:20px;">
        <h2 style="font-size:14px;font-weight:700;color:#1a3a4a;border-bottom:2px solid #1a7a7a;padding-bottom:4px;margin-bottom:8px;">${s.title}</h2>
        <div style="font-size:12px;color:#333;line-height:1.7;white-space:pre-line;">${s.content}</div>
      </div>
    `).join('');

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${reportTitle}</title>
  <style>
    @media print { body { margin: 0; } @page { margin: 1.5cm; } }
    body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 32px; color: #222; }
  </style>
</head>
<body>
  <div style="display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #1a7a7a;padding-bottom:12px;margin-bottom:20px;">
    <div>
      <h1 style="margin:0;font-size:20px;color:#1a3a4a;">${reportTitle}</h1>
      <p style="margin:4px 0 0;font-size:11px;color:#888;">Gerado por NeuroSuite · ${now}</p>
    </div>
    <div style="font-size:24px;font-weight:800;color:#1a7a7a;">NS</div>
  </div>
  ${statsHtml}
  ${sectionsHtml}
  ${footer ? `<div style="margin-top:32px;padding-top:16px;border-top:1px solid #ddd;font-size:10px;color:#999;text-align:center;">${footer}</div>` : ''}
  <script>window.onload = () => window.print();</script>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank');
    if (!w) {
      // Fallback: download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportTitle.replace(/\s/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  };

  return (
    <Button variant={variant} size={size} onClick={exportAsHTML} className="gap-1.5">
      <Download className="h-3.5 w-3.5" />
      Exportar PDF
    </Button>
  );
}
