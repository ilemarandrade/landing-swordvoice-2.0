import { Typography } from "../Typography";

interface IProps {
  Icon: any;
  name: string;
  description: string;
}

const PathAvailable: React.FC<IProps> = ({ Icon, name, description }) => (
  <div className="max-w-md">
    <div className="flex items-center justify-center">
      <Icon />
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

export default PathAvailable;
