export * from "./ITopic";

export type isEdit = Record<
  string,
  {
    html?: string | undefined;
    isOpen: boolean;
  }
>;
