import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Multicall", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, otherAccount] = await ethers.getSigners();

    const MultiCall = await ethers.getContractFactory("Multicall");
    const multiCall = await MultiCall.deploy();

    return { multiCall, owner, otherAccount };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { multiCall } = await loadFixture(
        deployOneYearLockFixture
      );

      var blkNum = await ethers.provider.getBlockNumber() - 1
      let calldata1 = {
        target:   multiCall.address,
        callData: multiCall.interface.encodeFunctionData('getBlockHash(uint256)', [blkNum]),
      }
      let calldata2 = {
        target:   multiCall.address,
        callData: multiCall.interface.encodeFunctionData('getLastBlockHash()'),
      }

      var t1 = new Date().getTime()
      for (let i = 0; i < 20; i++) {
        var res = await multiCall.callStatic["aggregate"]([calldata1, calldata2], { blockTag: blkNum + 1 })
      }
      var t2 = new Date().getTime()
      console.log("100 times consume time: ", t2 - t1)
      console.log(res.blockNumber)
      console.log(res.returnData[0])
      console.log(res.returnData[1])
    });
  });


});
