pragma solidity =0.7.6;

import '../SuperswapV1ERC20.sol';

contract ERC20 is SuperswapV1ERC20 {
    constructor(uint _totalSupply) public {
        _mint(msg.sender, _totalSupply);
    }
}
