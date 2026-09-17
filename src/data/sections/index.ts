import type { SectionModule } from '../pages/types';

/**
 * Registry of multi-page sections (compare/, use-cases/).
 * Each *.ts file in this folder must default-export a SectionModule.
 */
const modules = import.meta.glob('./*.ts', { eager: true }) as Record<string, { default?: SectionModule }>;

export const SECTIONS: Record<string, SectionModule> = {};

for (const [path, mod] of Object.entries(modules)) {
  if (path.endsWith('/index.ts')) continue;
  const name = path.replace(/^\.\//, '').replace(/\.ts$/, '');
  const section = mod?.default;
  if (!section?.items) throw new Error(`section ${name} must default-export a SectionModule with items`);
  SECTIONS[name] = section;
}

export function sectionItem(section: string, slug: string) {
  return SECTIONS[section]?.items.find((i) => i.slug === slug);
}

export const SECTION_NAMES = Object.keys(SECTIONS);
