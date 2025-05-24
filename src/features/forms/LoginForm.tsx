import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel
} from "@chakra-ui/react";
import { ErrorMessage } from "@hookform/error-message";
import bcrypt from "bcryptjs";
import { useTranslation } from "next-i18next";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { getUser } from "features/api/usersApi";
import {
  Column,
  EmailControl,
  ErrorMessageText,
  PasswordControl
} from "features/common";
import { useRouterLoading } from "hooks/useRouterLoading";
import { useToast } from "hooks/useToast";
import { PageProps } from "pages/_app";
import { useAppDispatch } from "store";
import api from "utils/api";
import { client } from "utils/auth";
import { handleError } from "utils/form";
import { useRouter } from "next/router";

export const LoginForm = ({ isMobile, ...props }: PageProps) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const routerLoading = useRouterLoading();
  const toast = useToast({ position: "top" });

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

        if (user.passwordSalt) {
          const hash = await bcrypt.hash(form.password, user.passwordSalt);
          const res = await api.post("login", { email: form.email, hash });

          if (res.status !== 200) {
            toast({
              status: "error",
              title: "This email address does not match the password"
            });
          } else {
            router.push("/", "/", { shallow: true });
            return;
          }
        }

        setIsLoggingIn(false);
      } else {
        await client.auth.loginWithMagicLink({
          email: form.email,
          redirectURI: new URL("/callback", window.location.origin).href
        });
      }
    } catch (error) {
      setIsLoggingIn(false);
      handleError(error, (message, field) => {
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
          placeholder={t("email-placeholder")}
          isDisabled={isLoggingIn}
          isMultiple={false}
          isRequired
          mb={0}
        />

        <FormControl
          display="flex"
          flexDir="column"
          justifyContent="center"
          my={3}
        >
          <FormLabel mt={3}>{t("login-question")}</FormLabel>
          <Button
            colorScheme="teal"
            fontSize="sm"
            onClick={() => setIsPassword(!isPassword)}
          >
            {t("login-pwd")}
          </Button>
        </FormControl>

        {isPassword && (
          <PasswordControl
            errors={errors}
            register={register}
            placeholder={t("pwd-placeholder")}
            noLabel
            mb={3}
          />
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
          isDisabled={
            /*!isPassword ||*/ isLoading || Object.keys(errors).length > 0
          }
          fontSize="sm"
        >
          {isPassword ? t("login-submit") : t("login-email")}
        </Button>
      </Column>
    </form>
  );
};
