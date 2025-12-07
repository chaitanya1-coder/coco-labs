import { ethers } from "ethers";

async function main() {
    const provider = new ethers.JsonRpcProvider("https://coston2-api.flare.network/ext/C/rpc");

    // FlareContractRegistry Address (Same on all networks)
    const REGISTRY_ADDRESS = "0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019";

    const abi = [
        "function getContractAddressByName(string calldata _name) external view returns (address)"
    ];

    const registry = new ethers.Contract(REGISTRY_ADDRESS, abi, provider);

    const contractsToFind = ["WNat", "FtsoV2", "SparkDEX", "Router", "UniswapV2Router02"];

    console.log("Fetching contract addresses from Registry...");

    for (const name of contractsToFind) {
        try {
            const address = await registry.getContractAddressByName(name);
            console.log(`${name}: ${address}`);
        } catch (error) {
            console.log(`${name}: Not found or error fetching`);
        }
    }
}

main();
