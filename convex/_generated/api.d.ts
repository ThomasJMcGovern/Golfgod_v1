/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as courseStats from "../courseStats.js";
import type * as dataManagement from "../dataManagement.js";
import type * as dev_debug from "../dev/debug.js";
import type * as dev_seed from "../dev/seed.js";
import type * as http from "../http.js";
import type * as importMasterData from "../importMasterData.js";
import type * as playerBios from "../playerBios.js";
import type * as playerPhotos from "../playerPhotos.js";
import type * as players from "../players.js";
import type * as tournamentResults from "../tournamentResults.js";
import type * as tournaments from "../tournaments.js";
import type * as utils_dataProcessing from "../utils/dataProcessing.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  courseStats: typeof courseStats;
  dataManagement: typeof dataManagement;
  "dev/debug": typeof dev_debug;
  "dev/seed": typeof dev_seed;
  http: typeof http;
  importMasterData: typeof importMasterData;
  playerBios: typeof playerBios;
  playerPhotos: typeof playerPhotos;
  players: typeof players;
  tournamentResults: typeof tournamentResults;
  tournaments: typeof tournaments;
  "utils/dataProcessing": typeof utils_dataProcessing;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
