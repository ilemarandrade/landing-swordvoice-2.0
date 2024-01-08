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
      <p className="text-[black] text-center text-xl font-bold">{name}</p>
      <p className="text-[black] text-center text-lg">{description}</p>
    </div>
  </div>
);

export default PathAvailable;
