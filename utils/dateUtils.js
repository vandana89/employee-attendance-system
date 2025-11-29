// utils/dateUtils.js

// Get today's date as "YYYY-MM-DD" in local time
const getTodayDateString = () => {
  const now = new Date();
  const offsetMs = now.getTimezoneOffset() * 60 * 1000;
  const local = new Date(now.getTime() - offsetMs);
  return local.toISOString().slice(0, 10); // "YYYY-MM-DD"
};

module.exports = { getTodayDateString };
