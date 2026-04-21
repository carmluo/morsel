import Link from "next/link";

export default function DevHub() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="font-display text-5xl text-text mb-1">morsel</h1>
          <p className="text-xs text-accent font-medium tracking-widest uppercase">
            Dev preview
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            href="/dev/draw"
            className="flex items-center gap-4 bg-surface rounded-2xl shadow-card px-5 py-4 hover:shadow-card-hover transition-shadow"
          >
            <span className="text-3xl">✏️</span>
            <div>
              <p className="font-medium text-text">Drawing canvas</p>
              <p className="text-xs text-muted">Photo overlay · tools · export</p>
            </div>
            <span className="ml-auto text-muted">→</span>
          </Link>

          <Link
            href="/dev/feed"
            className="flex items-center gap-4 bg-surface rounded-2xl shadow-card px-5 py-4 hover:shadow-card-hover transition-shadow"
          >
            <span className="text-3xl">📱</span>
            <div>
              <p className="font-medium text-text">Live feed</p>
              <p className="text-xs text-muted">Posts · reactions · comments</p>
            </div>
            <span className="ml-auto text-muted">→</span>
          </Link>

          <Link
            href="/dev/widget"
            className="flex items-center gap-4 bg-surface rounded-2xl shadow-card px-5 py-4 hover:shadow-card-hover transition-shadow"
          >
            <span className="text-3xl">🪟</span>
            <div>
              <p className="font-medium text-text">Widget view</p>
              <p className="text-xs text-muted">Rotating daily drawings</p>
            </div>
            <span className="ml-auto text-muted">→</span>
          </Link>
        </div>

        <p className="text-center text-xs text-muted">
          Local only · no auth · no database
        </p>
      </div>
    </div>
  );
}
