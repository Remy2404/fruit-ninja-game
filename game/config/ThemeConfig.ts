import type { GameplayObjectId, ObjectSetId } from './ObjectConfig';
import { OBJECT_SETS } from './ObjectConfig';

export interface SliceableObjectVisualDef {
  asset: string;
  halfAsset: string;
  juiceColor: number;
}

export interface ThemeConfig {
  id: string;
  title: string;
  backgroundAsset: string;
  bombAsset: string;
  objectVisuals: Partial<Record<GameplayObjectId, SliceableObjectVisualDef>>;
  uiAccentColors: { primary: string; secondary: string; glow: string };
  splashStyle: { baseAlpha: number };
  particleStyle: { colors: number[]; scale: number };
  hasWaterOverlay: boolean;
  hasFloatingParticles: boolean;
  backgroundColor: number;
  blurStrength?: number;
}

const DEFAULT_THEME_OBJECTS: Record<GameplayObjectId, SliceableObjectVisualDef> = {
  strawberry: { asset: '/assets/strawberry.svg', halfAsset: '/assets/strawberry-half.svg', juiceColor: 0xff2255 },
  cherry: { asset: '/assets/cherry.svg', halfAsset: '/assets/cherry-half.svg', juiceColor: 0xcc0033 },
  grape: { asset: '/assets/grape.svg', halfAsset: '/assets/grape-half.svg', juiceColor: 0x8b2fc9 },
  blueberry: { asset: '/assets/blueberry.svg', halfAsset: '/assets/blueberry-half.svg', juiceColor: 0x4433cc },
  raspberry: { asset: '/assets/raspberry.svg', halfAsset: '/assets/raspberry-half.svg', juiceColor: 0xe00055 },
  apple: { asset: '/assets/apple.svg', halfAsset: '/assets/apple-half.svg', juiceColor: 0xff4444 },
  orange: { asset: '/assets/orange.svg', halfAsset: '/assets/orange-half.svg', juiceColor: 0xff9933 },
  peach: { asset: '/assets/peach.svg', halfAsset: '/assets/peach-half.svg', juiceColor: 0xffaa55 },
  plum: { asset: '/assets/plum.svg', halfAsset: '/assets/plum-half.svg', juiceColor: 0x8800aa },
  kiwi: { asset: '/assets/kiwi.svg', halfAsset: '/assets/kiwi-half.svg', juiceColor: 0x77cc22 },
  lemon: { asset: '/assets/lemon.svg', halfAsset: '/assets/lemon-half.svg', juiceColor: 0xffe000 },
  lime: { asset: '/assets/lime.svg', halfAsset: '/assets/lime-half.svg', juiceColor: 0x88ee00 },
  mango: { asset: '/assets/mango.svg', halfAsset: '/assets/mango-half.svg', juiceColor: 0xffaa00 },
  watermelon: { asset: '/assets/watermelon.svg', halfAsset: '/assets/watermelon-half.svg', juiceColor: 0xff3355 },
  pineapple: { asset: '/assets/pineapple.svg', halfAsset: '/assets/pineapple-half.svg', juiceColor: 0xffd700 },
  coconut: { asset: '/assets/coconut.svg', halfAsset: '/assets/coconut-half.svg', juiceColor: 0xf0ead6 },
  banana: { asset: '/assets/banana.svg', halfAsset: '/assets/banana-half.svg', juiceColor: 0xffe44d },
  dragonfruit: { asset: '/assets/dragonfruit.svg', halfAsset: '/assets/dragonfruit-half.svg', juiceColor: 0xff44aa },
  starfruit: { asset: '/assets/starfruit.svg', halfAsset: '/assets/starfruit-half.svg', juiceColor: 0xffcc00 },
  pomegranate: { asset: '/assets/pomegranate.svg', halfAsset: '/assets/pomegranate-half.svg', juiceColor: 0xdd0022 },
  numAnsom: { asset: '/assets/num-ansom.svg', halfAsset: '/assets/num-ansom-half.svg', juiceColor: 0xc8e6c9 },
  numKrok: { asset: '/assets/num-krok.png', halfAsset: '/assets/num-krok-half.png', juiceColor: 0xf5e1a4 },
  numKum: { asset: '/assets/num-kum.png', halfAsset: '/assets/num-kum-half.png', juiceColor: 0xffe082 },
};

const THEME_CONFIGS: Record<string, ThemeConfig> = {
  default: {
    id: 'default',
    title: 'Classic',
    backgroundAsset: '/assets/bg.png',
    bombAsset: '/assets/bomb.svg',
    objectVisuals: DEFAULT_THEME_OBJECTS,
    uiAccentColors: { primary: '#ff6600', secondary: '#ffcc00', glow: 'rgba(255,100,0,0.4)' },
    splashStyle: { baseAlpha: 0.35 },
    particleStyle: { colors: [0xff5500, 0xaa0000], scale: 2.0 },
    hasWaterOverlay: false,
    hasFloatingParticles: false,
    backgroundColor: 0x1a0e06,
  },
  khmerSongkran: {
    id: 'khmerSongkran',
    title: 'Khmer Songkran',
    backgroundAsset: '/assets/khmer-bg.png',
    bombAsset: '/assets/khmer-pot-bomb.png',
    objectVisuals: {
      numAnsom: DEFAULT_THEME_OBJECTS.numAnsom,
      numKrok: DEFAULT_THEME_OBJECTS.numKrok,
      numKum: DEFAULT_THEME_OBJECTS.numKum,
    },
    uiAccentColors: { primary: '#d4a017', secondary: '#4caf50', glow: 'rgba(212,160,23,0.4)' },
    splashStyle: { baseAlpha: 0.4 },
    particleStyle: { colors: [0xd4a017, 0x4caf50, 0x42a5f5], scale: 1.8 },
    hasWaterOverlay: true,
    hasFloatingParticles: true,
    backgroundColor: 0x0d2137,
    blurStrength: 1,
  },
};

export function getThemeConfig(themeId: string): ThemeConfig {
  return THEME_CONFIGS[themeId] ?? THEME_CONFIGS.default;
}

export function getObjectVisual(theme: ThemeConfig, objectId: GameplayObjectId): SliceableObjectVisualDef {
  return theme.objectVisuals[objectId] ?? DEFAULT_THEME_OBJECTS[objectId];
}

export function buildAssetManifest(theme: ThemeConfig, objectSetId: ObjectSetId): string[] {
  const paths: string[] = [theme.backgroundAsset, theme.bombAsset];
  for (const objectId of OBJECT_SETS[objectSetId]) {
    const visual = getObjectVisual(theme, objectId);
    paths.push(visual.asset, visual.halfAsset);
  }
  return paths;
}

export function getThemeModeMapping(modeId: string): string {
  if (modeId === 'songkran' || modeId === 'frenzy' || modeId === 'tsunami') return 'khmerSongkran';
  return 'default';
}

export { DEFAULT_THEME_OBJECTS, THEME_CONFIGS };
