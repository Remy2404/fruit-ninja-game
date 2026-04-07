export interface SliceableObjectDef {
  id: string;
  asset: string;
  halfAsset: string;
  radius: number;
  baseScore: number;
  juiceColor: number;
  weight: number;
}

export interface ThemeConfig {
  id: string;
  title: string;
  backgroundAsset: string;
  bombAsset: string;
  bombRadius: number;
  objects: SliceableObjectDef[];
  uiAccentColors: { primary: string; secondary: string; glow: string };
  splashStyle: { baseAlpha: number };
  particleStyle: { colors: number[]; scale: number };
  hasWaterOverlay: boolean;
  hasFloatingParticles: boolean;
  backgroundColor: number;
}

const DEFAULT_OBJECTS: SliceableObjectDef[] = [
  // Tier 1 — common (weight 3)
  { id: 'strawberry',  asset: '/assets/strawberry.svg',  halfAsset: '/assets/strawberry-half.svg',  radius: 30, baseScore: 1, juiceColor: 0xff2255, weight: 3 },
  { id: 'cherry',      asset: '/assets/cherry.svg',      halfAsset: '/assets/cherry-half.svg',      radius: 28, baseScore: 1, juiceColor: 0xcc0033, weight: 3 },
  { id: 'grape',       asset: '/assets/grape.svg',       halfAsset: '/assets/grape-half.svg',       radius: 28, baseScore: 1, juiceColor: 0x8b2fc9, weight: 3 },
  { id: 'blueberry',   asset: '/assets/blueberry.svg',   halfAsset: '/assets/blueberry-half.svg',   radius: 26, baseScore: 1, juiceColor: 0x4433cc, weight: 3 },
  { id: 'raspberry',   asset: '/assets/raspberry.svg',   halfAsset: '/assets/raspberry-half.svg',   radius: 26, baseScore: 1, juiceColor: 0xe00055, weight: 3 },
  { id: 'apple',       asset: '/assets/apple.svg',       halfAsset: '/assets/apple-half.svg',       radius: 36, baseScore: 1, juiceColor: 0xff4444, weight: 3 },
  // Tier 2 — medium (weight 2)
  { id: 'orange',      asset: '/assets/orange.svg',      halfAsset: '/assets/orange-half.svg',      radius: 36, baseScore: 2, juiceColor: 0xff9933, weight: 2 },
  { id: 'peach',       asset: '/assets/peach.svg',       halfAsset: '/assets/peach-half.svg',       radius: 36, baseScore: 2, juiceColor: 0xffaa55, weight: 2 },
  { id: 'plum',        asset: '/assets/plum.svg',        halfAsset: '/assets/plum-half.svg',        radius: 34, baseScore: 2, juiceColor: 0x8800aa, weight: 2 },
  { id: 'kiwi',        asset: '/assets/kiwi.svg',        halfAsset: '/assets/kiwi-half.svg',        radius: 32, baseScore: 2, juiceColor: 0x77cc22, weight: 2 },
  { id: 'lemon',       asset: '/assets/lemon.svg',       halfAsset: '/assets/lemon-half.svg',       radius: 30, baseScore: 2, juiceColor: 0xffe000, weight: 2 },
  { id: 'lime',        asset: '/assets/lime.svg',        halfAsset: '/assets/lime-half.svg',        radius: 28, baseScore: 2, juiceColor: 0x88ee00, weight: 2 },
  { id: 'mango',       asset: '/assets/mango.svg',       halfAsset: '/assets/mango-half.svg',       radius: 40, baseScore: 2, juiceColor: 0xffaa00, weight: 2 },
  // Tier 3 — exotic (weight 1)
  { id: 'watermelon',  asset: '/assets/watermelon.svg',  halfAsset: '/assets/watermelon-half.svg',  radius: 48, baseScore: 3, juiceColor: 0xff3355, weight: 1 },
  { id: 'pineapple',   asset: '/assets/pineapple.svg',   halfAsset: '/assets/pineapple-half.svg',   radius: 44, baseScore: 3, juiceColor: 0xffd700, weight: 1 },
  { id: 'coconut',     asset: '/assets/coconut.svg',     halfAsset: '/assets/coconut-half.svg',     radius: 40, baseScore: 3, juiceColor: 0xf0ead6, weight: 1 },
  { id: 'banana',      asset: '/assets/banana.svg',      halfAsset: '/assets/banana-half.svg',      radius: 34, baseScore: 3, juiceColor: 0xffe44d, weight: 1 },
  { id: 'dragonfruit', asset: '/assets/dragonfruit.svg', halfAsset: '/assets/dragonfruit-half.svg', radius: 40, baseScore: 3, juiceColor: 0xff44aa, weight: 1 },
  { id: 'starfruit',   asset: '/assets/starfruit.svg',   halfAsset: '/assets/starfruit-half.svg',   radius: 42, baseScore: 3, juiceColor: 0xffcc00, weight: 1 },
  { id: 'pomegranate', asset: '/assets/pomegranate.svg', halfAsset: '/assets/pomegranate-half.svg', radius: 42, baseScore: 3, juiceColor: 0xdd0022, weight: 1 },
];

const KHMER_OBJECTS: SliceableObjectDef[] = [
  { id: 'numAnsom', asset: '/assets/num-ansom.svg',  halfAsset: '/assets/num-ansom-half.svg',  radius: 42, baseScore: 2, juiceColor: 0xc8e6c9, weight: 3 },
  { id: 'numKrok',  asset: '/assets/num-krok.png',   halfAsset: '/assets/num-krok-half.png',   radius: 40, baseScore: 2, juiceColor: 0xf5e1a4, weight: 3 },
  { id: 'numKum',   asset: '/assets/num-kum.png',    halfAsset: '/assets/num-kum-half.png',    radius: 36, baseScore: 3, juiceColor: 0xffe082, weight: 3 },
];

const THEME_CONFIGS: Record<string, ThemeConfig> = {
  default: {
    id: 'default',
    title: 'Classic',
    backgroundAsset: '/assets/bg.png',
    bombAsset: '/assets/bomb.svg',
    bombRadius: 38,
    objects: DEFAULT_OBJECTS,
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
    bombRadius: 44,
    objects: KHMER_OBJECTS,
    uiAccentColors: { primary: '#d4a017', secondary: '#4caf50', glow: 'rgba(212,160,23,0.4)' },
    splashStyle: { baseAlpha: 0.4 },
    particleStyle: { colors: [0xd4a017, 0x4caf50, 0x42a5f5], scale: 1.8 },
    hasWaterOverlay: true,
    hasFloatingParticles: true,
    backgroundColor: 0x0d2137,
  },
};

export function getThemeConfig(themeId: string): ThemeConfig {
  return THEME_CONFIGS[themeId] ?? THEME_CONFIGS['default'];
}

export function buildAssetManifest(theme: ThemeConfig): string[] {
  const paths: string[] = [theme.backgroundAsset, theme.bombAsset];
  for (let i = 0; i < theme.objects.length; i++) {
    const obj = theme.objects[i];
    paths.push(obj.asset, obj.halfAsset);
  }
  return paths;
}

export function getThemeModeMapping(modeId: string): string {
  if (modeId === 'songkran') return 'khmerSongkran';
  return 'default';
}

export { THEME_CONFIGS };
