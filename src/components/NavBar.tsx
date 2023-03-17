import { useAtom } from "jotai";
import { providerAtom, selectedChainIdAtom, setProviderAtom, signerAddressAtom } from "@/atom";
import { NETWORK_DATA } from "@/lib/constants";
import { ethers } from "ethers";
import { shortenAddress } from "@/lib/address-utils";
import Link from "next/link";
import { useRouter } from "next/router";
import { getAddressExplorerLink } from "@/lib/explorer-utils";

export default function NavBar() {
  const router = useRouter();
  const chainIdInQuery = router.query.chainId as undefined | string;

  const [selectedChainId, _setSelectedChainId] = useAtom(selectedChainIdAtom);
  const selectedNetworkData = Object.entries(NETWORK_DATA).find(([, data]) => data.chainId === selectedChainId)![1];

  const [provider] = useAtom(providerAtom);
  const [, setProvider] = useAtom(setProviderAtom);

  const [signerAddress] = useAtom(signerAddressAtom);

  const connected = provider && signerAddress;

  const connectWallet = async (_selectedNetworkData = selectedNetworkData) => {
    const ethereum = (window as any)?.ethereum;
    // short circuit if metamask not installed
    if (!ethereum) {
      alert("Cannot find metamask");
      return;
    }

    await ethereum.request({ method: "eth_requestAccounts" });
    const newProvider = new ethers.providers.Web3Provider(ethereum, "any");

    let broken = false;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: _selectedNetworkData.data__wallet_addEthereumChain.chainId }],
      });
    } catch (error: any) {
      if (error.code === 4902) {
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [_selectedNetworkData.data__wallet_addEthereumChain],
          });
        } catch (addErr) {
          console.log(addErr);
          broken = true;
        }
      } else {
        throw error;
      }
    }

    if (!broken) {
      ethereum.on("accountsChanged", (accounts: string[]) => {
        console.log("accountsChanged: accounts", accounts);
        setProvider(newProvider, _selectedNetworkData.data__wallet_addEthereumChain.blockExplorerUrls[0]);
      });
      setProvider(newProvider, _selectedNetworkData.data__wallet_addEthereumChain.blockExplorerUrls[0]);
    }

    // update dropbox for connected network
    _setSelectedChainId((await newProvider.getNetwork()).chainId);
  };

  const setSelectedChainId = async (chainId: number) => {
    const selectedNetworkData = Object.values(NETWORK_DATA).find((data) => data.chainId === chainId);
    if (!selectedNetworkData) {
      alert(`Unknown chain id: ${chainId}`);
      return;
    }
    console.log("network chainged: %s", selectedNetworkData.data__wallet_addEthereumChain.chainName);

    await connectWallet(selectedNetworkData);
    _setSelectedChainId(chainId);
  };

  const disconnectWallet = async () => {
    setProvider(null, null);
  };

  const shouldOpenChangeNetworkButton = chainIdInQuery && parseInt(chainIdInQuery) !== selectedChainId;
  const suggestedNetworkData =
    shouldOpenChangeNetworkButton &&
    Object.entries(NETWORK_DATA).find(([, data]) => data.chainId === parseInt(chainIdInQuery))![1];
  const changeToSuggestedNetwork = async () => {
    if (!suggestedNetworkData) return;
    await connectWallet(suggestedNetworkData);
  };

  return (
    <div className="space-x-10 py-3 mx-auto flex flex-row flex-wrap items-center">
      <div className="basis-3/12">
        <Link href="/">Home</Link>
      </div>

      <div>
        <select
          name="chainId"
          id="chainId"
          value={selectedChainId}
          onChange={(e) => setSelectedChainId(parseInt(e.target.value))}
        >
          {Object.values(NETWORK_DATA).map((data, i) => (
            <option value={data.chainId} key={i}>
              {data.data__wallet_addEthereumChain.chainName}
            </option>
          ))}
        </select>
      </div>

      <div>
        {connected ? (
          <span>
            Connected:{" "}
            <a
              href={getAddressExplorerLink(
                selectedNetworkData.data__wallet_addEthereumChain.blockExplorerUrls[0],
                signerAddress
              )}
              target="_blank"
            >
              {shortenAddress(signerAddress)}
            </a>
          </span>
        ) : (
          <button className="btn bg-blue-500 px-1" onClick={() => connectWallet()}>
            Connect Wallet
          </button>
        )}
      </div>

      {suggestedNetworkData && (
        <div>
          <button className="btn bg-red-500 px-1" onClick={changeToSuggestedNetwork}>
            Switch to {suggestedNetworkData.data__wallet_addEthereumChain.chainName}
          </button>
        </div>
      )}

      {connected && (
        <div>
          <button className="btn bg-blue-500 px-1" onClick={disconnectWallet}>
            Disconnect
          </button>{" "}
        </div>
      )}
    </div>
  );
}
