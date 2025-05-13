import {
  Badge,
  Button,
  Flex,
  FlexProps,
  Tooltip,
  useColorMode
} from "@chakra-ui/react";
import { useToast } from "hooks/useToast";

import { IOrg, IOrgList } from "models/Org";
import { ISubscription } from "models/Subscription";
import React from "react";
import { Session } from "utils/auth";
import { AppQuery } from "utils/types";

export const TopicsListOrgLists = ({
  org,
  isCreator,
  selectedLists,
  session,
  setSelectedLists,
  subQuery,
  ...props
}: FlexProps & {
  org: IOrg;
  isCreator?: boolean;
  selectedLists?: IOrgList[];
  session: Session;
  setSelectedLists: React.Dispatch<
    React.SetStateAction<IOrgList[] | undefined>
  >;
  subQuery: AppQuery<ISubscription>;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";

  return (
    <Flex flexWrap="wrap" {...props}>
      {org.orgLists.map((orgList, index) => {
        const isSelected = selectedLists?.find(
          ({ listName }) => listName === orgList.listName
        );

        const topicsCount = org.orgTopics.reduce((count, orgTopic) => {
          if (orgTopic.topicVisibility.includes(orgList.listName)) {
            return ++count;
          }
          return count;
        }, 0);

        return (
          <Tooltip
            key={"orgList-" + index}
            label={`Afficher les discussions de la liste "${orgList.listName}"`}
            hasArrow
          >
            <Button
              bg={
                isSelected
                  ? isDark
                    ? "pink.200"
                    : "pink.500"
                  : isDark
                    ? "#81E6D9"
                    : "#319795"
              }
              _hover={{
                bg: isSelected
                  ? isDark
                    ? "pink.300"
                    : "pink.600"
                  : isDark
                    ? "#4FD1C5"
                    : "#2C7A7B"
              }}
              color={isDark ? "black" : "white"}
              fontSize="small"
              fontWeight="normal"
              height="auto"
              // mb={1} // todo: when wrapped
              mr={1}
              p={2}
              onClick={() => {
                selectedLists?.find(
                  ({ listName }) => listName === orgList.listName
                )
                  ? setSelectedLists(
                      selectedLists.filter(
                        ({ listName }) => listName !== orgList.listName
                      )
                    )
                  : setSelectedLists((selectedLists || []).concat([orgList]));
              }}
            >
              {orgList.listName}
              {topicsCount > 0 && (
                <Badge colorScheme="green" ml={1}>
                  {topicsCount}
                </Badge>
              )}
            </Button>
          </Tooltip>
        );
      })}
    </Flex>
  );
};
