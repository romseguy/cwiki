import { CalendarIcon, ChatIcon, LockIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonProps,
  Flex,
  HStack,
  Heading,
  Icon,
  Text,
  Tooltip,
  TooltipProps,
  useColorMode
} from "@chakra-ui/react";

import { css } from "@emotion/react";
import { getRefId } from "models/Entity";
import {
  EOrgType,
  EOrgVisibility,
  IOrg,
  OrgTypes,
  orgTypeFull5
} from "models/Org";
import { ITopic } from "models/Topic";
import { IUser } from "models/User";
import { useRouter } from "next/router";
import React from "react";
import { FaGithub, FaNetworkWired, FaTree } from "react-icons/fa";
import { IoIosGitNetwork, IoIosPeople, IoIosPerson } from "react-icons/io";
import { localize } from "utils/localize";
import { Link } from "../Link";

export const EntityButton = ({
  children,
  org,
  suborg,
  topic,
  user,
  hasTooltip = true,
  onClick,
  tooltipProps,
  ...props
}: Omit<ButtonProps, "onClick"> & {
  org?: Partial<IOrg>;
  suborg?: Partial<IOrg>;
  topic?: ITopic;
  user?: Partial<IUser>;
  hasTooltip?: boolean;
  onClick?:
    | null
    | ((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void);
  tooltipProps?: Partial<TooltipProps>;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const router = useRouter();

  const entityName = topic
    ? topic.topicName
    : org
    ? localize(org.orgName, router.locale)
    : user
    ? user.userName
    : "";

  let entityUrl = org
    ? org.orgUrl
    : typeof user === "object"
    ? user.userName
    : "";
  const href = `/a/${entityUrl}${suborg ? "/b/" + suborg.orgUrl : ""}`;
  if (topic) {
    entityUrl = `${
      entityUrl || getRefId(topic.org) || getRefId(topic.event)
    }/discussions/${topic.topicName}`;
  }
  const hasLink = !!entityUrl || !!onClick;
  const label = hasLink
    ? topic
      ? "Aller à la discussion"
      : org
      ? org.orgType
        ? `Visiter ${orgTypeFull5(org.orgType)}`
        : ""
      : user
      ? "Visiter la page de l'utilisateur"
      : ""
    : "";

  if (!entityUrl && !onClick) return null;

  const button = children || (
    <Heading
      display="flex"
      alignItems="center"
      bgColor="teal"
      borderRadius={12}
      color="white"
      p={3}
      size="sm"
    >
      <Icon
        cursor="pointer"
        as={
          topic
            ? ChatIcon
            : user
            ? IoIosPerson
            : org
            ? suborg
              ? IoIosGitNetwork
              : FaTree
            : ChatIcon
        }
        color={
          topic
            ? "blue.500"
            : org
            ? org.orgType === EOrgType.NETWORK
              ? "white"
              : "white"
            : "blue.500"
        }
        boxSize={8}
        pr={2}
        onClick={(e) => {
          if (onClick) onClick(e);
          else if (onClick !== null)
            router.push(href, href, {
              shallow: true
            });
        }}
      />
      <Link href={href} shallow>
        {suborg ? localize(suborg.orgName, router.locale) : entityName}
      </Link>
    </Heading>
  );
  if (!hasTooltip) return button;

  return (
    <Tooltip label={label} hasArrow {...tooltipProps}>
      {button}
    </Tooltip>
  );
};

{
  /* <Button
            aria-label={label}
            colorScheme="teal"
            leftIcon=
            height="auto"
            cursor={hasLink ? "pointer" : "default"}
            textAlign="left"
            whiteSpace="normal"
            m={0}
            p={1}
            pr={2}
            {...props}
          >
            {children || entityName}

            {Array.isArray(topic?.topicVisibility) &&
            topic?.topicVisibility.includes("Abonnés") ? (
              <Icon as={IoIosPeople} ml={2} />
            ) : org && org.orgVisibility === EOrgVisibility.PRIVATE ? (
              <Icon as={LockIcon} ml={2} />
            ) : null}
          </Button> */
}
