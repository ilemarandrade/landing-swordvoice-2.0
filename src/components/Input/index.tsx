"use client";

import { Typography } from "../Typography";

interface IProps {
  label: string;
  value?: string;
  onChange?: (newValue: string) => void;
}

const Input: React.FC<IProps> = ({ label, onChange, value = "" }) => {
  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <Typography as="label" className="mb-3">
        {label}
      </Typography>
      <input
      value={value}
        className="w-full p-3 rounded text-black"
        onChange={onChange && ((e) => onChange(e.target.value))}
      />
    </div>
  );
};

export default Input;
