// lib/sessionTracker.ts

let sessionStartTime: string | null = null;
let sessionEndTime: string | null = null;

export const setSessionStartTime = () => {
  sessionStartTime = new Date().toISOString();
};

export const setSessionEndTime = () => {
  sessionEndTime = new Date().toISOString();
};

export const getSessionTimes = () => ({
  start: sessionStartTime,
  end: sessionEndTime,
});
