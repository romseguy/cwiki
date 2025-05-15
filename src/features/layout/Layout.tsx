import { AddIcon } from "@chakra-ui/icons";
import {
  Box,
  BoxProps,
  Flex,
  HStack,
  Icon,
  Spinner,
  useColorMode
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { DarkModeSwitch, Link } from "features/common";
import { useSession } from "hooks/useSession";
import { useTranslation } from "next-i18next";
import Head from "next/head";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import { ReactNode } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { FaLongArrowAltRight, FaPlus, FaTree } from "react-icons/fa";
import { useSelector } from "react-redux";
import { useAppDispatch } from "store";
import {
  selectIsSessionLoading,
  setIsSessionLoading,
  setSession
} from "store/sessionSlice";
import { resetUserEmail } from "store/userSlice";
import api from "utils/api";
import { magic } from "utils/auth";
import { getEnv } from "utils/env";
import { ServerError } from "utils/errors";
import { capitalize } from "utils/string";
import theme, { breakpoints, rainbowBorder } from "./theme";

export interface LayoutProps extends PageProps, BoxProps {
  pageTitle?: string;
}

export const Layout = ({
  children,
  isMobile,
  pageTitle,
  ...props
}: React.PropsWithChildren<LayoutProps>) => {
  //#region styling
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const borderLeft = `border-left: 8px solid ${
    isDark ? "white" : theme.colors.black
  };`;
  const borderRight = `border-right: 8px solid ${
    isDark ? "white" : theme.colors.black
  };`;
  //#endregion

  //#region routing
  const router = useRouter();
  let [entityUrl] =
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
  //#endregion

  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const isSessionLoading = useSelector(selectIsSessionLoading);
  const title = `${pageTitle ? capitalize(pageTitle) : "Loading..."} – ${
    process.env.NEXT_PUBLIC_SHORT_URL
  }`;

  const main = (c: ReactNode) => (
    <Flex
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
      //{...props}
    >
      <Flex
        css={css`
          align-items: center;
          justify-content: space-between;
          background-color: ${isDark ? theme.colors.black : "white"};
          border-bottom: 8px solid ${isDark ? "white" : theme.colors.black};
        `}
      >
        <HStack>
          <HStack css={css(borderRight)} pl={1} pr={2}>
            <DarkModeSwitch size="xs" bg="transparent" />

            <button onClick={() => onToggleLanguageClick(changeTo)}>
              {router.locale === "fr" ? (
                <img src="/icons/en.png" />
              ) : (
                <img src="/icons/fr.png" />
              )}
            </button>
          </HStack>

          <HStack
            css={css`
              ${borderRight}
            `}
            pr={2}
          >
            {router.asPath === "/" && <FaLongArrowAltRight pr={0} />}
            <Link onClick={() => router.push("/", "/", { shallow: true })}>
              {t("home")}
            </Link>
          </HStack>

          {router.asPath.includes("/a/") ? (
            <>
              <HStack
                css={css`
                  ${borderRight}
                `}
                pr={2}
              >
                <FaLongArrowAltRight />
                <FaTree />
                <Link href={"/a/" + entityUrl} shallow>
                  {entityUrl}
                </Link>
              </HStack>

              <HStack>
                {router.asPath.includes("add") && <FaLongArrowAltRight />}
                <AddIcon boxSize={3} />
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
              </HStack>
            </>
          ) : (
            <HStack pr={2}>
              <AddIcon boxSize={3} />
              <FaTree />
              {router.asPath.includes("add") && <FaLongArrowAltRight />}
              <Link href="/add" shallow>
                {t("add-a")}
              </Link>
            </HStack>
          )}
        </HStack>

        <HStack pl={1}>
          {session ? (
            <>
              <HStack
                css={css`
                  ${borderRight}
                `}
                pr={2}
              >
                <Link href="/settings" shallow>
                  {t("settings")}
                </Link>
              </HStack>

              <HStack>
                <Link
                  onClick={async () => {
                    dispatch(setIsSessionLoading(true));
                    dispatch(resetUserEmail());
                    const magicIsLoggedIn = await magic.user.isLoggedIn();
                    console.log(
                      "checkLoginStatus: magicIsLoggedIn",
                      magicIsLoggedIn
                    );

                    if (magicIsLoggedIn) {
                      await magic.user.logout();
                    }
                    await api.get("logout");
                    dispatch(setSession(null));
                    dispatch(setIsSessionLoading(false));
                  }}
                >
                  {!isSessionLoading ? t("logout") : <Spinner size="sm" />}
                </Link>
              </HStack>
            </>
          ) : (
            <Link href="/login">
              {!isSessionLoading ? "Login" : <Spinner size="sm" />}
            </Link>
          )}
        </HStack>
      </Flex>

      <div
        css={css`
          height: 100%;
          width: 100%;
          display: flex;
          flex-direction: column;
          background: ${isDark
            ? "linear-gradient( to bottom, #14161c 0%, #14161c 25%, #344155 50%, #2c323b 75%, #1a202c 100%)"
            : "linear-gradient( to bottom, #cffffe 0%, #cffffe 25%, #fafafa 50%, #fafafa 75%, #fafafa 100%)"};
          padding: 12px 12px 12px 12px;

          @media (min-width: ${breakpoints["xl"]}) {
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            ${rainbowBorder(isDark)}
          }
        `}
      >
        {c}
      </div>
    </Flex>
  );

  const page = (c: ReactNode) => <main>{main(c)}</main>;

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
