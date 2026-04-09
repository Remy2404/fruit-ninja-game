export function LandingPageSkeleton() {
  return (
    <main className="section-shell py-6">
      <div className="glass-panel rounded-full px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="h-10 w-48 animate-pulse rounded-full bg-[color:var(--surface-strong)]" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-[color:var(--surface-strong)]" />
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <div className="glass-panel rounded-[2rem] p-6 sm:p-8">
          <div className="h-6 w-40 animate-pulse rounded-full bg-[color:var(--surface-strong)]" />
          <div className="mt-6 h-20 w-full animate-pulse rounded-[1.5rem] bg-[color:var(--surface-strong)]" />
          <div className="mt-4 h-6 w-2/3 animate-pulse rounded-full bg-[color:var(--surface-strong)]" />
          <div className="mt-8 flex gap-3">
            <div className="h-12 w-36 animate-pulse rounded-full bg-[color:var(--surface-strong)]" />
            <div className="h-12 w-36 animate-pulse rounded-full bg-[color:var(--surface-strong)]" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div key={index} className="subtle-panel rounded-[1.75rem] p-6">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-[color:var(--surface-strong)]" />
              <div className="mt-6 h-8 w-3/4 animate-pulse rounded-full bg-[color:var(--surface-strong)]" />
              <div className="mt-4 h-20 animate-pulse rounded-[1.25rem] bg-[color:var(--surface-strong)]" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
