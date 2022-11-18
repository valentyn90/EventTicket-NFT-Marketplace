const BluePlus = () => (
  <svg
    width="70"
    height="70"
    viewBox="0 0 70 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_f_37_8425)">
      <circle cx="35" cy="35" r="15" fill="#0D9DE5" />
    </g>
    <g filter="url(#filter1_d_37_8425)">
      <rect
        x="24"
        y="24"
        width="22"
        height="22"
        rx="11"
        fill="#0D9DE5"
        shapeRendering="crispEdges"
      />
      <path d="M35 30V40" stroke="white" strokeWidth="2" />
      <path d="M40 35L30 35" stroke="white" strokeWidth="2" />
    </g>
    <defs>
      <filter
        id="filter0_f_37_8425"
        x="0"
        y="0"
        width="70"
        height="70"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="BackgroundImageFix"
          result="shape"
        />
        <feGaussianBlur
          stdDeviation="10"
          result="effect1_foregroundBlur_37_8425"
        />
      </filter>
      <filter
        id="filter1_d_37_8425"
        x="9"
        y="14"
        width="52"
        height="52"
        filterUnits="userSpaceOnUse"
        colorInterpolationFilters="sRGB"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          result="hardAlpha"
        />
        <feOffset dy="5" />
        <feGaussianBlur stdDeviation="7.5" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.0156863 0 0 0 0 0.0509804 0 0 0 0 0.152941 0 0 0 0.3 0"
        />
        <feBlend
          mode="normal"
          in2="BackgroundImageFix"
          result="effect1_dropShadow_37_8425"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_37_8425"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

export default BluePlus;
