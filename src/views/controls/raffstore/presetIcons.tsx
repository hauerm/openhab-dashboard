export const RaffstorePresetIcon = ({
  angleDeg,
  className = "h-full w-full",
}: {
  angleDeg: number;
  className?: string;
}) => {
  const mirroredAngleDeg = -angleDeg;

  return (
    <span className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 100 100"
        className="h-full w-full text-ui-foreground"
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1="50"
          y1="14"
          x2="50"
          y2="86"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <line
          x1="25"
          y1="50"
          x2="75"
          y2="50"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          transform={`rotate(${mirroredAngleDeg} 50 50)`}
        />
      </svg>
    </span>
  );
};
