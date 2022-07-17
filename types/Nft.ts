import AdminActions from "./AdminActions";
import CropValue from "./CropValue";
import UserDetails from "./UserDetails";

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
  mux_max_resolution: string | null;
  screenshot_file_id: number | null;
  user_details_id: string;
  admin_feedback: any;
  color_top: string | null;
  color_bottom: string | null;
  color_transition: string | null;
  crop_keyframes: string | null;
  slow_video: boolean;
  crop_values: CropValue[];
  user_details?: UserDetails;
  admin_actions?: AdminActions[];
  vfd_year: number;
  post_hs: boolean;
  edition_name: string;
  edition_size: number;
  edition_rarity: string;
  edition_utility: any[] | null;
}

export default Nft;
