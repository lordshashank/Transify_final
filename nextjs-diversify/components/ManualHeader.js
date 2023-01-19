// This file is to show what making a connect button looks like behind the scenes!
import classes from "../styles/Header.module.css";
import { useEffect } from "react";
import { useMoralis } from "react-moralis";
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
    deactivateWeb3,
  } = useMoralis();

  useEffect(() => {
    if (
      !isWeb3Enabled &&
      typeof window !== "undefined" &&
      window.localStorage.getItem("connected")
    ) {
      enableWeb3();
    }
  }, [isWeb3Enabled]);
  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
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
                const ret = await enableWeb3();
                if (typeof ret !== "undefined") {
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem("connected", "injected");
                  }
                }
              }}
              disabled={isWeb3EnableLoading}
              className={classes.connectbutton}
            >
              <span>Connect Wallet</span>
            </button>
          )}
        </li>
      </ul>
    </nav>
  );
}
