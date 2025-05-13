import { Switch, useToast } from "@chakra-ui/react";
import { useEditUserMutation, useGetUserQuery } from "features/api/usersApi";
import React, { useEffect, useState } from "react";
import { base64ToUint8Array } from "utils/string";
const { getEnv } = require("utils/env");

interface customWindow extends Window {
  workbox?: any;
}

declare const window: customWindow;

export const SubscribeSwitch = ({
  email,
  userName
}: {
  email: string;
  userName: string;
}) => {
  const toast = useToast({ position: "top" });

  const [editUser] = useEditUserMutation();
  const userQuery = useGetUserQuery({ slug: email });

  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);

  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );

  const isSubscribed = !!subscription && !!userQuery.data?.userSubscription;

  const subscribe = async (
    serviceWorkerRegistration: ServiceWorkerRegistration
  ) => {
    try {
      const pushSubscription =
        await serviceWorkerRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: base64ToUint8Array(
            process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY
          )
        });

      if (pushSubscription) {
        setSubscription(pushSubscription);
        await editUser({
          payload: { userSubscription: pushSubscription },
          slug: userName
        });
        toast({
          status: "success",
          title: "Les notifications mobile sont activées"
        });
      }
    } catch (error) {
      console.error("subscribe", error);
      throw error;
    }
  };

  const unsubscribe = async (subscription: PushSubscription) => {
    try {
      await subscription.unsubscribe();

      setSubscription(null);
      await editUser({
        payload: { userSubscription: null },
        slug: userName
      });
      toast({
        status: "success",
        title: "Notifications mobiles désactivées"
      });
    } catch (error) {
      console.error("unsubscribe", error);
      throw error;
    }
  };

  useEffect(() => {
    (async function checkSubscription() {
      if (!userQuery.data) {
        if (getEnv() === "production")
          console.warn("SubscribeSwitch.checkSubscription : no user");
        return;
      }

      if (!("serviceWorker" in navigator)) {
        if (getEnv() === "production")
          console.warn(
            "SubscribeSwitch.checkSubscription : navigator.serviceWorker is missing"
          );
        return;
      }

      if (!window.workbox) {
        if (getEnv() === "production")
          console.warn(
            "SubscribeSwitch.checkSubscription : window.workbox is missing"
          );
        return;
      }

      try {
        const serviceWorkerRegistration = await navigator.serviceWorker.ready;
        if (!registration) setRegistration(serviceWorkerRegistration);

        const pushSubscription =
          userQuery.data.userSubscription ||
          (await serviceWorkerRegistration.pushManager.getSubscription());

        if (pushSubscription) setSubscription(pushSubscription);
        else await subscribe(serviceWorkerRegistration);
      } catch (error) {
        console.error("cdm", error);
      }
    })();
  }, [userQuery.data]);

  return (
    <Switch
      isChecked={isSubscribed}
      display="flex"
      alignItems="center"
      onChange={async () => {
        try {
          if (isSubscribed) {
            await unsubscribe(subscription);
          } else {
            if (registration) {
              await subscribe(registration);
            } else {
              throw new Error("cannot subscribe: no registration");
            }
          }
        } catch (error: any) {
          console.error(error);
          toast({
            status: "error",
            title: `Les notifications mobiles n'ont pas pu être ${
              isSubscribed ? "désactivées" : "activées"
            }`
          });
        }
      }}
    >
      Notifications mobile
    </Switch>
  );
};
