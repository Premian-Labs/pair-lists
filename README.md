# @premia/pair-lists (beta)

[![Tests](https://github.com/Premian-Labs/pair-lists/workflows/Tests/badge.svg)](https://github.com/Premian-Labs/pair-lists/actions?query=workflow%3ATests)
[![npm](https://img.shields.io/npm/v/@premia/pair-lists)](https://unpkg.com/@premia/pair-lists@latest/)

This package includes a JSON schema for token lists, and TypeScript utilities for working with token lists.

The JSON schema represents the technical specification for a token list which can be used in a dApp interface, such as the Premia Interface.

## What are token lists?

Premia Pair Lists is a specification, based on [Uniswap Token Lists](https://github.com/Uniswap/token-lists), for lists of token pair metadata (e.g. base, quote, baseOracle, quoteOracle, ...) that can be used by any dApp interfaces that needs one or more lists of oracle-dependent token pairs.

Anyone can create and maintain a pair list, as long as they follow the specification.

Specifically an instance of a pair list is a [JSON](https://www.json.org/json-en.html) blob that contains a list of
[ERC20](https://github.com/ethereum/eips/issues/20) token pair metadata for use in dApp user interfaces.
Pair list JSON must validate against the [JSON schema](https://json-schema.org/) in order to be used in the Premia Interface.
Pairs on pair lists, and pair lists themselves, are tagged so that users can easily find token pairs.

## JSON Schema $id

The JSON schema ID is [https://premia.finance/pairlist.schema.json](https://premia.finance/pairlist.schema.json)

## Validating pair lists

This package does not include code for pair list validation. You can easily do this by including a library such as
[ajv](https://ajv.js.org/) to perform the validation against the JSON schema. The schema is exported from the package
for ease of use.

```typescript
import { schema } from '@premia/pair-lists';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import fetch from 'node-fetch';

const ARBITRUM_LIST = 'https://premia.finance/pair-list-42161.json';

async function validate() {
  const ajv = new Ajv({ allErrors: true, verbose: true });
  addFormats(ajv);
  const validator = ajv.compile(schema);
  const response = await fetch(ARBITRUM_LIST);
  const data = await response.json();
  const valid = validator(data);
  if (valid) {
    return valid;
  }
  if (validator.errors) {
    throw validator.errors.map((error) => {
      delete error.data;
      return error;
    });
  }
}

validate().then(console.log('Valid List.')).catch(console.error);
```

## Authoring pair lists

### Manual

The best way to manually author pair lists is to use an editor that supports JSON schema validation. Most popular
code editors do, such as [IntelliJ](https://www.jetbrains.com/help/idea/json.html#ws_json_schema_add_custom) or
[VSCode](https://code.visualstudio.com/docs/languages/json#_json-schemas-and-settings). Other editors
can be found [here](https://json-schema.org/implementations.html#editors).

The schema is registered in the [SchemaStore](https://github.com/SchemaStore/schemastore), and any file that matches
the pattern `*.pairlist.json` should
[automatically utilize](https://www.jetbrains.com/help/idea/json.html#ws_json_using_schemas)
the JSON schema for the [supported text editors](https://www.schemastore.org/json/#editors).

In order for your pair list to be able to be used, it must pass all JSON schema validation.

### Automated

If you want to automate pair listing, e.g. by pulling from a smart contract, or other sources, you can use this
npm package to take advantage of the JSON schema for validation and the TypeScript types.
Otherwise, you are simply working with JSON. All the usual tools apply, e.g.:

```typescript
import { PairList, schema } from '@premia/pair-lists';

// generate your pair list however you like.
const myList: PairList = generateMyPairList();

// use a tool like `ajv` to validate your generated pair list
validateMyPairList(myList, schema);

// print the resulting JSON to stdout
process.stdout.write(JSON.stringify(myList));
```

## Semantic versioning

Lists include a `version` field, which follows [semantic versioning](https://semver.org/).

List versions must follow the rules:

- Increment major version when pairs are removed
- Increment minor version when pairs are added
- Increment patch version when pairs already on the list have minor details changed (name, symbol, logo URL, decimals)

Changing a token address, price oracle, or chain ID is considered both a remove and an add, and should be a major version update.

Note that list versioning is used to improve the user experience, but not for security, i.e. list versions are not meant
to provide protection against malicious updates to a pair list; i.e. the list semver is used as a lossy compression
of the diff of list updates. List updates may still be diffed in the client dApp.

## Deploying your list

Once you have authored the list, you can make it available at any URI. Prefer pinning your list to IPFS
(e.g. via [pinata.cloud](https://pinata.cloud)) and referencing the list by an ENS name that resolves to the
[contenthash](https://eips.ethereum.org/EIPS/eip-1577).

If hosted on HTTPS, make sure the endpoint is configured to send an access-control-allow-origin header to avoid CORS errors.

### Linking an ENS name to the list

An ENS name can be assigned to an IPFS hash via the [contenthash](https://eips.ethereum.org/EIPS/eip-1577) text record.
This is the preferred way of referencing your list.

## Examples

You can find a simple example of a pair list in [test/schema/example.pairlist.json](test/schema/example.pairlist.json).

A snapshot of the Premia default list encoded as a pair list is found in [test/schema/bigexample.pairlist.json](test/schema/bigexample.pairlist.json).
