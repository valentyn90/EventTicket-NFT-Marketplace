import { Stack, Flex, Circle, Text, useColorModeValue, Heading, StackProps, Box } from '@chakra-ui/react'
import * as React from 'react'

export interface ListItemProps extends StackProps {
    title: string
    subTitle: string
    changes?: boolean
    text?: string
    icon?: React.ReactElement
    isLastItem?: boolean
}

export const ListItem = (props: ListItemProps) => {
    const { title, subTitle, icon, changes, text, isLastItem, children, ...stackProps } = props

    return (
        <Stack as="li" direction="row" spacing="4" {...stackProps}>
            <Flex direction="column" alignItems="center" aria-hidden="true">
                <Circle
                    bg={changes ? "red.600" : "green.500"}
                    size="12"
                    borderWidth="2px"
                    borderColor='white'
                    color="white"
                >
                    {icon}
                </Circle>
                {!isLastItem && <Flex flex="1" borderRightWidth="1px" mb="-12" />}
            </Flex>
            <Stack spacing="4" pt="1" flex="1">
                <Flex direction="column">
                    <Heading fontSize="md" fontWeight="semibold">
                        {title}
                    </Heading>
                    <Text fontSize="sm" color={useColorModeValue('gray.600', 'gray.400')}>
                        {subTitle}
                    </Text>
                </Flex>
                <Flex>{children}
                    {changes && <Box bg="gray.500" w="full" rounded="md" p="2">
                        {text}
                    </Box>}
                </Flex>
            </Stack>
        </Stack>
    )
}