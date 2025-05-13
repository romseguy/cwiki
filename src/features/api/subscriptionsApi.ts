import { getRefId } from "models/Entity";
import type { ISubscription } from "models/Subscription";
import { TagTypes, api } from "./";

export type AddSubscriptionPayload = Omit<ISubscription, "_id" | "createdBy">;
export type EditSubscriptionPayload = Partial<ISubscription>;

export const subscriptionApi = api.injectEndpoints({
  endpoints: (build) => ({
    addSubscription: build.mutation<ISubscription, AddSubscriptionPayload>({
      query: (payload) => {
        //console.groupCollapsed("addSubscription");
        //console.log("payload", payload);
        //console.groupEnd();

        return {
          url: `subscriptions`,
          method: "POST",
          body: payload
        };
      },
      //@ts-ignore
      invalidatesTags: (result, error, params) => {
        if (error || !result) return [];
        const tags = [
          { type: TagTypes.SUBSCRIPTIONS, id: "LIST" },
          { type: TagTypes.SUBSCRIPTIONS, id: result.email }
        ];

        if (Array.isArray(result.orgs)) {
          for (const orgSubscription of result.orgs) {
            tags.push({
              type: TagTypes.ORGS,
              id: getRefId(orgSubscription.org, "_id")
            });
          }
        }
        return tags;
      }
    }),
    deleteSubscription: build.mutation<
      ISubscription,
      {
        payload?: Partial<ISubscription>;
        subscriptionId: string;
        orgId?: string;
        topicId?: string;
      }
    >({
      query: ({ payload, subscriptionId, orgId, topicId }) => {
        //console.groupCollapsed("deleteSubscription");
        //console.log("subscriptionId", subscriptionId);
        //console.log("orgId", orgId);
        //console.log("topicId", topicId);
        //console.log("payload", payload);
        //console.groupEnd();

        return {
          url: `subscription/${subscriptionId}`,
          method: "DELETE",
          body: payload ? payload : { orgId, topicId }
        };
      },
      //@ts-ignore
      invalidatesTags: (result, error, params) => {
        if (error || !result) return [];

        let tags = [];

        if (params.orgId) tags.push({ type: "Orgs", id: params.orgId });

        //const email = params.email;
        //if (email) return [{ type: TagTypes.SUBSCRIPTIONS, email }];
        const id = result._id;
        if (id) tags.push({ type: TagTypes.SUBSCRIPTIONS, id });

        return tags;
      }
    }),
    editSubscription: build.mutation<
      {},
      { payload: EditSubscriptionPayload; subscriptionId?: string }
    >({
      query: ({ payload, subscriptionId }) => ({
        url: `subscription/${subscriptionId || payload._id}`,
        method: "PUT",
        body: payload
      }),
      invalidatesTags: (result, error, params) => {
        if (error) return [];

        let tags = [{ type: TagTypes.SUBSCRIPTIONS, id: "LIST" }];
        const id = params.subscriptionId || params.payload._id;

        if (id) {
          tags.push({ type: TagTypes.SUBSCRIPTIONS, id });
        }

        return tags;
      }
    }),
    getSubscription: build.query<
      ISubscription,
      { email?: string; populate?: string }
    >({
      query: ({ email, populate }) => {
        //console.groupCollapsed("getSubscription");
        //console.log("email", typeof email, email);
        //console.log("populate", populate);
        //console.groupEnd();

        if (!email) return "";

        return {
          url: `subscription/${email}${populate ? `?populate=${populate}` : ""}`
        };
      },
      providesTags: (result, error, params) => {
        if (error || !result) return [];

        return [{ type: TagTypes.SUBSCRIPTIONS, id: result.email }];
      }
    }),
    getSubscriptions: build.query<ISubscription[], { topicId?: string }>({
      query: ({ topicId }) => ({
        url: `subscriptions${topicId ? `?topicId=${topicId}` : ""}`
      }),
      providesTags: (result, error, params) => {
        if (error || !result) return [];

        let tags = [{ type: TagTypes.SUBSCRIPTIONS, id: "LIST" }];

        result.forEach((subscription) => {
          tags.push({
            type: TagTypes.SUBSCRIPTIONS,
            id: subscription._id
          });
        });

        return tags;
      }
    })
    // getSubscription: build.query<ISubscription, string | undefined>({
    //   query: (string) => ({ url: `subscriptions/${string}` })
    // })
  }),
  overrideExisting: true
});

export const {
  useAddSubscriptionMutation,
  useDeleteSubscriptionMutation,
  useEditSubscriptionMutation,
  useGetSubscriptionQuery,
  useGetSubscriptionsQuery
} = subscriptionApi;

// export const {
//   endpoints: { getSubscription, getSubscriptions, deleteSubscription }
// } = subscriptionApi;
