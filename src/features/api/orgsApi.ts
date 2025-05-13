import { EOrgType, EOrgVisibility, IOrg } from "models/Org";
import { objectToQueryString } from "utils/query";
import { TagTypes, api } from "./";

export type AddOrgPayload = Pick<Partial<IOrg>, "orgName">;

export type EditOrgPayload = Partial<IOrg> | string[];

export type GetOrgParams = {
  orgUrl: string;
  hash?: string | void;
  populate?: string;
};

export type GetOrgsParams = {
  createdBy?: string;
  orgType?: EOrgType;
  populate?: string;
};

export type DeleteOrgParams = { orgId: string; isDeleteOrgEvents: boolean };

export const orgApi = api.injectEndpoints({
  endpoints: (build) => ({
    addOrg: build.mutation<IOrg, AddOrgPayload>({
      query: (payload) => {
        //console.groupCollapsed("addOrg");
        //console.log("payload", payload);
        //console.groupEnd();

        return {
          url: `orgs`,
          method: "POST",
          body: payload
        };
      },
      invalidatesTags: [{ type: TagTypes.ORGS, id: "LIST" }]
    }),
    deleteOrg: build.mutation<IOrg, DeleteOrgParams>({
      query: ({ orgId, ...query }) => {
        //console.groupCollapsed("deleteOrg");
        //console.log("orgId", orgId);
        //console.log("isDeleteOrgEvents", query.isDeleteOrgEvents);
        //console.groupEnd();

        return {
          method: "DELETE",
          url: `org/${orgId}${
            Object.keys(query).length > 0
              ? `?${objectToQueryString(query)}`
              : ""
          }`
        };
      },
      invalidatesTags: [{ type: TagTypes.ORGS, id: "LIST" }]
    }),
    editOrg: build.mutation<IOrg, { payload: EditOrgPayload; orgId?: string }>({
      query: ({ payload, orgId }) => {
        const id = orgId ? orgId : "_id" in payload ? payload._id : undefined;

        //console.groupCollapsed("editOrg");
        //console.log("orgId", id);
        //console.log("payload", payload);
        //console.groupEnd();

        return {
          url: `org/${id}`,
          method: "PUT",
          body: payload
        };
      },
      invalidatesTags: (result, error, params) => {
        return [
          { type: TagTypes.ORGS, id: params.orgId },
          { type: TagTypes.ORGS, id: "LIST" }
        ];
      }
    }),
    getOrg: build.query<IOrg, GetOrgParams>({
      query: ({ orgUrl, ...query }) => {
        //console.groupCollapsed("getOrg");
        //console.log("orgUrl", orgUrl);
        //console.log("hash", query.hash);
        //console.log("populate", query.populate);
        //console.groupEnd();

        return {
          url: `org/${orgUrl}${
            Object.keys(query).length > 0
              ? `?${objectToQueryString(query)}`
              : ""
          }`
        };
      },
      providesTags: (result, error, params) => {
        if (error || !result) return [];
        return [{ type: TagTypes.ORGS, id: result._id }];
      }
    }),
    getOrgs: build.query<IOrg[], GetOrgsParams | void>({
      query: ({ ...query } = {}) => {
        const hasQueryParams = Object.keys(query).length > 0;
        if (hasQueryParams) {
          //console.groupCollapsed("getOrgs");
          //console.log("query", query);
          //console.groupEnd();
        }
        return {
          url: `orgs${hasQueryParams ? `?${objectToQueryString(query)}` : ""}`
        };
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({
                type: TagTypes.ORGS,
                id: _id
              })),
              { type: TagTypes.ORGS, id: "LIST" }
            ]
          : [{ type: TagTypes.ORGS, id: "LIST" }]
    })
  }),
  overrideExisting: true
});

export const {
  useAddOrgMutation,
  useDeleteOrgMutation,
  useEditOrgMutation,
  useGetOrgQuery,
  useGetOrgsQuery
} = orgApi;

export const { getOrg, getOrgs } = orgApi.endpoints;
