import { Alert, AlertIcon, Button, Flex } from "@chakra-ui/react";
import { ErrorMessage } from "@hookform/error-message";
import { ErrorMessageText } from "features/common";
import theme from "features/layout/theme";
import { useTranslation } from "next-i18next";
import { DeepMap, FieldError } from "react-hook-form";

export const FooterControl = ({
  errors,
  isLoading,
  onCancel,
  ...props
}: {
  errors: DeepMap<Record<string, any>, FieldError>;
  isLoading: boolean;
  onCancel?: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <>
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
        {onCancel && (
          <Button colorScheme="red" onClick={onCancel}>
            Annuler
          </Button>
        )}

        <Button
          colorScheme="green"
          type="submit"
          isLoading={isLoading}
          isDisabled={Object.keys(errors).length > 0}
        >
          {t("submit")}
        </Button>
      </Flex>
    </>
  );
};
