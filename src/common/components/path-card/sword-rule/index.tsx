import SwordHiltIcon from "@/common/assets/icons/SwordHiltIcon";

export function SwordRule() {
  return (
    <div aria-hidden="true" className="flex items-center text-secondary">
      <span className="flex-none">
        <SwordHiltIcon width={40} />
      </span>
      <span className="h-0.5 flex-1 bg-gradient-to-r from-secondary to-white/15" />
      <span className="h-0 w-0 flex-none border-y-[5px] border-l-[10px] border-y-transparent border-l-white/15" />
    </div>
  );
}
