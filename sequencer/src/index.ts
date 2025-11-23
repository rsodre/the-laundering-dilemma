import { config } from "dotenv";
import { SYNDICATE_COUNT, DAYS_COUNT, AUTHORITY_ACCOUNT_NAME } from "libs/src/constants";
import { getLaundromatAbstract, getSyndicateLaunder, getSyndicateProfile } from "./lib";
import { shuffle, sleep } from "libs/src/misc";
import { getServerAccount, getBalance } from "libs/src";
import { Address } from "viem";
import { _log, _saveLog } from "./log";

config();



//---------------------------------------------------------
// Syndicates
//
export type SyndicateType = {
  name: string;
  port: string;
  profile_endpoint: string;
  launder_endpoint: string;
};

const SYDICATES: SyndicateType[] = Array.from({ length: SYNDICATE_COUNT }, (_, index) => ({
  name: `Syndicate${index + 1}`,
  port: `310${index + 1}`,
  profile_endpoint: `http://localhost:310${index + 1}/entrypoints/profile/invoke`,
  launder_endpoint: `http://localhost:310${index + 1}/entrypoints/launder/invoke`,
}));
console.log(`>>> SYDICATES >>>`, SYDICATES);


async function main(): Promise<void> {

  await _saveLog();

  //
  // Days loop
  for (let dayIndex = 0; dayIndex < DAYS_COUNT; dayIndex++) {
    const dayNumber = dayIndex + 1;
    const shuffledSyndicates = shuffle(SYDICATES);
    console.log(`-------- Starting Day [${dayNumber}]...`);

    _log.currentDay = dayNumber;
    _log.days.push({
      day: dayNumber,
      abstract: '',
      syndicates: {},
    });
    _saveLog();

    // TODO: get the abstract from the previous day
    const abstract_endpoint = `http://localhost:3000/entrypoints/abstract/invoke`;
    const abstract = await getLaundromatAbstract(abstract_endpoint);
    console.log(`-------- Abstract:`, abstract);

    _log.days[dayIndex].abstract = abstract;
    _saveLog();

    //
    // Syndicates loop
    for (let syndIndex = 0; syndIndex < SYNDICATE_COUNT; syndIndex++) {
      const syndicate = shuffledSyndicates[syndIndex];
      console.log(`. Day [${dayNumber}] Syndicate [${syndIndex}/${syndicate.name}] on port [${syndicate.port}]...`);

      const profile = await getSyndicateProfile(syndicate);
      if (profile.busted) {
        console.log(`[${syndicate.name}] is busted! skipping...`);
        continue;
      }

      // Launder...
      console.log(`[${syndicate.name}] laundering...`);
      const launder = await getSyndicateLaunder(syndicate, abstract);
      console.log(`[${syndicate.name}] launder result:`, launder);

      // update authority...
      await sleep(1000);
      const authority_account = await getServerAccount(AUTHORITY_ACCOUNT_NAME);
      const balance_authority = await getBalance(authority_account.address);

      // log for the client...
      _log.authority_balance = Number(balance_authority.balance);
      _log.days[dayIndex].syndicates[syndicate.name] = {
        strategy: launder.strategy,
        amount_clean: launder.amount_clean,
        amount_lost: launder.amount_lost,
        dirty_balance: launder.dirty_balance,
        clean_balance: launder.clean_balance,
        busted: launder.busted,
        success: launder.success,
      };
      _saveLog();

      // wait a bit...
      // await sleep(1000);
    }
  }

  //
  // End result...
  console.log(`-------- Finshed!`);
  for (let syndIndex = 0; syndIndex < SYNDICATE_COUNT; syndIndex++) {
    const syndicate = SYDICATES[syndIndex];
    const profile = await getSyndicateProfile(syndicate);
    const balance_dirty = await getBalance(profile.dirty_wallet_address as Address);
    const balance_clean = await getBalance(profile.clean_wallet_address as Address);
    console.log(`[${syndicate.name}] dirty balance:`, balance_dirty);
    console.log(`[${syndicate.name}] clean balance:`, balance_clean);
  }

  // Taxed money collected by the authority...
  const authority_account = await getServerAccount(AUTHORITY_ACCOUNT_NAME);
  const balance_authority = await getBalance(authority_account.address);
  console.log(`[${AUTHORITY_ACCOUNT_NAME}] Taxed balance:`, balance_authority);

}

main().catch((error) => {
  console.error(error?.response?.data?.error ?? error);
  process.exit(1);
});
