import {
  Icon,
  ChevronUpIcon,
  ChevronRightIcon,
  SmallAddIcon
} from "@chakra-ui/icons";
import {
  Heading,
  HStack,
  Button,
  Tooltip,
  IconButton,
  Alert,
  AlertIcon,
  Box,
  Flex,
  Text,
  useColorMode,
  useToast
} from "@chakra-ui/react";
import { EditOrgPayload, useEditOrgMutation } from "features/api/orgsApi";
import {
  EditIconButton,
  Link,
  RTEditor,
  SelectionPopover,
  TabContainer,
  TabContainerHeader,
  TabContainerContent
} from "features/common";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { isMobile } from "react-device-detect";
import { useTranslation } from "next-i18next";
import { FaNewspaper } from "react-icons/fa";
import { localize } from "utils/localize";
import { sanitize } from "isomorphic-dompurify";
import { useSession } from "hooks/useSession";
import forest from "store/forest.json";
import { WIKI_URL } from "utils/string";

const Description = ({ description, onClick }) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const { t } = useTranslation();
  const [showPopover, setShowPopover] = useState(false);

  return (
    <>
      <Alert
        status="info"
        {...(isMobile ? {} : { m: "0 auto", w: "30%", minW: "300px" })}
      >
        <AlertIcon />
        <Flex>{t("select")}</Flex>
      </Alert>
      {/* <div data-selectable>yadyayda</div> */}
      <Box
        data-selectable
        className="rteditor"
        dangerouslySetInnerHTML={{
          __html: sanitize(description)
        }}
        bg={`rgba(${isDark ? "255,255,255,0.1" : "0,0,0,0.1"})`}
        borderRadius={12}
        mt={3}
        p={5}
      />
      <SelectionPopover
        showPopover={showPopover}
        onSelect={() => {
          setShowPopover(true);
        }}
        onDeselect={() => {
          setShowPopover(false);
        }}
      >
        <Button
          colorScheme="orange"
          onClick={() => {
            const selection = window.getSelection().toString();
            onClick(selection);
            setShowPopover(false);
          }}
        >
          {t("select-submit")}
        </Button>
      </SelectionPopover>
    </>
  );
};

