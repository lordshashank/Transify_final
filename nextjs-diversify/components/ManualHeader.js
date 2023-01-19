// This file is to show what making a connect button looks like behind the scenes!
import classes from "../styles/Header.module.css";
import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import { useRef } from "react";
import { stringify } from "postcss";
import Image from "next/image";
import logo from "../public/logo.jpg";

// Top navbar
export default function ManualHeader(props) {
  const {
    enableWeb3,
    isWeb3Enabled,
    isWeb3EnableLoading,
    account,
    Moralis,
    authenticate,
    deactivateWeb3,
    user,
    isAuthenticated,
  } = useMoralis();

  // if (!isAuthenticated) {
  //   return (
  //     <div>
  //       <button onClick={() => authenticate()}>Authenticate</button>
  //     </div>
  //   );
  // }
  useEffect(() => {
    if (
      !isWeb3Enabled &&
      typeof window !== "undefined" &&
      window.localStorage.getItem("connected")
    ) {
      enableWeb3();
      // enableWeb3({provider: window.localStorage.getItem("connected")}) // add walletconnect
    }
  }, [isWeb3Enabled]);
  // no array, run on every render
  // empty array, run once
  // dependency array, run when the stuff in it changesan

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to ${account}`);
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
        console.log("Null Account found");
      }
    });
  }, []);

  return (
    <nav className="p-5">
      <ul className={classes.list}>
        <li className={classes.logo}>
          <Image src={logo} className={classes.logo} />
        </li>
        <li className={"flex flex-row"}>
          {account ? (
            <div
              className={`${classes.connectbutton} ${classes.connectedbutton}`}
            >
              <span>
                Connected to {account.slice(0, 6)}...
                {account.slice(account.length - 4)}
              </span>
            </div>
          ) : (
            <button
              onClick={async () => {
                // await walletModal.connect()
                const ret = await enableWeb3();
                if (typeof ret !== "undefined") {
                  // depends on what button they picked
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem("connected", "injected");
                    // window.localStorage.setItem("connected", "walletconnect")
                  }
                }
              }}
              disabled={isWeb3EnableLoading}
              className={classes.connectbutton}
            >
              <span>Connect Wallet</span>
            </button>
            // <button
            //   onClick={async () => {
            //     // await walletModal.connect()
            //     const ret = await enableWeb3();
            //     if (typeof ret !== "undefined") {
            //       // depends on what button they picked
            //       if (typeof window !== "undefined") {
            //         window.localStorage.setItem("connected", "injected");
            //         // window.localStorage.setItem("connected", "walletconnect")
            //       }
            //     }
            //   }}
            //   disabled={isWeb3EnableLoading}
            //   className={classes.connectbutton}
            // >
            //   Connect Wallet
            // </button>
          )}
        </li>
      </ul>
    </nav>
  );
}
