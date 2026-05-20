// In-memory store for MVP (with global singleton for Next.js dev mode hot-reloads)

const globalForVerification = globalThis as unknown as {
  verificationCodes: Map<string, string>;
};

export const verificationCodes = globalForVerification.verificationCodes || new Map<string, string>();

if (process.env.NODE_ENV !== "production") {
  globalForVerification.verificationCodes = verificationCodes;
}
