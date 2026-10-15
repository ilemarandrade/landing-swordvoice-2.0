interface IProps {
  width?: number;
}

const SwordHiltVerticalIcon: React.FC<IProps> = ({ width = 48 }) => (
  <svg
    width={width}
    height={(width * 76) / 48}
    viewBox="0 0 48 76"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="24" cy="7" r="7" fill="currentColor" />
    <rect x="19" y="13" width="10" height="30" rx="3" fill="currentColor" opacity=".7" />
    <path d="M2 44h44a2 2 0 0 1 0 8H2a2 2 0 0 1 0-8z" fill="currentColor" />
    <rect x="21" y="52" width="6" height="24" fill="currentColor" />
  </svg>
);

export default SwordHiltVerticalIcon;
