import { Hue, IColor, Saturation, useColor } from "react-color-palette";
import "react-color-palette/css";

interface ColorPickerProps {
  color?: Partial<IColor>;
  height?: number;
  onChange?: (color: IColor) => void;
}

export const ColorPicker = (props: ColorPickerProps) => {
  const [color, setColor] = useColor(props.color?.hex || "#ffffff");
  const { height = 300, onChange } = props;

  return (
    <div>
      <Saturation
        height={height}
        color={color}
        onChange={(color) => {
          setColor(color);
          onChange && onChange(color);
        }}
      />
      <Hue
        color={color}
        onChange={(color) => {
          setColor(color);
          onChange && onChange(color);
        }}
      />
    </div>
  );
};

{
  /*
  useEffect(() => {
    if (props.color && color.hex !== props.color.hex) setColor(props.color);
  }, [props.color]);

  return <RCPColorPicker color={color} onChange={setColor} />;
*/
}

{
  /*
import { Box } from "@chakra-ui/react";
import { css } from "@emotion/react";
import {
  clamp,
  getHueCoordinates,
  hsvToRgb,
  parseColor,
  rgbToHex
} from "utils/colors";


export interface ColorHSV {
  h: number;
  s: number;
  v: number;
}

interface ColorPickerProps {
  color: string;
  onChange(color: string): void;
  //variant: ColorPickerVariant;
}

export const ColorPicker = (props: ColorPickerProps) => {
  const { color, onChange } = props;
  const parsedColor = parseColor(color);
  const hueCoords = getHueCoordinates(parsedColor);

  return (
    <Box
      css={css`
        display: grid;
        grid-gap: 8px;
        margin-bottom: 16px;
        max-width: 100%;
        width: 400px;
      `}
    >
      <Box
        css={css`
          width: 100%;
          height: 12px;
          background-image: linear-gradient(
            to right,
            #ff0000,
            #ffff00,
            #00ff00,
            #00ffff,
            #0000ff,
            #ff00ff,
            #ff0000
          );
          border-radius: 999px;
          position: relative;
          cursor: crosshair;
        `}
        onClick={(event) => {
          const { width, left } = event.target.getBoundingClientRect();
          console.log(
            "🚀 ~ file: ColorPicker.tsx:93 ~ ColorPicker ~ left:",
            left
          );
          console.log(
            "🚀 ~ file: ColorPicker.tsx:93 ~ ColorPicker ~ width:",
            width
          );
          const x = clamp(event.clientX - left, 0, width);
          const h = Math.round((x / width) * 360);
          const hsv = { h, s: parsedColor?.hsv.s, v: parsedColor?.hsv.v };
          const rgb = hsvToRgb(hsv);
          onChange(rgbToHex(rgb));
        }}
      >
        <Box
          css={css`
            width: 15px;
            height: 15px;
            border: 2px solid #ffffff;
            border-radius: 50%;
            transform: translate(-7.5px, -2px);
            position: absolute;
            background-color: ${parsedColor.hex};
            left: ${(hueCoords ?? 0) + "%"};
          `}
        />
      </Box>
    </Box>
  );
};
*/
}

{
  /*
// export const ColorPicker = () => {
//   const [color, setColor] = useState("gray.500");

//   const colors = [
//     "gray.500",
//     "red.500",
//     "gray.700",
//     "green.500",
//     "blue.500",
//     "blue.800",
//     "yellow.500",
//     "orange.500",
//     "purple.500",
//     "pink.500"
//   ];

//   return (
//     <Popover variant="picker">
//       <PopoverTrigger>
//         <Button
//           aria-label={color}
//           background={color}
//           height="22px"
//           width="22px"
//           padding={0}
//           minWidth="unset"
//           borderRadius={3}
//         ></Button>
//       </PopoverTrigger>
//       <PopoverContent width="170px">
//         <PopoverArrow bg={color} />
//         <PopoverCloseButton color="white" />
//         <PopoverHeader
//           height="100px"
//           backgroundColor={color}
//           borderTopLeftRadius={5}
//           borderTopRightRadius={5}
//           color="white"
//         >
//           <Center height="100%">{color}</Center>
//         </PopoverHeader>
//         <PopoverBody height="120px">
//           <SimpleGrid columns={5} spacing={2}>
//             {colors.map((c) => (
//               <Button
//                 key={c}
//                 aria-label={c}
//                 background={c}
//                 height="22px"
//                 width="22px"
//                 padding={0}
//                 minWidth="unset"
//                 borderRadius={3}
//                 _hover={{ background: c }}
//                 onClick={() => {
//                   setColor(c);
//                 }}
//               ></Button>
//             ))}
//           </SimpleGrid>
//           <Input
//             borderRadius={3}
//             marginTop={3}
//             placeholder="red.100"
//             size="sm"
//             value={color}
//             onChange={(e) => {
//               setColor(e.target.value);
//             }}
//           />
//         </PopoverBody>
//       </PopoverContent>
//     </Popover>
//   );
// };
*/
}

{
  /*

    <Box
      css={css`
        display: grid;
        grid-gap: 8px;
        margin-bottom: 16px;
        max-width: 100%;
        width: 400px;
      `}
    >
      <Box
        css={css`
width: 100%;
height: 150px;
backgroundColor: hsl(${parsedColor.hsv.h}, 100%, 50%);
background-image: linear-gradient(transparent, black);
linear-gradient(to right, white, transparent);
border-radius: 4px;
position: relative;
cursor: crosshair; 
        `}
        onClick={onSaturationChange}
      >
        <Box
          css={css`
            backgroundcolor: ${parsedColor.hex};
            left: ${(satCoords?.[0] ?? 0) + "%"};
            top: ${(satCoords?.[1] ?? 0) + "%"};
          `}
        />
      </Box>

    </Box>
*/
}
