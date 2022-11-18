import VerifiedInkNft from "@/components/VerifiedInkNft/VerifiedInkNft";
import { useState } from "react";

const nftPage: React.FC = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [school, setSchool] = useState("");
  const [state, setState] = useState("");
  const [year, setYear] = useState("");
  const [position, setPosition] = useState("");
  const [sport, setSport] = useState("");

  return <VerifiedInkNft nftId={null} />;
};

export default nftPage;
