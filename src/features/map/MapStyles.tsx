import { styled } from "twin.macro";

export const MapStyles = styled("div")((props: any) => {
  return `
    .cluster .marker {
      background: red;
    }
  `;
});
