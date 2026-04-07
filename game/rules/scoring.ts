import type { ComboRules, ModeConfig, RiskRules } from '../config/ModeConfig';

export type RiskVariant = 'normal' | 'gold' | 'cursed';

export interface FruitScoreInput {
  baseScore: number;
  isCritical: boolean;
  precisionMultiplier: number;
  streakMultiplier: number;
  modeConfig: ModeConfig;
  variant: RiskVariant;
}

export interface FruitScoreBreakdown {
  criticalBasePoints: number;
  precisionAdjustedPoints: number;
  variantModifier: number;
  finalPoints: number;
}

export function getVariantModifier(variant: RiskVariant, riskRules: RiskRules): number {
  if (!riskRules.enabled) return 0;
  if (variant === 'gold') return riskRules.goldBonus;
  if (variant === 'cursed') return -riskRules.cursedPenalty;
  return 0;
}

export function calculateFruitSliceScore(input: FruitScoreInput): FruitScoreBreakdown {
  const criticalBasePoints = input.isCritical
    ? input.baseScore * input.modeConfig.scoring.criticalMultiplier
    : input.baseScore;

  const precisionAdjustedPoints = criticalBasePoints * input.precisionMultiplier;
  const variantModifier = getVariantModifier(input.variant, input.modeConfig.risk);
  const preMultiplierPoints = precisionAdjustedPoints + variantModifier;

  return {
    criticalBasePoints,
    precisionAdjustedPoints,
    variantModifier,
    finalPoints: Math.round(
      preMultiplierPoints *
        input.streakMultiplier *
        input.modeConfig.scoring.modeMultiplier,
    ),
  };
}

export function calculateComboBonus(count: number, comboRules: ComboRules): number {
  if (count < comboRules.minSlices) return 0;
  const pointsPerFruit = comboRules.comboOnly
    ? comboRules.comboOnlyBonusPerFruit
    : comboRules.bonusPerFruit;
  return count * pointsPerFruit;
}
