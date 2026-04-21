const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

function getExplorerTxBaseUrl(chainId) {
  if (chainId === "11155111") {
    return "https://sepolia.etherscan.io/tx/";
  }

  return "";
}

function getNetworkName(chainId, networkName) {
  if (chainId === "31337") {
    return "Hardhat Local";
  }

  if (chainId === "11155111") {
    return "Sepolia Testnet";
  }

  return networkName;
}

async function main() {
  const HashStorage = await hre.ethers.getContractFactory("HashStorage");
  const hashStorage = await HashStorage.deploy();
  await hashStorage.waitForDeployment();

  const address = await hashStorage.getAddress();
  const network = await hre.ethers.provider.getNetwork();
  const chainId = network.chainId.toString();

  const artifact = await hre.artifacts.readArtifact("HashStorage");
  const deployment = {
    address,
    abi: artifact.abi,
    explorerTxBaseUrl: getExplorerTxBaseUrl(chainId),
    network: chainId,
    networkName: getNetworkName(chainId, hre.network.name),
  };

  const deploymentDir = path.join(__dirname, "..", "client", "lib", "deployments");
  fs.mkdirSync(deploymentDir, { recursive: true });
  fs.writeFileSync(
    path.join(deploymentDir, `${chainId}.json`),
    JSON.stringify(deployment, null, 2),
  );

  console.log(`HashStorage deployed to ${address} on chain ${chainId}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
