import type { Metadata } from 'next';
import { GameOverlay } from '@/components/game/GameOverlay';
import { GameRouteBootstrap } from '@/components/game/GameRouteBootstrap';

export const metadata: Metadata = {
  title: 'Play Now | Fruit Ninja HTML5',
  description: 'Jump straight into the browser arcade experience and start slicing fruit immediately.',
};

interface PlayPageProps {
  searchParams: Promise<{
    autostart?: string | string[] | undefined;
    mode?: string | string[] | undefined;
  }>;
}

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const query = await searchParams;
  const mode = getSingleValue(query.mode);
  const autostart = getSingleValue(query.autostart) === '1';

  return (
    <>
      <GameRouteBootstrap autostart={autostart} mode={mode} />
      <GameOverlay />
    </>
  );
}

function getSingleValue(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}
