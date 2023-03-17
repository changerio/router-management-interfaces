import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

import { useState } from "react";

import cn from "classnames";
import styles from "@/styles/Address.module.css";

export interface CopyButtonProps {
  address: string;
}

export default function CopyButton(props: CopyButtonProps) {
  const { address } = props;

  const [copied, setCopied] = useState(false);

  const onClickCopy = () => {
    setCopied(true);
    navigator.clipboard.writeText(address);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  return (
    <a onClick={onClickCopy} className={cn(styles.tooltip, styles["copy-box"])}>
      <FontAwesomeIcon icon={faCopy} />
      <span className={cn(styles.tooltiptext, styles["tooltip-top"])}>{copied ? "Copied!" : "Copy Address"}</span>
    </a>
  );
}
