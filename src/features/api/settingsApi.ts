import { createApi } from "@reduxjs/toolkit/query/react";
import type { ISetting } from "models/Setting";
import baseQuery, { objectToQueryString } from "utils/query";

export type AddSettingPayload = Omit<
  ISetting,
  "_id" | "settingName" | "settingValue"
>;

export type EditSettingPayload = Partial<ISetting>;

export type GetSettingParams = {
  settingName: string;
};

export type GetSettingsParams = {};

export const settingApi = createApi({
  reducerPath: "settingsApi",
  baseQuery,
  tagTypes: ["Settings"],
  endpoints: (build) => ({
    addSetting: build.mutation<ISetting, AddSettingPayload>({
      query: (payload) => {
        //console.groupCollapsed("addSetting");
        //console.log("payload", payload);
        //console.groupEnd();

        return {
          url: `settings`,
          method: "POST",
          body: payload
        };
      },
      invalidatesTags: [{ type: "Settings", id: "LIST" }]
    }),
    // deleteSetting: build.mutation<ISetting, string>({
    //   query: (settingId) => ({ url: `setting/${settingId}`, method: "DELETE" })
    // }),
    editSetting: build.mutation<
      ISetting,
      { payload: Partial<ISetting>; settingId?: string }
    >({
      query: ({ payload, settingId }) => {
        const id = settingId
          ? settingId
          : "_id" in payload
            ? payload._id
            : undefined;

        //console.log("editSetting: settingId", id);
        //console.log("editSetting: payload", payload);

        return {
          url: `setting/${id}`,
          method: "PUT",
          body: payload
        };
      },
      invalidatesTags: (result, error, params) =>
        result ? [{ type: "Settings", id: result._id }] : []
    }),
    getSetting: build.query<ISetting, GetSettingParams>({
      query: ({ settingName, ...query }) => {
        //console.groupCollapsed("getSetting");
        //console.log("settingName", settingName);
        //console.groupEnd();

        return {
          url: `setting/${settingName}?${objectToQueryString(query)}`
        };
      }
    }),
    getSettings: build.query<ISetting[], GetSettingsParams | void>({
      query: (query) => {
        //console.groupCollapsed("getSettings");
        // if (query) {
        //   //console.log("createdBy", query.createdBy);
        //   //console.log("populate", query.populate);
        // }
        //console.groupEnd();

        return {
          url: `settings${query ? `?${objectToQueryString(query)}` : ""}`
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: "Settings" as const,
                id: _id
              })),
              { type: "Settings", id: "LIST" }
            ]
          : [{ type: "Settings", id: "LIST" }]
    })
  })
});

export const {
  useAddSettingMutation,
  //useDeleteSettingMutation,
  useEditSettingMutation,
  useGetSettingQuery,
  useGetSettingsQuery
} = settingApi;
