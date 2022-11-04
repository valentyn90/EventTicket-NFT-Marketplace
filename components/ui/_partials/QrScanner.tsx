import React, { useState } from "react";
import { QrReader } from "react-qr-reader";

const constraints = {
  facingMode: "environment",
};

interface QrScannerProps {
  onScan: (data: any) => void;
  scanDelay?: number;
  isError?: boolean;
  isSuccess?: boolean;
}
const QrScanner = (props: QrScannerProps) => {
  const { onScan, isError, isSuccess, scanDelay } = props;

  const getBorder = () => {
    if (isError) return "17px solid #D82A39";
    if (isSuccess) return "17px solid #00BDA4";
    return "2px solid #0E9DE5";
  };

  const getBackgroundColor = () => {
    if (isError) return "#D82A39";
    if (isSuccess) return "#00BDA4";
    return "transparent";
  };
  return (
    <QrReader
      constraints={constraints}
      scanDelay={scanDelay || 1000}
      onResult={(result) => {
        onScan(result);
      }}
      containerStyle={{
        objectFit: "cover",
        border: getBorder(),
      }}
      videoStyle={{
        objectFit: "cover",
      }}
      ViewFinder={(props) => {
        return (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9999,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <div
              style={{
                opacity: "0.62",
                border: `88px solid ${getBackgroundColor()}`,
              }}
            >
              <img src="/img/scanner/viewfinder.svg" alt="" />
            </div>
          </div>
        );
      }}
    />
  );
};

export default QrScanner;
