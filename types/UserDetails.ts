interface UserDetails {
  id: string;
  user_id?: string;
  referral_code?: string;
  verified_user?: boolean;
  referring_user_id?: string;
  total_referred_users?: number;
  user_name?: string;
  twitter?: string | null;
  email?: string | null;
  role?: string | null;
}

export default UserDetails;
