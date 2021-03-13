import { Contract, Wallet } from "ethers";
import { Web3Provider } from "@ethersproject/providers";
import { deployContract } from "ethereum-waffle";

import { expandTo18Decimals } from "./utilities";

// import ERC20 from "../../build/ERC20.json";
// import UniswapV2Factory from "../../build/UniswapV2Factory.json";
import SuperswapV1Factory from "../../artifacts/contracts/SuperswapV1Factory.sol/SuperswapV1Factory.json";
// import UniswapV2Pair from "../../build/UniswapV2Pair.json";
import SuperswapV1Pair from "../../artifacts/contracts/SuperswapV1Pair.sol/SuperswapV1Pair.json";
// import UniswapV2Factory from "@uniswap/v2-core/build/UniswapV2Factory.json";
// import IUniswapV2Pair from "@uniswap/v2-core/build/IUniswapV2Pair.json";

// Router test deps
import IUniswapV2Pair from "../../artifacts/contracts/uniswap/interfaces/IUniswapV2Pair.sol/IUniswapV2Pair.json";

import ERC20 from "../../artifacts/contracts/test/ERC20.sol/ERC20.json";
import WETH9 from "../../artifacts/contracts/test/WETH9.sol/WETH9.json";
// import UniswapV2Router02 from "../../build/UniswapV2Router02.json";
import SuperswapV1Router from "../../artifacts/contracts/SuperswapV1Router.sol/SuperswapV1Router.json";

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

interface V2Fixture {
  token0: Contract;
  token1: Contract;
  WETH: Contract;
  WETHPartner: Contract;
  factoryV2: Contract;
  router02: Contract;
  router: Contract;
  pair: Contract;
  WETHPair: Contract;
}

export async function v2Fixture(
  [wallet]: Wallet[],
  provider: Web3Provider
): Promise<V2Fixture> {
  // deploy tokens
  const tokenA = await deployContract(wallet, ERC20, [
    expandTo18Decimals(10000)
  ]);
  const tokenB = await deployContract(wallet, ERC20, [
    expandTo18Decimals(10000)
  ]);
  const WETH = await deployContract(wallet, WETH9);
  const WETHPartner = await deployContract(wallet, ERC20, [
    expandTo18Decimals(10000)
  ]);

  // deploy V2
  const factoryV2 = await deployContract(wallet, SuperswapV1Factory, [
    wallet.address
  ]);

  const router02 = await deployContract(
    wallet,
    SuperswapV1Router,
    [factoryV2.address, WETH.address],
    overrides
  );

  // initialize V2
  await factoryV2.createPair(tokenA.address, tokenB.address);
  const pairAddress = await factoryV2.getPair(tokenA.address, tokenB.address);
  const pair = new Contract(
    pairAddress,
    JSON.stringify(IUniswapV2Pair.abi),
    provider
  ).connect(wallet);

  const token0Address = await pair.token0();
  const token0 = tokenA.address === token0Address ? tokenA : tokenB;
  const token1 = tokenA.address === token0Address ? tokenB : tokenA;

  await factoryV2.createPair(WETH.address, WETHPartner.address);
  const WETHPairAddress = await factoryV2.getPair(
    WETH.address,
    WETHPartner.address
  );
  const WETHPair = new Contract(
    WETHPairAddress,
    JSON.stringify(IUniswapV2Pair.abi),
    provider
  ).connect(wallet);

  return {
    token0,
    token1,
    WETH,
    WETHPartner,
    factoryV2,
    router02,
    router: router02, // the default router, 01 had a minor bug
    pair,
    WETHPair
  };
}
