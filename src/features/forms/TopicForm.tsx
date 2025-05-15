import {
  Alert,
  AlertIcon,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
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
import { ErrorMessageText, RTEditor } from "features/common";
import { FooterControl } from "features/common/forms/FooterControl";
import useFormPersist from "hooks/useFormPersist";
import { useLeaveConfirm } from "hooks/useLeaveConfirm";
import { useSession } from "hooks/useSession";
import { useToast } from "hooks/useToast";
import { IEntity, isOrg } from "models/Entity";
import { EOrgVisibility, IOrg } from "models/Org";
import { ITopic } from "models/Topic";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
  const edit = /*isE ? editEvent :*/ editOrg;
  const topicCategories = /*isE
    ? entity.eventTopicCategories
    :*/ isO ? entity.orgTopicCategories : [];
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
      //event,
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

      <FooterControl
        errors={errors}
        isLoading={isLoading}
        onCancel={props.onCancel}
      />
    </form>
  );
};
