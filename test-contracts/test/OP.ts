import { expect } from "chai";
import { deployments, ethers } from "hardhat";
import { OP } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("OP", function () {
  let op: OP;
  let signers: SignerWithAddress[];
  this.beforeEach("deploy contract", async function () {
    signers = await ethers.getSigners();
    await deployments.fixture();
    op = (await ethers.getContract("OP", signers[0] as any)) as any;
  });

  it("only owner can pause", async function () {
    expect(await op.paused()).to.be.false;
    await expect(op.connect(signers[1]).pause()).to.be.reverted;
    expect(await op.pause()).to.emit(op, "Paused");
    expect(await op.paused()).to.be.true;
  });
});
