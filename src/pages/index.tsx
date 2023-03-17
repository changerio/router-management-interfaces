import DEPLOYMENT from "@/contract-address-production.json";
import Layout from "@/components/Layout";
import { NETWORK_DATA } from "@/lib/constants";
import Link from "next/link";

// TODO: add monitoring target contract data here
const MAINNET_DATA = {
  networkData: NETWORK_DATA.mainnet,
  contracts: [
    {
      name: "ChangerSwapRouterV3Proxy",
      address: DEPLOYMENT.mainnet.ChangerSwapRouterV3Proxy,
    },
  ],
};

const POLYGON_DATA = {
  networkData: NETWORK_DATA.polygon,
  contracts: [
    {
      name: "ChangerSwapRouterV3Proxy",
      address: DEPLOYMENT.polygon.ChangerSwapRouterV3Proxy,
    },
  ],
};

const BSC_DATA = {
  networkData: NETWORK_DATA.bsc,
  contracts: [
    {
      name: "ChangerSwapRouterV3Proxy",
      address: DEPLOYMENT.bsc.ChangerSwapRouterV3Proxy,
    },
  ],
};

const GOERLI_DATA = {
  networkData: NETWORK_DATA.goerli,
  contracts: [
    {
      name: "TEST_CONTRACT",
      address: DEPLOYMENT.goerli.TEST_CONTRACT,
    },
    {
      name: "TEST_CONTRACT_2",
      address: DEPLOYMENT.goerli.TEST_CONTRACT_2,
    },
  ],
};

const DATA = [MAINNET_DATA, POLYGON_DATA, BSC_DATA, GOERLI_DATA];

export default function Home() {
  return (
    <Layout>
      <div>
        {DATA.map(({ networkData, contracts }, i) => (
          <div className="py-10" key={i}>
            <h3 className="prose prose-xl prose-stone dark:prose-invert">
              {networkData.data__wallet_addEthereumChain.chainName}
            </h3>

            <ul className="p-1 pl-6 list-decimal">
              {[...contracts].map(({ name, address }, i) => (
                <li key={i}>
                  <Link href={`/contracts/${networkData.chainId}/${address}`}>
                    {/* <Address
                      name={name}
                      address={address}
                      explorerUrl={networkData.data__wallet_addEthereumChain.blockExplorerUrls[0]}
                      simple={true}
                    /> */}
                    <div>
                      <span>{name}</span>
                      <span className="px-3">{address}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Layout>
  );
}
