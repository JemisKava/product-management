/**
 * tRPC Client Setup
 *
 * Creates the tRPC client for frontend to communicate with backend.
 */

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "./types.d";

export const trpc = createTRPCReact<AppRouter>();
