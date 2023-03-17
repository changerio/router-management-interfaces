import { safeServiceClientAtom, signerAtom } from "@/atom";
import { NetworkDataType } from "@/lib/constants";
import { GnosisSafeL2__factory } from "@/typechain";
import { faArrowsRotate } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SafeMultisigTransactionResponse } from "@safe-global/safe-core-sdk-types";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import urlJoin from "url-join";
import Divider from "./Divider";
import TxHash from "./TxHash";

interface GnosisSafeStateProps {
  contract: string;
  networkData: NetworkDataType;
  setOwners?: (owners: string[]) => void;
}

const getTextColoForBoolean = (v: boolean | undefined) => {
  return v === true ? "text-blue-500" : v === false ? "text-red-500" : "text-slate-500";
};

export default function GnosisSafeState(props: GnosisSafeStateProps) {
  const { contract, networkData, setOwners: setOwnersProps } = props;
  const {
    gnosisAPIUrl,
    gnosisSafeNetworkSymbol,
    data__wallet_addEthereumChain: {
      blockExplorerUrls: [explorerUrl],
    },
  } = networkData;

  const safeServiceClient = useAtomValue(safeServiceClientAtom);

  const [owners, setOwners] = useState<string[]>([]);
  const [threshold, setThreshold] = useState<number>(0);
  const [nonce, setNonce] = useState<number>(0);
  const [txs, setTxs] = useState<SafeMultisigTransactionResponse[]>([]);
  const [shouldRefreshTransactionData, setShouldRefreshTransactionData] = useState(false);

  const clearData = () => {
    setOwners([]);
    setThreshold(0);
    setNonce(0);
    setTxs([]);
    setShouldRefreshTransactionData(false);
  };

  // load safe state from api
  useEffect(() => {
    if (!safeServiceClient) return;
    if (shouldRefreshTransactionData) return;

    (async () => {
      // /api/v1/safes: fetch general state
      const safeInfo = await safeServiceClient.getSafeInfo(contract);

      // TODO: pagination with `json.next`
      // fetch transaction list
      const multisigTxs = await safeServiceClient.getMultisigTransactions(contract);
      const txs = multisigTxs?.results;
      txs.sort((a: any, b: any) => b.nonce - a.nonce);
      console.log("txs", txs);

      setOwners(safeInfo.owners);
      setThreshold(safeInfo.threshold);
      setNonce(safeInfo.nonce);
      if (setOwnersProps) setOwnersProps(safeInfo.owners);

      setTxs(txs);
      setShouldRefreshTransactionData(true);
    })().catch(console.error);
  }, [
    safeServiceClient,
    setOwnersProps,
    gnosisAPIUrl,
    contract,
    owners,
    setOwners,
    threshold,
    setThreshold,
    nonce,
    setNonce,
    txs,
    setTxs,
    shouldRefreshTransactionData,
    setShouldRefreshTransactionData,
  ]);

  return (
    <>
      <div className="mt-10">
        <h3 className="prose prose-xl prose-stone dark:prose-invert">Gnosis Safe</h3>
        <div>
          <span className="font-bold">External Links</span>
          <span>: </span>
          <a
            className="text-indigo-500"
            href={`https://app.safe.global/home?safe=${gnosisSafeNetworkSymbol}:${contract}`}
            target="_blank"
          >
            Home
          </a>{" "}
          <a
            className="text-indigo-500"
            href={`https://app.safe.global/transactions/queue?safe=${gnosisSafeNetworkSymbol}:${contract}`}
            target="_blank"
          >
            Queue
          </a>{" "}
          <a
            className="text-indigo-500"
            href={`https://app.safe.global/transactions/history?safe=${gnosisSafeNetworkSymbol}:${contract}`}
            target="_blank"
          >
            History
          </a>
        </div>

        <div className="grid grid-cols-3 gap-3 my-4">
          {/* ADDRESS of safe */}
          <div>
            <span>Address</span>
          </div>
          <div className="col-span-2">
            <span className="text-yellow-500 font-bold">{contract}</span>
          </div>

          {/* THRESHOLD of safe */}
          <div>
            <span>Threshold</span>
          </div>
          <div className="col-span-2">
            <span>
              {threshold} of {owners.length}
            </span>
          </div>

          {/* NONCE of safe */}
          <div>
            <span>Nonce</span>
          </div>
          <div className="col-span-2">
            <span>{nonce}</span>
          </div>

          {/* OWENR of safe */}
          <div>
            <span>Owners</span>
          </div>
          <div className="col-span-2" style={{ minHeight: "13vh" }}>
            <ul>
              {owners.map((owner, i) => (
                <li key={i}>{owner}</li>
              ))}
            </ul>
          </div>
        </div>

        <Divider />

        {/* Tx List: heading */}
        <div className="mt-8 flex flex-row items-center">
          <h3 className="prose prose-xl prose-stone dark:prose-invert">Transactions</h3>
          <a
            className="ml-3 hover:cursor-pointer"
            onClick={() => {
              clearData();
            }}
          >
            <FontAwesomeIcon icon={faArrowsRotate} style={{ width: "20px" }} />
          </a>
        </div>

        {/* Tx List: iterate over `txs` */}
        <div style={{ minHeight: "30vh" }}>
          {txs.map((tx, i) => (
            <div key={i} className="mt-4 py-2 px-2 border-2 border-sky-900 rounded">
              <div>
                TX#{tx.nonce} - <TxHash hash={tx.transactionHash} explorerUrl={explorerUrl} /> (isExecuted=
                <span className={getTextColoForBoolean(tx.isExecuted)}>{String(tx.isExecuted)}</span>, isSuccessful=
                <span className={getTextColoForBoolean(tx.isSuccessful)}>{String(tx.isSuccessful)}</span>)
              </div>

              <div>
                Confirmed: {tx.confirmations?.length} ({tx.confirmations?.map((c: any) => c.owner).join(", ")})
              </div>

              <div>tx.to: {tx.to}</div>

              {/* Note that tx.dataDecoded is not a string  */}
              {tx.dataDecoded && (
                <div>
                  tx.data: {(tx.dataDecoded as any)?.method}(
                  {(tx.dataDecoded as any)?.parameters?.map((p: any, i: number) => (
                    <span key={i}>
                      <p className="indent-7 whitespace-nowrap">
                        {p.name}: {p.value}
                      </p>
                    </span>
                  ))}
                  )
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
