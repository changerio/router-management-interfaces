import { atom, PrimitiveAtom } from "jotai";
import * as ethers from "ethers";
import invariant from "invariant";
import { DEV, NETWORK_DATA, NETWORK_NAME_BY_CHAIN_ID, NetworkDataType } from "@/lib/constants";
import SafeServiceClient from "@safe-global/safe-service-client";

import DEPLOYMENT from "@/contract-address-production.json";
import EthersAdapter from "@safe-global/safe-ethers-lib";

const DEFAULT_NETWORK = DEV ? NETWORK_DATA.goerli : NETWORK_DATA.mainnet;

/**************************************************************************
 * Provider
 **************************************************************************/
export const explorerUrlAtom = atom<null | string>(null);
export const signerAtom = atom<null | ethers.providers.JsonRpcSigner>(null);
export const signerAddressAtom = atom<null | string>(null);
export const chainIdAtom = atom<null | number>(null);
export const providerAtom = atom<null | ethers.providers.Web3Provider>(null);
export const setProviderAtom = atom<null, [null | ethers.providers.Web3Provider, null | string], void>(
  null,
  async (get, set, provider, explorerUrl) => {
    console.log("setProviderAtom executed");

    set(providerAtom, provider);
    set(explorerUrlAtom, explorerUrl);

    // clear signers if disconnected
    if (!provider) {
      set(signerAtom, null);
      set(signerAddressAtom, null);
      set(chainIdAtom, null);
      set(safeServiceClientAtom, null);
      // set(selectedNetworkDataAtom, null);
      return;
    }

    const signer = await provider.getSigner(0);
    const signerAddress = await signer.getAddress();
    const { chainId } = await provider.getNetwork();
    set(signerAtom, signer);
    set(signerAddressAtom, signerAddress);
    set(chainIdAtom, chainId);

    const networkName = NETWORK_NAME_BY_CHAIN_ID[chainId.toString()];
    console.log("networkName", networkName);

    if (!networkName) return;
    const networkData = NETWORK_DATA[networkName as keyof typeof NETWORK_DATA];
    set(selectedNetworkDataAtom, networkData);

    const ethAdapter = new EthersAdapter({ ethers, signerOrProvider: signer });
    const safeService = new SafeServiceClient({ txServiceUrl: networkData.gnosisAPIUrl, ethAdapter });
    set(ethAdapterAtom, ethAdapter);
    set(safeServiceClientAtom, safeService);
  }
);
export const suggestedChainIdAtom = atom<null | number>(null);
export const selectedNetworkDataAtom = atom<null | NetworkDataType>(DEFAULT_NETWORK);

export const selectedChainIdAtom = atom(DEFAULT_NETWORK.chainId);

/**************************************************************************
 * Gnosis Safe SDK
 **************************************************************************/
export const ethAdapterAtom = atom<null | EthersAdapter>(null);
export const safeServiceClientAtom = atom<null | SafeServiceClient>(null);
