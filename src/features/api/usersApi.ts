import { IUser } from "models/User";
import { objectToQueryString } from "utils/query";
import { api } from "./";

export type AddUserPayload = Pick<IUser, "email" | "phone" | "userName">;
export type EditUserPayload = Partial<
  Pick<IUser, "phone" | "userImage" | "userName">
>;

export type GetUserParams = {
  slug: string;
  populate?: string;
  select?: string;
};

export type GetUsersParams = {
  populate?: string;
  select?: string;
};

export type PostResetPasswordMailPayload = {};
export type CheckSecurityCodePayload = { code: string; email: string };

export const userApi = api.injectEndpoints({
  endpoints: (build) => ({
    addUser: build.mutation<IUser, AddUserPayload>({
      query: (payload) => ({
        url: `users`,
        method: "POST",
        body: payload
      }),
      invalidatesTags: (result, error, params) => {
        return result
          ? [
              { type: "Users", id: result._id },
              { type: "Users", id: "LIST" }
            ]
          : [];
      }
    }),
    editUser: build.mutation<IUser, { payload: Partial<IUser>; slug: string }>({
      query: ({ payload, slug }) => ({
        url: `user/${slug}`,
        method: "PUT",
        body: payload
      }),
      invalidatesTags: (result, error, params) =>
        result ? [{ type: "Users", id: result._id }] : []
    }),
    getUser: build.query<IUser, GetUserParams>({
      query: ({ slug, ...query }) => {
        const hasQueryParams = Object.keys(query).length > 0;
        console.groupCollapsed("getUser");
        console.log("slug", slug);
        if (hasQueryParams) {
          console.log("populate", query.populate);
          console.log("select", query.select);
        }
        console.groupEnd();

        return {
          url: `user/${slug}${
            hasQueryParams ? `?${objectToQueryString(query)}` : ""
          }`
        };
      },
      providesTags: (result, error, params) => [
        { type: "Users" as const, id: result?._id }
      ]
    }),
    getUsers: build.query<IUser[], GetUsersParams | void>({
      query: ({ ...query }) => {
        const hasQueryParams = Object.keys(query).length > 0;
        if (hasQueryParams) {
          //console.groupCollapsed("getUsers");
          //console.log("query", query);
          //console.groupEnd();
        }
        return {
          url: `users${hasQueryParams ? `?${objectToQueryString(query)}` : ""}`
        };
      },
      providesTags: (result) => {
        return result
          ? [
              ...result.map(({ _id }) => ({
                type: "Users" as const,
                id: _id
              })),
              { type: "Users", id: "LIST" }
            ]
          : [{ type: "Users", id: "LIST" }];
      }
    }),
    postResetPasswordMail: build.mutation<
      void,
      { payload?: PostResetPasswordMailPayload; email: string }
    >({
      query: ({ payload = {}, email }) => {
        //console.groupCollapsed("postResetPasswordMail");
        //console.log("email", email);
        //console.groupEnd();

        return {
          url: `user/${email}`,
          method: "POST",
          body: payload
        };
      }
    }),
    // checkPassword: build.mutation<
    //   boolean,
    //   { query;  }
    // >({
    //   query: ({ query = {} }) => {
    //     return {
    //       url: `user/check${hasQueryParams ? `?${objectToQueryString(query)}` : ""}`
    //       method: "GET"
    //     };
    //   }
    // }),
    checkSecurityCode: build.mutation<
      boolean,
      { payload?: CheckSecurityCodePayload }
    >({
      query: ({ payload = {} }) => {
        return {
          url: `user/check`,
          method: "POST",
          body: payload
        };
      }
    })
  }),
  overrideExisting: true
});

export const {
  useAddUserMutation,
  useEditUserMutation,
  useGetUserQuery,
  useGetUsersQuery,
  usePostResetPasswordMailMutation,
  useCheckSecurityCodeMutation
} = userApi;
export const { getUser, getUsers } = userApi.endpoints;
