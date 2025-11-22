import { config } from "dotenv";
import { SyndicateType } from ".";
import { SyndicateLaunderInputType, SyndicateLaunderOutputType, SyndicateProfileOutputType } from "libs/src/types";
import { fetcher } from "libs/src/fetcher";
config();

export const getSyndicateProfile = async (syndicate: SyndicateType): Promise<SyndicateProfileOutputType> => {
  const input = {};
  const response = await fetcher(syndicate.profile_endpoint, { input }, false) as SyndicateProfileOutputType;
  return response;
}

export const getSyndicateLaunder = async (syndicate: SyndicateType, abstract: string): Promise<SyndicateLaunderOutputType> => {
  const input: SyndicateLaunderInputType = {
    abstract,
  };
  const response = await fetcher(syndicate.launder_endpoint, { input }, false) as SyndicateLaunderOutputType;
  return response;
}
