import { diffPairLists } from './diffPairLists';
import { VersionUpgrade } from './getVersionUpgrade';
import { PairInfo, TokenInfo } from './types';

/**
 * Returns the minimum version bump for the given list
 * @param baseList the base list of tokens
 * @param updatedList the updated list of tokens
 */
export function minVersionBump(
  basePairs: PairInfo[],
  updatedPairs: PairInfo[],
  baseTokens: TokenInfo[],
  updatedTokens: TokenInfo[]
): VersionUpgrade {
  const diff = diffPairLists(
    basePairs,
    updatedPairs,
    baseTokens,
    updatedTokens
  );
  if (diff.removedTokens.length > 0 || diff.removedPairs.length > 0)
    return VersionUpgrade.MAJOR;
  if (diff.addedTokens.length > 0 || diff.addedPairs.length > 0)
    return VersionUpgrade.MINOR;
  if (
    Object.keys(diff.changedTokens).length > 0 ||
    Object.keys(diff.changedPairs).length > 0
  )
    return VersionUpgrade.PATCH;
  return VersionUpgrade.NONE;
}
