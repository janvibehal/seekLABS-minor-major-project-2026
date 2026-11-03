import { env } from "../config/env.js";
import { finalizeExpiredSessions } from "../services/session.service.js";

let running = false;

const runExpirationCheck = async () => {
  if (running) {
    return;
  }

  running = true;

  try {
    const finalized = await finalizeExpiredSessions();

    if (finalized > 0) {
      console.log(
        `[SESSION EXPIRY] Finalized ${finalized} expired session(s).`,
      );
    }
  } catch (error) {
    console.error("[SESSION EXPIRY] Expiration check failed:", error);
  } finally {
    running = false;
  }
};

export const startSessionExpirationWorker = () => {
  void runExpirationCheck();

  const interval = setInterval(
    () => {
      void runExpirationCheck();
    },
    env.SESSION_EXPIRY_POLL_INTERVAL_MS,
  );

  return () => clearInterval(interval);
};
