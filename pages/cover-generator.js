import React from "react";
import styles from "../assets/css/cover-generator.module.css";
import html2canvas from "html2canvas";
import { colorSchemes } from "../lib/consts.js";
import { getAccessToken } from "../lib/spotify.js";
import {
  Box,
  Button,
  Flex,
  Image,
  Spacer,
  Text,
  VStack,
  Stack,
  RadioGroup,
  Radio,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Checkbox,
  Select,
  HStack,
} from "@chakra-ui/react";

function CoverGenerator({ data }) {
  let track = data.track;

  const [controlsTheme, setControlsTheme] = React.useState("white");
  const [sliderValue, setSliderValue] = React.useState(0);
  const [showAlbumCover, setShowAlbumCover] = React.useState(true);
  const [timebarColor, setTimebarColor] = React.useState("");

  let trackLengthInSeconds = Math.floor(track.duration_ms / 1000);

  return (
    <Flex align="center" direction="column" justify="center">
      <Flex
        w="1500px"
        h="500px"
        justify="center"
        id="capture"
        bgImage="/img/bg/1.jpg"
        transform={{
          base: "scale(0.25)",
          sm: "scale(0.3)",
          md: "scale(0.5)",
          lg: "scale(0.7)",
        }}
      >
        <Flex align="center" justify="center" w="900px">
          <Image
            src={track.album.images[1].url}
            boxSize="250px"
            display={showAlbumCover ? "block" : "none"}
          ></Image>
          <Box pl="30px" w="650px">
            <Flex direction="column">
              <Box px="5px">
                <Text
                  className={styles.song}
                  color={controlsTheme}
                  display="inline"
                >
                  {track.name}
                </Text>
                <Spacer />

                <Text
                  className={styles.artist}
                  color={controlsTheme}
                  display="inline"
                >
                  {track.artists.map((artist, i) => (
                    i > 0 ? <span key={i}>, {artist.name}</span> : <span key={i}>{artist.name}</span>
                  ))}
                </Text>
              </Box>
              <Spacer />

              <Box pt="20px">
                <SliderMarkExample
                  sliderValue={sliderValue}
                  setSliderValue={setSliderValue}
                  min={0}
                  max={trackLengthInSeconds}
                  timebarColor={timebarColor}
                ></SliderMarkExample>
              </Box>
              <Spacer />

              <Flex px="5px">
                <Text className={styles.trackTime} color={controlsTheme}>
                  {getFormattedTime(sliderValue)}
                </Text>
                <Spacer />
                <Text className={styles.trackTime} color={controlsTheme}>
                  {getFormattedTime(trackLengthInSeconds)}
                </Text>
              </Flex>
              <Spacer />

              <Flex justify="center" px="3px">
                <Image src={`/img/${controlsTheme}-controls.png`}></Image>
              </Flex>
            </Flex>
          </Box>
        </Flex>
      </Flex>
      <Box width={{ base: "90%", lg: "990px" }}>
        <Flex pb="15px">
          <Text pr="10px">Controls:</Text>
          <RadioGroup onChange={setControlsTheme} value={controlsTheme}>
            <Stack direction="row">
              <Radio value="white">White</Radio>
              <Radio value="black">Black</Radio>
            </Stack>
          </RadioGroup>
          <Spacer />
          <Checkbox
            isChecked={showAlbumCover}
            onChange={(e) => setShowAlbumCover(e.target.checked)}
          >
            Show album cover
          </Checkbox>
        </Flex>

        <Flex align="center" pb="15px">
          <Text w="160px">Timebar color: </Text>
          <Select
            placeholder="Select..."
            onChange={(e) => {
              console.log(e.target.value);
              setTimebarColor(e.target.value);
            }}
          >
            {colorSchemes.map((scheme, i) => {
              return (
                <option key={i} value={scheme}>
                  {scheme}
                </option>
              );
            })}
          </Select>
        </Flex>

        <Flex justify="center">
          <Button onClick={saveImage}>Save image</Button>
        </Flex>
      </Box>
    </Flex>
  );
}

export const getServerSideProps = async (context) => {
  let trackId = context.query.trackId;

  const { access_token } = await getAccessToken();
  console.log(access_token);

  const spotifyResponse = await fetch(
    `https://api.spotify.com/v1/tracks/${trackId}`,
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const responseData = await spotifyResponse.json();

  return {
    props: {
      data: {
        track: responseData,
      },
    },
  };
};

const saveImage = () => {
  html2canvas(document.querySelector("#capture"), {
    logging: true,
    letterRendering: 1,
    allowTaint: false,
    useCORS: true,
  }).then((canvas) => {
    saveAs(canvas.toDataURL(), "cover.png");
  });
};

const saveAs = (uri, filename) => {
  var link = document.createElement("a");

  if (typeof link.download === "string") {
    link.href = uri;
    link.download = filename;

    //Firefox requires the link to be in the body
    document.body.appendChild(link);

    //simulate click
    link.click();

    //remove the link when done
    document.body.removeChild(link);
  } else {
    window.open(uri);
  }
};

function SliderMarkExample(props) {
  return (
    <Slider
      aria-label="slider-ex-6"
      onChange={(val) => props.setSliderValue(val)}
      min={props.min}
      max={props.max}
      colorScheme={props.timebarColor}
      defaultValue={props.sliderValue}
    >
      <SliderTrack>
        <SliderFilledTrack />
      </SliderTrack>
      <SliderThumb />
    </Slider>
  );
}

function getFormattedTime(time) {
  let minutes = Math.floor(time / 60);
  let seconds = time - minutes * 60;
  let finalTime =
    str_pad_left(minutes, "0", 2) + ":" + str_pad_left(seconds, "0", 2);

  return finalTime;
}

function str_pad_left(string, pad, length) {
  return (new Array(length + 1).join(pad) + string).slice(-length);
}

export default CoverGenerator;
