export type StripePayment = {
  price: number;
  productName: string;
  email: string;
  price_usd: number;
  user_id: string;
  nft_id?: string | number;
  sn?: string | number;
  order_book_id?: string;
  mint?: string;
  price_sol?: number;
};

export const stripePayment = async (data: StripePayment) => {
  return await fetch(`/api/marketplace/stripeCheckout`, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.sessionUrl) {
        window.location.assign(data.sessionUrl);
      }
    })
    .catch((err) => console.log(err));
};
