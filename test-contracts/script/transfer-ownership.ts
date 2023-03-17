import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import hre, { deployments, getNamedAccounts } from "hardhat";
import { Ownable } from "../typechain-types";

// "ChangerContractAdminMultisig": "0x8e05b0f41796dacC37eA39aFCca6aEC05bF61454"
const NEXT_OWNER = "0x8e05b0f41796dacC37eA39aFCca6aEC05bF61454"; // original multisig wallet on goerli
// const NEXT_OWNER = "0xCe9205Eef8334D8Ffee4A08C578477CfA00F691a"; // test multisig wallet
async function main() {
  if (hre.network.name !== "goerli") {
    console.log(`run only on goerli network (current: ${hre.network.name})`);
    return;
  }

  const { deployer } = await getNamedAccounts();
  console.log("deployer", deployer);

  const op: Ownable = await hre.ethers.getContract("OP");
  console.log("op", op.address);

  const owner = await op.owner({ blockTag: "pending" });
  console.log("owner", owner);

  if (deployer === owner) {
    console.log("try to transfer ownserhip to %s", NEXT_OWNER);
    const tx = await op.transferOwnership(NEXT_OWNER);
    console.log(tx.hash);
  } else {
    console.log("already ownership transfered to %s", owner);
  }
}

main().catch(console.error);
