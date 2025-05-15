import {
  Alert,
  AlertIcon,
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Spinner,
  Stack,
  Text,
  useColorMode
} from "@chakra-ui/react";
import { useToast } from "hooks/useToast";

import { ErrorMessage } from "@hookform/error-message";
import { OAuthProvider } from "@magic-ext/oauth";
import bcrypt from "bcryptjs";
import { getUser } from "features/api/usersApi";
import { SocialLogins } from "features/auth/SocialLogins";
import {
  AppHeading,
  Column,
  EmailControl,
  ErrorMessageText,
  PasswordControl
} from "features/common";
import { useRouterLoading } from "hooks/useRouterLoading";
import { useSession } from "hooks/useSession";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FaPowerOff } from "react-icons/fa";
import { useAppDispatch } from "store";
import api from "utils/api";
import { TOKEN_NAME, magic } from "utils/auth";
import { handleError } from "utils/form";
import theme from "features/layout/theme";

const onLoginWithSocial = async (provider: OAuthProvider) => {
  await magic.oauth.loginWithRedirect({
    provider,
    redirectURI: new URL("/callback", window.location.origin).href
  });
};

export const LoginForm = ({ isMobile, ...props }: PageProps) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const dispatch = useAppDispatch();
  const router = useRouter();
  const routerLoading = useRouterLoading();
  const {
    data: session,
    loading: isSessionLoading,
    setSession,
    setIsSessionLoading
  } = useSession();
  const toast = useToast({ position: "top" });
  //const [postResetPasswordMail] = usePostResetPasswordMailMutation();

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const isLoading = isLoggingIn || routerLoading.isLoading;
  const [isPassword, setIsPassword] = useState(false);
  //const [isSent, setIsSent] = useState(false);

  //#region form
  const { clearErrors, register, control, errors, setError, handleSubmit } =
    useForm({ mode: "onChange" });
  //const email = useWatch<string>({ control, name: "email" });
  //const password = useWatch<string>({ control, name: "password" });

  const onChange = () => {
    clearErrors("formErrorMessage");
  };
  const onSubmit = async (form: { email: string; password?: string }) => {
    console.log("submitted", form);
    setIsLoggingIn(true);

    try {
      if (form.password) {
        const { data: user } = await dispatch(
          getUser.initiate({ slug: form.email })
        );

        if (!user) throw new Error("Identifiants incorrects");

        if (user?.passwordSalt) {
          const hash = await bcrypt.hash(form.password, user.passwordSalt);
          const res = await api.post("login", { email: form.email, hash });
          console.log("🚀 ~ onSubmit ~ res:", res);

          if (res.status !== 200) {
            toast({
              status: "error",
              title: "This email address does not match the password"
            });
          } else {
            // if (res.data.authenticated) {
            //   dispatch(
            //     setSession({
            //       user: userToken,
            //       [TOKEN_NAME]: authToken
            //     })
            //   );
            // }
            window.location.replace("/");
          }
        }

        setIsLoggingIn(false);
      } else {
        await magic.auth.loginWithMagicLink({
          email: form.email,
          redirectURI: new URL("/callback", window.location.origin).href
        });
      }
    } catch (error) {
      console.log("🚀 ~ onSubmit ~ error:", error);
      setIsLoggingIn(false);
      handleError(error, (message, field) => {
        console.log("🚀 ~ handleError ~ message:", message);
        console.log("🚀 ~ handleError ~ field:", field);
        setError(field || "formErrorMessage", {
          type: "manual",
          message
        });
      });
    }
  };
  //#endregion

  return (
    <form onChange={onChange} onSubmit={handleSubmit(onSubmit)}>
      <Column borderRadius={isMobile ? 0 : undefined} mt={3} mb={5}>
        <EmailControl
          name="email"
          control={control}
          errors={errors}
          register={register}
          isDisabled={isLoggingIn}
          isMultiple={false}
          isRequired
          mb={0}
        />

        <FormControl display="flex" flexDir="row" mb={0}>
          <FormLabel mt={3}>Password</FormLabel>
          <Checkbox
            borderColor={isDark ? "white" : theme.colors.black}
            onChange={() => setIsPassword(!isPassword)}
          />
        </FormControl>

        {isPassword && (
          <PasswordControl errors={errors} register={register} noLabel mb={3} />
        )}

        <ErrorMessage
          errors={errors}
          name="formErrorMessage"
          render={({ message }) => (
            <Alert status="error" mb={3}>
              <AlertIcon />
              <ErrorMessageText>{message}</ErrorMessageText>
            </Alert>
          )}
        />

        <Button
          type="submit"
          colorScheme="green"
          isLoading={isLoading}
          isDisabled={isLoading || Object.keys(errors).length > 0}
          fontSize="sm"
        >
          {isPassword ? "Se connecter" : "Envoyer un e-mail de connexion"}
        </Button>
      </Column>

      <Column borderRadius={isMobile ? 0 : undefined} pb={0}>
        <SocialLogins flexDirection="column" onSubmit={onLoginWithSocial} />
      </Column>
    </form>
  );
};
