export default function PlayLoading() {
  return (
    <main className="flex h-dvh items-center justify-center bg-[#111116] text-white">
      <div className="glass-panel rounded-[2rem] px-8 py-6 text-center">
        <p className="font-display text-3xl tracking-[-0.04em]">Preparing the blade...</p>
        <p className="mt-3 text-sm text-white/70">Loading the arena, assets, and controls.</p>
      </div>
    </main>
  );
}
