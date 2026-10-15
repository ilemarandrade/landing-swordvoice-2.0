interface IProps {
  width?: number;
}

const CrownIcon: React.FC<IProps> = ({ width = 16 }) => (
  <svg
    width={width}
    height={width}
    viewBox="0 0 24 24"
    aria-hidden="true"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M3 7l4.5 4L12 4l4.5 7L21 7l-2 12H5L3 7z" fill="currentColor" />
  </svg>
);

export default CrownIcon;
