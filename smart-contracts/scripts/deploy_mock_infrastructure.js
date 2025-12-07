import { ethers } from "ethers";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    if (!process.env.PRIVATE_KEY) {
        console.error("Please set PRIVATE_KEY in .env file");
        process.exit(1);
    }

    const provider = new ethers.JsonRpcProvider("https://coston2-api.flare.network/ext/C/rpc");
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    console.log(`Deploying from account: ${wallet.address}`);

    // 1. Deploy MockFDC
    console.log("Deploying MockFDC...");
    const mockFdcArtifact = JSON.parse(fs.readFileSync("MockFDC.json", "utf8"));
    const mockFdcFactory = new ethers.ContractFactory(mockFdcArtifact.abi, mockFdcArtifact.evm.bytecode.object, wallet);
    const mockFdc = await mockFdcFactory.deploy();
    await mockFdc.waitForDeployment();
    const mockFdcAddress = await mockFdc.getAddress();
    console.log(`MockFDC deployed to: ${mockFdcAddress}`);

    // 2. Deploy MockDEX
    console.log("Deploying MockDEX...");
    const mockDexArtifact = JSON.parse(fs.readFileSync("MockDEX.json", "utf8"));
    const mockDexFactory = new ethers.ContractFactory(mockDexArtifact.abi, mockDexArtifact.evm.bytecode.object, wallet);
    const mockDex = await mockDexFactory.deploy();
    await mockDex.waitForDeployment();
    const mockDexAddress = await mockDex.getAddress();
    console.log(`MockDEX deployed to: ${mockDexAddress}`);

    // 3. Deploy VerifyMindVault with MockFDC and MockDEX
    console.log("Deploying VerifyMindVault...");
    const vaultArtifact = JSON.parse(fs.readFileSync("VerifyMindVault.json", "utf8"));
    const vaultFactory = new ethers.ContractFactory(vaultArtifact.abi, vaultArtifact.evm.bytecode.object, wallet);

    const vault = await vaultFactory.deploy(mockFdcAddress, mockDexAddress);
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log(`VerifyMindVault deployed to: ${vaultAddress}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
