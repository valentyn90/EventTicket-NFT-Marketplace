import userStore from "@/mobx/UserStore";
import { supabase } from "@/supabase/supabase-client";
import ChevronDown from "@/svgs/ChevronDown";
import HouseIcon from "@/svgs/HouseIcon";
import UsersIcon from "@/svgs/UsersIcon";
import { Box, HStack, VStack, Text, Stack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { useQuery } from '@tanstack/react-query'
import { CloseIcon } from "@chakra-ui/icons";

interface Props{
  beginFilter?: any
}

const Filter: React.FC<Props> = ({beginFilter}: Props) => {
  const [showFilter, setShowFilter] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlert(wrapperRef);




  const { isLoading, error, data:teams } = useQuery(['repoData'], async () => {
    const { data: teams } = await supabase.from("school").select('*').gt('marketplace_priority', 0).order('marketplace_priority');
    return teams
  })

  function useOutsideAlert(ref: any) {
    useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target)) {
          setShowFilter(false)
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref]);
  }

  useEffect(() => {
    if(!isLoading && beginFilter){
      onSelectFilter(beginFilter.school)
    }

  }, [ isLoading])


  const onSelectFilter = (filter: string) => {

    if (teams) {
      const filtered = teams.filter((team, team_id) => {
        return team.school === decodeURI(filter);
      });

      filtered.length > 0 ?
      userStore.ui.setFieldValue("marketplaceFilter", filtered) 
      :
      userStore.ui.setFieldValue("marketplaceFilter", {})
      setShowFilter(false);
    }
  };

  return (
    <div ref={wrapperRef}>
      <VStack display="inline-block" position="relative">
        <HStack>
          <Text color={"whiteAlpha.600"}>Filter by:</Text>
          <HStack
            p={"7px 12px"}
            outline="2px solid transparent"
            outlineOffset={"2px"}
            border="1px solid #4e5ab5"
            borderRadius={"md"}
            onClick={() => setShowFilter(!showFilter)}
            color={"whiteAlpha.600"}
            cursor="pointer"
            backdropFilter={"blur(10px)"}
            backgroundColor={"blueBlackTransparent"}
          >
            <HStack
              sx={{
                "> svg": {
                  color: "#4e5ab5",
                  opacity: "0.8",
                  height: "20px",
                  width: "20px",
                },
              }}
            >
              <HouseIcon /> <ChevronDown />
            </HStack>
            <Text
              sx={{
                "user-select": "none",
              }}
              textAlign="start"
              w={["auto", "auto", "150px"]}
            >
              {userStore.ui.marketplaceFilter[0] ? userStore.ui.marketplaceFilter[0].school : "School"}
            </Text>
            
          </HStack>
          <CloseIcon color="whiteAlpha.600" h="10px" onClick={()=>{onSelectFilter("")}}/>
        </HStack>
        {showFilter && (
          <VStack
            zIndex={1}
            position="absolute"
            display="block"
            padding={"12px 16px"}
            backdropFilter="blur(10px)"
            backgroundColor="rgba(0, 0, 0, 0.5)"
            minWidth="200px"
            border="1px solid #4e5ab5"
            borderRadius={"md"}
            spacing={4}
            pr={["16px", 8]}
            pb={["12px", 8]}
            w={["70vw", "60vw", "unset"]}
          >
            <HStack display={["none", "none", "flex"]}>
              <Text>Filter by: </Text>
            </HStack>
            <Stack
              direction={["column", "column", "row"]}
              align={"start"}
              justify="start"
              spacing={[8, 8, 12]}
              pb={[4, 0]}
            >
              <VStack
                justify={"start"}
                align="start"
                flexShrink={0}
                w={["100%", "100%", "auto"]}
                spacing={[3, 3, 4]}
              >
                <HStack
                  sx={{
                    "> svg": {
                      width: "25px",
                      height: "25px",
                      color: "#4e5ab5",
                    },
                  }}
                  justify="start"
                >
                  <HouseIcon />
                  <Text cursor="default">School</Text>
                </HStack>
                <Stack
                  direction={["row", "row", "column"]}
                  flexWrap="wrap"
                  justify={"flex-start"}
                  align="flex-start"
                  pl="33px"
                  color="whiteAlpha.600"
                  w="100%"
                >
                  {teams && teams.map((team, i) => (
                    <Text
                      key={i}
                      width={["50%", "50%", "auto"]}
                      textAlign="start"
                      marginStart={["0px !important", "auto"]}
                      mb={[2, 2, "auto"]}
                      cursor="pointer"
                      transition="all 0.1s ease-in-out"
                      color={
                        userStore.ui.marketplaceFilter[0] && userStore.ui.marketplaceFilter[0].school === team.school
                          ? "white"
                          : "whiteAlpha.600"
                      }
                      onClick={() => onSelectFilter(team.school)}
                    >
                      {team.school}
                    </Text>
                  ))}
                </Stack>
              </VStack>

            </Stack>
          </VStack>
        )}
      </VStack>
    </div>
  );
};

export default observer(Filter);
