// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;
pragma abicoder v2;

// Write up super app
// Should create a stream when someone swaps
// And should verify there is enough liquidity
import './uniswap/interfaces/IUniswapV2Factory.sol';
import './libraries/SuperswapV1Library.sol';
import "hardhat/console.sol";

import {
    ISuperfluid,
    ISuperToken,
    ISuperAgreement,
    SuperAppDefinitions
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import {
    IConstantFlowAgreementV1
} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";

import {
    SuperAppBase
} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";



contract SuperswapApp is SuperAppBase {
    
    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token
	IUniswapV2Factory private _factory;


    constructor(
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken,
		IUniswapV2Factory factory,
	  ) {
        assert(address(host) != address(0));
        assert(address(cfa) != address(0));
        assert(address(acceptedToken) != address(0));
        assert(address(factory) != address(0));

        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;
		_factory = factory;

        // NOTE: this may be incorrect
        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL;

        _host.registerApp(configWord);
    }
	/// Will replace this with actual swapping funcitonality
    /// @dev Check requirements before letting the user playing the game
    function _beforePlay(
        bytes calldata ctx
    )
        private view
        returns (bytes memory cbdata)
    {
        address sender = _host.decodeCtx(ctx).msgSender;
        cbdata = abi.encode(sender);
    }




	// Callback lifecycle methods
	/**************************************************************************
     * SuperApp callbacks
     *************************************************************************/

    // Check liquidity
	// Just check that the stream can last for 2 days
	//
	// - Below is future state
	// If enough liquidity continue
	// Arbitraliy this means that your stream could
	// last a 7 days, we will update flows with
	// an oracle every block or every day to prevent
	// rug pulling
    function beforeAgreementCreated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata ctx
    )
        external view override
        returns (bytes memory cbdata)
    {
        cbdata = _checkLiquidity(superToken, ctx);
    }

    function afterAgreementCreated(
        ISuperToken /* superToken */,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata /*agreementData*/,
        bytes calldata cbdata,
        bytes calldata ctx
    )
        external override
        returns (bytes memory newCtx)
    {
        return _beforePlay(ctx);
    }

    function beforeAgreementUpdated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata ctx
    )
        external view override
        returns (bytes memory cbdata)
    {
        cbdata = _beforePlay(ctx);
    }

    function afterAgreementUpdated(
        ISuperToken /* superToken */,
        address agreementClass,
        bytes32 agreementId,
        bytes calldata /*agreementData*/,
        bytes calldata cbdata,
        bytes calldata ctx
    )
        external override
        returns (bytes memory newCtx)
    {
        return _beforePlay(ctx);
    }

    function beforeAgreementTerminated(
        ISuperToken superToken,
        address agreementClass,
        bytes32 /*agreementId*/,
        bytes calldata /*agreementData*/,
        bytes calldata ctx
    )
        external view override
        returns (bytes memory cbdata)
    {
        // According to the app basic law, we should never revert in a termination callback
        cbdata = _beforePlay(ctx);
    }

    ///
    function afterAgreementTerminated(
        ISuperToken /* superToken */,
        address /* agreementClass */,
        bytes32 /* agreementId */,
        bytes calldata agreementData,
        bytes calldata cbdata,
        bytes calldata ctx
    )
        external override
        returns (bytes memory newCtx)
    {
        return _beforePlay(ctx);
    }

	/**************************************************************************
     * Private methods
     *************************************************************************/

	 function _checkLiquidity(ISuperToken swapToken, bytes calldata ctx) internal view (bool enoughReserves) {
		// Get liquidity from uniswap contract
		// Check token that is being added and token that is being subtracted
		// Get the net streams on calculate how many days are left before exhaustion
		// 
		// calldata should have the token pairs

		address swapAddr = swapToken.getUnderlyingToken();
		console.log("swapAddr")
		console.log(swapAddr)
		(address receiveTokenAddr) = abi.decode(userData, (address));
		console.log("receiveAddr")
		console.log(receiveTokenAddr)
		(uint reserveSwap, uint reserveReceive) = SuperswapV1Library.getReserves(factory, swapAddr, receiveTokenAddr);
		console.log("Reserves")
		console.log(reserveSwap)
		console.log(reserveReceive)
		return true

	 } 


}
