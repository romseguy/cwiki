import {
  Alert,
  AlertIcon,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input
} from "@chakra-ui/react";
import { css } from "@emotion/react";
import { ErrorMessage } from "@hookform/error-message";
import { AddOrgPayload, useAddOrgMutation } from "features/api/orgsApi";
import { ErrorMessageText } from "features/common";
import { FooterControl } from "features/common/forms/FooterControl";
import theme from "features/layout/theme";
import useFormPersist from "hooks/useFormPersist";
import { useLeaveConfirm } from "hooks/useLeaveConfirm";
import { useToast } from "hooks/useToast";
import { EOrgType } from "models/Org";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Session } from "utils/auth";
import { handleError } from "utils/form";

type FormValues = { treeName: string; formErrorMessage?: string };

export const AddForm = ({
  session,
  ...props
}: {
  session: Session;
  onCancel?: () => void;
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast({ position: "top" });
  const [isLoading, setIsLoading] = useState(false);
  const [addOrg] = useAddOrgMutation();

  const defaultValues = {
    treeName: ""
  };
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
      defaultValues,
      mode: "onChange"
    })
  );
  useLeaveConfirm({ formState });
  const refs = useMemo(
    () =>
      Object.keys(defaultValues).reduce(
        (acc: Record<string, React.RefObject<any>>, fieldName) => {
          acc[fieldName] = React.createRef();
          return acc;
        },
        {}
      ),
    [defaultValues]
  );
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      const fieldName = Object.keys(errors)[0];
      const fieldRef = refs[fieldName].current;
      if (fieldRef)
        fieldRef.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
    }
  }, [errors]);
  const onChange = () => {
    clearErrors("formErrorMessage");
  };
  const onSubmit = async (form: { treeName: string }) => {
    console.log("submitted", form);
    setIsLoading(true);

    try {
      let payload: AddOrgPayload = {
        orgName: {
          en: form.treeName
        },
        orgType: EOrgType.NETWORK
      };

      const org = await addOrg(payload).unwrap();
      const orgUrl = org.orgUrl;

      toast({
        //title: `Vous allez être redirigé vers l'arbre : ${form.treeName}...`,
        title: t("success"),
        status: "success"
      });

      setIsLoading(false);
      router.push(`/a/${orgUrl}`);
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

  return (
    <form
      css={css`
        button {
          margin-top: 12px;
        }
      `}
      onChange={onChange}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormControl
        ref={refs.treeName}
        isRequired
        isInvalid={!!errors["treeName"]}
      >
        <FormLabel>{t("name-label-a")}</FormLabel>
        <Input
          name="treeName"
          ref={register({
            required: `Veuillez saisir un nom`
            // pattern: {
            //   value: /^[A-zÀ-ú0-9 ]+$/i,
            //   message:
            //     "Veuillez saisir un nom composé de lettres et de chiffres uniquement"
            // }
          })}
        />
      </FormControl>

      <FooterControl errors={errors} isLoading={isLoading} />
    </form>
  );
};
