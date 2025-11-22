
export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

export const formatCash = (number: number | bigint): string => {
  const n = typeof number === 'bigint' ? Number(number) : number as number;
  return (n / 1000000).toFixed(6);
}
