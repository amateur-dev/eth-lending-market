import { ethers } from "hardhat";
import { formatUnits, parseUnits } from "ethers/lib/utils";
import { assert } from "chai";
import { deployErc20Token, Erc20Token,Erc20Token__factory } from "@dany-armstrong/hardhat-erc20";
import {
  CTokenDeployArg,
  deployCompoundV2,
  Comptroller,
} from "@dany-armstrong/hardhat-compound";
import { writeFileSync } from 'fs';
import { join } from 'path';

async function main() {
  const [deployer] = await ethers.getSigners();

  //TODO: to check why this is needed
  //TODO: to fetch the price from the mainnet Uniswap contract
  const UNI_PRICE = uniswap.routerMainnet.getPrice //
  const UNI_PRICE = "25022748000000000000"; // UniPrice
  const USDC_PRICE = "1000000000000000000"; 
  const AAVE_PRICE = "92500000000000000000";
  const DAI_PRICE = "1000000000000000000";
  const ETH_PRICE = "1738000000000000000000";

  // Deploy USDC ERC20
  const USDC = Erc20Token__factory.connect("0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",deployer); // mainnet address
  const UNI = Erc20Token__factory.connect("PARI TO INSERT",erc20abi,deployer)
  const AAVE = Erc20Token__factory.connect("PARI TO INSERT",erc20abi,deployer)
  const DAI = Erc20Token__factory.connect("PARI TO INSERT",erc20abi,deployer)
  
  // const USDC: Erc20Token = await deployErc20Token(
  //     {
  //       name: "USD Coin",
  //       symbol: "USDC",
  //       decimals: 6,
  //     },
  //     deployer
  // );
  // console.log('USDC token deployed!');

  // Deploy UNI ERC20
  // const UNI: Erc20Token = await deployErc20Token(
  //     {
  //       name: "Uniswap",
  //       symbol: "UNI",
  //       decimals: 18,
  //     },
  //     deployer
  // );
  // console.log('UNI token deployed!');

  // Deploy AAVE ERC20
  // const AAVE: Erc20Token = await deployErc20Token(
  //     {
  //       name: "Aave Token",
  //       symbol: "AAVE",
  //       decimals: 18,
  //     },
  //     deployer
  // );
  // console.log('AAVE token deployed!');

  // Deploy DAI ERC20
  // const DAI: Erc20Token = await deployErc20Token(
  //     {
  //       name: "Dai Token",
  //       symbol: "DAI",
  //       decimals: 18,
  //     },
  //     deployer
  // );
  // console.log('DAI token deployed!');

  const ctokenArgs: CTokenDeployArg[] = [
    {
      cToken: "cUNI",
      underlying: UNI.address,
      underlyingPrice: UNI_PRICE,
      collateralFactor: "500000000000000000", // 50%
    },
    {
      cToken: "cUSDC",
      underlying: USDC.address,
      underlyingPrice: USDC_PRICE,
      collateralFactor: "500000000000000000", // 50%
    },
    {
      cToken: "cAAVE",
      underlying: AAVE.address,
      underlyingPrice: AAVE_PRICE,
      collateralFactor: "500000000000000000", // 50%
    },
    {
      cToken: "cDAI",
      underlying: DAI.address,
      underlyingPrice: DAI_PRICE,
      collateralFactor: "500000000000000000", // 50%
    },
    {
      cToken: "cETH",
      underlyingPrice: ETH_PRICE,
      collateralFactor: "500000000000000000", // 50%
    },
  ];

  const { comptroller, cTokens, priceOracle, interestRateModels } =
      await deployCompoundV2(ctokenArgs, deployer); //@pari do we really need to do it?

  var tx = await comptroller._setCloseFactor(parseUnits("0.5", 18).toString());
  await tx.wait();

  tx = await comptroller._setLiquidationIncentive(parseUnits("1.08", 18));
  await tx.wait();

  console.log("Comptroller: ", comptroller.address);
  console.log("SimplePriceOralce: ", await comptroller.oracle());

  const chainId = await deployer.getChainId();
  const outputFileName = join(__dirname, `../../dapp/src/contract/${chainId}-comptroller.json`);
  const fileContent = JSON.stringify({
    address: comptroller.address
  });
  writeFileSync(outputFileName, fileContent, {
    flag: 'w',
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
