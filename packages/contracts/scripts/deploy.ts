import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Token contract...");

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();

  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log(`Token deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 