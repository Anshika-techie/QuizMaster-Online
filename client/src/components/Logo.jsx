export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="16" cy="16" r="5" fill="var(--mark)" />
    </svg>
  );
}
