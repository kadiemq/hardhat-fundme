import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import "hardhat-gas-reporter";

const config: HardhatUserConfig = {
    // solidity: "0.8.17",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: process.env.APP_URL,
            accounts: [process.env.ACCOUNTS!],
            chainId: 5,
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            chainId: 31337,
        },
    },

    namedAccounts: {
        deployer: {
            default: 0,
        },
    },

    etherscan: {
        apiKey: process.env.ETHERSCAN_API,
    },

    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: process.env.COINMARKETCAP,
        token: "ETH",
    },
};

export default config;
