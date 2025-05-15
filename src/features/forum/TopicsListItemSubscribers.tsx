import { Flex, Spinner, Tag, Text } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useSession } from "hooks/useSession";
import { ITopic } from "models/Topic";
import { Link } from "features/common";
import { useGetSubscriptionsQuery } from "features/api/subscriptionsApi";

export const TopicsListItemSubscribers = ({
  topic,
  isSubbedToTopic
}: {
  topic: ITopic;
  isSubbedToTopic: boolean;
}) => {
  const { data: session } = useSession();
  const query = useGetSubscriptionsQuery({ topicId: topic._id });

  if (query.isLoading) return <Spinner boxSize={4} />;

  return (
    <Flex alignItems="center" flexWrap="wrap">
      {Array.isArray(query.data) && query.data.length > 0 ? (
        <Text fontSize="smaller" mr={1} whiteSpace="nowrap">
          Abonnés à la discussion :
        </Text>
      ) : (
        <Text fontSize="smaller" fontStyle="italic" whiteSpace="nowrap">
          Aucun abonnés à la discussion.
        </Text>
      )}

      {Array.isArray(query.data) && query.data.length > 0 && (
        <Flex flexWrap="wrap" mb={-1}>
          {query.data.map((subscription) => {
            if (typeof subscription.user !== "object") return;

            const userName =
              subscription.user.userName ||
              session?.user.email.replace(/@.+/, "");

            return (
              <Link key={subscription._id} href={`/${userName}`} mb={1}>
                <Tag mr={1} fontSize="smaller">
                  {userName}
                </Tag>
              </Link>
            );
          })}
        </Flex>
      )}
    </Flex>
  );
};
