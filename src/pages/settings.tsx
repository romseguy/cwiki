import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Icon,
  Input,
  Spinner,
  useColorMode
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { ErrorMessage } from "@hookform/error-message";
import { EditUserPayload, useEditUserMutation } from "features/api/usersApi";
import { AppHeading, PasswordControl } from "features/common";
import { FooterControl } from "features/common/forms/FooterControl";
import { PasswordConfirmControl } from "features/common/forms/PasswordConfirmControl";
import { Layout } from "features/layout";
import theme from "features/layout/theme";
import useFormPersist from "hooks/useFormPersist";
import { useSession } from "hooks/useSession";
import { useToast } from "hooks/useToast";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
//import { useLeaveConfirm } from "hooks/useLeaveConfirm";
import router from "next/router";
import React, { useMemo, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { FaLongArrowAltDown, FaLongArrowAltRight } from "react-icons/fa";
import { useAppDispatch } from "store";
import { setSession } from "store/sessionSlice";
import { resetUserEmail } from "store/userSlice";
import api from "utils/api";
import { magic } from "utils/auth";
import { handleError } from "utils/form";
import { PageProps } from "./_app";

type FormValues = {
  userName: string;
  password: string;
  passwordConfirm: string;
  formErrorMessage?: string;
};

const Settings = ({ ...props }: PageProps & {}) => {
  const { colorMode } = useColorMode();
  const isDark = colorMode === "dark";
  const dispatch = useAppDispatch();
  const { data: session, loading: isSessionLoading } = useSession();
  const { t } = useTranslation();
  const toast = useToast({ position: "top" });
  const [editUser] = useEditUserMutation();

  const [isUserNameCollapsed, setIsUserNameCollapsed] = useState(true);
  const [isPasswordCollapsed, setIsPasswordCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    errors,
    setError,
    clearErrors,
    setValue,
    getValues,
    formState
  } = useFormPersist(
    useForm<FormValues>({
      mode: "onChange"
    })
  );
  //useLeaveConfirm({ formState });

  const password = useRef<string | undefined>();
  password.current = useWatch({ control, name: "password" }) || "";

  const onChange = () => {
    clearErrors("formErrorMessage");
  };

  const onSubmit = async (form: {
    userName: string;
    password: string;
    passwordConfirm: string;
  }) => {
    let payload: EditUserPayload = { userName: form.userName };

    try {
      setIsLoading(true);

      const salt = await bcrypt.genSalt(10);
      payload.password = await bcrypt.hash(form.password, salt);
      payload.passwordSalt = salt;

      await editUser({
        slug: session!.user.email,
        payload
      }).unwrap();

      toast({
        title:
          "Vous allez devoir vous reconnecter pour que les changements soient effectifs...",
        status: "success"
      });

      dispatch(resetUserEmail());
      dispatch(setSession(null));
      if (await magic.user.isLoggedIn()) {
        await magic.user.logout();
      }
      await api.get("logout");
      router.push("/login", "/login", { shallow: false });

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      handleError(error, (message, field) => {
        setError(field || "formErrorMessage", {
          type: "manual",
          message
        });
      });
    }
  };

  if (isSessionLoading) return <Spinner />;

  return (
    <Layout pageTitle={t("settings")} {...props}>
      <AppHeading smaller>{t("settings")}</AppHeading>

      <form
        css={css`
          width: 60%;
          button {
            margin-top: 12px;
          }
        `}
        onChange={onChange}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box
          bgColor={`rgba(${isDark ? "255,255,255" : "0,0,0"},0.1)`}
          borderRadius={12}
          my={3}
          p={3}
          pt={2}
          cursor="pointer"
          onClick={() => setIsUserNameCollapsed(!isUserNameCollapsed)}
        >
          <HStack spacing={3}>
            <h3>{t("userName")}</h3>{" "}
            <Flex>
              {isUserNameCollapsed ? (
                <Icon as={FaLongArrowAltRight} boxSize={8} />
              ) : (
                <Icon as={FaLongArrowAltDown} boxSize={8} />
              )}
            </Flex>
          </HStack>
          <FormControl
            display={isUserNameCollapsed ? "none" : "block"}
            isRequired
            isInvalid={!!errors["userName"]}
          >
            <FormLabel>{t("userNameLabel")}</FormLabel>
            <Input
              name="userName"
              //defaultValue={session.user?.userName}
              ref={register({ required: t("required") })}
            />
            <FormErrorMessage>
              <ErrorMessage errors={errors} name="userName" />
            </FormErrorMessage>
          </FormControl>
        </Box>

        <Box
          bgColor={`rgba(${isDark ? "255,255,255" : "0,0,0"},0.1)`}
          borderRadius={12}
          mt={3}
          p={3}
          pt={2}
          cursor="pointer"
          onClick={() => setIsPasswordCollapsed(!isPasswordCollapsed)}
        >
          <HStack spacing={3}>
            <h3>{t("password")}</h3>{" "}
            <Flex>
              {isPasswordCollapsed ? (
                <Icon as={FaLongArrowAltRight} boxSize={8} />
              ) : (
                <Icon as={FaLongArrowAltDown} boxSize={8} />
              )}
            </Flex>
          </HStack>

          <PasswordControl
            display={isPasswordCollapsed ? "none" : "block"}
            isRequired
            label={t("passwordLabel")}
            name="password"
            errors={errors}
            register={register}
            placeholder=""
            mb={3}
          />
          <PasswordConfirmControl
            display={isPasswordCollapsed ? "none" : "block"}
            isRequired
            label={t("passwordConfirmLabel")}
            name="passwordConfirm"
            errors={errors}
            register={register}
            password={password}
            placeholder=""
            mb={3}
          />
        </Box>

        <FooterControl errors={errors} isLoading={isLoading} />
      </form>
    </Layout>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});

export default Settings;
