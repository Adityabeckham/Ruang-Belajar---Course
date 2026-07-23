/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as comments from "../comments.js";
import type * as courses from "../courses.js";
import type * as enrollments from "../enrollments.js";
import type * as exercises from "../exercises.js";
import type * as gamification from "../gamification.js";
import type * as lessons from "../lessons.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_lessonMarkdown from "../lib/lessonMarkdown.js";
import type * as lib_quizMarkdown from "../lib/quizMarkdown.js";
import type * as modules from "../modules.js";
import type * as profiles from "../profiles.js";
import type * as progress from "../progress.js";
import type * as seed from "../seed.js";
import type * as submissions from "../submissions.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  comments: typeof comments;
  courses: typeof courses;
  enrollments: typeof enrollments;
  exercises: typeof exercises;
  gamification: typeof gamification;
  lessons: typeof lessons;
  "lib/authz": typeof lib_authz;
  "lib/lessonMarkdown": typeof lib_lessonMarkdown;
  "lib/quizMarkdown": typeof lib_quizMarkdown;
  modules: typeof modules;
  profiles: typeof profiles;
  progress: typeof progress;
  seed: typeof seed;
  submissions: typeof submissions;
  users: typeof users;
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
