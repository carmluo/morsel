import Link from "next/link";

export default function ConfirmPage() {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm text-center">
        <h1 className="font-display text-5xl text-text mb-8">morsel</h1>
        <div className="bg-surface rounded-2xl shadow-card p-8 flex flex-col gap-4">
          <h2 className="font-display text-2xl text-text">Check your email</h2>
          <p className="text-muted text-sm leading-relaxed">
            We sent a confirmation link to your inbox. Click it to activate your
            account, then come back to sign in.
          </p>
          <Link
            href="/auth/login"
            className="mt-2 text-sm text-accent hover:text-accent-hover transition-colors"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
