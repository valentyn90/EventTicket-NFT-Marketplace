export const getNftTicketColor = (tab: number) => {
  switch (tab) {
    case 0:
      return "#FFFFFF";
    case 1:
      return "#0E9DE5";
    case 2:
      return "#DABC00";
    default:
      return "#0E9DE5";
  }
};
