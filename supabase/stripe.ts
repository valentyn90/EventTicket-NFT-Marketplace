import { supabase } from "./supabase-client";

export const createPendingCreditCardSale = (
  user_id: string,
  order_book_id: number,
  mint: string,
  price_sol: number,
  price_usd: number,
  stripe_tx: string,
  status: string
) =>
  supabase
    .from("credit_card_sale")
    .insert([
      {
        user_id,
        order_book_id,
        mint,
        price_sol,
        price_usd,
        stripe_tx,
        status,
      },
    ])
    .single();

export const creditCardSaleListen = () =>
  supabase
    .from("credit_card_sale")
    .on("*", (payload) => {
      console.log("Payload:");
      console.log(payload);
    })
    .subscribe();
