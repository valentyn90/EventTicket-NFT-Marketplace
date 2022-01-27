interface OrderBook {
  id: number;
  created_at: Date;
  mint: string;
  price: number;
  buy: boolean;
  active: boolean;
  user_id: string;
  currency: string;
  public_key: string | null;
  onchain_success: boolean;
}

export default OrderBook;
