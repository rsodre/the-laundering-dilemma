import { z } from "zod";
import { Strategy } from "./constants";



//---------------------------------------------------------
// Laudromat endpoints schemas
//

export const laundromat_input_schema = z.object({
  boss_name: z.string().min(1, "The Syndicate boss name."),
  name: z.string().min(1, "The Syndicate name."),
  clean_account_name: z.string().min(1, "Clean CASH account address."),
});
export type LaundromatInputType = z.infer<typeof laundromat_input_schema>;

export const laundromat_output_schema = z.object({
  amount_clean: z.number().describe(`Laundered amount`),
  amount_lost: z.number().describe(`Taxed/Lost amount`),
  busted: z.boolean().describe(`Busted flag`),
});
export type LaundromatOutputType = z.infer<typeof laundromat_output_schema>;

export const laundromat_abstract_output_schema = z.object({
  abstract: z.string().min(1, "Past day activities abstract."),
});
export type LaundromatAbstractOutputType = z.infer<typeof laundromat_abstract_output_schema>;

//---------------------------------------------------------
// Syndicate schemas
//
export const syndicate_profile_output_schema = z.object({
  boss_name: z.string().describe(`Boss name`),
  syndicate_name: z.string().describe(`Syndicate name`),
  dirty_wallet_name: z.string().describe(`Dirty wallet name`),
  clean_wallet_name: z.string().describe(`Clean wallet name`),
  dirty_wallet_address: z.string().describe(`Dirty wallet address`),
  clean_wallet_address: z.string().describe(`Clean wallet address`),
  busted: z.boolean().describe(`Busted flag`),
});
export type SyndicateProfileOutputType = z.infer<typeof syndicate_profile_output_schema>;

export const syndicate_launder_input_schema = z.object({
  abstract: z.string().min(1, "Past day activities abstract."),
});
export type SyndicateLaunderInputType = z.infer<typeof syndicate_launder_input_schema>;

export const syndicate_launder_output_schema = z.object({
  strategy: z.enum([Strategy.Conservative, Strategy.Moderate, Strategy.Aggressive, Strategy.PlayNice]).describe(`Laundering strategy`),
  amount_clean: z.number().describe(`Laundered amount`),
  amount_lost: z.number().describe(`Taxed/Lost amount`),
  busted: z.boolean().describe(`Busted flag`),
  success: z.boolean().describe(`Success flag`),
});
export type SyndicateLaunderOutputType = z.infer<typeof syndicate_launder_output_schema>;



