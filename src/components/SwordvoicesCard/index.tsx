import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import LinkedinIcon from "@/assets/icons/LinkedinIcon";
import GithubIcon from "@/assets/icons/GithubIcon";
import PageIcon from "@/assets/icons/PageIcon";

interface SwordvoicesProps {
  photo: any;
  name: string;
  description: string;
  rol: string;
  linkedin: string;
  github: string;
  portfolio: string;
}

const SwordvoicesCard = ({
  photo,
  name,
  description,
  rol,
  linkedin,
  portfolio,
  github,
}: SwordvoicesProps) => {
  return (
    <div className="max-h-[500px] max-w-[250px] bg-white rounded-[18px] m-6 z-1">
      <div className="relative h-[50%]">
        <Image
          alt=""
          src={photo}
          width={220}
          height={200}
          className="rounded-t-[18px] w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-10% via-transparent via-30% to-blue to-100%" />
        <h1 className="absolute bottom-0 text-xl p-4 title">{name}</h1>
      </div>
      <div className="h-[50%] p-4">
        <h2 className="text-black text-lg font-bold mb-4">{rol}</h2>
        <p className="text-black text-xs mb-8">{description}</p>
        <div className="flex justify-start items-center">
          <Link href={linkedin}>
            <LinkedinIcon width={32} height={32} color="#0A66C2" />
          </Link>
          <Link href={github} className="p-1 mr-1">
            <GithubIcon />
          </Link>
          <Link href={portfolio}>
            <PageIcon />
          </Link>
        </div>
      </div>
    </div>
  );
};
export default SwordvoicesCard;
