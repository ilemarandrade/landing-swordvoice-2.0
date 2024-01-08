import { ReactElement } from "react";

interface IServices {
  icon: ReactElement;
  title: string;
  description: string;
}

const Services: React.FC<IServices> = ({ icon, title, description }) => {
  return (
    <div className="flex mb-8 gap-8">
      <div className="flex-1 flex justify-center">{icon}</div>
      <div className="flex-[5]">
        <p className="text-xl font-bold">{title}</p>
        <p className="text-lg">{description}</p>
      </div>
    </div>
  );
};

export default Services;
