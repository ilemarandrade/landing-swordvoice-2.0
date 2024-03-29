import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import LinkedinIcon from "@/assets/icons/LinkedinIcon";
import GithubIcon from "@/assets/icons/GithubIcon";
import PageIcon from "@/assets/icons/PageIcon";
import { Typography } from "../Typography";

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
    <div className="min-h-[450px] max-h-[520px] min-w-[240px] max-w-[300px] bg-white rounded-[18px] m-6 z-1">
      <div className="relative h-[50%] overflow-hidden">
        <Image
          alt=""
          src={photo}
          width={180}
          height={100}
          className="rounded-t-[18px] w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-10% via-transparent via-30% to-blue to-100%" />
        <Typography
          variant="h5"
          className="absolute bottom-0 p-4 font-sedgwick"
        >
          {name}
        </Typography>
      </div>
      <div className="h-[50%] min-h-[236px] p-4">
        <Typography variant="h6" className="text-black font-bold mb-2">
          {rol}
        </Typography>
        <Typography variant="small" className="text-black">
          {description}
        </Typography>
        <div className="flex justify-start items-center mt-4 absolute bottom-10">
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
