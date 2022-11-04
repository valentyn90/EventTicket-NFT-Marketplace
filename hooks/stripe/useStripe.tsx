import { useToast } from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
const paymentAPI = "/api/marketplace/stripeCheckout";

const stripeGateWay = (data: any) =>
  fetch(paymentAPI, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

function useStripe() {
  const toast = useToast();
  const getPaidByStripe = useMutation(
    ["stripe"],
    async (stripeData: any) => stripeGateWay(stripeData),
    {
      onSuccess: (data: any) => {
        console.log("the data is", data);
        if (data?.status === 500) {
          toast({
            position: "top",
            title: "Payment failed",
            description: "Payment failed",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          return;
        }
        if (data.sessionUrl) {
          window.location.assign(data.sessionUrl);
        }
      },
      onError: (error: { response: { data: { message: string } } }) => {
        console.log("the error", error);
        toast({
          position: "top",
          title: "Payment failed",
          description: error?.response?.data?.message || "Payment failed",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  return {
    getPaidByStripe,
  };
}

export default useStripe;
