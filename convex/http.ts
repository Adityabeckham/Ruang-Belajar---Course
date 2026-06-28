import { httpRouter } from "convex/server";
import { auth } from "./auth";

// Pasang route OAuth Convex Auth (/api/auth/*) ke HTTP router deployment.
const http = httpRouter();
auth.addHttpRoutes(http);

export default http;
