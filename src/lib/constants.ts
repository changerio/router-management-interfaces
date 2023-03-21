export const DEV = process.env.NODE_ENV === "development";

export interface NetworkDataType {
  chainId: number;
  data__wallet_addEthereumChain: {
    chainId: string;
    chainName: string;
    nativeCurrency: {
      name: string;
      symbol: string;
      decimals: number;
    };
    rpcUrls: string[];
    blockExplorerUrls: string[];
  };
  gnosisSafeNetworkSymbol: string;
  gnosisAPIUrl: string;
}

const mainnet: NetworkDataType = {
  chainId: 1,
  data__wallet_addEthereumChain: {
    chainId: "0x1",
    chainName: "Ethereum",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https:/.mycryptoapi.com/eth", "https://cloudflare-eth.com"],
    blockExplorerUrls: ["https://etherscan.io/"],
  },
  gnosisSafeNetworkSymbol: "eth",
  gnosisAPIUrl: "https://safe-transaction-mainnet.safe.global",
};

const bsc: NetworkDataType = {
  chainId: 56,
  data__wallet_addEthereumChain: {
    chainId: "0x38",
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18,
    },
    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org",
      "https://bsc-dataseed4.binance.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed2.defibit.io",
      "https://bsc-dataseed3.defibit.io",
      "https://bsc-dataseed4.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://bsc-dataseed2.ninicoin.io",
      "https://bsc-dataseed3.ninicoin.io",
      "https://bsc-dataseed4.ninicoin.io",
    ],
    blockExplorerUrls: ["https://bscscan.com"],
  },
  gnosisSafeNetworkSymbol: "bnb",
  gnosisAPIUrl: "https://safe-transaction-bsc.safe.global",
};

const polygon: NetworkDataType = {
  chainId: 137,
  data__wallet_addEthereumChain: {
    chainId: "0x89",
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    rpcUrls: [
      "https://polygon-rpc.com/",
      "https://rpc-mainnet.matic.network",
      "https://matic-mainnet.chainstacklabs.com",
      "https://rpc-mainnet.maticvigil.com",
      "https://rpc-mainnet.matic.quiknode.pro",
      "https://matic-mainnet-full-rpc.bwarelabs.com",
    ],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  gnosisSafeNetworkSymbol: "matic",
  gnosisAPIUrl: "https://safe-transaction-polygon.safe.global",
};

const goerli: NetworkDataType = {
  chainId: 5,
  data__wallet_addEthereumChain: {
    chainId: "0x5",
    chainName: "Görli",
    nativeCurrency: {
      name: "Görli Ether",
      symbol: "GOR",
      decimals: 18,
    },
    rpcUrls: [
      "https://rpc.ankr.com/eth_goerli",
      "https://rpc.goerli.mudit.blog",
      "https://eth-goerli.g.alchemy.com/v2/demo",
      "https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      "https://eth-goerli.public.blastapi.io",
    ],
    blockExplorerUrls: ["https://goerli.etherscan.io", "https://stats.goerli.net"],
  },
  gnosisSafeNetworkSymbol: "gor",
  gnosisAPIUrl: "https://safe-transaction-goerli.safe.global",
};

export const NETWORK_DATA = {
  mainnet,
  bsc,
  polygon,
  goerli,
};

export const NETWORK_NAME_BY_CHAIN_ID: { [chainId: string]: string } = Object.entries(NETWORK_DATA).reduce(
  (acc, [key, value]) => ({
    ...acc,
    [value.chainId.toString()]: key,
  }),
  {}
);

// my admin 0x806782cB34f3456C2802799A8716007066bdAd85
