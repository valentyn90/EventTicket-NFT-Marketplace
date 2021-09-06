import { rejects } from "assert";
import Resizer from "react-image-file-resizer";

export const resizeImageFile = (
  file: any,
  width: number,
  height: number,
  quality: number = 100,
  rotate: number = 0
) => {
  return new Promise((resolve, reject) => {
    try {
      Resizer.imageFileResizer(
        file,
        width,
        height,
        "PNG",
        quality,
        rotate,
        (uri) => {
          resolve(uri);
        },
        "file"
      );
    } catch (err) {
      reject(err);
    }
  });
};

export const checkImageSize = async (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event: any) => {
      const image = new Image();
      image.src = event.target.result;
      image.onload = () => {
        resolve({ width: image.width, height: image.height });
      };
      reader.onerror = (err) => reject(err);
    };
  });
};
