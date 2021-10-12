interface UserDetails {
  id: string;
  user_id?: string;
  referral_code?: string;
  verified?: boolean;
  referring_user_id?: string;
  total_referred_users?: number;
}

export default UserDetails;
