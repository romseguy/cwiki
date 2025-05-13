import {
  Alert,
  AlertIcon,
  Button,
  ButtonProps,
  Spinner,
  Stack,
  Text,
  VStack,
  useColorMode
} from "@chakra-ui/react";

import { ArrowBackIcon } from "@chakra-ui/icons";
import { AppHeading, Column } from "features/common";
import { LoginForm } from "features/forms/LoginForm";
import { breakpoints } from "features/layout/theme";
import { useSession } from "hooks/useSession";
import Head from "next/head";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import React from "react";
import { FaPowerOff } from "react-icons/fa";
import { useAppDispatch, wrapper } from "store";
import { resetUserEmail } from "store/userSlice";
import { css } from "@emotion/react";
import api from "utils/api";
import { magic } from "utils/auth";

const BackButton = ({ ...props }: ButtonProps & {}) => {
  const router = useRouter();
  return (
    <Button
      colorScheme="blue"
      leftIcon={<ArrowBackIcon />}
      onClick={() => router.push("/", "/", { shallow: true })}
      {...props}
    >
      Back to home
    </Button>
  );
};

const LoginPage = ({ isMobile, ...props }: PageProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const dispatch = useAppDispatch();
  const {
    data: session,
    loading: isSessionLoading,
    setSession,
    setIsSessionLoading
  } = useSession();
  const title = `Login – ${process.env.NEXT_PUBLIC_SHORT_URL}`;

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title}</title>
      </Head>

      <VStack
        as="main"
        css={css`
          background-color: ${isDark ? "#2D3748" : "lightblue"};

          @media (min-width: ${breakpoints["2xl"]}) {
            margin: 0 auto;
            /*height: ${window.innerHeight}px;*/
            width: 1180px;
            ${isDark
              ? `
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-image: linear-gradient(to bottom right, #b827fc 0%, #2c90fc 25%, #b8fd33 50%, #fec837 75%, #fd1892 100%);
            border-image-slice: 1;
            `
              : `
            border-left: 12px solid transparent;
            border-right: 12px solid transparent;
            border-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='100' height='100' viewBox='0 0 100 100' fill='none' xmlns='http://www.w3.org/2000/svg'%3E %3ClinearGradient id='g' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23cffffe' /%3E%3Cstop offset='25%25' stop-color='%23f9f7d9' /%3E%3Cstop offset='50%25' stop-color='%23fce2ce' /%3E%3Cstop offset='100%25' stop-color='%23ffc1f3' /%3E%3C/linearGradient%3E %3Cpath d='M1.5 1.5 l97 0l0 97l-97 0 l0 -97' stroke-linecap='square' stroke='url(%23g)' stroke-width='3'/%3E %3C/svg%3E") 1;
            `};
          }
        `}
      >
        <AppHeading>Login</AppHeading>

        {isSessionLoading && <Spinner mb={3} />}

        {!isSessionLoading && (
          <>
            {session && (
              <Column borderRadius={isMobile ? 0 : undefined} mb={3}>
                <Alert bg={isDark ? "gray.600" : undefined} status="success">
                  <AlertIcon />
                  <Stack spacing={3} textAlign="center">
                    <Text>You are already logged in with the email :</Text>

                    <Text fontWeight="bold" ml={1}>
                      {session.user.email}
                    </Text>
                  </Stack>
                </Alert>

                <BackButton mt={3} />

                <Button
                  colorScheme="red"
                  leftIcon={<FaPowerOff />}
                  mt={3}
                  onClick={async () => {
                    dispatch(setIsSessionLoading(true));
                    dispatch(resetUserEmail());
                    await magic.user.logout();
                    await api.get("logout");
                    dispatch(setSession(null));
                    dispatch(setIsSessionLoading(false));
                  }}
                >
                  Logout
                </Button>
              </Column>
            )}

            {!session && <LoginForm {...props} isMobile={isMobile} />}
          </>
        )}
      </VStack>
    </>
  );
};

export const getServerSideProps = wrapper.getServerSideProps(
  (store) => async (ctx) => {
    return { props: {} };
  }
);

export default LoginPage;
