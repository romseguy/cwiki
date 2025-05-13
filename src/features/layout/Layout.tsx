import {
  Box,
  BoxProps,
  HStack,
  Spinner,
  useColorMode,
  VStack
} from "@chakra-ui/react";
import Head from "next/head";
import { ReactNode } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useSelector } from "react-redux";
import { css } from "@emotion/react";
import { Link } from "features/common";
import { PageProps } from "pages/_app";
import { selectScreenHeight } from "store/uiSlice";
import { ServerError } from "utils/errors";
import { capitalize } from "utils/string";
import { breakpoints, rainbowBorder } from "./theme";
import { useSession } from "hooks/useSession";
import { magic } from "utils/auth";
import api from "utils/api";
import { useAppDispatch } from "store";
import {
  selectIsSessionLoading,
  setIsSessionLoading,
  setSession
} from "store/sessionSlice";
import { resetUserEmail } from "store/userSlice";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";

export interface LayoutProps extends PageProps, BoxProps {
  mainContainer?: boolean;
  pageTitle?: string;
}

export const Layout = ({
  children,
  isMobile,
  mainContainer = true,
  pageTitle,
  ...props
}: React.PropsWithChildren<LayoutProps>) => {
  const router = useRouter();
  const { t, i18n } = useTranslation("common");
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

  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const dispatch = useAppDispatch();
  const { data: session } = useSession();
  const isSessionLoading = useSelector(selectIsSessionLoading);
  const screenHeight = useSelector(selectScreenHeight);
  const title = `${
    pageTitle ? capitalize(pageTitle) : "Merci de patienter..."
  } – ${process.env.NEXT_PUBLIC_SHORT_URL}`;
  //const main = (c: ReactNode) => (mainContainer ? <Box as="main">{c}</Box> : c);

  const main = (c: ReactNode) =>
    mainContainer ? (
      <Box
        as="main"
        css={css`
          background-color: ${isDark ? "#2D3748" : "#FAFAFA"};

          @media (min-width: ${breakpoints["2xl"]}) {
            margin: 0 auto;
            min-height: ${screenHeight}px;
            width: 1180px;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            ${rainbowBorder(isDark)}
          }
        `}
      >
        <VStack
          css={css`
            align-items: start;
            background-color: #cffffe;
            /*width: 1156px;*/
          `}
        >
          <header>
            <HStack
              css={css`
                border-bottom: 12px solid black;
                a {
                  border-right: 12px solid black;
                  padding-left: 6px;
                  padding-right: 12px;
                }
              `}
            >
              <HStack>
                <button onClick={() => onToggleLanguageClick(changeTo)}>
                  {t("change-locale", { changeTo })}
                </button>
                {/* <button onClick={() => clientSideLanguageChange(changeTo)}>
                  {t("change-locale", { changeTo })}
                </button> */}
                <Link href="/">Home</Link>
              </HStack>
              <HStack>
                {session ? (
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
                    {!isSessionLoading ? "Logout" : <Spinner size="sm" />}
                  </Link>
                ) : (
                  <Link href="/login">
                    {!isSessionLoading ? "Login" : <Spinner size="sm" />}
                  </Link>
                )}
                <Link href="/add">Add a tree</Link>
              </HStack>
            </HStack>
          </header>
        </VStack>

        <VStack
          css={css`
            background: linear-gradient(
              to bottom,
              #cffffe 0%,
              #cffffe 25%,
              #fafafa 50%,
              #fafafa 75%,
              #fafafa 100%
            );
            height: 100%;
            /*width: 1156px;*/
            margin: 0 !important;
          `}
        >
          <main>{c}</main>
        </VStack>
      </Box>
    ) : (
      <main>c</main>
    );

  const page = (c: ReactNode) => main(c);

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

      <ErrorBoundary fallbackRender={Fallback}>{page(children)}</ErrorBoundary>
    </>
  );
};
