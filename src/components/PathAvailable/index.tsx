"use client";

import { useIsMobile } from "@/constants/Hooks/useIsMobile";
import { Typography } from "../Typography";

interface IProps {
  Icon: any;
  name: string;
  description: string;
}

const PathAvailable: React.FC<IProps> = ({ Icon, name, description }) => {
  const isMobile = useIsMobile();

  return (
    <div className="md:max-w-md flex flex-col mb-12 md:mb-0">
      <div className="flex items-center justify-center">
        <Icon width={isMobile ? 85 : undefined} />
      </div>
      <div>
        <Typography variant="h5" className="text-[black] text-center font-bold">
          {name}
        </Typography>
        <Typography variant="h6" className="text-[black] text-center">
          {description}
        </Typography>
      </div>
    </div>
  );
};

export default PathAvailable;
