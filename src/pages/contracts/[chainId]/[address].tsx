import cn from "classnames";
import {
  chainIdAtom,
  ethAdapterAtom,
  explorerUrlAtom,
  safeServiceClientAtom,
  selectedNetworkDataAtom,
  signerAddressAtom,
  signerAtom,
} from "@/atom";
import Layout from "@/components/Layout";
import { NETWORK_DATA, NETWORK_NAME_BY_CHAIN_ID } from "@/lib/constants";
import { findPathWithValue } from "@/lib/misc";
import { Ownable__factory, Pausable__factory } from "@/typechain";
import { getAddress, isAddress } from "ethers/lib/utils";
import { useAtomValue } from "jotai";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

import DEPLOYMENT from "@/contract-address-production.json";

import styles from "@/styles/ContractDetail.module.css";
import GnosisSafeState from "@/components/GnosisSafeState";
import { SafeTransactionDataPartial } from "@safe-global/safe-core-sdk-types";
import Safe from "@safe-global/safe-core-sdk";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import { ethers } from "ethers";
import SafeServiceClient from "@safe-global/safe-service-client";
import urlJoin from "url-join";
import Divider from "@/components/Divider";

const PausableInterface = Pausable__factory.createInterface();
const OwnableInterface = Ownable__factory.createInterface();

const getTextColorForBoolean = (v: boolean | undefined) => {
  return v === true ? "text-blue-500" : v === false ? "text-red-500" : "text-slate-500";
};

