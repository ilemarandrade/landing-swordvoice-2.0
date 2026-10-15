interface IProps {
  width?: number;
}

const CheckIcon: React.FC<IProps> = ({ width = 12 }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export default CheckIcon;
