import { AddIcon, SettingsIcon, SmallAddIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  HStack,
  IconButton,
  Spinner,
  Tooltip,
  useColorMode
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { DarkModeSwitch, Link, OfflineIcon } from "features/common";
import { useSession } from "hooks/useSession";
import { IOrg } from "models/Org";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import { ReactNode } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import {
  FaCodeBranch,
  FaExclamationCircle,
  FaHome,
  FaLongArrowAltRight,
  FaPowerOff,
  FaTree,
  FaUser
} from "react-icons/fa";
import { GrWifiNone } from "react-icons/gr";
import { IoIosGitBranch } from "react-icons/io";
import { useSelector } from "react-redux";
import { useAppDispatch } from "store";
import {
  selectIsOffline,
  selectIsSessionLoading,
  setIsSessionLoading,
  setSession
} from "store/sessionSlice";
import { resetUserEmail } from "store/userSlice";
import api from "utils/api";
import { client } from "utils/auth";
import { getEnv } from "utils/env";
import { ServerError } from "utils/errors";
import { localize } from "utils/localize";
import { capitalize } from "utils/string";
import theme, { breakpoints, rainbowBorder } from "./theme";

export interface LayoutProps extends PageProps {
  pageTitle?: string;
  org?: IOrg;
  suborg?: IOrg;
}

export const Layout = ({
  children,
  isMobile,
  pageTitle,
  org,
  suborg
}: React.PropsWithChildren<LayoutProps>) => {
  //#region styling
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const borderLeft = `border-left: 1px solid ${
    isDark ? "white" : theme.colors.black
  };`;
  const borderRight = `border-right: 1px solid ${
    isDark ? "white" : theme.colors.black
  };`;
  //#endregion

  //#region routing
  const router = useRouter();
  let [entityUrl, _, b] =
    "treeName" in router.query && Array.isArray(router.query.treeName)
      ? router.query.treeName
      : [];
  const { t } = useTranslation();
  const changeTo = router.locale === "en" ? "fr" : "en";
  // const clientSideLanguageChange = (newLocale: string) => {
  //   i18n.changeLanguage(newLocale);
  // };
  const onToggleLanguageClick = (newLocale: string) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, {
      locale: newLocale
    });
  };
  const offline = useSelector(selectIsOffline);
  //#endregion

  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const isSessionLoading = useSelector(selectIsSessionLoading);
  const title = `${pageTitle ? capitalize(pageTitle) : "Loading..."} – ${
    process.env.NEXT_PUBLIC_SHORT_URL
  }`;

  const header = () => (
    <Flex
      css={css`
        align-items: center;
        justify-content: space-between;
        background-color: ${isDark ? theme.colors.black : "white"};
        border-bottom: 8px solid ${isDark ? "white" : theme.colors.black};
        svg {
          height: 12px !important;
        }
      `}
    >
      {/* Left */}
      <HStack spacing={isMobile ? 0 : 2}>
        {/* Buttons */}
        <HStack spacing={isMobile ? 0 : 0}>
          {!isMobile && <DarkModeSwitch />}

          <Button
            css={css`
              ${borderLeft}
              ${borderRight}
            `}
            borderRadius={0}
            onClick={() => onToggleLanguageClick(changeTo)}
          >
            {router.locale === "fr" ? (
              <img src="/icons/en.png" />
            ) : (
              <img src="/icons/fr.png" />
            )}
          </Button>
        </HStack>

        {/* Home */}
        <HStack
          spacing={isMobile ? 0 : 1}
          css={css`
            a {
              padding-top: 2px;
            }
            ${isMobile ? "text-wrap: nowrap" : "padding-right: 0px"}
          `}
        >
          {isMobile && (
            <IconButton
              aria-label={t("home")}
              css={css`
                ${borderRight};
                padding: 0 6px;
              `}
              borderRadius={0}
              icon={
                <>
                  <FaLongArrowAltRight />
                  <FaHome />
                </>
              }
              onClick={() => {
                router.push("/", "/", { shallow: true });
              }}
            />
          )}
          {!isMobile && (
            <>
              {router.asPath === "/" && <FaLongArrowAltRight />}
              <Link onClick={() => router.push("/", "/", { shallow: true })}>
                {t("home")}
              </Link>
            </>
          )}
        </HStack>

        {org && (
          <>
            {/* Tree name */}
            <HStack
              spacing={isMobile ? 0 : 1}
              css={css`
                ${isMobile
                  ? "padding: 0 8px; text-wrap: nowrap; a { padding-top: 3px; }"
                  : "a { padding-top: 2px; }"}
              `}
            >
              <FaLongArrowAltRight />
              <FaTree />
              <Link href={"/a/" + org.orgUrl} shallow>
                {localize(org.orgName, router.locale)}
              </Link>
            </HStack>

            {/* Add Branch */}
            {!router.asPath.includes("/b/") && (
              <>
                {isMobile && (
                  <>
                    <IconButton
                      aria-label={t("add-b")}
                      css={css`
                        ${borderLeft}
                        ${borderRight}
                      `}
                      borderRadius={0}
                      icon={
                        <>
                          <SmallAddIcon />
                          {/* <FaCodeBranch /> */}
                          <IoIosGitBranch />
                        </>
                      }
                      onClick={() => {
                        const href = router.asPath.includes("/b/add")
                          ? "#"
                          : `/b/add${router.asPath}`;
                        router.push(href, href, { shallow: true });
                      }}
                    />
                  </>
                )}
                {!isMobile && (
                  <HStack spacing={0}>
                    {router.asPath.includes("add") && <FaLongArrowAltRight />}
                    <SmallAddIcon />
                    <Box pt={0.5}>
                      <Link
                        href={
                          router.asPath.includes("/b/add")
                            ? "#"
                            : `/b/add${router.asPath}`
                        }
                        shallow
                      >
                        {t("add-b")}
                      </Link>
                    </Box>
                  </HStack>
                )}
              </>
            )}

            {/* Branch name */}
            {suborg && !router.asPath.includes("add") && (
              <HStack
                spacing={isMobile ? 0 : 1}
                css={css`
                  a {
                    padding-top: 2px;
                  }
                `}
              >
                <FaLongArrowAltRight />
                <IoIosGitBranch />
                <Link href={"/a/" + entityUrl + "/b/" + b} shallow>
                  {localize(suborg.orgName, router.locale)}
                </Link>
              </HStack>
            )}
          </>
        )}

        {!org && (
          <HStack
            spacing={isMobile ? 0 : 1}
            css={css`
              a {
                padding-top: 2px;
              }
            `}
          >
            {isMobile && (
              <IconButton
                aria-label={t("add-a")}
                css={css`
                  ${borderRight}
                  padding: 0 12px;
                `}
                borderRadius={0}
                icon={
                  <>
                    <SmallAddIcon />
                    <FaTree />
                  </>
                }
                onClick={() => {
                  router.push("/add", "/add", { shallow: true });
                }}
              />
            )}
            {!isMobile && (
              <>
                <SmallAddIcon />
                <FaTree />
                {router.asPath.includes("add") && <FaLongArrowAltRight />}
                <Link href="/add" shallow>
                  {t("add-a")}
                </Link>
              </>
            )}
          </HStack>
        )}
      </HStack>

      <HStack spacing={isMobile ? 0 : 0}>
        {session ? (
          <>
            {isMobile && (
              <>
                <DarkModeSwitch
                  css={css`
                    ${borderLeft}
                    ${borderRight}
                  `}
                  borderRadius={0}
                />
                <IconButton
                  aria-label={t("settings")}
                  borderRadius={0}
                  icon={<SettingsIcon />}
                />
              </>
            )}
            {!isMobile && (
              <HStack spacing={0}>
                {offline && <OfflineIcon boxSize={4} />}
                <HStack spacing={1} px={3}>
                  <FaLongArrowAltRight />
                  <FaUser />
                  <Link href="/settings" shallow>
                    {/* {t("settings")} */}
                    {session.user.userName}
                  </Link>
                </HStack>
                <HStack spacing={1}>
                  <FaPowerOff />
                  <Link
                    onClick={async () => {
                      dispatch(setIsSessionLoading(true));
                      dispatch(resetUserEmail());
                      if (await client.user.isLoggedIn()) {
                        await client.user.logout();
                      }
                      await api.get("logout");
                      dispatch(setSession(null));
                      dispatch(setIsSessionLoading(false));
                    }}
                  >
                    {!isSessionLoading ? t("logout") : <Spinner size="sm" />}
                  </Link>
                </HStack>
              </HStack>
            )}
          </>
        ) : (
          <Link href="/login">
            {!isSessionLoading ? (
              "Login"
            ) : (
              <Spinner size={isMobile ? "xs" : "sm"} />
            )}
          </Link>
        )}
      </HStack>
    </Flex>
  );

  const main = (c: ReactNode) => (
    <div
      css={css`
        width: 100%;
        display: flex;
        flex-direction: column;
        background: ${isDark
          ? "linear-gradient( to bottom, #14161c 0%, #14161c 25%, #344155 50%, #2c323b 75%, #1a202c 100%)"
          : "linear-gradient( to bottom, #cffffe 0%, #cffffe 25%, #fafafa 50%, #fafafa 75%, #fafafa 100%)"};

        @media (min-width: ${breakpoints["xl"]}) {
          border-left: 8px solid transparent;
          border-right: 8px solid transparent;
          ${rainbowBorder(isDark)}
        }
      `}
    >
      {c}
    </div>
  );

  const page = (c: ReactNode) => (
    <Flex
      as="main"
      css={css`
        height: 100%;
        max-width: 1050px;
        margin: 0 auto;
        flex-direction: column;
        background-color: ${isDark ? "#2D3748" : "#FAFAFA"};
        svg {
          margin: 0 !important;
        }
      `}
    >
      {header()}
      {main(c)}
    </Flex>
  );

  const Fallback = ({
    error,
    resetErrorBoundary,
    ...props
  }: FallbackProps & { error: ServerError }) => {
    return page(<>An error occured, the app is still under development !</>);
  };

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, minimum-scale=1"
        />
        <title>{title}</title>
      </Head>

      {getEnv() === "production" ? (
        <ErrorBoundary fallbackRender={Fallback}>
          {page(children)}
        </ErrorBoundary>
      ) : (
        page(children)
      )}
    </>
  );
};
