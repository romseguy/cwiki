import { EmailIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  ComponentWithAs,
  Icon,
  IconProps,
  Tooltip
} from "@chakra-ui/react";
import React from "react";
import { IconType } from "react-icons";
import { FaGlobeEurope } from "react-icons/fa";
import { IEntity, isEvent, isOrg } from "models/Entity";
import { orgTypeFull } from "models/Org";
import { ITopic } from "models/Topic";
import { hasItems } from "utils/array";
import { AppIcon, AppQueryWithData } from "utils/types";

export const TopicsListItemVisibility = ({
  query,
  topic,
  ...props
}: Omit<IconProps, "aria-label"> & {
  query: AppQueryWithData<IEntity>;
  topic: ITopic;
}) => {
  const entity = query.data;
  const isE = isEvent(entity);
  const isO = isOrg(entity);

  let icons: {
    label: string;
    icon: AppIcon;
  }[] = [];

  const customLists = topic.topicVisibility.filter(
    (listName) => !["Abonnés"].includes(listName)
  );

  const suffix = isE
    ? "de " + entity.eventName
    : isO
      ? `${orgTypeFull(entity.orgType)} "${entity.orgName}"`
      : "";

  if (Array.isArray(customLists) && customLists.length > 0) {
    icons = [
      {
        label: `Discussion réservée aux membres ${
          customLists.length === 1
            ? `de la liste "${customLists[0]}"`
            : `des listes ${customLists.map(
                (listName, index) => ` "${listName}"`
              )}`
        }`,
        icon: HamburgerIcon
      }
    ];
  }

  if (topic.topicVisibility.includes("Abonnés")) {
    icons.push({
      label: `Discussion réservée aux abonnés ${suffix}`,
      icon: EmailIcon
    });
  }

  if (!hasItems(icons))
    icons = [
      {
        label: "Discussion publique",
        icon: FaGlobeEurope
      }
    ];

  return (
    <>
      {icons.map(({ label, icon }, index) => (
        <Tooltip key={index} label={label}>
          <span>
            <Icon as={icon} boxSize={4} {...props} />
          </span>
        </Tooltip>
      ))}
    </>
  );
};
