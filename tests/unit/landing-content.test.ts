import { describe, expect, it } from 'vitest';
import { MODE_ORDER } from '../../game/config/ModeConfig';
import { featureItems, heroStats, modeCards, navigationItems, spawnMathFormulaCards } from '../../lib/landing/content';

describe('landing content', () => {
  it('keeps game mode cards aligned with the actual game mode order', () => {
    expect(modeCards.map((mode) => mode.id)).toEqual(MODE_ORDER);
  });

  it('exposes complete metadata for every rendered game mode card', () => {
    for (const mode of modeCards) {
      expect(mode.assetSrc.startsWith('/assets/')).toBe(true);
      expect(mode.description.length).toBeGreaterThan(0);
      expect(mode.metricLabel.length).toBeGreaterThan(0);
      expect(mode.previewLabel.length).toBeGreaterThan(0);
    }
  });

  it('keeps the landing sections intentionally constrained', () => {
    expect(navigationItems).toHaveLength(6);
    expect(featureItems).toHaveLength(6);
    expect(heroStats).toHaveLength(3);
  });

  it('stores spawn formulas as markdown-ready math content', () => {
    for (const formulaCard of spawnMathFormulaCards) {
      expect(formulaCard.formulaMarkdown.startsWith('$$')).toBe(true);
      expect(formulaCard.noteMarkdown.length).toBeGreaterThan(0);
    }
  });
});
