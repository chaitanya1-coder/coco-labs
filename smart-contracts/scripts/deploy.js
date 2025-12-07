const hre = require("hardhat");

async function main() {
    // FDC Contract Address on Coston2
    const FDC_ADDRESS = "0xc5aE774481cb2b24f1556E705856c3D42d4747de";

    // SparkDEX Router Address on Coston2 (Placeholder/Mock)
    // Replace with actual address if available
    const DEX_ADDRESS = "0x483510509a930776514065b206990d1996403487";

    console.log("Deploying VerifyMindVault...");
    console.log("FDC Address:", FDC_ADDRESS);
    console.log("DEX Address:", DEX_ADDRESS);

    const VerifyMindVault = await hre.ethers.getContractFactory("VerifyMindVault");
    const vault = await VerifyMindVault.deploy(FDC_ADDRESS, DEX_ADDRESS);

    await vault.waitForDeployment();

    const address = await vault.getAddress();
    console.log(`VerifyMindVault deployed to: ${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
