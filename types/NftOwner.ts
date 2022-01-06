interface NftOwner {
  id: number;
  created_at: Date;
  nft_id: number;
  owner_id: string;
  serial_no: number;
}

export default NftOwner;
