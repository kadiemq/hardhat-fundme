import { network } from "hardhat";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DECIMALS, developmentChains, INTIAL_ANSWER } from "../helper-hardhat-config";

module.exports = async ({ getNamedAccounts, deployments }: HardhatRuntimeEnvironment) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();
    const chaindId = network.config.chainId!;

    if (developmentChains.includes(network.name)) {
        log("local network detected deploying mocks...");
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INTIAL_ANSWER],
        });

        log("Mocks deployed");
        log("------------------------------------------------");
    }
};

module.exports.tags = ["all", "mocks"];
