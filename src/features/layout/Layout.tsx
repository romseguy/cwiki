import { ChevronRightIcon } from "@chakra-ui/icons";
import {
  Box,
  BoxProps,
  HStack,
  Spinner,
  VStack,
  useColorMode,
  Flex
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { Link } from "features/common";
import { useSession } from "hooks/useSession";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Head from "next/head";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import { ReactNode } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { useSelector } from "react-redux";
import { useAppDispatch } from "store";
import {
  selectIsSessionLoading,
  setIsSessionLoading,
  setSession
} from "store/sessionSlice";
import { selectScreenHeight } from "store/uiSlice";
import { resetUserEmail } from "store/userSlice";
import api from "utils/api";
import { magic } from "utils/auth";
import { ServerError } from "utils/errors";
import { capitalize } from "utils/string";
import { breakpoints, rainbowBorder } from "./theme";

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
      <Flex
        css={css`
          flex-direction: column;
          background-color: ${isDark ? "#2D3748" : "#FAFAFA"};

          @media (min-width: ${breakpoints["2xl"]}) {
            margin: 0 auto;
            width: 1180px;
            height: 100%;
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            ${rainbowBorder(isDark)}
          }
        `}
      >
        <Flex
          css={css`
            align-items: center;
            justify-content: space-between;
            background-color: white;
            border-left: 12px solid black;
            border-bottom: 12px solid black;
            a {
              border-right: 12px solid black;
              padding: 0 12px 0 6px;
            }
            button {
              margin-left: 6px;
            }
          `}
        >
          <HStack>
            <button onClick={() => onToggleLanguageClick(changeTo)}>
              {router.locale === "fr" ? (
                <img src="/icons/en.png" />
              ) : (
                <img src="/icons/fr.png" />
              )}
            </button>

            {router.asPath === "/" && <ChevronRightIcon />}
            <Link href="/" shallow>
              {t("home")}
            </Link>

            {router.asPath.includes("/a/") ? (
              <>
                <ChevronRightIcon />
                <Link href={"/a/" + entityUrl} shallow>
                  {entityUrl}
                </Link>

                {router.asPath.includes("add") && <ChevronRightIcon />}
                <Link
                  href={
                    router.asPath.includes("/b/add")
                      ? "#"
                      : `/b/add${router.asPath}`
                  }
                  shallow
                >
                  {t("add-branch")}
                </Link>
              </>
            ) : (
              <>
                {router.asPath.includes("add") && <ChevronRightIcon />}
                <Link href="/add" shallow>
                  {t("add")}
                </Link>
              </>
            )}
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
                {!isSessionLoading ? t("logout") : <Spinner size="sm" />}
              </Link>
            ) : (
              <Link href="/login">
                {!isSessionLoading ? "Login" : <Spinner size="sm" />}
              </Link>
            )}
          </HStack>
        </Flex>

        <div
          css={css`
            display: flex;
            flex-direction: column;
            background: linear-gradient(
              to bottom,
              #cffffe 0%,
              #cffffe 25%,
              #fafafa 50%,
              #fafafa 75%,
              #fafafa 100%
            );
            padding: 12px 0 0 12px;
          `}
        >
          {c}
        </div>
      </Flex>
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
