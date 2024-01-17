interface buttonProps {
    label: string;
  }
  
  const Button = ({ label }: buttonProps) => {
    return (
      <button className="w-max px-8 mt-4 py-2 rounded-full bg-black font-bold text-base text-primary border-2 border-white">
        {label}
      </button>
    );
  };
  export default Button;
  