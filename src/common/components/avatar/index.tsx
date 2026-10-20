import Image from "next/image";
import { getInitials } from "@/common/utils/getInitials";

type AvatarProps = {
  name: string;
  photoUrl: string | null;
  size: number;
  className?: string;
};

export function Avatar({ name, photoUrl, size, className }: AvatarProps) {
  const base = `flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-blue font-bold ${
    className ?? ""
  }`;

  if (photoUrl) {
    return (
      <span className={base} style={{ width: size, height: size }}>
        <Image
          src={photoUrl}
          alt={`Foto de ${name}`}
          width={size}
          height={size}
          className="h-full w-full object-cover"
        />
      </span>
    );
  }
  return (
    <span
      aria-hidden="true"
      className={base}
      style={{ width: size, height: size, fontSize: Math.round(size / 3) }}
    >
      {getInitials(name)}
    </span>
  );
}
