const getWeekStart = (dateStr) => {
  const date = new Date(dateStr);
  date.setDate(date.getDate() - date.getDay());
  return date.toISOString().split('T')[0];
};

const getMonthStart = (dateStr) => {
  const date = new Date(dateStr);
  return new Date(date.getFullYear(), date.getMonth(), 1)
    .toISOString()
    .split('T')[0];
};

const getToday = () => new Date().toISOString().split('T')[0];

module.exports = { getWeekStart, getMonthStart, getToday };
