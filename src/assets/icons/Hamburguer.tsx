
const Hamburguer = (props: any) => (
  <svg
    width={44}
    height={44}
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx={22} cy={22} r={22} fill="#FF7A00" />
    <rect x={10} y={12} width={24} height={2} rx={1} fill="white" />
    <rect x={10} y={18} width={24} height={2} rx={1} fill="white" />
    <rect x={10} y={24} width={24} height={2} rx={1} fill="white" />
    <rect x={10} y={30} width={24} height={2} rx={1} fill="white" />
  </svg>
);
export default Hamburguer;