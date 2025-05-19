import { FormLabel, HStack, Text } from "@chakra-ui/react";
import { css } from "@emotion/react";
import {
  AddOrgPayload,
  EditOrgPayload,
  useAddOrgMutation,
  useEditOrgMutation,
  useGetOrgQuery
} from "features/api/orgsApi";
import { useToast } from "hooks/useToast";
import { EOrgType } from "models/Org";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { IoIosGitNetwork } from "react-icons/io";
import Creatable from "react-select/creatable";
import { Session } from "utils/auth";

type FormValues = { branchName: string; formErrorMessage?: string };

export const AddBranchForm = ({
  session,
  ...props
}: {
  session: Session;
  onCancel?: () => void;
  onSubmit?: () => void;
}) => {
  const { t } = useTranslation();
  const toast = useToast({ position: "top" });
  const router = useRouter();
  let [entityUrl] =
    "treeName" in router.query && Array.isArray(router.query.treeName)
      ? router.query.treeName
      : [];
  const [addOrg] = useAddOrgMutation();
  const [editOrg] = useEditOrgMutation();
  const query = useGetOrgQuery({
    orgUrl: entityUrl,
    populate: "orgs"
  });
  const org = query.data;
  console.log("🚀 ~ org:", org);
  const [value, setValue] = useState();

  return (
    <>
      {/* <FormLabel>{t("name-label-b")}</FormLabel> */}
      {/* {query.isLoading && <Spinner />} */}
      {!!org && (
        <Creatable
          css={css`
            div[role="button"] {
              display: none;
            }
            input {
              min-width: 200px !important;
            }
          `}
          placeholder={t("name-label-b")}
          value={org.orgs.map(({ _id, orgName }) => ({
            label: orgName.en,
            value: _id
          }))}
          isMulti
          options={[]}
          formatCreateLabel={(inputValue) => {
            console.log(inputValue);
            return (
              <HStack>
                <Text mr={1}>{t("add-b")}</Text>
                <IoIosGitNetwork />
                <Text fontWeight="bold">{inputValue}</Text>
              </HStack>
            );
          }}
          onChange={(options, { action, option }) => {
            console.log("🚀 ~ AddBranchPage ~ action:", action);
            if (action === "select-option") {
              setValue(option.value);
            }
          }}
          onCreateOption={async (orgName: string) => {
            try {
              const payload: AddOrgPayload = {
                orgName: { en: orgName },
                orgType: EOrgType.GENERIC
              };
              const { _id } = await addOrg(payload).unwrap();

              const payload2: EditOrgPayload = {
                orgs: org.orgs.concat([{ _id }])
              };
              await editOrg({ payload: payload2, org }).unwrap();
              toast({ status: "success", title: t("success") });
              props.onSubmit && props.onSubmit();
            } catch (error) {
              toast({ status: "error", title: t("error") });
            }
          }}
        />
      )}
    </>
  );
};

// export const AddBranchForm = ({
//   session,
//   ...props
// }: {
//   session: Session;
//   onCancel?: () => void;
// }) => {
//   const router = useRouter();
//   const { t } = useTranslation();
//   const toast = useToast({ position: "top" });
//   const [isLoading, setIsLoading] = useState(false);
//   const [addOrg] = useAddOrgMutation();

//   const defaultValues = {
//     branchName: ""
//   };
//   const {
//     control,
//     register,
//     handleSubmit,
//     errors,
//     setError,
//     clearErrors,
//     setValue,
//     getValues,
//     formState
//   } = useFormPersist(
//     useForm<FormValues>({
//       defaultValues,
//       mode: "onChange"
//     })
//   );
//   useLeaveConfirm({ formState });
//   const refs = useMemo(
//     () =>
//       Object.keys(defaultValues).reduce(
//         (acc: Record<string, React.RefObject<any>>, fieldName) => {
//           acc[fieldName] = React.createRef();
//           return acc;
//         },
//         {}
//       ),
//     [defaultValues]
//   );
//   useEffect(() => {
//     if (Object.keys(errors).length > 0) {
//       const fieldName = Object.keys(errors)[0];
//       const fieldRef = refs[fieldName].current;
//       if (fieldRef)
//         fieldRef.scrollIntoView({
//           behavior: "smooth",
//           block: "start"
//         });
//     }
//   }, [errors]);
//   const onChange = () => {
//     clearErrors("formErrorMessage");
//   };
//   const onSubmit = async (form: { branchName: string }) => {
//     console.log("submitted", form);
//     setIsLoading(true);

//     try {
//       let payload: EditOrgPayload = {
//         orgs: (props.org.orgs || []).concat([{}])
//       };

//       const pay;
//       const org = await addOrg(payload).unwrap();
//       const orgUrl = org.orgUrl;

//       toast({
//         //title: `Vous allez être redirigé vers l'arbre : ${form.branchName}...`,
//         title: t("success"),
//         status: "success"
//       });

//       setIsLoading(false);
//       router.push(`/a/${orgUrl}`);
//     } catch (error) {
//       setIsLoading(false);
//       handleError(error, (message, field) => {
//         setError(field || "formErrorMessage", {
//           type: "manual",
//           message
//         });
//       });
//     }
//   };

//   return (
//     <form
//       css={css`
//         button {
//           margin-top: 12px;
//         }
//       `}
//       onChange={onChange}
//       onSubmit={handleSubmit(onSubmit)}
//     >
//       <FormControl
//         ref={refs.branchName}
//         isRequired
//         isInvalid={!!errors["branchName"]}
//       >
//         <FormLabel>{t("name-label-b")}</FormLabel>
//         <Input
//           name="branchName"
//           ref={register({
//             required: `Veuillez saisir un nom`
//             // pattern: {
//             //   value: /^[A-zÀ-ú0-9 ]+$/i,
//             //   message:
//             //     "Veuillez saisir un nom composé de lettres et de chiffres uniquement"
//             // }
//           })}
//         />
//       </FormControl>

//       <FooterControl errors={errors} isLoading={isLoading} />
//     </form>
//   );
// };
