import { query } from "./_generated/server";

export const get = query({
  args: {},
  handler: async (ctx) => {
    return {
      message: "Hello from Convex Backend!"
    };
  },
});
