import { Spinner } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Layout } from "features/layout";
import { selectIsOffline } from "store/sessionSlice";
import { client } from "utils/auth";
import { PageProps } from "./_app";

const CallbackPage = (props: PageProps) => {
  const isOffline = useSelector(selectIsOffline);
  const router = useRouter();

  useEffect(() => {
    console.log("🚀 ~ CallbackPage ~ isOffline:", isOffline);
    if (isOffline) window.location.replace("/");
  }, [isOffline]);

  useEffect(() => {
    (async function onRouterQueryChange() {
      try {
        if (router.query.provider) {
          const result = await client.oauth.getRedirectResult();
          const didToken = result.magic.idToken;
          await fetch("/api/login", {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + didToken
            }
          });
          window.location.replace("/");
        } else if (typeof router.query.magic_credential === "string") {
          const didToken = await client.auth.loginWithCredential(
            router.query.magic_credential
          );
          const response = await fetch("/api/login", {
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + didToken
            }
          });
          const json = await response.json();
          console.log("🚀 ~ CallbackPage ~ json:", json);
          window.location.replace("/");
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
