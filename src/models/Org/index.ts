import { CalendarIcon, ChatIcon, SettingsIcon } from "@chakra-ui/icons";
import { getOrgs, useGetOrgsQuery } from "features/api/orgsApi";
import { EOrgSubscriptionType, ISubscription } from "models/Subscription";
import { FaGlobeEurope, FaHome, FaImages, FaTools } from "react-icons/fa";
import { GrWorkshop } from "react-icons/gr";
import { AppDispatch } from "store";
import { hasItems } from "utils/array";
import { Session } from "utils/auth";
import { belongs } from "utils/belongs";
import { capitalize, equals, normalize } from "utils/string";
import {
  EOrgType,
  EOrgVisibility,
  IOrg,
  IOrgEventCategory,
  IOrgList,
  IOrgTabWithMetadata
} from "./IOrg";

export const defaultLists = [/*"Abonnés",*/ "Participants"];

export * from "./IOrg";

//#region categories
export const getEventCategories = (org?: IOrg): IOrgEventCategory[] => {
  return org ? org.orgEventCategories : [];
};
//#endregion

//#region descriptions
export const getOrgDescriptionByType = (orgType?: EOrgType): string => {
  return "";
};
//#endregion

//#region lists
export const addOrReplaceList = (org: IOrg, list: IOrgList) => {
  let orgListExists = false;
  let orgLists: IOrgList[] = [];

  orgLists = org.orgLists.map((orgList) => {
    if (orgList.listName === list.listName) {
      orgListExists = true;
      return list;
    }
    return orgList;
  });

  if (!orgListExists) orgLists = org.orgLists.concat([list]);

  return orgLists;
};

export const editList = (
  org: IOrg,
  listToEdit: Partial<IOrgList>,
  newList: IOrgList
) => {
  if (!hasItems(org.orgLists)) return [newList];

  return org.orgLists.map((orgList) => {
    if (orgList.listName === listToEdit.listName) return newList;
    return orgList;
  });
};

export const getLists = (org?: IOrg): IOrgList[] => {
  if (!org) return [];

  let lists = org.orgLists;

  // if (
  //   Array.isArray(lists) &&
  //   !lists.find(({ listName }) => listName === "Abonnés")
  // )
  //   lists = [
  //     {
  //       listName: "Abonnés",
  //       subscriptions: getSubscriptions(org, EOrgSubscriptionType.FOLLOWER)
  //     }
  //   ].concat(lists);

  if (
    Array.isArray(lists) &&
    !lists.find(({ listName }) => listName === "Participants")
  )
    lists = [
      {
        listName: "Participants",
        subscriptions: [] as ISubscription[] // TODO1 ?
      }
    ].concat(lists);

  return lists;
};
//#endregion

//#region networks
export const getNetworks = async (
  org: IOrg,
  session: Session | null,
  dispatch: AppDispatch
) => {
  const { data: myOrgs } = await dispatch(
    getOrgs.initiate({
      createdBy: session?.user.userId,
      populate: "orgs"
    })
  );

  const { data: orgs } = await dispatch(
    getOrgs.initiate({
      populate: "orgs"
    })
  );

  let orgNetworks = orgs;

  if (myOrgs && orgs) {
    orgNetworks = myOrgs.concat(
      orgs.filter(({ _id }) => !myOrgs.find((myOrg) => myOrg._id === _id))
    );
  }

  return orgNetworks?.filter(
    (o) =>
      o.orgName !== org.orgName &&
      o.orgType === EOrgType.NETWORK &&
      !!o.orgs?.find(({ orgName }) => orgName === org.orgName)
  );
};
//#endregion

//#region subscriptions
export const getSubscriptions = (org: IOrg, type: string) => {
  if (!Array.isArray(org.orgSubscriptions) || !org.orgSubscriptions.length)
    return [];

  if (
    typeof org.orgSubscriptions[0] === "string" ||
    !org.orgSubscriptions[0].createdAt
  )
    throw new Error("getSubscriptions: org.orgSubscriptions must be populated");

  return org.orgSubscriptions.filter((subscription) =>
    subscription.orgs?.find(
      (orgSubscription) =>
        equals(orgSubscription.orgId, org._id) && orgSubscription.type === type
    )
  );
};
//#endregion

