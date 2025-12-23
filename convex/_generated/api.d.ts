/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admins from "../admins.js";
import type * as auth from "../auth.js";
import type * as contact from "../contact.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as newsletter from "../newsletter.js";
import type * as passwordReset from "../passwordReset.js";
import type * as properties from "../properties.js";
import type * as representatives from "../representatives.js";
import type * as siteContent from "../siteContent.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admins: typeof admins;
  auth: typeof auth;
  contact: typeof contact;
  files: typeof files;
  http: typeof http;
  newsletter: typeof newsletter;
  passwordReset: typeof passwordReset;
  properties: typeof properties;
  representatives: typeof representatives;
  siteContent: typeof siteContent;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
