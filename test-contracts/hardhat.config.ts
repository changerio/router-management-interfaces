import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import { config as dotenvConfig } from "dotenv";
import { parseEther } from "ethers/lib/utils";

dotenvConfig();

const config: HardhatUserConfig = {
  solidity: "0.8.18",

  namedAccounts: {
    deployer: {
      default: 0,
    },
  },

  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      accounts: {
        mnemonic:
          process.env.MAINNET_HDWALLET_MNEMONIC ||
          "maze drift razor shy spring stick name sell lobster drink blossom cost",
        accountsBalance: parseEther("1000000").toString(),
      },
    },
    goerli: {
      // url: "https://rpc.ankr.com/eth_goerli",
      url: "https://goerli.blockpi.network/v1/rpc/public",
      accounts: {
        mnemonic:
          process.env.MAINNET_HDWALLET_MNEMONIC ||
          "maze drift razor shy spring stick name sell lobster drink blossom cost",
      },
      gas: "auto",
      gasPrice: "auto",
      gasMultiplier: 2,
      chainId: 5,
    },
  },
};

export default config;
