import { ethers } from "hardhat";

async function main() {
  const Multicall = await ethers.getContractFactory("Multicall");
  const multicall = await Multicall.deploy();

  await multicall.deployed();

  console.log("Multicall deployed to ", multicall.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
