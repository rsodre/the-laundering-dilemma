import { config } from "dotenv";

config();

export const fetcher = async (url: string, input: any) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if ( response.status !== 200 ) {
    console.error(`response >>>`, response);
    throw new Error(`Client fetch failed! status: ${response.status}`);
  }

  const body = await response.json();
  console.log(`body >>>`, body);

  return body.output;
}
