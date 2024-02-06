import * as React from "react";

const LogoSwordvoice: React.ForwardRefRenderFunction<
  any,
  {
    className: string;
  }
> = (props, ref) => (
  <svg
    ref={ref}
    width={77}
    height={87}
    viewBox="0 0 77 87"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clipPath="url(#clip0_991_1080)">
      <path
        d="M0.357178 0.236818H18.3022H38.4989L60.6076 0.41626L76.6408 0.236816L38.4989 86.4254L0.721123 1.05922L0.357178 0.236818Z"
        fill="#0387B7"
        stroke="url(#paint0_radial_991_1080)"
        strokeWidth={0.277434}
      />
      <path
        d="M76.6409 0.236816V62.1906L38.499 86.4254L76.6409 0.236816Z"
        fill="#024259"
      />
      <path
        d="M0.357178 0.236816V62.1906L38.4989 86.4254L0.357178 0.236816Z"
        fill="#024259"
      />
      <path
        d="M46.9538 28.0782C43.3529 24.8051 41.7443 24.0128 39.4511 23.733C37.9127 23.4824 35.5249 23.6626 34.4315 25.7639C32.7936 28.9121 38.0906 30.7978 39.3274 31.4247C42.1827 32.8723 46.4925 35.0795 48.7177 36.7409C51.2978 38.6674 53.1376 40.2184 54.3264 43.7077C55.5705 47.36 56.0118 50.1697 54.2191 54.3403C50.4121 63.1975 38.9067 65.2629 30.4363 62.4203C26.4137 60.632 24.0455 58.739 21.2537 55.5239L28.5535 47.6428C29.6651 48.9747 38.7875 56.6192 43.3121 50.9459C47.5678 45.6098 34.5601 42.5049 28.4255 37.5028C24.6304 34.0938 23.0922 30.5188 23.1013 26.4749C23.1088 23.1184 24.5391 19.618 27.6965 16.9463C29.6614 15.2838 31.5577 13.5512 38.0509 13.0347C39.7937 12.8961 43.2968 13.1384 47.329 15.0782C51.8538 17.2548 53.1175 19.5296 54.2189 20.9436C53.3817 21.8744 48.4809 26.718 46.9538 28.0782Z"
        fill="#415D68"
      />
      <path
        d="M45.7943 26.5712C42.1931 23.298 40.5847 22.5058 38.2913 22.2259C36.7531 21.9752 34.3651 22.1555 33.272 24.2569C31.6339 27.4051 36.9311 29.2908 38.1678 29.9176C41.023 31.3652 45.3327 33.5724 47.5579 35.2339C50.1382 37.1602 51.978 38.7114 53.1666 42.2006C54.4109 45.853 54.8522 48.6626 53.0595 52.8333C49.2523 61.6905 37.747 63.7559 29.2766 60.9132C25.2541 59.125 22.886 57.2319 20.094 54.0168L27.394 46.1357C28.5055 47.4676 37.628 55.1121 42.1526 49.4387C46.4082 44.1025 33.4004 40.9976 27.2658 35.9957C23.4706 32.5867 21.9325 29.0117 21.9417 24.9679C21.9491 21.6114 23.3795 18.1109 26.5369 15.4393C28.5017 13.7767 30.3982 12.0441 36.8912 11.5276C38.6341 11.389 42.1372 11.6313 46.1695 13.5711C50.694 15.7477 51.958 18.0225 53.0591 19.4364C52.2219 20.3673 47.3212 25.211 45.7943 26.5712Z"
        fill="#ECF0F2"
      />
    </g>
    <defs>
      <radialGradient
        id="paint0_radial_991_1080"
        cx={0}
        cy={0}
        r={1}
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(38.5 43.5) scale(38.5 43.5)"
      >
        <stop />
        <stop offset={1} stopOpacity={0} />
      </radialGradient>
      <clipPath id="clip0_991_1080">
        <rect width={77} height={87} fill="white" />
      </clipPath>
    </defs>
  </svg>
);
export default React.forwardRef(LogoSwordvoice);
