import Mux from "@mux/mux-node"

/**
 * Server-only Mux client. Reads credentials from env:
 *   MUX_TOKEN_ID, MUX_TOKEN_SECRET
 * Never import this from a client component.
 */
export const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
})
