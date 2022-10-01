import { ethers, getNamedAccounts } from "hardhat";
import { FundMe } from "../typechain-types";

async function main() {
    const { deplyer } = await getNamedAccounts();
    const fundMe: FundMe = await ethers.getContract("FundMe", deplyer);
    console.log("Withdrawing from the contract....");

    const tx = await fundMe.withdraw();
    await tx.wait(1);
    console.log("Withdrawen!");
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
