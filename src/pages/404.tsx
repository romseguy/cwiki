import { NotFound } from "features/common";
import { useTranslation } from "next-i18next";
export default () => {
  const { t } = useTranslation();
  return <NotFound message={t("not-found")} />;
};
