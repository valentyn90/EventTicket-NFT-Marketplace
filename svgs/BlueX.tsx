const BlueX = () => (
  <svg
    width="70"
    height="70"
    viewBox="0 0 70 70"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g filter="url(#filter0_f_51_12791)">
      <circle cx="35" cy="35" r="15" fill="#0D9DE5" />
    </g>
    <g filter="url(#filter1_d_51_12791)">
      <rect
        x="35"
        y="19.4436"
        width="22"
        height="22"
        rx="11"
        transform="rotate(45 35 19.4436)"
        fill="#0D9DE5"
        shapeRendering="crispEdges"
      />
      <path
        d="M38.5356 31.4646L31.4646 38.5357"
        stroke="white"
        strokeWidth="2"
      />
      <path
        d="M38.5356 38.5356L31.4646 31.4646"
        stroke="white"
        strokeWidth="2"
      />
    </g>
    <defs>
      <filter
        id="filter0_f_51_12791"
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
          result="effect1_foregroundBlur_51_12791"
        />
      </filter>
      <filter
        id="filter1_d_51_12791"
        x="4.44385"
        y="9.4436"
        width="61.1123"
        height="61.1128"
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
          result="effect1_dropShadow_51_12791"
        />
        <feBlend
          mode="normal"
          in="SourceGraphic"
          in2="effect1_dropShadow_51_12791"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
);

export default BlueX;
