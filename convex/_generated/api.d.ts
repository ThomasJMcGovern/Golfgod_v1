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
import type * as analyzePlayerCount from "../analyzePlayerCount.js";
import type * as auth from "../auth.js";
import type * as checkExtraPlayers from "../checkExtraPlayers.js";
import type * as cleanupDuplicates from "../cleanupDuplicates.js";
import type * as dataManagement from "../dataManagement.js";
import type * as debugPlayer from "../debugPlayer.js";
import type * as dev_debug from "../dev/debug.js";
import type * as dev_myFunctions from "../dev/myFunctions.js";
import type * as dev_seed from "../dev/seed.js";
import type * as fixAllDuplicates from "../fixAllDuplicates.js";
import type * as fixDuplicates from "../fixDuplicates.js";
import type * as http from "../http.js";
import type * as importPipeline from "../importPipeline.js";
import type * as imports from "../imports.js";
import type * as playerBios from "../playerBios.js";
import type * as playerPhotos from "../playerPhotos.js";
import type * as players from "../players.js";
import type * as tournamentResults from "../tournamentResults.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  analyzePlayerCount: typeof analyzePlayerCount;
  auth: typeof auth;
  checkExtraPlayers: typeof checkExtraPlayers;
  cleanupDuplicates: typeof cleanupDuplicates;
  dataManagement: typeof dataManagement;
  debugPlayer: typeof debugPlayer;
  "dev/debug": typeof dev_debug;
  "dev/myFunctions": typeof dev_myFunctions;
  "dev/seed": typeof dev_seed;
  fixAllDuplicates: typeof fixAllDuplicates;
  fixDuplicates: typeof fixDuplicates;
  http: typeof http;
  importPipeline: typeof importPipeline;
  imports: typeof imports;
  playerBios: typeof playerBios;
  playerPhotos: typeof playerPhotos;
  players: typeof players;
  tournamentResults: typeof tournamentResults;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