export const DescriptionContainer = ({
  currentTabLabel,
  isCreator,
  org,
  suborg
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast({ position: "top" });
  const [editOrg] = useEditOrgMutation();
  const { t } = useTranslation();
  const [isAddingDescription, setIsAddingDescription] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(
    currentTabLabel !== "t"
  );
  const [html, setHtml] = useState("");
  const [description, setDescription] = useState<string | undefined>();
  const orgDescription = localize(
    suborg
      ? suborg.orgDescription || { en: "", fr: "" }
      : org
      ? org.orgDescription || { en: "", fr: "" }
      : { en: "", fr: "" },
    router.locale
  );
  useEffect(() => {
    transformDescription();
    function transformDescription() {
      const doc = new DOMParser().parseFromString(orgDescription, "text/html");

      const regex = /\[([^\]]+)]\(\[\[([^\|\]]+)]]\)/gi;
      const matches = doc.body.innerHTML.matchAll(regex);
      for (const m of matches) {
        const [yy, fr, en] = m;
        let branchUrl = en;
        let treeName: string | undefined;

        for (const tree of forest) {
          if (tree.branches.find((branchName) => branchName === branchUrl)) {
            treeName = tree.tree;
          }
        }

        doc.body.innerHTML = doc.body.innerHTML.replace(
          yy,
          treeName
            ? `<a href="${WIKI_URL}/${treeName.replaceAll(
                " ",
                "-"
              )}/${en.replaceAll(" ", "-")}">${fr}</a>`
            : fr
        );
      }

      const regex2 = /\[\[([^\]]+)]]/gi;
      const matches2 = doc.body.innerHTML.matchAll(regex2);
      for (const m of matches2) {
        const [yy, name] = m;
        let treeName: string | undefined;
        for (const tree of forest) {
          if (tree.branches.find((branchName) => branchName === name)) {
            treeName = tree.tree;
          }
        }
        doc.body.innerHTML = doc.body.innerHTML.replace(
          yy,
          treeName
            ? `<a href="${WIKI_URL}/${treeName.replaceAll(
                " ",
                "-"
              )}/${name.replaceAll(" ", "-")}">${name}</a>`
            : name
        );
      }

      if (isMobile) {
        const links = (doc.firstChild as HTMLElement).getElementsByTagName("a");
        for (let i = 0; i < links.length; i++) {
          const link = links[i];

          if (!link.innerText.includes("http")) {
            link.setAttribute("title", link.innerText);

            if (link.href.includes("http") || link.href.includes("mailto:")) {
              link.classList.add("clip");

              if (link.href.includes("mailto:"))
                link.innerText = "@" + link.innerText;
            }
          }
        }
      } else {
      }
      setDescription(doc.body.innerHTML);
    }
  }, [org, suborg, router.locale]);

  return (
    <TabContainer borderBottomRadius={isDescriptionOpen ? undefined : "lg"}>
      <TabContainerHeader
        borderBottomRadius={isDescriptionOpen ? undefined : "lg"}
        onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
      >
        <Icon
          as={isDescriptionOpen ? ChevronUpIcon : ChevronRightIcon}
          boxSize={6}
          ml={3}
          mr={1}
        />
        <Heading size="sm">{t("desc-a")}</Heading>

        {isCreator && (
          <EditIconButton
            aria-label="Modifier"
            colorScheme="white"
            placement="right"
            ml={3}
            {...(isMobile ? {} : {})}
            onClick={(e) => {
              e.stopPropagation();
              setIsAddingDescription(true);
            }}
          />
        )}
      </TabContainerHeader>

      {isDescriptionOpen && (
        <TabContainerContent p={3}>
          {isAddingDescription ? (
            <>
              <RTEditor
                defaultValue={orgDescription}
                onChange={({ html }) => {
                  setHtml(html);
                }}
              />
              <HStack justifyContent="space-between" mt={3}>
                <Button
                  colorScheme="red"
                  onClick={() => setIsAddingDescription(false)}
                >
                  {t("cancel")}
                </Button>
                <Button
                  colorScheme="green"
                  onClick={async () => {
                    setDescription(html);
                    setIsAddingDescription(false);
                    const payload: EditOrgPayload = {
                      orgDescription: {
                        ...(suborg
                          ? suborg?.orgDescription || {
                              en: "",
                              fr: ""
                            }
                          : org.orgDescription),
                        [router.locale || "en"]: html
                      }
                    };
                    await editOrg({
                      payload,
                      org: suborg || org
                    }).unwrap();
                    toast({ title: t("success") });
                  }}
                >
                  {t("submit")}
                </Button>
              </HStack>
            </>
          ) : description && description.length > 0 ? (
            <Description
              description={description}
              onClick={async (selection) => {
                const createdBy = session
                  ? {
                      _id: session.user.userId
                    }
                  : { userName: "anonymous" };
                await editOrg({
                  payload: {
                    orgNotes: (org.orgNotes || [])
                      .concat([
                        {
                          quote: selection,
                          createdAt: new Date(),
                          createdBy
                        }
                      ])
                      .map(({ _id, ...orgNote }) => orgNote)
                  },
                  org
                }).unwrap();
                toast({ status: "success", title: t("success") });
              }}
            />
          ) : isCreator ? (
            <Tooltip placement="right" label={t("add-d")}>
              <IconButton
                aria-label={t("add-n")}
                alignSelf="flex-start"
                colorScheme="teal"
                icon={
                  <>
                    <SmallAddIcon />
                    <FaNewspaper />
                  </>
                }
                pr={1}
                onClick={() => setIsAddingDescription(true)}
              />
            </Tooltip>
          ) : (
            <Text fontStyle="italic">
              Aucune description.{" "}
              {!session && (
                <>
                  <Link href="/login" variant="underline">
                    Connectez-vous
                  </Link>{" "}
                  pour en écrire une.
                </>
              )}
            </Text>
          )}
        </TabContainerContent>
      )}
    </TabContainer>
  );
};
