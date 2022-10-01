import { deployments, ethers, getNamedAccounts, network } from "hardhat";
import { FundMe, MockV3Aggregator } from "../../typechain-types";
import { assert, expect } from "chai";
import { developmentChains } from "../../helper-hardhat-config";

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe: FundMe;
          let deployer: string;
          let mockV3Aggregator: MockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");

          beforeEach(async () => {
              // const accounts = await ethers.getSigners();
              // const accountZero = accounts[0];
              deployer = (await getNamedAccounts()).deployer;

              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator");
          });

          describe("constructor", async () => {
              it("sets the aggregator address correctly", async () => {
                  const response = await fundMe.s_priceFeed();
                  assert.equal(response, mockV3Aggregator.address);
              });
          });

          describe("Fund", async () => {
              it("fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!");
              });

              it("update the amount funded data structure", async () => {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.s_addressToAmountFunded(deployer);

                  assert.equal(response.toString(), sendValue.toString());
              });

              it("adds funder to array of funders", async () => {
                  await fundMe.fund({ value: sendValue });
                  const response = await fundMe.getFunder(0);

                  assert.equal(response, deployer);
              });
          });

          describe("withdraw function", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue });
              });

              it("withdraw ETH from a single funder", async () => {
                  // Arrange
                  const initalFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                  const initalDeployerBalance = await fundMe.provider.getBalance(deployer);

                  // Act
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const finalFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                  const finalDeployerBalance = await fundMe.provider.getBalance(deployer);

                  // Assert
                  assert.equal(finalFundMeBalance.toString(), "0");
                  assert.equal(
                      initalDeployerBalance.add(initalFundMeBalance).toString(),
                      finalDeployerBalance.add(gasCost).toString()
                  );
              });

              it("withdraw ETH from multiple funders", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 0; i < 6; i++) {
                      const fundMeConnectedContract = fundMe.connect(accounts[i]);
                      await fundMeConnectedContract.fund({ value: sendValue });

                      const initalFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                      const initalDeployerBalance = await fundMe.provider.getBalance(deployer);

                      const txResponse = await fundMe.withdraw();
                      const txReceipt = await txResponse.wait(1);
                      const { gasUsed, effectiveGasPrice } = txReceipt;
                      const gasCost = gasUsed.mul(effectiveGasPrice);
                      const finalFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                      const finalDeployerBalance = await fundMe.provider.getBalance(deployer);

                      // Assert
                      assert.equal(finalFundMeBalance.toString(), "0");
                      assert.equal(
                          initalDeployerBalance.add(initalFundMeBalance).toString(),
                          finalDeployerBalance.add(gasCost).toString()
                      );
                      await expect(fundMe.getFunder(0)).to.be.reverted;

                      for (let i = 0; i < 6; i++) {
                          assert.equal(
                              await (await fundMe.s_addressToAmountFunded(accounts[i].address)).toString(),
                              "0"
                          );
                      }
                  }
              });

              it("only allows the owner to withdraw", async () => {
                  const accounts = await ethers.getSigners();
                  const attacker = accounts[1];
                  const attackerConnectedContract = fundMe.connect(attacker);

                  await expect(attackerConnectedContract.withdraw()).to.be.revertedWithCustomError(
                      fundMe,
                      "FundMe__NotOwner"
                  );
              });

              it("cheaper withdraw ETH from a single funder", async () => {
                  // Arrange
                  const initalFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                  const initalDeployerBalance = await fundMe.provider.getBalance(deployer);

                  // Act
                  const txResponse = await fundMe.cheaperWithdraw();
                  const txReceipt = await txResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);
                  const finalFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                  const finalDeployerBalance = await fundMe.provider.getBalance(deployer);

                  // Assert
                  assert.equal(finalFundMeBalance.toString(), "0");
                  assert.equal(
                      initalDeployerBalance.add(initalFundMeBalance).toString(),
                      finalDeployerBalance.add(gasCost).toString()
                  );
              });

              it("Cheaper withdraw multifunders testing", async () => {
                  const accounts = await ethers.getSigners();
                  for (let i = 0; i < 6; i++) {
                      const fundMeConnectedContract = fundMe.connect(accounts[i]);
                      await fundMeConnectedContract.fund({ value: sendValue });

                      const initalFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                      const initalDeployerBalance = await fundMe.provider.getBalance(deployer);

                      const txResponse = await fundMe.cheaperWithdraw();
                      const txReceipt = await txResponse.wait(1);
                      const { gasUsed, effectiveGasPrice } = txReceipt;
                      const gasCost = gasUsed.mul(effectiveGasPrice);
                      const finalFundMeBalance = await fundMe.provider.getBalance(fundMe.address);
                      const finalDeployerBalance = await fundMe.provider.getBalance(deployer);

                      // Assert
                      assert.equal(finalFundMeBalance.toString(), "0");
                      assert.equal(
                          initalDeployerBalance.add(initalFundMeBalance).toString(),
                          finalDeployerBalance.add(gasCost).toString()
                      );
                      await expect(fundMe.getFunder(0)).to.be.reverted;

                      for (let i = 0; i < 6; i++) {
                          assert.equal(
                              await (await fundMe.s_addressToAmountFunded(accounts[i].address)).toString(),
                              "0"
                          );
                      }
                  }
              });
          });
      });
