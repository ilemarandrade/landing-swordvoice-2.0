interface IProps {
  width?: number;
}

const SwordHilt: React.FC<IProps> = ({ width = 40 }) => (
  <svg
    width={width}
    height={(width * 18) / 40}
    viewBox="0 0 40 18"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="4" cy="9" r="4" fill="currentColor" />
    <rect x="8" y="6" width="14" height="6" rx="2" fill="currentColor" opacity=".7" />
    <rect x="22" y="0" width="5" height="18" rx="2" fill="currentColor" />
  </svg>
);

export default SwordHilt;
