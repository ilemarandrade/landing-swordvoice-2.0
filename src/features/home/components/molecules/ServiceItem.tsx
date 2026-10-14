import type { ReactElement } from "react";
import { Typography } from "@/common/components/atoms/Typography";

type ServiceItemProps = {
  icon: ReactElement;
  title: string;
  description: string;
};

export function ServiceItem({ icon, title, description }: ServiceItemProps) {
  return (
    <div className="flex mb-8 gap-3 md:gap-8">
      <div className="md:flex-1 flex justify-center lg:items-center scale-75">
        {icon}
      </div>
      <div className="flex-1 md:flex-[5]">
        <Typography variant="h5" className="font-bold">
          {title}
        </Typography>
        <Typography>{description}</Typography>
      </div>
    </div>
  );
}
