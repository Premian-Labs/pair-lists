import { minVersionBump, PairInfo, TokenInfo, VersionUpgrade } from '../src';
const tokenA: TokenInfo = {
  chainId: 1,
  address: '0x0a',
  logoURI: 'ipfs://test',
  symbol: 'abcd',
  name: 'token a',
  decimals: 18,
  tags: ['hello', 'world'],
};
const pairA: PairInfo = {
  base: tokenA,
  quote: tokenA,
  decimals: 18,
  priceOracleAddress: '0x0a',
};
const tokenAChangedNameDecimals: TokenInfo = {
  ...tokenA,
  name: 'blah',
  decimals: 12,
};
const tokenAChangedTags: TokenInfo = {
  ...tokenA,
  tags: ['hello', 'worlds'],
};
const tokenB: TokenInfo = {
  chainId: 1,
  address: '0x0b',
  logoURI: 'ipfs://blah',
  symbol: 'defg',
  name: 'token b',
  decimals: 9,
  tags: ['token', 'other'],
};
describe('#minVersionBump', () => {
  it('empty', () => {
    expect(minVersionBump([], [], [], [])).toBe(VersionUpgrade.NONE);
  });
  it('patch for tag changes only', () => {
    expect(
      minVersionBump([pairA], [pairA], [tokenA], [tokenAChangedTags])
    ).toBe(VersionUpgrade.PATCH);
  });
  it('patch for name/decimals changes', () => {
    expect(
      minVersionBump([pairA], [pairA], [tokenA], [tokenAChangedNameDecimals])
    ).toBe(VersionUpgrade.PATCH);
  });
  it('major for remove', () => {
    expect(minVersionBump([pairA], [pairA], [tokenA], [])).toBe(
      VersionUpgrade.MAJOR
    );
  });
  it('minor for add', () => {
    expect(minVersionBump([pairA], [pairA], [], [tokenA])).toBe(
      VersionUpgrade.MINOR
    );
  });
  it('major for add/remove', () => {
    expect(minVersionBump([pairA], [pairA], [tokenB], [tokenA])).toBe(
      VersionUpgrade.MAJOR
    );
  });
});