export default function ContractDetail() {
  const { query, isReady } = useRouter();

  const chainIdInQuery = parseInt(query.chainId as string);
  const address = query.address ? getAddress(query.address as string) : "";

  const networkName = NETWORK_NAME_BY_CHAIN_ID[chainIdInQuery.toString()];

  const deployment = (DEPLOYMENT as any)[networkName];
  const name = findPathWithValue(deployment, address) ?? "UNKNOWN";

  // load atoms
  const signer = useAtomValue(signerAtom);
  const signerAddress = useAtomValue(signerAddressAtom);
  const chainId = useAtomValue(chainIdAtom);
  const explorerUrl = useAtomValue(explorerUrlAtom);
  const networkData = useAtomValue(selectedNetworkDataAtom);
  const ethAdapter = useAtomValue(ethAdapterAtom);
  const safeServiceClient = useAtomValue(safeServiceClientAtom);

  const targetAsPausable = signer && Pausable__factory.connect(address, signer);
  const targetAsOwnable = signer && Ownable__factory.connect(address, signer);

  const isProviderConnected = chainId === chainIdInQuery;

  // loading target.owner()
  const [owner, setOwner] = useState<undefined | string>();
  useEffect(() => {
    if (!isProviderConnected) return;
    if (!isReady) return;
    if (!targetAsOwnable) return;
    if (owner) return;

    console.log("loading target.owner()");

    (async () => {
      setOwner(await targetAsOwnable.owner());
    })().catch(console.error);
  }, [isProviderConnected, isReady, targetAsOwnable, owner]);
  const ownerName = findPathWithValue(deployment, owner) ?? "";

  // loading target.paused()
  const [paused, setPaused] = useState<undefined | boolean>();
  useEffect(() => {
    if (!isProviderConnected) return;
    if (!isReady) return;
    if (!targetAsPausable) return;
    if (paused !== undefined) return;
    console.log("loading target.owner()");

    (async () => {
      setPaused(await targetAsPausable.paused());
    })().catch(console.error);
  }, [isProviderConnected, isReady, targetAsPausable, paused]);

  // gnosis safe state
  const [owners, setOwners] = useState<string[]>([]);
  const [nonce, setNonce] = useState<number>(0);
  const [isOwnerConnected, setIsOwnerConnected] = useState(false);
  useEffect(() => {
    if (!signerAddress) return;
    setIsOwnerConnected(owners.indexOf(signerAddress) !== -1);
  }, [owners, setIsOwnerConnected, signerAddress]);

  // trigger gnosis safe to (un)pause contract
  const triggerContract = useCallback(async () => {
    if (!signer || !signerAddress || !owner || !ethAdapter || !safeServiceClient || !networkData) return;
    if (paused === undefined) return;
    if (!confirm(`Do you want to ${paused ? "unpause" : "pause"} ${name}?`)) return;

    const nonce = await safeServiceClient.getNextNonce(owner);
    console.log("nonce", nonce);

    const txData = paused
      ? PausableInterface.encodeFunctionData("unpause")
      : PausableInterface.encodeFunctionData("pause");
    // const isL1SafeMasterCopy = chainIdInQuery === 1;
    const isL1SafeMasterCopy = true;
    const safeSdk = await Safe.create({ ethAdapter, safeAddress: owner, isL1SafeMasterCopy });

    // instantiate SafeTransactionDataPartial just to generate safe tx hash
    const origin = `${paused ? "Unpause" : "Pause"} ${name}`;
    const safeTransactionData: SafeTransactionDataPartial = {
      to: address,
      data: txData,
      value: "0",
      baseGas: 0,
      safeTxGas: 0,
      gasPrice: 0,
      operation: 0, // 0 for call, 1 for delegatecall
      nonce,
    };
    const safeTransaction = await safeSdk.createTransaction({ safeTransactionData });
    const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
    const senderSignature = await safeSdk.signTransactionHash(safeTxHash);

    // Note that safeServiceClient.proposeTransaction doesn't work for some reason
    // That's why we use `fetch` to send the request directly
    //// safeServiceClient.proposeTransaction(...)

    const res = await fetch(urlJoin(networkData.gnosisAPIUrl, "api/v1/safes", owner, "multisig-transactions/"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // meta tx data
        safe: owner,
        to: safeTransactionData.to,
        value: safeTransactionData.value,
        data: safeTransactionData.data,

        // safe tx data
        contractTransactionHash: safeTxHash,
        operation: safeTransactionData.operation,
        safeTxGas: safeTransactionData.safeTxGas,
        baseGas: safeTransactionData.baseGas,
        gasPrice: safeTransactionData.gasPrice,
        nonce: safeTransactionData.nonce,
        sender: signerAddress,
        signature: senderSignature.data,
        origin,
      }),
    });

    if (res.status === 201) {
      alert(`Transaction requested to "${origin}"`);
      window.open(
        `https://app.safe.global/transactions/queue?safe=${networkData.gnosisSafeNetworkSymbol}:${owner}`,
        "_blank"
      );
    }
  }, [address, name, networkData, owner, paused, signer, signerAddress, ethAdapter, safeServiceClient]);

  const connected = explorerUrl && signer && owner && paused !== undefined;

  if (!isAddress(address)) {
    return <div>INVALID ADDRESS: {address}</div>;
  }

  if (!isProviderConnected) {
    return (
      <Layout>
        <div>Switch network to {networkName}</div>
      </Layout>
    );
  }

  if (!connected) {
    return (
      <Layout>
        <div>Loding...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-10">
        {/* contract state */}
        <div className="h-min">
          {/* <h2 className="mb-2 prose prose-xl prose-stone dark:prose-invert">{name}</h2> */}
          <h2 className="mb-2 prose prose-xl prose-stone dark:prose-invert">Target Contract</h2>
          <div className="grid grid-cols-3 gap-3">
            {/* NAME */}
            <div>
              <span>Name</span>
            </div>
            <div className="col-span-2">
              <span>{name}</span>
            </div>

            {/* ADDRESS */}
            <div>
              <span>Address</span>
            </div>
            <div className="col-span-2">
              <span className="text-green-500 font-bold">{address}</span>
            </div>

            {/* OWNER */}
            <div>
              <span>Owner</span>
            </div>
            <div>
              <span className="text-yellow-500 font-bold">{owner}</span>
            </div>
            <div>
              <span>{ownerName}</span>
            </div>

            {/* PAUSED */}
            <div>
              <span>Paused</span>
            </div>
            <div className="col-span-2">
              <span className={getTextColorForBoolean(!paused)}>{String(paused)}</span>
            </div>

            {/* PAUSE / UNPAUSE BUTTON */}

            <div className="col-span-3">
              <button
                type="button"
                className={cn(
                  getTextColorForBoolean(paused),
                  "bg-gray-200", // bg color
                  "w-full p-3 font-bold text-xl"
                )}
                onClick={triggerContract}
                disabled={!isOwnerConnected}
              >
                MAKE IT {paused ? "UNPAUSE" : "PAUSE"} {!isOwnerConnected && "(connect with one of gnosis safe owners)"}
              </button>
            </div>
          </div>
        </div>

        <Divider />

        {/* gnosis safe state */}
        {networkData && <GnosisSafeState contract={owner} networkData={networkData} setOwners={setOwners} />}
      </div>
    </Layout>
  );
}
