import { Spinner } from "@chakra-ui/react";
import { Layout } from "features/layout";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { selectIsOffline } from "store/sessionSlice";
import { PageProps } from "./_app";

const CallbackPage = (props: PageProps) => {
  const isOffline = useSelector(selectIsOffline);
  const router = useRouter();

  useEffect(() => {
    if (isOffline) window.location.replace("/");
  }, [isOffline]);

  useEffect(() => {
    (async function onRouterQueryChange() {
      try {
        if (router.query.otp) {
          //todo
        } else {
          console.log("🚀 ~ CallbackPage ~ no query params");
          window.location.replace("/");
        }
      } catch (error) {
        console.log("🚀 ~ CallbackPage ~ error:", error);
        window.location.replace("/");
      }
    })();
  }, [router.query]);

  return (
    <Layout {...props}>
      <Spinner />
    </Layout>
  );
};

export default CallbackPage;
