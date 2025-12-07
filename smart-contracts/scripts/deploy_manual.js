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

    const artifact = JSON.parse(fs.readFileSync("VerifyMindVault.json", "utf8"));
    const abi = artifact.abi;
    const bytecode = artifact.evm.bytecode.object;

    const factory = new ethers.ContractFactory(abi, bytecode, wallet);

    // FDC Contract Address on Coston2
    const FDC_ADDRESS = ethers.getAddress("0xc5ae774481cb2b24f1556e705856c3d42d4747de");
    // SparkDEX Router Address on Coston2 (Placeholder)
    const DEX_ADDRESS = ethers.getAddress("0x483510509a930776514065b206990d1996403487");

    console.log("Deploying VerifyMindVault...");
    const contract = await factory.deploy(FDC_ADDRESS, DEX_ADDRESS);

    console.log("Waiting for deployment transaction...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`VerifyMindVault deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
