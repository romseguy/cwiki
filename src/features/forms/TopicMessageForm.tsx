import {
  Alert,
  AlertIcon,
  Button,
  ChakraProps,
  Flex,
  FormControl,
  FormErrorMessage
} from "@chakra-ui/react";
import { useToast } from "hooks/useToast";

import { ErrorMessage } from "@hookform/error-message";
import { AddTopicPayload, useAddTopicMutation } from "features/api/topicsApi";
import { ErrorMessageText, RTEditor } from "features/common";
import useFormPersist from "hooks/useFormPersist";
import { useLeaveConfirm } from "hooks/useLeaveConfirm";
import { useSession } from "hooks/useSession";
import { IEntity, isEvent, isOrg } from "models/Entity";
import { IEvent } from "models/Event";
import { IOrg } from "models/Org";
import { ITopic } from "models/Topic";
import { ITopicMessage } from "models/TopicMessage";
import { useRouter } from "next/router";
import React from "react";
import { Controller, useForm } from "react-hook-form";
import { handleError } from "utils/form";
import { AppQueryWithData } from "utils/types";

interface TopicMessageFormProps extends ChakraProps {
  formats?: string[];
  isDisabled?: boolean;
  query: AppQueryWithData<IEntity>;
  isLoading: boolean;
  setIsLoading: (bool: boolean) => void;
  topic: ITopic;
  topicMessage?: ITopicMessage;
  onCancel?: () => void;
  onSubmit?: (topicMessageName: string) => void;
}

export const TopicMessageForm = ({
  isDisabled,
  isLoading,
  setIsLoading,
  query,
  ...props
}: TopicMessageFormProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const toast = useToast({ position: "top" });
  const entity = query.data;
  //const isE = isEvent(entity);
  const isO = isOrg(entity);
  const event = isE ? (query.data as IEvent) : undefined;
  const org = isO ? (query.data as IOrg) : undefined;

  const [addTopic, addTopicMutation] = useAddTopicMutation();

  //#region local state
  //const [isLoading, setIsLoading] = useState(true);
  // const [topicMessageDefaultValue, setTopicMessageDefaultValue] =
  //   useState<string>("");
  //#endregion

  //#region form
  const {
    control,
    handleSubmit,
    errors,
    setError,
    clearErrors,
    setValue,
    formState
  } = useFormPersist(
    useForm<{ formErrorMessage: string; topicMessage: string }>({
      mode: "onChange",
      defaultValues: { topicMessage: "" }
    })
  );
  useLeaveConfirm({ formState });

  const onChange = () => {
    clearErrors("formErrorMessage");
  };

  const onSubmit = async (form: { topicMessage: string }) => {
    console.log("submitted", form);

    setIsLoading(true);

    const payload: AddTopicPayload = {
      topic: {
        ...props.topic,
        topicMessages: [
          {
            message: form.topicMessage,
            createdBy: session!.user.userId
          }
        ]
      }
    };

    try {
      await addTopic({
        payload
      }).unwrap();

      toast({
        title: "Votre message a été ajouté !",
        status: "success"
      });

      setIsLoading(false);
      clearErrors("topicMessage");
      setValue("topicMessage", "");
      props.onSubmit && props.onSubmit(form.topicMessage);
    } catch (error) {
      setIsLoading(false);
      handleError(error, (message, field) => {
        if (field) {
          setError(field, { type: "manual", message });
        } else {
          setError("formErrorMessage", { type: "manual", message });
        }
      });
    }
  };
  //#endregion

  return (
    <form onChange={onChange} onSubmit={handleSubmit(onSubmit)}>
      {!isDisabled && session && (
        <FormControl
          isDisabled={isDisabled}
          isRequired
          isInvalid={!!errors["topicMessage"]}
        >
          <Controller
            name="topicMessage"
            control={control}
            rules={{ required: "Veuillez saisir un message" }}
            render={(renderProps) => {
              const lineBreaks = renderProps.value.match(/<br>/g);
              const newHeight = Array.isArray(lineBreaks)
                ? lineBreaks.length * 22
                : 200;
              return (
                <RTEditor
                  value={renderProps.value}
                  placeholder={"Cliquez ici pour ajouter un message..."}
                  setIsLoading={setIsLoading}
                  height={
                    newHeight < 200 ? 200 : newHeight > 500 ? 500 : newHeight
                  }
                  onChange={({ html }) => {
                    renderProps.onChange(html);
                  }}
                />
              );
            }}
          />

          <FormErrorMessage ml={1}>
            <ErrorMessage errors={errors} name="topicMessage" />
          </FormErrorMessage>
        </FormControl>
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

      <Flex
        justifyContent={props.onCancel ? "space-between" : "flex-end"}
        mt={3}
      >
        {props.onCancel && (
          <Button onClick={() => props.onCancel && props.onCancel()}>
            Annuler
          </Button>
        )}

        {!session && (
          <Button
            variant="outline"
            onClick={() => {
              router.push("/login", "/login", { shallow: true });
            }}
            mr={3}
          >
            Se connecter pour ajouter un message
          </Button>
        )}

        {session && (
          <Button
            colorScheme="green"
            type="submit"
            isLoading={isLoading}
            isDisabled={isDisabled || Object.keys(errors).length > 0}
          >
            {isDisabled
              ? "Réponses désactivées"
              : props.topicMessage
                ? "Modifier"
                : "Ajouter"}
          </Button>
        )}
      </Flex>
    </form>
  );
};

{
  /*
    const formData = localStorage.getItem("storageKey");
    useEffect(() => {
      if (formData) {
        const parsed = JSON.parse(formData);

        if (parsed) {
          const value = parsed.topicMessage;

          if (typeof value === "string") {
            setTopicMessageDefaultValue(value);
            //setValue("topicMessage", value);
          }
        }
      }
    }, [formData]);

    useEffect(() => {
      if (formData) {
        const parsed = JSON.parse(formData);

        if (parsed) {
          const value = parsed.topicMessage;
          setValue("topicMessage", value);
          setTopicMessageDefaultValue(value);
          console.log("storage changed!", value);
        }
      } else {
        console.log("nothing stored");
        setValue("topicMessage", "");
        setTopicMessageDefaultValue("");
      }
    }, [formData]);
  */
}
