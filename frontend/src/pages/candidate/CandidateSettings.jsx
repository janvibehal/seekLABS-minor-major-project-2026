
import { useAuth } from '../../context/AuthContext.jsx'

function CandidateSettings() {
  const { user } = useAuth()

  const capitalize = (value = '') =>
    value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()

  const fullName = user
    ? `${capitalize(user.firstName)} ${capitalize(user.lastName)}`.trim()
    : 'Candidate'

  return (
    <div className="min-h-full text-white">
      {/* PAGE HEADER */}
      <section className="relative mb-5 overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#10151d] via-[#0b0d11] to-[#07090d] px-5 py-5 sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute -right-20 -top-28 h-64 w-64 rounded-full bg-blue-400/[0.07] blur-[90px]" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/[0.08] px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-xs font-medium text-blue-300">
              Account Management
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Settings
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            Manage your account information and security preferences.
          </p>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        {/* PROFILE INFORMATION */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b0d11]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">
              Profile Information
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Your personal account details
            </p>
          </div>

          <div className="p-5">
            {/* PROFILE */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/[0.08] text-lg font-semibold text-blue-300">
                {user?.firstName?.charAt(0)?.toUpperCase() || 'C'}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">
                  {fullName}
                </h3>
                <p className="mt-0.5 text-xs text-zinc-500">
                  Candidate Account
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ProfileField
                label="First Name"
                value={capitalize(user?.firstName || '')}
              />
              <ProfileField
                label="Last Name"
                value={capitalize(user?.lastName || '')}
              />
              <ProfileField
                label="Email Address"
                value={user?.email || 'Not available'}
              />
              <ProfileField
                label="Account Role"
                value={capitalize(user?.role || 'Candidate')}
              />
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
              <div>
                <p className="text-xs font-medium text-zinc-300">
                  Email Verification
                </p>
                <p className="mt-1 text-[11px] text-zinc-600">
                  Your email verification status
                </p>
              </div>

              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-medium ${
                  user?.emailVerified
                    ? 'border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300'
                    : 'border-amber-400/20 bg-amber-400/[0.08] text-amber-300'
                }`}
              >
                {user?.emailVerified ? 'Verified' : 'Not verified'}
              </span>
            </div>
          </div>
        </section>

        {/* SECURITY */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0b0d11]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">
              Account Security
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Information about keeping your account secure
            </p>
          </div>

          <div className="space-y-3 p-5">
            <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-400/15 bg-blue-400/[0.07] text-blue-400">
                <ShieldIcon />
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-200">
                  Protected Account
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Your account is protected through QORE authentication and
                  access controls.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-400/15 bg-blue-400/[0.07] text-blue-400">
                <LockIcon />
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-200">
                  Password Security
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  Your password is securely stored and is never displayed
                  here.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-blue-400/15 bg-blue-400/[0.07] text-blue-400">
                <UserIcon />
              </div>

              <div>
                <p className="text-xs font-medium text-zinc-200">
                  Account Type
                </p>
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  You are currently registered as a candidate on QORE.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ABOUT QORE */}
      <section className="mt-4 rounded-2xl border border-white/[0.06] bg-[#0b0d11] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.07] text-blue-400">
            <QoreIcon />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">About QORE</h2>
            <p className="mt-0.5 text-xs text-zinc-600">
              Your conversational interview preparation platform
            </p>
          </div>
        </div>

        <p className="mt-3 max-w-2xl text-xs leading-6 text-zinc-500">
          QORE helps candidates practice technical interviews through
          conversational problem-solving, structured evaluation, and
          personalized AI feedback.
        </p>

        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="text-[11px] text-zinc-600">
            QORE · Candidate Workspace
          </span>
          <span className="text-[11px] text-zinc-600">Account Settings</span>
        </div>
      </section>
    </div>
  )
}

function ProfileField({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-3.5 py-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-600">
        {label}
      </p>
      <p className="mt-1.5 break-all text-sm font-medium text-zinc-300">
        {value || 'Not available'}
      </p>
    </div>
  )
}

function ShieldIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 1 1 8 0v3" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </svg>
  )
}

function QoreIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m16 16 5 5M8 11h6" />
    </svg>
  )
}

export default CandidateSettings
