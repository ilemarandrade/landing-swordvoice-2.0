type SectionDividerProps = { className?: string };

export function SectionDivider({ className = "" }: SectionDividerProps) {
  return <div className={`h-[58px] bg-[black] w-full ${className}`} />;
}
