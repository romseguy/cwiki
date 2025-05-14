import { CalendarIcon, ChatIcon, LockIcon } from "@chakra-ui/icons";
import {
  Button,
  ButtonProps,
  Flex,
  HStack,
  Icon,
  Tooltip,
  TooltipProps,
  useColorMode
} from "@chakra-ui/react";

import React from "react";
import { FaGithub, FaTree } from "react-icons/fa";
import { IoIosPeople, IoIosPerson } from "react-icons/io";
import { css } from "@emotion/react";
import {
  IOrg,
  EOrgType,
  EOrgVisibility,
  OrgTypes,
  orgTypeFull5
} from "models/Org";
import { IUser } from "models/User";
import { ITopic } from "models/Topic";
import { useRouter } from "next/router";
import { getRefId } from "models/Entity";
import { Link } from "../Link";

export const EntityButton = ({
  children,
  org,
  topic,
  user,
  hasTooltip = false,
  onClick,
  tooltipProps,
  ...props
}: Omit<ButtonProps, "onClick"> & {
  org?: Partial<IOrg>;
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
    ? `${
        org.orgType === EOrgType.TREETOOLS ? OrgTypes[org.orgType] + " : " : ""
      }${org.orgName}`
    : user
    ? user.userName
    : "";
  let entityUrl = org
    ? org.orgUrl
    : typeof user === "object"
    ? user.userName
    : "";
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
      ? org.orgUrl === "forum"
        ? "Aller au forum"
        : org.orgType
        ? `Visiter ${orgTypeFull5(org.orgType)}`
        : ""
      : user
      ? "Visiter la page de l'utilisateur"
      : ""
    : "";

  if (!entityUrl && !onClick) return null;

  const button = (
    <HStack bgColor="teal" borderRadius={12} color="white" p={3}>
      <Icon
        as={
          topic
            ? ChatIcon
            : user
            ? IoIosPerson
            : org
            ? org.orgType === EOrgType.NETWORK
              ? FaTree
              : FaGithub
            : ChatIcon
        }
        color={
          topic
            ? "blue.500"
            : org
            ? org.orgType === EOrgType.NETWORK
              ? "white"
              : "blue.500"
            : "blue.500"
        }
      />
      <Link
        href={"/a/" + entityUrl!}
        shallow
        // onClick={(e) => {
        //   if (onClick) onClick(e);
        //   else if (onClick !== null)
        //     router.push("/a/" + entityUrl!, "/a/" + entityUrl, {
        //       shallow: true
        //     });
        // }}
      >
        {children || entityName}
        {/* <Button
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
          </Button> */}
      </Link>
    </HStack>
  );

  if (!hasTooltip) return button;

  return (
    <Tooltip label={label} hasArrow {...tooltipProps}>
      {button}
    </Tooltip>
  );
};
