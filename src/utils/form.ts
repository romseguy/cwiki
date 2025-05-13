export const onCancelWithConfirm = ({
  isDirty,
  onCancel
}: {
  isDirty: boolean;
  onCancel: () => void;
}) => {
  if (isDirty) {
    const confirmed = confirm(
      "Le formulaire a été modifié, êtes-vous sûr de vouloir annuler ?"
    );
    if (!confirmed) return;
  }

  onCancel && onCancel();
};

export const onCloseWithConfirm = ({
  isDirty,
  onClose
}: {
  isDirty: boolean;
  onClose: () => void;
}) => {
  if (isDirty) {
    const confirmed = confirm(
      "Le formulaire a été modifié, êtes-vous sûr de vouloir annuler ?"
    );
    if (!confirmed) return;
  }

  onClose && onClose();
};

export function handleError<T>(
  error: any,
  setError: (message: string, field?: keyof T) => void
) {
  console.warn(error);

  const setFieldsErrors = (fields: any) => {
    const keys = Object.keys(fields);
    if (!keys.length) {
      return setError("Une erreur inconnue est survenue");
    }

    for (const key of keys) {
      if (key === "message") {
        setError(fields[key]);
      } else {
        const message = fields[key].message ? fields[key].message : fields[key];
        //@ts-expect-error
        setError(message, key);
      }
    }
  };

  if (error.status === 400 || error.status === 500) {
    if (error.data) {
      const keys = Object.keys(error.data);

      if (keys.length) {
        setFieldsErrors(error.data);
      } else {
        if (error.data.message) {
          setError(error.data.message);
        } else {
          setFieldsErrors(error.data);
        }
      }
    } else if (error.message) {
      setError(error.message);
    } else {
      setFieldsErrors(error);
    }
  } else {
    if (error.data) {
      if (error.data.message) {
        setError(error.data.message);
      } else {
        setFieldsErrors(error.data);
      }
    } else if (error.message) {
      setError(error.message);
    } else {
      setFieldsErrors(error);
    }
  }
}

export function pickFile(onFilePicked: (file: File) => void): void {
  const inputElement = document.createElement("input");
  inputElement.style.display = "none";
  inputElement.type = "file";

  inputElement.addEventListener("change", () => {
    if (inputElement.files) {
      onFilePicked(inputElement.files[0]);
    }
  });

  const teardown = () => {
    document.body.removeEventListener("focus", teardown, true);
    setTimeout(() => {
      document.body.removeChild(inputElement);
    }, 1000);
  };
  document.body.addEventListener("focus", teardown, true);

  document.body.appendChild(inputElement);
  inputElement.click();
}
