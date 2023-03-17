import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

import { explorerUrlAtom } from "@/atom";
import { shortenAddress } from "@/lib/address-utils";
import { useAtomValue } from "jotai";
import { useState } from "react";

import cn from "classnames";
import styles from "@/styles/Address.module.css";
import { getAddressExplorerLink } from "@/lib/explorer-utils";

export interface AddressProps {
  name?: string;
  explorerUrl?: string;
  simple?: boolean;
  address: string;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export default function Address(props: AddressProps) {
  const { name, address, simple } = props;
  const explorerUrlFromAtom = useAtomValue(explorerUrlAtom);
  const explorerUrl = explorerUrlFromAtom ?? props.explorerUrl ?? "https://etherscan.io";

  const [copied, setCopied] = useState(false);

  if (simple) {
    return (
      <>
        {name ? name + " " : ""} {shortenAddress(address)}
      </>
    );
  }

  const onClickCopy = () => {
    setCopied(true);
    copyToClipboard(address);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <>
      {name ? name + " " : ""}{" "}
      <a href={getAddressExplorerLink(explorerUrl, address)} target="_blank">
        {shortenAddress(address)}
      </a>{" "}
      <a onClick={onClickCopy} className={cn(styles.tooltip, styles["copy-box"])}>
        <FontAwesomeIcon icon={faCopy} />
        <span className={cn(styles.tooltiptext, styles["tooltip-top"])}>{copied ? "Copied!" : "Copy Address"}</span>
      </a>
    </>
  );
}
