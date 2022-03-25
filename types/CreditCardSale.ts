interface CreditCardSale {
  id?: number;
  created_at?: Date;
  user_id: string;
  order_book_id: number;
  mint: string;
  price_sol: number;
  price_usd: number;
  stripe_tx: string;
  status: string;
}

export default CreditCardSale;
