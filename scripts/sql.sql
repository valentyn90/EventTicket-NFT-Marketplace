--- Adding more editions
INSERT INTO public.nft(
	inserted_at, updated_at, user_id, first_name, last_name, graduation_year, high_school, usa_state, sport, sport_position, video_link, quotes, finished, approved, minted, signature_file, photo_file, clip_file, mux_playback_id, mux_upload_id, mux_asset_id, screenshot_file_id, user_details_id, mint_datetime, color_top, color_bottom, color_transition, mux_max_resolution, og_photo_id, crop_keyframes, slow_video, crop_values, admin_feedback, post_hs, vfd_year, edition_name, edition_quantity, edition_rarity, edition_utility, temp_user_id)
	
	Select inserted_at, updated_at, user_id, first_name, last_name, graduation_year, high_school, usa_state, sport, sport_position, video_link, quotes, finished, approved, minted, signature_file, photo_file, clip_file, mux_playback_id, mux_upload_id, mux_asset_id, screenshot_file_id, user_details_id, mint_datetime, color_top, color_bottom, color_transition, mux_max_resolution, og_photo_id, crop_keyframes, slow_video, crop_values, admin_feedback, post_hs, vfd_year, edition_name, edition_quantity, edition_rarity, edition_utility, temp_user_id
	from public.nft
		where id=1600

--Replacing a video
update nft 
set (mux_playback_id, mux_upload_id, mux_asset_id, mux_max_resolution, crop_values)
= (select mux_playback_id, mux_upload_id, mux_asset_id, mux_max_resolution, crop_values from nft where id = 1599) 
where id = 1543 --Replace this video with the one above
