import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { Flex, Icon, Tooltip } from "@chakra-ui/react";
import { Link } from "features/common";
import React, { useState } from "react";
import { AppIcon } from "utils/types";

export const CollapsibleLink = ({
  collapseLength,
  icon,
  url
}: {
  collapseLength: number;
  icon: AppIcon;
  url: string;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  let uri = url.includes("http")
    ? url.replace("https://", "").replace("http://", "").replace("www.", "")
    : url;
  uri = uri.replace(/\/$/, "");
  let canCollapse = uri.length > collapseLength;
  let shortUrl = uri;
  if (canCollapse && isCollapsed)
    shortUrl = uri.substr(0, collapseLength) + "...";

  return (
    <Flex alignItems="center">
      {!isCollapsed ? (
        <Tooltip label="Réduire l'adresse du site internet" placement="top">
          <ViewOffIcon
            cursor="pointer"
            mr={3}
            onClick={() => setIsCollapsed(true)}
          />
        </Tooltip>
      ) : (
        <Icon as={icon} mr={3} />
      )}

      <Link target="_blank" variant="underline" href={url}>
        {shortUrl}
      </Link>

      {canCollapse && isCollapsed ? (
        <Tooltip
          label="Voir en entier l'adresse du site internet"
          placement="top"
        >
          <ViewIcon
            cursor="pointer"
            ml={2}
            onClick={() => setIsCollapsed(false)}
          />
        </Tooltip>
      ) : null}
    </Flex>
  );
};
