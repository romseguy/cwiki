import { NotFound } from "features/common";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});
export default NotFound;
