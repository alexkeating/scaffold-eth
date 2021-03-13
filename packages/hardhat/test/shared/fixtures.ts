import { Contract, Wallet } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { deployContract } from "ethereum-waffle";

import { expandTo18Decimals } from "./utilities";

// import ERC20 from "../../build/ERC20.json";
import ERC20 from "../../artifacts/contracts/test/ERC20.sol/ERC20.json";
// import UniswapV2Factory from "../../build/UniswapV2Factory.json";
import SuperswapV1Factory from "../../artifacts/contracts/SuperswapV1Factory.sol/SuperswapV1Factory.json";
// import UniswapV2Pair from "../../build/UniswapV2Pair.json";
import SuperswapV1Pair from "../../artifacts/contracts/SuperswapV1Pair.sol/SuperswapV1Pair.json";

interface FactoryFixture {
  factory: Contract;
}

const overrides = {
  gasLimit: 9999999
};

export async function factoryFixture(
  [wallet]: Wallet[],
  _: Web3Provider
): Promise<FactoryFixture> {
  const factory = await deployContract(
    wallet,
    SuperswapV1Factory,
    [wallet.address],
    overrides
  );
  return { factory };
}

interface PairFixture extends FactoryFixture {
  token0: Contract;
  token1: Contract;
  pair: Contract;
}

export async function pairFixture(
  [wallet]: Wallet[],
  provider: Web3Provider
): Promise<PairFixture> {
  const { factory } = await factoryFixture([wallet], provider);

  const tokenA = await deployContract(
    wallet,
    ERC20,
    [expandTo18Decimals(10000)],
    overrides
  );
  const tokenB = await deployContract(
    wallet,
    ERC20,
    [expandTo18Decimals(10000)],
    overrides
  );

  await factory.createPair(tokenA.address, tokenB.address, overrides);
  const pairAddress = await factory.getPair(tokenA.address, tokenB.address);
  const pair = new Contract(
    pairAddress,
    JSON.stringify(SuperswapV1Pair.abi),
    provider
  ).connect(wallet);

  const token0Address = (await pair.token0()).address;
  const token0 = tokenA.address === token0Address ? tokenA : tokenB;
  const token1 = tokenA.address === token0Address ? tokenB : tokenA;

  return { factory, token0, token1, pair };
}
