import { ethers, getNamedAccounts, network } from "hardhat";
import { developmentChains } from "../../helper-hardhat-config";
import { FundMe } from "../../typechain-types";
import { assert } from "chai";

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMeContract: FundMe;
          let deployer: string;
          const sendValue = ethers.utils.parseEther("0.01");

          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer;
              fundMeContract = await ethers.getContract("FundMe", deployer);
          });

          it("allows people to fund and withdraw", async () => {
              await fundMeContract.fund({ value: sendValue });
              await fundMeContract.withdraw();

              const endingBalance = await fundMeContract.provider.getBalance(fundMeContract.address);
              assert.equal(endingBalance.toString(), "0");
          });
      });
