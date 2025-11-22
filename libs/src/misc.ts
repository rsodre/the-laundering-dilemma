
export const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

// export const formatCash = (number: number | bigint): string => {
//   const n = typeof number === 'bigint' ? Number(number) : number as number;
//   return (n / 1000000).toFixed(6);
// }
export const formatCash = (number: number | bigint): string => {
  const n = typeof number === 'bigint' ? Number(number) : number as number;
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export type BigNumberish = bigint | number | string;
export const bigintEquals = (a: BigNumberish, b: BigNumberish): boolean => {
  return BigInt(a) === BigInt(b);
}


export const shuffle = <T>(array: T[]): T[] => {
  const source = [...array];
  const result: T[] = [];
  while (source.length > 0) {
    const randomIndex = Math.floor(Math.random() * source.length);
    const [item] = source.splice(randomIndex, 1);
    result.push(item);
  }
  return result;
}
