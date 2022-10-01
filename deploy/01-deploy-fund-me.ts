import { network } from "hardhat";
import { HardhatRuntimeEnvironment, HttpNetworkConfig } from "hardhat/types";
import { developmentChains, networkConfig } from "../helper-hardhat-config";
import verify from "../utils/verify";

interface HttpNetworkConfig2 extends HttpNetworkConfig{
    blockConfirmations: number;
}

module.exports = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chaindId = network.config.chainId;

    let ethUsdPriceFeedAddress: string;
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chaindId as keyof typeof networkConfig]["ethUsdPriceFeed"];
    }

    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        // waitConfirmations: networkConfig[chaindId as keyof typeof networkConfig].blockConfirmations || 1,
    });

    if (!developmentChains.includes(network.name)) {
        await verify(fundMe.address, args);
    }
    log("---------------------------------------------------------");
};

module.exports.tags = ["all", "fundme"];
