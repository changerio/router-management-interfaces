import SafeProvider from "@gnosis.pm/safe-apps-react-sdk";
import NoSSR from "react-no-ssr";
import { Provider as JotaiProvider } from "jotai";

import "@/styles/globals.css";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    // <NoSSR>
    <SafeProvider>
      {/* <JotaiProvider> */}
      <Component {...pageProps} />
      {/* </JotaiProvider> */}
    </SafeProvider>
    // </NoSSR>
  );
}
