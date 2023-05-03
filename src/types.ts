type ExtensionValue = string | number | boolean | null | undefined;

export enum AdapterType {
  None = 'None',
  Chainlink = 'Chainlink',
  UniswapV3 = 'UniswapV3',
  Custom = 'Custom',
}

export interface TokenInfo {
  readonly chainId: number;
  readonly address: string;
  readonly name: string;
  readonly decimals: number;
  readonly symbol: string;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: {
    readonly [key: string]:
      | {
          [key: string]:
            | {
                [key: string]: ExtensionValue;
              }
            | ExtensionValue;
        }
      | ExtensionValue;
  };
}

export interface PairInfo {
  readonly base: TokenInfo;
  readonly baseAdapterType: string;
  readonly quote: TokenInfo;
  readonly quoteAdapterType: string;
  readonly decimals: number;
  readonly priceOracleAddress: string;
  readonly name?: string;
  readonly logoURI?: string;
  readonly tags?: string[];
  readonly extensions?: {
    readonly [key: string]:
      | {
          [key: string]:
            | {
                [key: string]: ExtensionValue;
              }
            | ExtensionValue;
        }
      | ExtensionValue;
  };
}

export interface Version {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
}

export interface Tags {
  readonly [tagId: string]: {
    readonly name: string;
    readonly description: string;
  };
}

export interface PairList {
  readonly name: string;
  readonly timestamp: string;
  readonly version: Version;
  readonly pairs: PairInfo[];
  readonly tokens: TokenInfo[];
  readonly keywords?: string[];
  readonly tags?: Tags;
  readonly logoURI?: string;
}
