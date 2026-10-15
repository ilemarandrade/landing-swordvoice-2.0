interface IProps {
  width?: number;
}

const ShieldIcon: React.FC<IProps> = ({ width = 28 }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 24 24"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3z"
      fill="currentColor"
    />
  </svg>
);

export default ShieldIcon;
