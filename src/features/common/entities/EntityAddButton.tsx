import { AddIcon, CalendarIcon, ChatIcon } from "@chakra-ui/icons";
import { Button, ButtonProps, Icon, useColorMode } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { FaGlobeEurope, FaTree } from "react-icons/fa";
import { EOrgType } from "models/Org";

export const EntityAddButton = ({
  label,
  eventName,
  orgName,
  orgType,
  onClick,
  ...props
}: ButtonProps & {
  label?: string;
  eventName?: string;
  orgName?: string;
  orgType?: EOrgType;
  onClick?: () => void;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();

  if (orgType === EOrgType.NETWORK) {
    return (
      <Button
        colorScheme="teal"
        leftIcon={
          <>
            <AddIcon mr={0.5} />
            <Icon as={FaTree} color={isDark ? "green" : "lightgreen"} />
          </>
        }
        size="sm"
        onClick={(e) => {
          onClick && onClick();
          e.stopPropagation();
          const url = orgName ? `/add?treeName=${orgName}` : "/add";
          router.push(url, url, {
            shallow: true
          });
        }}
        data-cy="org-add-button"
        {...props}
      >
        {label || "Ajouter un arbre"}
      </Button>
    );
  }

  if (label === "Ajouter une discussion") {
    return (
      <Button
        colorScheme="teal"
        leftIcon={
          <>
            <AddIcon mr={1} />
            <ChatIcon />
          </>
        }
        size="sm"
        onClick={(e) => {
          onClick && onClick();
          e.stopPropagation();
          const url = `/discussions/ajouter`;
          router.push(url, url, {
            shallow: true
          });
        }}
        data-cy="org-add-button"
        {...props}
      >
        {label}
      </Button>
    );
  }

  return (
    <Button
      colorScheme="teal"
      leftIcon={
        <>
          <AddIcon mr={1} />
          <CalendarIcon />
        </>
      }
      size="sm"
      mt={1}
      onClick={() => {
        const url = eventName
          ? `/evenements/ajouter?eventName=${eventName}`
          : "/evenements/ajouter";
        router.push(url, url, {
          shallow: true
        });
      }}
      data-cy="event-add-button"
    >
      {label || "Ajouter un événement"}
    </Button>
  );
};
