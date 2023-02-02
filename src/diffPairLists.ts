import { PairInfo, TokenInfo } from './types';

export type TokenInfoChangeKey = Exclude<
  keyof TokenInfo,
  'address' | 'chainId' | 'priceOracleAddress'
>;
export type TokenInfoChanges = Array<TokenInfoChangeKey>;

export type PairInfoChangeKey = Exclude<
  keyof PairInfo,
  'base' | 'quote' | 'priceOracleAddress'
>;
export type PairInfoChanges = Array<PairInfoChangeKey>;

/**
 * compares two token info key values
 * this subset of full deep equal functionality does not work on objects or object arrays
 * @param a comparison item a
 * @param b comparison item b
 */
function compareInfoProperty(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.every((el, i) => b[i] === el);
  }
  return false;
}

/**
 * Differences between a base list and an updated list.
 */
export interface PairListDiff {
  /**
   * Tokens from updated with chainId/address/oracle not present in base list
   */
  readonly addedTokens: TokenInfo[];
  /**
   * Tokens from base with chainId/address/oracle not present in the updated list
   */
  readonly removedTokens: TokenInfo[];
  /**
   * Pairs from updated with chainId/address/oracle not present in base list
   */
  readonly addedPairs: PairInfo[];
  /**
   * Pairs from base with chainId/address/oracle not present in the updated list
   */
  readonly removedPairs: PairInfo[];
  /**
   * The token info that changed
   */
  readonly changedTokens: {
    [chainId: number]: {
      [address: string]: TokenInfoChanges;
    };
  };
  /**
   * The pair info that changed
   */
  readonly changedPairs: {
    [chainId: number]: {
      [address: string]: PairInfoChanges;
    };
  };
}

/**
 * Computes the diff of a token list where the first argument is the base and the second argument is the updated list.
 * @param base base list
 * @param update updated list
 */
export function diffPairLists(
  basePairs: PairInfo[],
  updatePairs: PairInfo[],
  baseTokens: TokenInfo[],
  updateTokens: TokenInfo[]
): PairListDiff {
  const indexedBasePairs = basePairs.reduce<{
    [baseAddress: string]: { [quoteAddress: string]: PairInfo };
  }>((memo, pairInfo) => {
    if (!memo[pairInfo.base.address]) memo[pairInfo.base.address] = {};
    memo[pairInfo.base.address][pairInfo.quote.address] = pairInfo;
    return memo;
  }, {});

  const indexedBaseTokens = baseTokens.reduce<{
    [chainId: number]: { [address: string]: TokenInfo };
  }>((memo, tokenInfo) => {
    if (!memo[tokenInfo.chainId]) memo[tokenInfo.chainId] = {};
    memo[tokenInfo.chainId][tokenInfo.address] = tokenInfo;
    return memo;
  }, {});

  const newPairListUpdates = updatePairs.reduce<{
    added: PairInfo[];
    changed: {
      [baseAddress: string]: {
        [quoteAddress: string]: PairInfoChanges;
      };
    };
    index: {
      [baseAddress: string]: {
        [quoteAddress: string]: true;
      };
    };
  }>(
    (memo, pairInfo) => {
      const basePair =
        indexedBasePairs[pairInfo.base.address]?.[pairInfo.quote.address];
      if (!basePair) {
        memo.added.push(pairInfo);
      } else {
        const changes: PairInfoChanges = Object.keys(pairInfo)
          .filter(
            (s): s is PairInfoChangeKey =>
              s !== 'base' && s !== 'quote' && s !== 'priceOracleAddress'
          )
          .filter(s => {
            return !compareInfoProperty(pairInfo[s], basePair[s]);
          });
        if (changes.length > 0) {
          if (!memo.changed[pairInfo.base.address]) {
            memo.changed[pairInfo.base.address] = {};
          }
          memo.changed[pairInfo.base.address][pairInfo.quote.address] = changes;
        }
      }

      if (!memo.index[pairInfo.base.address]) {
        memo.index[pairInfo.base.address] = {
          [pairInfo.quote.address]: true,
        };
      } else {
        memo.index[pairInfo.base.address][pairInfo.quote.address] = true;
      }

      return memo;
    },
    { added: [], changed: {}, index: {} }
  );

  const newTokenListUpdates = updateTokens.reduce<{
    added: TokenInfo[];
    changed: {
      [chainId: number]: {
        [address: string]: TokenInfoChanges;
      };
    };
    index: {
      [chainId: number]: {
        [address: string]: true;
      };
    };
  }>(
    (memo, tokenInfo) => {
      const baseToken =
        indexedBaseTokens[tokenInfo.chainId]?.[tokenInfo.address];
      if (!baseToken) {
        memo.added.push(tokenInfo);
      } else {
        const changes: TokenInfoChanges = Object.keys(tokenInfo)
          .filter(
            (s): s is TokenInfoChangeKey =>
              s !== 'address' && s !== 'chainId' && s !== 'priceOracleAddress'
          )
          .filter(s => {
            return !compareInfoProperty(tokenInfo[s], baseToken[s]);
          });
        if (changes.length > 0) {
          if (!memo.changed[tokenInfo.chainId]) {
            memo.changed[tokenInfo.chainId] = {};
          }
          memo.changed[tokenInfo.chainId][tokenInfo.address] = changes;
        }
      }

      if (!memo.index[tokenInfo.chainId]) {
        memo.index[tokenInfo.chainId] = {
          [tokenInfo.address]: true,
        };
      } else {
        memo.index[tokenInfo.chainId][tokenInfo.address] = true;
      }

      return memo;
    },
    { added: [], changed: {}, index: {} }
  );

  const removedPairs = basePairs.reduce<PairInfo[]>((list, curr) => {
    if (
      !newPairListUpdates.index[curr.base.address] ||
      !newPairListUpdates.index[curr.base.address][curr.quote.address]
    ) {
      list.push(curr);
    }
    return list;
  }, []);

  const removedTokens = baseTokens.reduce<TokenInfo[]>((list, curr) => {
    if (
      !newTokenListUpdates.index[curr.chainId] ||
      !newTokenListUpdates.index[curr.chainId][curr.address]
    ) {
      list.push(curr);
    }
    return list;
  }, []);

  return {
    addedTokens: newTokenListUpdates.added,
    changedTokens: newTokenListUpdates.changed,
    addedPairs: newPairListUpdates.added,
    changedPairs: newPairListUpdates.changed,
    removedTokens,
    removedPairs,
  };
}
