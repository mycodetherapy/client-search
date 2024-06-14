export const formatNumber = (value: string) => {
  return value.replace(/(\d{2})(\d{2})(\d{2})/g, "$1-$2-$3");
};
