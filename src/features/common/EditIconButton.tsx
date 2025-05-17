import { EditIcon } from "@chakra-ui/icons";
import { IconButton, IconButtonProps, Tooltip } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { selectIsMobile } from "store/uiSlice";

export const EditIconButton = ({
  label = "Modifier",
  hasArrow,
  placement = "left",
  ...props
}: Omit<IconButtonProps, "ref">) => {
  const isMobile = useSelector(selectIsMobile);

  return (
    <Tooltip label={label} placement={placement} hasArrow={hasArrow}>
      <IconButton
        aria-label={props["aria-label"] || label}
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
    </Tooltip>
  );
};
