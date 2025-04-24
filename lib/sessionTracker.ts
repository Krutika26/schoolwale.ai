// lib/sessionTracker.ts

export const setSessionStartTime = () => {
  const time = new Date().toISOString();
  localStorage.setItem("sessionStartTime", time);
};

export const setSessionEndTime = () => {
  const time = new Date().toISOString();
  localStorage.setItem("sessionEndTime", time);
};

export const getSessionTimes = () => {
  return {
    start: localStorage.getItem("sessionStartTime"),
    end: localStorage.getItem("sessionEndTime"),
  };
};