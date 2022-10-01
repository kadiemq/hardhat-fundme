import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain-types";

async function main() {
    const { deplyer } = await getNamedAccounts();
    const fundMe: FundMe = await ethers.getContract("FundMe", deplyer);
    console.log("Funding the contract....");

    const tx = await fundMe.fund({ value: ethers.utils.parseEther("1") });
    await tx.wait(1);
    console.log("Funded!");
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
