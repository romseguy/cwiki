import { QuestionIcon } from "@chakra-ui/icons";
import { Box, BoxProps, IconButton, Tooltip } from "@chakra-ui/react";
import React from "react";
import { useAppDispatch } from "store";
import { setIsContactModalOpen } from "store/modalSlice";

export const IconFooter = ({ ...props }: BoxProps & {}) => {
  const dispatch = useAppDispatch();
  const label = "Une question ? Contactez-nous  ͡❛ ͜ʖ ͡❛";

  return (
    <Box {...props}>
      <Tooltip hasArrow label={label}>
        {/* <Image src="/favicon-32x32.png" /> */}
        <IconButton
          aria-label={label}
          colorScheme="purple"
          icon={<QuestionIcon />}
          onClick={() => {
            dispatch(setIsContactModalOpen(true));
          }}
        />
      </Tooltip>
    </Box>
  );
};
