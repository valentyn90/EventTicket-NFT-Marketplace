interface Key {
  id?: number;
  created_at?: Date;
  salt?: string;
  secret_key?: string;
  public_key: string;
  user_id?: string;
}

export default Key;
