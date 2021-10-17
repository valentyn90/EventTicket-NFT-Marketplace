interface Nft {
  approved: boolean;
  clip_file: number;
  finished: boolean;
  first_name: string;
  graduation_year: string;
  high_school: string;
  id: number;
  last_name: string;
  minted: boolean;
  photo_file: number;
  quotes: string;
  signature_file: number;
  sport: string;
  sport_position: string;
  usa_state: string;
  user_id: string;
  video_link: string;
  mux_playback_id: string | null;
  mux_upload_id: string | null;
  mux_asset_id: string | null;
  screenshot_file_id: number | null;
}

export default Nft;