//#region tabs
// url and label must be same (not case sensitive)
export const defaultTabs: IOrgTabWithMetadata[] = [
  { order: 0, label: "Présentation", icon: FaHome, url: "/" },
  {
    order: 1,
    label: ["Discussions", "d"],
    icon: ChatIcon,
    url: ["/discussions", "/d"]
  },
  { order: 2, label: "Agenda", icon: CalendarIcon, url: "/agenda" },
  // { order: 3, label: "Projets", icon: FaTools, url: "/projets" },
  { order: 3, label: "Galeries", icon: FaImages, url: "/galeries" }
  //{ order: 5, label: "", icon: SettingsIcon, url: "/parametres" }
];
export const getDefaultTab = ({ url }: { url?: string | string[] }) => {
  if (!url) return undefined;
  return defaultTabs.find((defaultTab) => belongs(defaultTab.url, url));
};
export const getCurrentTab = ({
  org,
  currentTabLabel
}: {
  org: IOrg;
  currentTabLabel: string;
}) => {
  if (normalize(currentTabLabel) === "parametres") {
    return defaultTabs.find(({ url }) => url === "/parametres");
  }

  const dt = defaultTabs.find(({ label }) => belongs(label, currentTabLabel));
  if (!dt && org.orgTabs) {
    return org.orgTabs.find((orgTab) => belongs(orgTab.label, currentTabLabel));
  }

  return dt;
};
//#endregion

//#region toString
export const orgTypeFull = (orgType: EOrgType = EOrgType.GENERIC): string => {
  return `${
    [EOrgType.GENERIC].includes(orgType)
      ? "de l'"
      : [EOrgType.TREETOOLS].includes(orgType)
        ? "du "
        : "de l'"
  }${OrgTypes[orgType].toLowerCase()}`;
};

export const orgTypeFull2 = (orgType: EOrgType = EOrgType.GENERIC): string =>
  `${
    [EOrgType.GENERIC].includes(orgType)
      ? "à l'"
      : [EOrgType.TREETOOLS].includes(orgType)
        ? "au "
        : "à l'"
  }${OrgTypes[orgType].toLowerCase()}`;

export const orgTypeFull3 = (orgType: EOrgType = EOrgType.GENERIC): string => {
  return `${
    [EOrgType.GENERIC, EOrgType.TREETOOLS].includes(orgType) ? "un " : "un "
  }${OrgTypes[orgType].toLowerCase()}`;
};

export const orgTypeFull4 = (orgType: EOrgType = EOrgType.GENERIC): string =>
  `${
    [EOrgType.GENERIC].includes(orgType)
      ? "cet "
      : [EOrgType.TREETOOLS].includes(orgType)
        ? "ce "
        : "cette "
  }${OrgTypes[orgType].toLowerCase()}`;

export const orgTypeFull5 = (
  orgType: EOrgType = EOrgType.GENERIC,
  isCapitalized?: boolean
): string => {
  const str = `${
    [EOrgType.NETWORK].includes(orgType)
      ? "l'"
      : [EOrgType.TREETOOLS].includes(orgType)
        ? "le "
        : "l'"
  }${OrgTypes[orgType].toLowerCase()}`;

  if (isCapitalized) return capitalize(str);

  return str;
};

export const OrgTypes: Record<EOrgType, string> = {
  [EOrgType.GENERIC]: "Branche",
  [EOrgType.NETWORK]: "Arbre"
};

export const OrgVisibilities: Record<EOrgVisibility, string> = {
  [EOrgVisibility.FRONT]: "En 1ère page du site",
  [EOrgVisibility.LINK]: "Uniquement par ceux qui ont le lien",
  [EOrgVisibility.PUBLIC]: "Publique",
  [EOrgVisibility.PRIVATE]: "Protégée par un mot de passe"
};
//#endregion
