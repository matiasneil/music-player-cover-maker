import {
  Flex,
  FormControl,
  Input,
  Box,
  Button,
  HStack,
  Spacer,
  Link,
} from "@chakra-ui/react";
import Router from "next/router";

export default function Home() {
  const createCover = async (event) => {
    event.preventDefault();

    let trackUrl = event.target.trackUrl.value;
    let trackId = trackUrl.match(/track\/(.*?)\?/i)[1];

    Router.push(`/cover-generator?trackId=${trackId}`);
  };

  return (
    <Flex h="100vh" align="center" justify="center">
      <Box w="80%" maxW="800px">
        <form onSubmit={createCover} width="100%">
          <Flex direction={{ base: "column", lg: "row" }} gap="5px">
            <FormControl>
              <Input
                placeholder="Enter the song URL here"
                size="lg"
                id="trackUrl"
              />
            </FormControl>
            <Spacer></Spacer>
            <Button size="lg" type="submit">
              Create
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  );
}
