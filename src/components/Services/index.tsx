import { ReactElement } from "react";

interface IServices {
  icon: ReactElement;
  title: string;
  description: string;
}

const Services: React.FC<IServices> = ({ icon, title, description }) => {
  return (
    <div className="flex mb-8 gap-8">
      <div>{icon}</div>
      <div>
        <p className="text-xl font-bold">{title}</p>
        <p className="text-lg">{description}</p>
      </div>
    </div>
  );
};

export default Services;
