import { ethers } from "hardhat";

async function main() {
  console.log("Deploying contracts...");

  // Deploy SimpleToken1
  const SimpleToken1 = await ethers.getContractFactory("SimpleToken");
  const token1 = await SimpleToken1.deploy("Token1", "TK1", ethers.parseEther("1000000"));
  await token1.waitForDeployment();
  const token1Address = await token1.getAddress();
  console.log(`SimpleToken1 deployed to: ${token1Address}`);

  // Deploy SimpleToken2
  const SimpleToken2 = await ethers.getContractFactory("SimpleToken");
  const token2 = await SimpleToken2.deploy("Token2", "TK2", ethers.parseEther("1000000"));
  await token2.waitForDeployment();
  const token2Address = await token2.getAddress();
  console.log(`SimpleToken2 deployed to: ${token2Address}`);

  // Deploy TokenSwap
  const TokenSwap = await ethers.getContractFactory("TokenSwap");
  const tokenSwap = await TokenSwap.deploy();
  await tokenSwap.waitForDeployment();
  const tokenSwapAddress = await tokenSwap.getAddress();
  console.log(`TokenSwap deployed to: ${tokenSwapAddress}`);

  // Set exchange rate
  const rate = ethers.parseEther("2"); // 1 TK1 = 2 TK2
  await tokenSwap.setExchangeRate(token1Address, token2Address, rate);
  console.log(`Exchange rate set: 1 TK1 = 2 TK2`);

  // Approve TokenSwap to spend tokens
  await token1.approve(tokenSwapAddress, ethers.parseEther("1000000"));
  await token2.approve(tokenSwapAddress, ethers.parseEther("1000000"));
  console.log("Approved TokenSwap to spend tokens");

  console.log("Deployment completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 