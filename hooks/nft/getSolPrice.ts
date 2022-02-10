import { useEffect, useState } from "react";

const getSolPrice = () => {
  const [solPrice, setSolPrice] = useState(0);

  useEffect(() => {
    fetch("/api/marketplace/getPrice?mkt=SOL/USD")
      .then((res) => res.json())
      .then((result) => {
        if (result.result.price) {
          setSolPrice(result.result.price);
        } else {
          setSolPrice(0);
        }
      })
      .catch((err) => {
        setSolPrice(0);
      });
  }, []);

  return {
    solPrice,
  };
};

export default getSolPrice;
