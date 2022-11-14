export const formateNumber = (number: number) => {
  const str = number.toFixed(16).replace(/0+$/, '');
  return str[str.length - 1] === '.' ? str.slice(0, str.length - 1) : str;
};
