/**
 * Convex HTTP Router — Ruang Belajar LMS
 *
 * Handles HTTP endpoints required by Convex Auth for OAuth callbacks.
 * This file exposes the auth HTTP actions at the standard paths
 * that OAuth providers redirect to after user authentication.
 *
 * Routes handled:
 *  - /api/auth/*  — All Convex Auth callback routes
 *
 * @see https://labs.convex.dev/auth/setup/manual
 * @module
 */

import { httpRouter } from "convex/server";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

export default http;
