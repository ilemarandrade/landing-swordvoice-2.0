"use client";

import { Typography } from "../Typography";

interface IProps {
  label: string;
  onChange?: (newValue: string) => void;
  value?: string;
  isValid?: boolean;
}

const Textarea: React.FC<IProps> = ({
  label,
  onChange,
  value = "",
  isValid = true,
}) => {
  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <Typography as="label" className="mb-3">
        {label}
      </Typography>
      <textarea
        value={value}
        className={`w-full p-3 rounded text-black resize-none h-[150px] ${
          isValid ? "" : `border-red-600 border-2`
        }`}
        onChange={onChange && ((e) => onChange(e.target.value))}
      />
    </div>
  );
};

export default Textarea;
