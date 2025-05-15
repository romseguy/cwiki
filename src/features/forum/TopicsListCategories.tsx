import { SettingsIcon } from "@chakra-ui/icons";
import {
  Badge,
  Box,
  Flex,
  FlexProps,
  IconButton,
  Tag,
  TagCloseButton,
  Text,
  Tooltip,
  useColorMode,
  useDisclosure
} from "@chakra-ui/react";
import { useEditEventMutation } from "features/api/eventsApi";
import { useEditOrgMutation } from "features/api/orgsApi";
import { DeleteButton } from "features/common";
import { CategoriesModal } from "features/modals/CategoriesModal";
import {
  EEntityCategoryKey,
  IEntity,
  IEntityCategory,
  isEvent,
  isOrg
} from "models/Entity";
import { IEvent, IEventTopicCategory } from "models/Event";
import { IOrg, IOrgTopicCategory } from "models/Org";
import React, { useEffect, useState } from "react";
import { AppQueryWithData } from "utils/types";

const TopicsListCategoriesSettings = ({
  categories,
  query
}: {
  categories: IEventTopicCategory[] | IOrgTopicCategory[];
  query: AppQueryWithData<IEntity>;
}) => {
  const entity = query.data;
  const isE = isEvent(entity);
  const isO = isOrg(entity);
  const {
    isOpen: isCategoriesModalOpen,
    onOpen: openCategoriesModal,
    onClose: closeCategoriesModal
  } = useDisclosure();
  const label = "Gérer les catégories de discussions";

  return (
    <>
      <Tooltip label={label} placement="right">
        <IconButton
          aria-label={label}
          colorScheme="teal"
          height="32px"
          icon={<SettingsIcon />}
          //_hover={{ bg: "teal", color: "white" }}
          mr={1}
          onClick={openCategoriesModal}
        ></IconButton>
      </Tooltip>

      <CategoriesModal
        categories={categories}
        categoryKey={
          isE
            ? EEntityCategoryKey.eventTopicCategories
            : EEntityCategoryKey.orgTopicCategories
        }
        isOpen={isCategoriesModalOpen}
        query={query}
        onClose={closeCategoriesModal}
      />
    </>
  );
};

export const TopicsListCategories = ({
  query,
  isCreator,
  selectedCategories,
  setSelectedCategories,
  ...props
}: FlexProps & {
  query: AppQueryWithData<IEntity>;
  isCreator?: boolean;
  selectedCategories?: string[];
  setSelectedCategories: React.Dispatch<
    React.SetStateAction<string[] | undefined>
  >;
}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const [editEvent] = useEditEventMutation();
  const [editOrg] = useEditOrgMutation();
  const entity = query.data;
  const isE = isEvent(entity);
  const isO = isOrg(entity);
  const edit = isE ? editEvent : editOrg;
  const topicCategories: IEntityCategory[] =
    entity[
      isE
        ? EEntityCategoryKey.eventTopicCategories
        : EEntityCategoryKey.orgTopicCategories
    ];
  const topics = isE ? entity.eventTopics : isO ? entity.orgTopics : [];

  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    if (!query.isFetching) {
      setIsLoading(
        Object.keys(isLoading).reduce(
          (obj, key) => ({ ...obj, [key]: false }),
          {}
        )
      );
    }
  }, [query.isFetching]);

  return (
    <Flex {...props}>
      {isCreator && (
        <TopicsListCategoriesSettings
          categories={topicCategories}
          query={query}
        />
      )}

      {topicCategories.map(({ catId, label }, index) => {
        const isSelected = selectedCategories?.find(
          (selectedCategory) => selectedCategory === catId
        );
        const topicsCount = topics.filter(
          (topic) => topic.topicCategory === catId
        ).length;

        return (
          <Tag
            key={`category-${index}`}
            bg={
              isSelected
                ? isDark
                  ? "pink.200"
                  : "pink.500"
                : isDark
                  ? "#81E6D9"
                  : "#319795"
            }
            color={isDark ? "black" : "white"}
            cursor="pointer"
            fontWeight="normal"
            mr={1}
            p={0}
            _hover={{
              bg: isSelected
                ? isDark
                  ? "pink.300"
                  : "pink.600"
                : isDark
                  ? "#4FD1C5"
                  : "#2C7A7B"
            }}
            onClick={() => {
              selectedCategories?.find(
                (selectedCategory) => selectedCategory === catId
              )
                ? setSelectedCategories(
                    selectedCategories.filter(
                      (selectedCategory) => selectedCategory !== catId
                    )
                  )
                : setSelectedCategories(
                    (selectedCategories || []).concat([catId])
                  );
            }}
          >
            <Tooltip
              label={`Afficher les discussions de la catégorie "${label}"`}
              hasArrow
            >
              <Flex alignItems="center" p={2}>
                <Text fontWeight="bold">{label}</Text>
                {topicsCount > 0 && (
                  <Badge
                    bg={isDark ? "teal" : "#81E6D9"}
                    borderRadius="md"
                    ml={2}
                  >
                    {topicsCount}
                  </Badge>
                )}
              </Flex>
            </Tooltip>

            {isCreator && (
              <Box
                borderColor={isDark ? "#BAC1CB" : "gray.500"}
                borderLeftWidth="1px"
                pr={3}
              >
                <TagCloseButton as="span">
                  <DeleteButton
                    color={isDark ? "black" : "white"}
                    isIconOnly
                    // tooltip props
                    hasArrow
                    label="Supprimer la catégorie"
                    placement="right"
                    // other props
                    header={
                      <>
                        Êtes vous sûr de vouloir supprimer la catégorie {label}{" "}
                        ?
                      </>
                    }
                    isLoading={isLoading[`category-${index}`]}
                    onClick={async () => {
                      setIsLoading({ [`category-${index}`]: true });
                      try {
                        await edit({
                          [isE ? "eventId" : "orgId"]: entity._id,
                          payload: [
                            isE
                              ? `eventTopicCategories.catId=${catId}`
                              : `orgTopicCategories.catId=${catId}`
                          ]
                        });
                      } catch (error) {
                        setIsLoading({ [`category-${index}`]: false });
                        console.error(error);
                      }
                    }}
                  />
                </TagCloseButton>
              </Box>
            )}
          </Tag>
        );
      })}
    </Flex>
  );
};
