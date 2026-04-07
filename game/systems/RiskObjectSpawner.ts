import { Fruit } from '../entities/Fruit';
import type { RiskRules } from '../config/ModeConfig';

export class RiskObjectSpawner {
  private readonly rules: RiskRules;

  constructor(rules: RiskRules) {
    this.rules = rules;
  }

  public assignVariant(fruit: Fruit) {
    if (!this.rules.enabled) {
      fruit.setVariant('normal');
      return;
    }

    const roll = Math.random();
    if (roll < this.rules.cursedChance) {
      fruit.setVariant('cursed');
      return;
    }

    if (roll < this.rules.cursedChance + this.rules.goldChance) {
      fruit.setVariant('gold');
      return;
    }

    fruit.setVariant('normal');
  }
}
