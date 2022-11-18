import CreateLayout from "@/components/Create/CreateLayout";
import StaticCard from "@/components/NftCard/StaticCard";
import userStore from "@/mobx/UserStore";
import { Button, Center, Heading, Text, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import cookieCutter from "cookie-cutter";

const Page = () => {
  const [alreadyMinted, setAlreadyMinted] = useState(true);
  const [existingNftId, setExistingNftId] = useState<number>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cookieCutter.set("alreadyCreatedRedirect", null, { path: "/", expires: new Date(0) })
    // unset cookie

    if (userStore.nft) {
      setExistingNftId(userStore.nft.id);
      setAlreadyMinted(userStore.nft.minted);
    }
  }, [userStore.nft]);

  return (
    <CreateLayout>
      <Center>
        <VStack spacing={4} alignItems="flex-start" maxW={600}>
          <Heading>Seeing Double</Heading>
          <Text>
            It looks like you've already created your first VerifiedInk! We'll
            be enabling second mints soon, but for now you can only create one.
          </Text>
          <Text>
            Please reach out via the blue help button below if you have any questions.
          </Text>

          {alreadyMinted ? (
            <Button
              isLoading={loading}
              onClick={() => {
                setLoading(true);
                window.location.assign("/create");
              }}
            >
              Continue
            </Button>
          ) : (
            <Button
              isLoading={loading}
              onClick={() => {
                setLoading(true);
                window.location.assign("/create");
              }}
            >
              Edit Your Original NFT
            </Button>
          )}

          {existingNftId ? (
            <StaticCard nft_id={existingNftId} width={300} />
          ) : null}
        </VStack>
      </Center>
    </CreateLayout>
  );
};

export default Page;
