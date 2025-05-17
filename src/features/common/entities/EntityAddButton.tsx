import { AddIcon, CalendarIcon, ChatIcon } from "@chakra-ui/icons";
import { Button, ButtonProps, Icon, useColorMode } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { FaGlobeEurope, FaTree } from "react-icons/fa";
import { EOrgType, IOrg } from "models/Org";
import { IoIosGitNetwork } from "react-icons/io";
import { useTranslation } from "next-i18next";
import { localize } from "utils/localize";

export const EntityAddButton = ({
  label,
  org,
  orgType,
  onClick,
  ...props
}: ButtonProps & {
  label?: string;
  org?: Partial<IOrg>;
  orgType?: EOrgType;
  onClick?: () => void;
}) => {
  const { t } = useTranslation();
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();
  const orgName = localize(org?.orgName, router.locale);

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

  if (org && orgType === EOrgType.GENERIC) {
    return (
      <Button
        colorScheme="teal"
        leftIcon={
          <>
            <AddIcon mr={0.5} />
            <Icon
              as={IoIosGitNetwork}
              color={isDark ? "green" : "lightgreen"}
            />
          </>
        }
        size="sm"
        onClick={(e) => {
          onClick && onClick();
          e.stopPropagation();
          const href = `/b/add/a/${org.orgUrl}`;
          router.push(href, href, {
            shallow: true
          });
        }}
        {...props}
      >
        {label || t("add-b")}
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
