import { useRouter } from "next/router";
import { Button } from "@chakra-ui/react";

import { QRCode } from 'react-qrcode-logo';
import html2canvas from 'html2canvas';

export default function GenerateQr() {

    const router = useRouter();
    const { id } = router.query;

    const handleDownload = () => {
        html2canvas(document.querySelector('#react-qrcode-logo') as any, {backgroundColor:"transparent"})
        .then(function (canvas) {
            console.log(canvas.toDataURL("image/png"))
            const link = document.createElement('a');
            //@ts-ignore
            link.download = 'react-qrcode-logo.png';
            //@ts-ignore
            link.href = canvas.toDataURL("image/png");
            link.click();
        });

    }
   


    return (
        <>
        <QRCode size={400} bgColor="transparent" fgColor="white" value={`https://verifiedink.us/apparel/${id}`} qrStyle="dots" eyeRadius={30} ecLevel={'Q'} />
        <Button onClick={handleDownload}>Download</Button>
        </>
    )
}