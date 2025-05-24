import { FormControl, FormLabel, Input } from "@chakra-ui/react";
import { css } from "@emotion/react";
import { useEditOrgMutation } from "features/api/orgsApi";
import { FooterControl } from "features/common/forms/FooterControl";
import { useToast } from "hooks/useToast";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { localize } from "utils/localize";
import { normalize } from "utils/string";

type FormValues = { treeName: string; formErrorMessage?: string };

export const EditForm = ({ org, suborg }) => {
  const router = useRouter();
  const {
    t,
    i18n: { defaultLocale }
  } = useTranslation();
  const locale = router.locale || defaultLocale;
  const toast = useToast({ position: "top" });
  const [editOrg] = useEditOrgMutation();
  const [isLoading, setIsLoading] = useState(false);
  const defaultValues = {
    treeName: localize(suborg ? suborg.orgName : org.orgName, locale)
  };
  const { register, handleSubmit, errors } = useForm<FormValues>({
    defaultValues
  });

  const onSubmit = async (form: { treeName: string }) => {
    console.log("submitted", form);
    setIsLoading(true);
    try {
      const orgName = suborg ? suborg.orgName : org.orgName;
      await editOrg({
        payload: {
          orgName: { ...orgName, [locale]: form.treeName }
        },
        org: suborg || org
      }).unwrap();
      toast({ status: "success", title: t("success") });
      setIsLoading(false);
      const href = "/a/" + normalize(form.treeName);
      router.push(href, href, { shallow: true });
    } catch (error) {}
  };
  return (
    <form
      css={css`
        & > div[role="group"] {
          margin-bottom: 12px;
        }
      `}
      onSubmit={handleSubmit(onSubmit)}
    >
      <FormControl>
        <FormLabel>{t(suborg ? "name-label-b" : "name-label-a")}</FormLabel>
        <Input
          name="treeName"
          ref={register({
            required: `Veuillez saisir un nom`
          })}
        />
      </FormControl>
      <FooterControl errors={errors} isLoading={isLoading} />
    </form>
  );
};
