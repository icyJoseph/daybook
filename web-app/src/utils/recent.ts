export const daysAgoInSecs = (days = 7) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return Math.floor(date.getTime() / 1000);
};
