import React, { useRef, useEffect } from "react";
import SignaturePad from "react-signature-pad-wrapper";
import { Button, Box, Flex } from "@chakra-ui/react";

const SignaturePadComp = () => {
  const signatureRef: any = useRef(null);
  useEffect(() => {
    console.log(signatureRef);
  });

  function handleClear() {
    if (signatureRef) {
      signatureRef.current.instance.clear();
    }
  }

  return (
    <>
      <Box border="2px solid #E2E8F0" mt="2" mb="2" borderRadius="5px">
        <SignaturePad
          ref={signatureRef}
          options={{
            minWidth: 5,
            maxWidth: 10,
            penColor: "rgb(66, 133, 244)",
          }}
        />
      </Box>
      <Flex mt="2" mb="2">
        <Button onClick={handleClear}>Clear</Button>
      </Flex>
    </>
  );
};

export default SignaturePadComp;
