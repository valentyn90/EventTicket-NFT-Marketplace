import AdminTableRow from "@/components/Admin/AdminTableRow";
import AppModal from "@/components/ui/AppModal";
import userStore from "@/mobx/UserStore";
import { getAdminNfts } from "@/supabase/admin";
import { supabase } from "@/supabase/supabase-client";
import { getUserDetails } from "@/supabase/userDetails";
import Nft from "@/types/Nft";
import { useColorModeValue } from "@chakra-ui/color-mode";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "@chakra-ui/icons";
import { Box, Container, Heading, HStack, VStack } from "@chakra-ui/layout";
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Table,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { Select } from "chakra-react-select";
import { observer } from "mobx-react-lite";
import { NextApiRequest } from "next";
import React, { useEffect, useState } from "react";

interface SelectType {
  label: string;
  value: string;
}

const Admin = () => {
  const bgColor = useColorModeValue("gray.50", "inherit");
  const [searchValue, setSearchValue] = useState("");
  const [allNfts, setAllNfts] = useState<Nft[]>([]);
  const [filteredNfts, setFilteredNfts] = useState<Nft[]>([]);
  const [progressFilter, setProgressFilter] = useState<SelectType[]>([]);
  const [range, setRange] = useState(0);

  useEffect(() => {
    let filterValues: string[] = [];
    progressFilter.forEach((pf) => {
      filterValues.push(pf.value);
    });

    getAdminNfts({ progressFilter: filterValues }).then((res) => {
      setAllNfts(res);
      // console.log(res);
      setFilteredNfts(res.slice(range, range + 50));
    });
  }, [userStore.ui.refetchAdmin, progressFilter]);

  useEffect(() => {
    if (searchValue.length > 0) {
      setFilteredNfts(
        allNfts.filter((nft) => {
          let lowerSearchVal = searchValue.toLowerCase();
          if (String(nft.id).includes(searchValue)) return true;
          if (nft.first_name.toLowerCase().includes(lowerSearchVal))
            return true;
          if (nft.last_name.toLowerCase().includes(lowerSearchVal)) return true;
          return false;
        })
      );
    } else {
      setFilteredNfts(allNfts.slice(range, range + 50));
    }
  }, [searchValue, range, progressFilter]);

  function handleProgressSelect(e: SelectType[]) {
    setProgressFilter(e);
    setRange(0);
  }

  return (
    <Box
      bg={bgColor}
      minH="100vh"
      py={{ base: "8", lg: "12" }}
      px={{ base: "4", lg: "8" }}
    >
      <Container maxW="10xl">
        <VStack align="start" spacing={10}>
          <Heading>Minting Admin</Heading>
          <HStack spacing={4} align="start">
            <InputGroup w="unset">
              <InputLeftElement
                pointerEvents="none"
                children={<SearchIcon color="gray.300" />}
              />
              <Input
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                type="text"
                placeholder="Filter by User, id"
                w="350px"
              />
            </InputGroup>
            <Box w="300px">
              <Select
                isMulti
                onChange={handleProgressSelect}
                placeholder="Progress"
                options={[
                  {
                    label: "All progress",
                    value: "all",
                    variant: "outline",
                  },
                  {
                    label: "0. Not started",
                    value: "0",
                    variant: "outline",
                  },
                  {
                    label: "1. Started",
                    value: "1",
                    variant: "outline",
                  },
                  {
                    label: "2. User approved",
                    value: "2",
                    variant: "outline",
                  },
                  {
                    label: "3. Minted",
                    value: "3",
                    variant: "outline",
                  },
                ]}
              />
            </Box>
          </HStack>
          <Table>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th>nft_id</Th>
                <Th>Preview</Th>
                <Th>Referrer</Th>
                <Th>Twitter</Th>
                <Th>Progress</Th>
                <Th textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredNfts.map((nft) => (
                <AdminTableRow nft={nft} key={nft.id} />
              ))}
            </Tbody>
          </Table>
          <HStack w="100%" justify="space-between">
            <Button
              onClick={() => setRange(range - 50 <= 0 ? 0 : range - 50)}
              disabled={range - 50 < 0}
              leftIcon={<ChevronLeftIcon />}
            >
              Previous 50
            </Button>
            <Button
              onClick={() => setRange(range + 50)}
              disabled={range + 50 >= allNfts.length}
              rightIcon={<ChevronRightIcon />}
            >
              Next 50
            </Button>
          </HStack>
          <AppModal />
        </VStack>
      </Container>
    </Box>
  );
};

export async function getServerSideProps({ req }: { req: NextApiRequest }) {
  const { user } = await supabase.auth.api.getUserByCookie(req);
  if (!user) {
    return {
      redirect: {
        destination: "/create",
        permanent: false,
      },
    };
  } else {
    const { data, error } = await getUserDetails(user.id);

    if (data?.role === process.env.NEXT_PUBLIC_ADMIN_ROLE) {
      return { props: {} };
    } else {
      return {
        redirect: {
          destination: "/create",
          permanent: false,
        },
      };
    }
  }
}

export default observer(Admin);
