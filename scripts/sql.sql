--- Adding more editions
INSERT INTO public.nft(
	inserted_at, updated_at, user_id, first_name, last_name, graduation_year, high_school, usa_state, sport, sport_position, video_link, quotes, finished, approved, minted, signature_file, photo_file, clip_file, mux_playback_id, mux_upload_id, mux_asset_id, screenshot_file_id, user_details_id, mint_datetime, color_top, color_bottom, color_transition, mux_max_resolution, og_photo_id, crop_keyframes, slow_video, crop_values, admin_feedback, post_hs, vfd_year, edition_name, edition_quantity, edition_rarity, edition_utility, temp_user_id)
	
	Select inserted_at, updated_at, user_id, first_name, last_name, graduation_year, high_school, usa_state, sport, sport_position, video_link, quotes, finished, approved, minted, signature_file, photo_file, clip_file, mux_playback_id, mux_upload_id, mux_asset_id, screenshot_file_id, user_details_id, 
	mint_datetime, color_top, color_bottom, color_transition, mux_max_resolution, og_photo_id, crop_keyframes, slow_video, crop_values, admin_feedback, post_hs, vfd_year, 
	'Extended', 84, 'Common', edition_utility, temp_user_id
	from public.nft
		where id=1586
	UNION ALL
	Select inserted_at, updated_at, user_id, first_name, last_name, graduation_year, high_school, usa_state, sport, sport_position, video_link, quotes, finished, approved, minted, signature_file, photo_file, clip_file, mux_playback_id, mux_upload_id, mux_asset_id, screenshot_file_id, user_details_id, 
	mint_datetime, color_top, color_bottom, color_transition, mux_max_resolution, og_photo_id, crop_keyframes, slow_video, crop_values, admin_feedback, post_hs, vfd_year, 
	'Extended', 12, 'Rare', edition_utility, temp_user_id
	from public.nft
		where id=1586
	UNION ALL
	Select inserted_at, updated_at, user_id, first_name, last_name, graduation_year, high_school, usa_state, sport, sport_position, video_link, quotes, finished, approved, minted, signature_file, photo_file, clip_file, mux_playback_id, mux_upload_id, mux_asset_id, screenshot_file_id, user_details_id, 
	mint_datetime, color_top, color_bottom, color_transition, mux_max_resolution, og_photo_id, crop_keyframes, slow_video, crop_values, admin_feedback, post_hs, vfd_year, 
	'Extended', 4, 'Legendary', edition_utility, temp_user_id
	from public.nft
		where id=1586

update public.nft
set edition_rarity = 'Legendary'
where id = 1586

--Replacing a video
update nft 
set (mux_playback_id, mux_upload_id, mux_asset_id, mux_max_resolution, crop_values)
= (select mux_playback_id, mux_upload_id, mux_asset_id, mux_max_resolution, crop_values from nft where id = 1599) 
where id = 1543 --Replace this video with the one above



select * from public.drop where id=10


-- 348d305f-3156-44ec-98f6-5d052bea2aa8 - VerifiedId

-- Premium - 1   / 10
-- Common  - 44  / 445
-- Rare    - 4   / 40
-- Leg     - 1   / 15

-- P - 1  / 10
-- C - 9  / 84
-- R - 1  / 12
-- L - 0  / 4
{1797,1798,1799}	1499	'8ab7dbf6-580b-4c52-bbda-3e7bdf702d6e'

Delete from
--select * from 
nft_owner where nft_id in (1499,1797,1798,1799)

select id, edition_quantity, edition_name, * from nft where id in (1499,1797,1798,1799)

--Launch
insert into nft_owner(nft_id, owner_id, serial_no)
select 1499 as nft_id, UUID('8ab7dbf6-580b-4c52-bbda-3e7bdf702d6e') as owner_id, generate_series as serial_no from generate_series(1,9)
UNION ALL
select  1499 as nft_id, UUID('348d305f-3156-44ec-98f6-5d052bea2aa8') as owner_id, generate_series as serial_no from generate_series(10,10)

-- Common
-- insert into nft_owner(nft_id, owner_id, serial_no)
UNION ALL
select 1797 as nft_id, UUID('8ab7dbf6-580b-4c52-bbda-3e7bdf702d6e') as owner_id, generate_series as serial_no from generate_series(1,75) -- generate_series(1,401)
UNION ALL
select  1797 as nft_id, UUID('348d305f-3156-44ec-98f6-5d052bea2aa8') as owner_id, generate_series as serial_no from generate_series(76,84) --generate_series(402,445)

--Rare
-- insert into nft_owner(nft_id, owner_id, serial_no)
UNION ALL
select 1798 as nft_id, UUID('8ab7dbf6-580b-4c52-bbda-3e7bdf702d6e') as owner_id, generate_series as serial_no from generate_series(1,11) --generate_series(1,36)
UNION ALL
select  1798 as nft_id, UUID('348d305f-3156-44ec-98f6-5d052bea2aa8') as owner_id, generate_series as serial_no from generate_series(12,12) --generate_series(37,40)

--Lego
-- insert into nft_owner(nft_id, owner_id, serial_no)
UNION ALL
select 1799 as nft_id, UUID('8ab7dbf6-580b-4c52-bbda-3e7bdf702d6e') as owner_id, generate_series as serial_no from generate_series(1,4) --generate_series(1,14)
--UNION ALL
--select  1664 as nft_id, UUID('348d305f-3156-44ec-98f6-5d052bea2aa8') as owner_id, generate_series as serial_no from generate_series(1,1) --generate_series(15,15)

select * from generate_series(1,1)

update nft 
set minted = true, mint_datetime=now()
--select minted, mint_datetime from nft
where id in (1499,1797,1798,1799)

