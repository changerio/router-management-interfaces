import urlJoin from "url-join";

export function getAddressExplorerLink(explorerUrl: string, address: string) {
  return urlJoin(explorerUrl, "address", address);
}

export function getTxHashExplorerLink(explorerUrl: string, hash: string) {
  return urlJoin(explorerUrl, "tx", hash);
}
