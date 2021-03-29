import { expect } from "chai";
import { ethers } from "hardhat";

const deployFramework = require("@superfluid-finance/ethereum-contracts/scripts/deploy-framework");
const deployTestToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-test-token");
const deploySuperToken = require("@superfluid-finance/ethereum-contracts/scripts/deploy-super-token");
const Web3 = require("web3");
const SuperfluidSDK = require("@superfluid-finance/js-sdk");

const errorHandler = err => {
  if (err) throw err;
};

const overrides = {
  gasLimit: 9500000
};

// befeoreAll
// Create the superfluid contracts
describe("SuperswapApp", () => {
  let sf;
	let router;
	// Fee setter for factory
	let addressA;
	// Liquidity Depositor
	let addressB;
	let fDAI;
	let fUSDC;


  beforeEach(async () => {
    // Set up Superfluid contracts
    // Then I can test opening and closing a swapping stream

    const web3 = new Web3(Web3.givenProvider || "ws://localhost:8545");
    const [deployer, address1, address2] = await web3.eth.getAccounts();
		addressA = address1
		addressB = address2
    await deployFramework(errorHandler, { web3 });

		// Deploy Fake Dai
    await deployTestToken(errorHandler, [":", "fDAI"], {
      web3,
      from: deployer
    });
    await deploySuperToken(errorHandler, [":", "fDAI"], {
      web3,
      from: deployer
    });
		Deploy Fake USDC
    await deployTestToken(errorHandler, [":", "fUSDC"], {
      web3,
      from: deployer
    });
    await deploySuperToken(errorHandler, [":", "fUSDC"], {
      web3,
      from: deployer
    });
 
    sf = new SuperfluidSDK.Framework({
      web3,
      version: "test",
      tokens: ["fDAI", "fUSDC"]
    });

		fDAI = await sf.contracts.TestToken.at(await sf.tokens.fDAI.address);
		fUSDC = await sf.contracts.TestToken.at(await sf.tokens.fUSDC.address);


    await sf.initialize();

    // Setup Uniswap contracts
		const signers = await ethers.getSigners();
    const wethFactory = await ethers.getContractFactory(
      "contracts/test/WETH9.sol:WETH9",
      signers[0]
    );
    const weth = await wethFactory.deploy();

    const superswapv1FactoryFactory = await ethers.getContractFactory(
      "SuperswapV1Factory",
      signers[0]
    );
    const superswapV1Factory = await superswapv1FactoryFactory.deploy(
			addressA
    );

    const routerFactory = await ethers.getContractFactory(
      "SuperswapV1Router",
      signers[0]
    );
    router = await routerFactory.deploy(
      superswapV1Factory.address,
      weth.address
    );
		await fDAI.approve(router.address, ethers.constants.MaxUint256)
		await fUSDC.approve(router.address, ethers.constants.MaxUint256)
		// Liquidity Added
		await router.addLiquidity(
		  sf.tokens.fDAI.address,
		  sf.tokens.fUSDC.address,
		  ethers.BigNumber.from(1000),
		  ethers.BigNumber.from(1000),
		  0,
		  0,
		  addressB,
		  ethers.constants.MaxUint256,
		  overrides,
	 	)
  });

	// Add liquidty for stable coins
	// Let's have a test DAI and USDC contract
	// Question to steam do the tokens need to be SuperTokens?


    

});
