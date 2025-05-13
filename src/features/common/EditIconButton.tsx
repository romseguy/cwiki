import { EditIcon } from "@chakra-ui/icons";
import { IconButton, IconButtonProps } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { selectIsMobile } from "store/uiSlice";

export const EditIconButton = ({ ...props }: Omit<IconButtonProps, "ref">) => {
  const isMobile = useSelector(selectIsMobile);

  return (
    <IconButton
      icon={<EditIcon />}
      {...(isMobile
        ? {
            colorScheme: "green",
            variant: "outline"
          }
        : {
            bgColor: "transparent",
            height: "auto",
            minWidth: 0,
            _hover: { color: "green" }
          })}
      {...props}
    />
  );
};
