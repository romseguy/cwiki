import { getRefId, isUser } from "models/Entity";
import { IEvent } from "models/Event";
import { IOrg } from "models/Org";
import { hasItems } from "utils/array";
import { equals, logJson } from "utils/string";
import { AppQuery } from "utils/types";
import {
  EOrgSubscriptionType,
  IEventSubscription,
  IOrgSubscription,
  ISubscription,
  TagType
} from "./ISubscription";

export * from "./ISubscription";

export const isOrgSubscription = (
  followerSubscription: IOrgSubscription | IEventSubscription
): followerSubscription is IOrgSubscription => {
  return (followerSubscription as IOrgSubscription).orgId !== undefined;
};

export const getEmail = (sub: ISubscription) => {
  if (isUser(sub.user)) return sub.user.email;
  return sub.email;
};

export const getEntitySubscription = ({
  event,
  org,
  subQuery,
  subscription
}: {
  event?: IEvent;
  org?: IOrg;
  subQuery?: AppQuery<ISubscription>;
  subscription?: ISubscription;
}): IOrgSubscription | IEventSubscription | undefined => {
  const sub = subQuery?.data || subscription;

  if (!sub) return;

  if (event) {
    return sub.events?.find((eventSubscription: IEventSubscription) =>
      equals(getRefId(eventSubscription.event, "_id"), event._id)
    );
  }

  if (org) {
    return sub.orgs?.find((orgSubscription: IOrgSubscription) =>
      equals(getRefId(orgSubscription.org, "_id"), org._id)
    );
  }
};

export const setEntityTagTypes = (
  newTagType: TagType,
  sub: IOrgSubscription | IEventSubscription
): IOrgSubscription | IEventSubscription => {
  if (!hasItems(sub.tagTypes)) {
    sub.tagTypes = [newTagType];
    return sub;
  }

  if (sub.tagTypes?.find((tagType) => tagType.type === newTagType.type)) {
    sub.tagTypes = sub.tagTypes
      .filter((tagType) => tagType.type !== newTagType.type)
      .concat([newTagType]);
  } else {
    sub.tagTypes = (sub.tagTypes || []).concat([newTagType]);
  }

  return sub;
};
