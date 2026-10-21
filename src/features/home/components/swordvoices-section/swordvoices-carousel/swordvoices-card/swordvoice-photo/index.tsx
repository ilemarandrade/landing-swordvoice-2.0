import Image from "next/image";

type SwordvoicePhotoProps = { name: string; photoUrl: string; experience: string };

export function SwordvoicePhoto({ name, photoUrl, experience }: SwordvoicePhotoProps) {
  return (
    <div className="relative aspect-square overflow-hidden bg-blue">
      <Image
        src={photoUrl}
        alt={`Foto de ${name}`}
        fill
        sizes="(min-width: 1200px) 300px, (min-width: 680px) 50vw, 100vw"
        className="object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent from-45% to-blue" />
      <div className="absolute inset-x-6 bottom-4 z-[1]">
        <p className="mb-1.5 text-xs uppercase tracking-[0.05em] text-[#E6E6EE]">
          {experience}
        </p>
        <h3 className="font-sedgwick text-[32px] leading-tight text-white">{name}</h3>
      </div>
    </div>
  );
}
