import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_DIR = join(process.cwd(), 'src');
const SCAN_DIRS = ['pages', 'components', 'hooks', 'services', 'lib'];
const EXCLUDED_PREFIXES = [
  'AIInsights',
  'DashboardRH',
  'HRAlerts',
  'NR1',
  'ROIDashboard',
  'PGR',
  'Turnover',
  'NarrativeReport',
];
const EMOJI_PATTERN = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    if (statSync(fullPath).isDirectory()) return listSourceFiles(fullPath);
    const isTsSource = ['.ts', '.tsx'].includes(extname(entry));
    const isTestFile = /\.test\./.test(entry);
    const isExcluded = EXCLUDED_PREFIXES.some((prefix) => entry.startsWith(prefix));
    return isTsSource && !isTestFile && !isExcluded ? [fullPath] : [];
  });
}

function findEmojiLines(filePath: string): string[] {
  const lines = readFileSync(filePath, 'utf-8').split(/\r?\n/);
  return lines.flatMap((line, index) =>
    EMOJI_PATTERN.test(line) ? [`${filePath}:${index + 1}`] : [],
  );
}

describe('UI sem emoji', () => {
  it('nenhum arquivo de pages/components/hooks/services/lib contém emoji (exceto os excluídos)', () => {
    const files = SCAN_DIRS.flatMap((dir) => listSourceFiles(join(SRC_DIR, dir)));
    const offenders = files.flatMap(findEmojiLines);

    expect(
      offenders,
      `Emoji encontrado em:\n${offenders.join('\n')}`,
    ).toEqual([]);
  });
});
