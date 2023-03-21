const DEV = process.env.NODE_ENV === "development";

const DEPLOYMENT = require("./src/contract-address-production.json");

// TODO: add network data
const CHAIN_ID_BY_NETWORK = {
  mainnet: 1,
  bsc: 56,
  polygon: 137,
  goerli: 5,
};

const basePath = DEV ? undefined : "/router-management-interfaces";
const assetPrefix = DEV ? "" : "/router-management-interfaces/";

// make route map to support URL navigation: https://stackoverflow.com/a/69557638
const exportPathMap = Object.entries(DEPLOYMENT).reduce((acc, [networkName, data]) => {
  const chainId = CHAIN_ID_BY_NETWORK[networkName];
  const contracts = Object.values(data);

  return {
    ...acc,
    ...contracts.reduce((acc2, contract) => {
      return {
        ...acc2,
        [`/contracts/${chainId}/${contract}`]: {
          page: "/contracts/[chainId]/[address]",
        },
      };
    }, {}),
  };
}, {});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  exportPathMap: async function () {
    return {
      ...exportPathMap,
      "/": { page: "/" },
    };
  },
  basePath: basePath,
  assetPrefix: assetPrefix,
};

module.exports = nextConfig;
