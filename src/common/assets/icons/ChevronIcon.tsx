interface IProps {
  width?: number;
}

const ChevronIcon: React.FC<IProps> = ({ width = 20 }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export default ChevronIcon;
