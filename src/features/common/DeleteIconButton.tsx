import { DeleteIcon } from "@chakra-ui/icons";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  IconButton,
  IconButtonProps,
  Tooltip,
  TooltipProps,
  useColorMode,
  useDisclosure
} from "@chakra-ui/react";
import React from "react";
import { useSelector } from "react-redux";
import { selectIsMobile } from "store/uiSlice";
import theme from "features/layout/theme";

export const DeleteIconButton = ({
  body,
  header = "Confirmez la suppression",
  isDisabled,
  isLoading,
  hasArrow,
  label = "Supprimer",
  placement = "left",
  ...props
}: Omit<IconButtonProps, "aria-label"> &
  Omit<TooltipProps, "children"> & {
    "aria-label"?: string;
    body?: React.ReactNode;
    header?: React.ReactNode;
    isDisabled?: boolean;
    isLoading?: boolean;
  }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { onOpen, onClose, isOpen } = useDisclosure();
  const cancelRef = React.useRef<HTMLButtonElement | null>(null);
  const isMobile = useSelector(selectIsMobile);

  return (
    <>
      <Tooltip label={label} placement={placement} hasArrow={hasArrow}>
        <IconButton
          aria-label={props["aria-label"] || "Supprimer"}
          icon={<DeleteIcon />}
          //color={isDark ? "white" : theme.colors.black}
          {...(isMobile
            ? {
                colorScheme: "red",
                variant: "outline"
              }
            : {
                bgColor: "transparent",
                height: "auto",
                minWidth: 0,
                _hover: { bg: "transparent", color: "red" }
              })}
          {...props}
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
        />
      </Tooltip>

      {isOpen && (
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              {header && (
                <AlertDialogHeader fontSize="lg" fontWeight="bold">
                  {header}
                </AlertDialogHeader>
              )}

              <AlertDialogBody>{body}</AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Annuler
                </Button>
                <Button
                  isDisabled={isDisabled}
                  isLoading={isLoading}
                  colorScheme="red"
                  onClick={(e) => {
                    if (props.onClick) {
                      props.onClick(e);
                    }
                    onClose();
                  }}
                  ml={3}
                >
                  Supprimer
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      )}
    </>
  );
};
