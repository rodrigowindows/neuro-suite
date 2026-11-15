-- NÃO APLICADO. Rodar só com aprovação do dono.
-- Alvo: public.stress_scans (PCS-005)
-- Objetivo: limitar blink_rate e hrv_value aos intervalos fisiológicos.
-- Ordem: 1) medir violações  2) ADD CONSTRAINT ... NOT VALID (não varre a tabela)  3) VALIDATE (opcional, após limpar dados).

-- 1) Contar linhas que violariam as constraints (somente leitura)
SELECT
  count(*) FILTER (WHERE blink_rate < 0 OR blink_rate > 120)                                  AS blink_rate_violacoes,
  count(*) FILTER (WHERE hrv_value IS NOT NULL AND (hrv_value < 10 OR hrv_value > 250))        AS hrv_value_violacoes,
  count(*)                                                                                    AS total_linhas
FROM public.stress_scans;

-- 2) Aplicar sem validar linhas existentes (NOT VALID): só novas inserções/atualizações são checadas
ALTER TABLE public.stress_scans
  ADD CONSTRAINT check_blink_rate_physiological CHECK (blink_rate >= 0 AND blink_rate <= 120) NOT VALID,
  ADD CONSTRAINT check_hrv_value_physiological CHECK (hrv_value IS NULL OR (hrv_value >= 10 AND hrv_value <= 250)) NOT VALID;

-- 3) Validar linhas antigas. Descomentar somente se o passo 1 retornar zero violações
--    ou após a limpeza aprovada pelo dono.
-- ALTER TABLE public.stress_scans VALIDATE CONSTRAINT check_blink_rate_physiological;
-- ALTER TABLE public.stress_scans VALIDATE CONSTRAINT check_hrv_value_physiological;
