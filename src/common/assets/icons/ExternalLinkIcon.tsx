interface IProps {
  width?: number;
}

const ExternalLinkIcon: React.FC<IProps> = ({ width = 14 }) => (
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
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

export default ExternalLinkIcon;
