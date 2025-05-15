import { AddForm } from "features/forms/AddForm";
import { Layout } from "features/layout";
import { useSession } from "hooks/useSession";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { PageProps } from "pages/_app";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectIsSessionLoading } from "store/sessionSlice";
import { Session } from "utils/auth";

const AddPage = ({
  ...props
}: PageProps & {
  onCancel?: () => void;
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const isSessionLoading = useSelector(selectIsSessionLoading);

  useEffect(() => {
    if (!isSessionLoading) {
      if (!session) {
        window.localStorage.setItem("path", router.asPath);
        router.push("/login", "/login", { shallow: true });
      } /*else if (!session.user.isAdmin) {
        throw new Error(
          "Vous devez être administrateur pour ajouter un événement"
        );
      }*/
    }
  }, [session, isSessionLoading]);

  if (!session) return null;

  return (
    <Layout pageTitle="Add a tree" {...props}>
      <AddForm session={session as Session} {...props} />
    </Layout>
  );
};

export const getStaticProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? "en", ["common"]))
  }
});

export default AddPage;
