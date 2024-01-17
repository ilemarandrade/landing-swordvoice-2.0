"use client";

interface IProps {
  label: string;
  onChange?: (newValue: string) => void;
}

const Input: React.FC<IProps> = ({ label, onChange }) => {
  return (
    <div className="flex-col flex w-full mb-4 max-w-md">
      <label className="mb-3">{label}</label>
      <input
        className="w-full p-3 rounded text-black"
        onChange={onChange && ((e) => onChange(e.target.value))}
      />
    </div>
  );
};

export default Input;
