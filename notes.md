## Spec

I will take the overall architecture of uniswap
and restrict to the token pairs to stablecoins.
For this first iteration I will keep it simple.

Users deposit liquidity in a normal manner, but
removing liquidity could be in streams (burning lps). If the
pool hits a minimum liquidity level the streams
will be discontinued.

Swapping will also be done via streams where the price
is taken from the uniswap oracle.

## Questions

1. Is it possible to make flow a function rather than a number? (Function flow agreement) for swapping. Use case would be to swap
   when a certain slippage number is met or to have conditional logic.

- Next step is to copy the uniswap contracts and tests
- As well as to
