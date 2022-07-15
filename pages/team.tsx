import React from "react";
import {
    Avatar,
    Box,
    Button,
    Container,
    Heading,
    HStack,
    Icon,
    Link,
    SimpleGrid,
    Stack,
    Text,
    useBreakpointValue,
} from '@chakra-ui/react'
import { FaGithub, FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa'



const Team: React.FC = () => {


    const team = [
        {
            name: "Aaron Linsky",
            role: "Co-Founder / co-CEO",
            image: "img/team/linsky.jpeg",
            description: "John Doe is the CEO of VerifiedInk. He is a softwar",
            twitter: "https://twitter.com/linsky",
            linkedin: "https://www.linkedin.com/in/aaronlinsky/",
            instagram: "",
        },
        {
            name: "Damir Makic",
            role: "Co-Founder / COO",
            image: "img/team/damir.jpeg",
            description: "John Doe is the CEO of VerifiedInk. He is a softwar",
            twitter: "",
            linkedin: "https://www.linkedin.com/in/damir-makic/",
            instagram: "",
        },
        {
            name: "Nate Slutzky",
            role: "Co-Founder / co-CEO",
            image: "img/team/nate.jpeg",
            description: "John Doe is the CEO of VerifiedInk. He is a softwar",
            twitter: "https://twitter.com/CoachSlutzky",
            linkedin: "https://www.linkedin.com/in/nathan-slutzky-verified-athletics/",
            instagram: "",
        },
        {
            name: "Ryan McHardy",
            role: "Co-Founder / CMO",
            image: "img/team/ryan.jpeg",
            description: "John Doe is the CEO of VerifiedInk. He is a softwar",
            twitter: "",
            linkedin: "https://www.linkedin.com/in/robertryanmchardy/",
            instagram: "",
        },
        {
            name: "Maggie Cornejo",
            role: "Marketing Coordinator",
            image: "img/team/maggie.jpeg",
            description: "John Doe is the CEO of VerifiedInk. He is a softwar",
            twitter: "",
            linkedin: "https://www.linkedin.com/in/mcornejo4/",
            instagram: "",
        },
        {
            name: "Matt Brandabur",
            role: "Business Development",
            image: "img/team/matt.jpeg",
            description: "John Doe is the CEO of VerifiedInk. He is a softwar",
            twitter: "",
            linkedin: "https://www.linkedin.com/in/mattbrandabur/",
            instagram: "",
        },
        {
            name: "Prophet Kates",
            role: "Business Development",
            image: "img/team/prophet.jpeg",
            description: "John Doe is the CEO of VerifiedInk. He is a softwar",
            twitter: "",
            linkedin: "https://www.linkedin.com/in/prophet-kates-9523a0137/",
            instagram: "https://www.instagram.com/coachproph/",
        },
        {
            name: "Frantz Pierre-Louis",
            role: "Business Development",
            image: "img/team/frantz.jpeg",
            description: "John Doe is the CEO of VerifiedInk. He is a softwar",
            twitter: "",
            linkedin: "",
            instagram: "",
        },
    ]



    return (
        <Box bg="bg-surface">
            <Container py={{ base: '8', md: '8' }} maxW={["80%","80%","80%","1000px"]}>
                <Stack spacing={{ base: '12', xl: '12' }} direction={{ base: 'column' }}>
                    <Stack spacing="10">
                        <Stack spacing="3" maxW="xl" width="full">
                            <Stack spacing={{ base: '4', md: '5' }}>
                                <Heading size={useBreakpointValue({ base: 'xl', md: 'lg' })}>Meet our team</Heading>
                                <Text fontSize={{ base: 'md', md: 'xl' }} color="muted">
                                    We are the fans, athletes and collectors that power VerifiedInk.
                                </Text>
                            </Stack>
                        </Stack>

                    </Stack>
                    <SimpleGrid
                        columns={{ base: 1, md: 2 }}
                        columnGap="8"
                        rowGap={{ base: '10', lg: '12' }}
                        flex="1"
                    >
                        {team.map((member) => (
                            <Stack key={member.name} spacing={{ base: '4', md: '5' }} direction="row">
                                <Avatar src={member.image} boxSize={{ base: '16', md: '20' }} />
                                <Stack spacing="4">
                                    <Stack>
                                        <Box>
                                            <Text fontWeight="bold" fontSize="lg">
                                                {member.name}
                                            </Text>
                                            <Text color="accent">{member.role}</Text>
                                        </Box>
                                        {/* <Text color="muted">{member.description}</Text> */}
                                    </Stack>
                                    <HStack spacing="4" color="subtle">
                                        {[FaLinkedin, FaTwitter, FaInstagram].map((item, id) => {
                                            let link = member.twitter
                                            if (item === FaLinkedin) {
                                                link = member.linkedin
                                            }
                                            else if (item === FaInstagram) {
                                                link = member.instagram
                                            }
                                            return (link === "" ? null :

                                                <Link href={link} key={id}>
                                                    <Icon as={item} boxSize="5" />
                                                </Link>
                                            )
                                        })}
                                    </HStack>
                                </Stack>
                            </Stack>
                        ))}
                    </SimpleGrid>
                </Stack>
            </Container>
        </Box>

    )


};

export default Team;