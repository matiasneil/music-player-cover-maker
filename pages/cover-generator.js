import styles from "../assets/css/cover-generator.module.css";
import { colorSchemes, bgColors } from "../lib/consts.js";
import { getAccessToken } from "../lib/spotify.js";
import { TwitterPicker } from "react-color";
import html2canvas from "html2canvas";
import React from "react";
import {
  Box,
  Button,
  Flex,
  Image,
  Spacer,
  Text,
  Input,
  Stack,
  RadioGroup,
  Radio,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Checkbox,
  Select,
} from "@chakra-ui/react";

function CoverGenerator({ data }) {
  let track = data.track;

  const [controlsTheme, setControlsTheme] = React.useState("white");
  const [sliderValue, setSliderValue] = React.useState(0);
  const [showAlbumCover, setShowAlbumCover] = React.useState(true);
  const [timebarColor, setTimebarColor] = React.useState("");
  const [bgColor, setBgColor] = React.useState("#C5DEDD");
  const [timeInputValid, setTimeInputValid] = React.useState(true);

  let trackLengthInSeconds = Math.floor(track.duration_ms / 1000);
  let defaultSliderValue = Math.floor(trackLengthInSeconds / 2);

  React.useEffect(() => {
    setSliderValue(defaultSliderValue);
  }, [trackLengthInSeconds]);

  const setTimeFromInput = (val) => {
    let valid = true;
    let splittedVal;
    if (val.includes(":")) {
      splittedVal = val.split(":").map(Number);
      if (splittedVal[1] > 59) {
        valid = false;
      }
    } else {
      valid = false;
    }

    let totalSeconds;
    if (valid) {
      totalSeconds = splittedVal[0] * 60 + splittedVal[1];
      if (totalSeconds > trackLengthInSeconds) {
        valid = false;
      }
    }

    setTimeInputValid(valid);

    if (valid) {
      setSliderValue(totalSeconds);
    } else {
      setSliderValue(0);
    }
  };
  
  return (
    <Flex align="center" direction="column" justify="center">
      <Flex
        w="1500px"
        h="500px"
        justify="center"
        id="capture"
        bgColor={bgColor}
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
                  {track.artists.map((artist, i) =>
                    i > 0 ? (
                      <span key={i}>, {artist.name}</span>
                    ) : (
                      <span key={i}>{artist.name}</span>
                    )
                  )}
                </Text>
              </Box>
              <Spacer />

              <Box pt="20px">
                <SliderMarkExample
                  sliderValue={sliderValue}
                  setSliderValue={setSliderValue}
                  defaultValue={defaultSliderValue}
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
        <Flex justify="center" direction={{ base: "column", md: "row" }}>
          <Flex
            width={{ base: "100%", md: "220px" }}
            pb={{ base: "15px", sm: "0px" }}
            justify="center"
          >
            <TwitterPicker
              color={bgColor}
              colors={bgColors}
              onChange={(color, event) => setBgColor(color.hex)}
              triangle="hide"
              width="100%"
            ></TwitterPicker>
          </Flex>
          <Flex
            direction="column"
            pl="15px"
            width={{ base: "100%", md: "40%" }}
          >
            <Flex dir="row" align="center">
              <Text pr="10px">Time:</Text>
              <Spacer />
              <Input
                size="sm"
                isInvalid={!timeInputValid}
                w="150px"
                onBlur={(event) => setTimeFromInput(event.target.value)}
                id="timeInput"
                defaultValue={getFormattedTime(sliderValue)}
              ></Input>
            </Flex>

            <Flex dir="row" align="center">
              <Text w="160px">Timebar color: </Text>
              <Spacer />
              <Select
                size="sm"
                placeholder="Select..."
                onChange={(e) => {
                  setTimebarColor(e.target.value);
                }}
                w="150px"
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
            <Flex dir="row">
              <Text pr="10px">Controls:</Text>
              <RadioGroup onChange={setControlsTheme} value={controlsTheme}>
                <Stack direction="row">
                  <Radio value="white">White</Radio>
                  <Radio value="black">Black</Radio>
                </Stack>
              </RadioGroup>
            </Flex>
            <Checkbox
              isChecked={showAlbumCover}
              onChange={(e) => setShowAlbumCover(e.target.checked)}
            >
              Show album cover
            </Checkbox>
          </Flex>
        </Flex>

        <Flex align="center" pb="15px"></Flex>

        <Flex justify="center">
          <Button onClick={saveImage}>Download</Button>
        </Flex>
      </Box>
    </Flex>
  );
}

export const getServerSideProps = async (context) => {
  let trackId = context.query.trackId;

  const { access_token } = await getAccessToken();

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
      defaultValue={props.defaultValue}
      value={props.sliderValue}
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

function handleChange(color, event) {
  setBgColor(color);
}

export default CoverGenerator;
