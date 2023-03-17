import { shortenAddress } from "@/lib/address-utils";
import { getTxHashExplorerLink } from "@/lib/explorer-utils";

interface TxHashProps {
  hash: string;
  explorerUrl: string;
  shorten?: boolean;
}

export default function TxHash(props: TxHashProps) {
  const { hash, explorerUrl, shorten } = props;

  return (
    <a href={getTxHashExplorerLink(explorerUrl, hash ?? "")} target="_blank">
      {shorten ? shortenAddress(hash) : hash}
    </a>
  );
}
