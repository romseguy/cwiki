import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Switch,
  Text
} from "@chakra-ui/react";
import { ErrorMessage } from "@hookform/error-message";
//import { useEditEventMutation } from "features/api/eventsApi";
import { useEditOrgMutation } from "features/api/orgsApi";
import {
  AddTopicPayload,
  EditTopicPayload,
  useAddTopicMutation,
  useEditTopicMutation
} from "features/api/topicsApi";
import { ErrorMessageText, MultiSelect, RTEditor } from "features/common";
import useFormPersist from "hooks/useFormPersist";
import { useLeaveConfirm } from "hooks/useLeaveConfirm";
import { useSession } from "hooks/useSession";
import { useToast } from "hooks/useToast";
import { IEntity, isEvent, isOrg } from "models/Entity";
//import { EEventVisibility, IEvent } from "models/Event";
import { EOrgVisibility, IOrg, orgTypeFull } from "models/Org";
import { ITopic } from "models/Topic";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import Creatable from "react-select/creatable";
import { handleError } from "utils/form";
import { AppQueryWithData } from "utils/types";

export const TopicForm = ({
  query,
  //subQuery,
  ...props
}: {
  query: AppQueryWithData<IEntity>;
  //subQuery: AppQuery<ISubscription>;
  topic?: ITopic;
  isCreator?: boolean;
  isFollowed?: boolean;
  onCancel?: () => void;
  onSubmit?: (topic?: Partial<ITopic>) => void;
}) => {
  const { data: session } = useSession();
  const toast = useToast({ position: "top" });

  //#region local state
  const [addTopic, addTopicMutation] = useAddTopicMutation();
  const [editTopic, editTopicMutation] = useEditTopicMutation();
  //const [editEvent] = useEditEventMutation();
  const [editOrg] = useEditOrgMutation();
  const entity = query.data;
  //const isE = isEvent(entity);
  const isO = isOrg(entity);
  //const event = isE ? (query.data as IEvent) : undefined;
  const org = isO ? (query.data as IOrg) : undefined;
  const isEntityPrivate = org?.orgVisibility === EOrgVisibility.PRIVATE;
  // || event?.eventVisibility === EEventVisibility.PRIVATE;
  const edit = isE ? editEvent : editOrg;
  const topicCategories = isE
    ? entity.eventTopicCategories
    : isO
      ? entity.orgTopicCategories
      : [];
  const topicCategory =
    props.topic &&
    props.topic.topicCategory &&
    topicCategories.find(({ catId }) => catId === props.topic!.topicCategory);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //#endregion

  //#region form
  const {
    control,
    register,
    handleSubmit,
    errors,
    setError,
    clearErrors,
    setValue,
    formState
  } = useFormPersist(
    useForm<{
      topicName: string;
      topicCategory: { label: string; value: string } | null;
      topicMessage?: string;
    }>({
      mode: "onChange",
      defaultValues: {
        topicName: props.topic?.topicName,
        topicCategory: topicCategory
          ? { label: topicCategory.label, value: topicCategory.catId }
          : null,
        topicMessage: ""
      }
    })
  );
  useLeaveConfirm({ formState });

  const onChange = () => {
    clearErrors("formErrorMessage");
  };

  const onSubmit = async (form: {
    topicName: string;
    topicMessage?: string;
    topicCategory?: { label: string; value: string } | null;
    topicVisibility?: [{ label: string; value: string }];
  }) => {
    console.log("submitted", form);
    if (!session) return;

    setIsLoading(true);

    let topic: Partial<ITopic> = {
      event,
      org,
      topicCategory: form.topicCategory ? form.topicCategory.value : null,
      topicName: form.topicName,
      topicVisibility: (form.topicVisibility || []).map(
        ({ label, value }) => value
      )
    };

    try {
      if (props.topic) {
        const payload: EditTopicPayload = {
          topic
        };

        await editTopic({
          payload,
          topicId: props.topic._id
        }).unwrap();

        toast({
          title: "La discussion a été modifiée",
          status: "success"
        });

        setIsLoading(false);
        props.onSubmit && props.onSubmit();
      } else {
        if (typeof form.topicMessage === "string" && form.topicMessage !== "") {
          topic.topicMessages = [
            {
              message: form.topicMessage,
              createdBy: session.user.userId
            }
          ];
        }

        let payload: AddTopicPayload = {
          topic
        };

        const newTopic = await addTopic({
          payload
        }).unwrap();

        toast({
          title: "La discussion a été ajoutée !",
          status: "success"
        });

        setIsLoading(false);
        props.onSubmit && props.onSubmit(newTopic);
      }
    } catch (error: any) {
      setIsLoading(false);
      handleError(error, (message, field) =>
        field
          ? setError(field, { type: "manual", message })
          : setError("formErrorMessage", { type: "manual", message })
      );
    }
  };
  //#endregion

  return (
    <form onChange={onChange} onSubmit={handleSubmit(onSubmit)}>
      <FormControl isRequired isInvalid={!!errors["topicName"]} mb={3}>
        <FormLabel>Objet de la discussion</FormLabel>
        <Input
          name="topicName"
          ref={register({
            required: "Veuillez saisir l'objet de la discussion"
          })}
          autoComplete="off"
          placeholder="Objet de la discussion"
        />
        <FormErrorMessage>
          <ErrorMessage errors={errors} name="topicName" />
        </FormErrorMessage>
      </FormControl>

      {!props.topic && (
        <FormControl isInvalid={!!errors["topicMessage"]} mb={3}>
          <FormLabel>Message (optionnel)</FormLabel>
          <Controller
            name="topicMessage"
            control={control}
            render={(renderProps) => {
              return (
                <RTEditor
                  maxImageHeight={300}
                  placeholder="Contenu de votre message"
                  onChange={({ html }) => {
                    renderProps.onChange(html);
                  }}
                />
              );
            }}
          />
          <FormErrorMessage>
            <ErrorMessage errors={errors} name="topicMessage" />
          </FormErrorMessage>
        </FormControl>
      )}

      {isO && (
        <FormControl isInvalid={!!errors["topicCategory"]} mb={3}>
          <FormLabel>Catégorie (optionnel)</FormLabel>
          <Controller
            name="topicCategory"
            control={control}
            render={(renderProps) => {
              let value = renderProps.value;

              return (
                <Creatable
                  value={value}
                  onChange={renderProps.onChange}
                  options={
                    topicCategories.map(({ catId: value, label }) => {
                      return {
                        label,
                        value
                      };
                    }) || []
                  }
                  allowCreateWhileLoading
                  formatCreateLabel={(inputValue: string) =>
                    `Ajouter la catégorie "${inputValue}"`
                  }
                  onCreateOption={async (inputValue: string) => {
                    if (!props.isCreator) {
                      toast({
                        status: "error",
                        title: `Vous n'avez pas la permission ${
                          isE
                            ? "de l'événement"
                            : isO
                              ? orgTypeFull(entity.orgType)
                              : ""
                        } pour ajouter une catégorie`
                      });
                      return;
                    }

                    // if (
                    //   entity.orgTopicCategories.find(
                    //     (orgTopicsCategory) =>
                    //       orgTopicsCategory === normalize(inputValue, false)
                    //   )
                    // ) {
                    //   toast({
                    //     status: "error",
                    //     title: `Ce nom de catégorie n'est pas disponible`,
                    //                         //   });
                    //   return;
                    // }

                    try {
                      //if (isE) {
                      //todo
                      //} else {
                      const catId = "" + topicCategories.length;
                      await edit({
                        [isE ? "eventId" : "orgId"]: entity._id,
                        payload: {
                          [isE ? "eventTopicCategories" : "orgTopicCategories"]:
                            [
                              ...topicCategories,
                              {
                                catId,
                                label: inputValue
                              }
                            ]
                        }
                      }).unwrap();
                      //}

                      setValue("topicCategory", {
                        label: inputValue,
                        value: catId
                      });
                      toast({
                        status: "success",
                        title: "La catégorie a été ajoutée !"
                      });
                    } catch (error) {
                      console.error(error);
                      toast({
                        status: "error",
                        title: "La catégorie n'a pas pu être ajoutée"
                      });
                    }
                  }}
                  isClearable
                  placeholder="Rechercher ou ajouter une catégorie"
                  noOptionsMessage={() => "Aucun résultat"}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (defaultStyles: any) => {
                      return {
                        ...defaultStyles,
                        borderColor: "#e2e8f0"
                      };
                    },
                    placeholder: () => {
                      return {
                        color: "#A0AEC0"
                      };
                    }
                  }}
                />
              );
            }}
          />
          <FormErrorMessage>
            <ErrorMessage errors={errors} name="topicCategory" />
          </FormErrorMessage>
        </FormControl>
      )}

      {org && !isEntityPrivate && (
        <>
          <FormLabel>Paramètres de la discussion</FormLabel>
          <FormControl mb={3}>
            <HStack>
              <FormLabel fontWeight="normal" m={0}>
                Rendre la discussion visible aux participants seulement
              </FormLabel>
              <Switch
                isChecked={isChecked}
                onChange={() => setIsChecked(!isChecked)}
              />
            </HStack>
          </FormControl>
        </>
      )}

      {/*hasItems(topicVisibility) && (
        <Alert status="warning" mb={3}>
          <AlertIcon />
          La discussion ne sera visible que par les participants des listes
          sélectionnées.
        </Alert>
      )*/}

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

      <Flex justifyContent="space-between">
        {props.onCancel && (
          <Button colorScheme="red" onClick={props.onCancel}>
            Annuler
          </Button>
        )}

        <Button
          colorScheme="green"
          type="submit"
          isLoading={
            isLoading ||
            addTopicMutation.isLoading ||
            editTopicMutation.isLoading
          }
          isDisabled={Object.keys(errors).length > 0}
          data-cy="addTopic"
        >
          {props.topic ? "Modifier" : "Ajouter"}
        </Button>
      </Flex>
    </form>
  );
};

{
  /* {org && org.orgUrl !== "forum" && (
      )} */
}

{
  /*
          <Controller
            name="topicVisibility"
            control={control}
            defaultValue={
              props.topic?.topicVisibility.map((listName) => ({
                label: listName,
                value: listName
              })) || []
            }
            render={(renderProps) => {
              return (
                <MultiSelect
                  value={renderProps.value}
                  onChange={renderProps.onChange}
                  options={
                    org.orgLists.map(({ listName }) => ({
                      label: listName,
                      value: listName
                    })) || []
                  }
                  allOptionLabel="Toutes les listes"
                  //closeMenuOnSelect={false}
                  placeholder="Sélectionner une ou plusieurs listes"
                  noOptionsMessage={() => "Aucun résultat"}
                  isClearable
                  isSearchable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={{
                    control: (defaultStyles: any) => {
                      return {
                        ...defaultStyles,
                        borderColor: "#e2e8f0"
                      };
                    },
                    placeholder: () => {
                      return {
                        color: "#A0AEC0"
                      };
                    }
                  }}
                />
              );
            }}
          />
  */
}
