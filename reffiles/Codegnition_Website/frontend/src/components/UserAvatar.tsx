"use client";

type UserAvatarProps = {
  name: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-10 w-10 text-[11px]",
  md: "h-14 w-14 text-sm",
  lg: "h-20 w-20 text-base",
};

export function UserAvatar({ name, size = "md" }: UserAvatarProps) {
  return (
    <div
      className={`relative inline-flex ${sizeClasses[size]} items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/[0.06] font-display uppercase tracking-[0.22em] text-white`}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="absolute inset-0 h-full w-full text-white/12"
        fill="none"
      >
        <circle cx="12" cy="9" r="4" stroke="currentColor" strokeWidth="1.25" />
        <path
          d="M5.5 19.5c1.8-3 4-4.5 6.5-4.5s4.7 1.5 6.5 4.5"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}