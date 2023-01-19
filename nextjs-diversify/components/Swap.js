import classes from "../styles/CoinData.module.css";
import styles from "../styles/Swap.module.css";
import { contractAddresses, abi } from "../constants";
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState } from "react";
import { networkConfig } from "../helper.config.js";

const Swap = (props) => {
  const [inputSwaploss, setInputSwapLoss] = useState("");
  const [chainId, setChainId] = useState("5");
  const [userAccount, setUserAccount] = useState();
  const [priceRatio, setPriceRatio] = useState();
  const [error, setError] = useState({ error: false, msg: "" });
  const [maximumChange, setMaximumChange] = useState("");
  const [destinationChain, setDestinationChain] = useState();
  const [enableSwap, setEnableSwap] = useState(false);
  const {
    Moralis,
    isWeb3Enabled,
    chainId: chainIdHex,
    account,
    user,
    deactivateWeb3,
  } = useMoralis();
  useEffect(() => {
    setChainId(parseInt(chainIdHex));
    setUserAccount(account);
  }, [isWeb3Enabled]);

  useEffect(() => {
    Moralis.onAccountChanged((account) => {
      console.log(`Account changed to ${account}`);
      if (account == null) {
        window.localStorage.removeItem("connected");
        deactivateWeb3();
        console.log("Null Account found");
      }
      setUserAccount(account);
    });
  }, []);
  useEffect(() => {
    Moralis.onChainChanged((chainIdHex) => {
      setChainId(parseInt(chainIdHex));
    });
  }, []);
  const contractAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  useEffect(() => {
    if (props.data != [] && chainId && destinationChain) {
      const currentChainData = props.data.filter(
        (e) => e.name == networkConfig[chainId]["name"]
      );
      const destinationChainData = props.data.filter(
        (e) => e.name == networkConfig[destinationChain]["name"]
      );
      if (currentChainData != [] && destinationChainData != []) {
        const currentChainPrice =
          currentChainData[0].market_data.current_price.usd;
        const destinationChainPrice =
          destinationChainData[0].market_data.current_price.usd;
        setPriceRatio(currentChainPrice / destinationChainPrice);
      }
    }
  }, [props.data, chainId, destinationChain]);

  const { runContractFunction: setterRatio } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "setterRatio",
    params: {
      chainType: 0,
      chainId: destinationChain,
      ratioX1000000: (priceRatio * 1000000).toFixed(0),
    },
  });
  // console.log(
  //   props.data.filter((e) => e.name == networkConfig[chainId]["name"])
  // );

  const {
    runContractFunction: transferTokens,
    isLoading,
    isFetching,
  } = useWeb3Contract({
    abi: abi,
    contractAddress: contractAddress,
    functionName: "transferTokens",
    msgValue: inputSwaploss,
    params: {
      chainType: 0,
      chainId: destinationChain,
      amount: "100000000000000",
      receipientAddress: userAccount,
      destGasPrice: "30000000000",
    },
  });

  const handleSuccess = async (tx) => {
    try {
      await tx.wait(1);
      //   updateUIValues();
      //   handleNewNotification(tx);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const cryptoData = props.data;
    let maxChange = props.data[0];

    cryptoData.forEach((crypto) => {
      if (
        crypto.market_data.price_change_percentage_24h >
        maxChange.market_data.price_change_percentage_24h
      ) {
        maxChange = crypto;
      }
    });
    setMaximumChange(maxChange);
  }, [props.data]);

  const inputChangeHandler = (e) => {
    setInputSwapLoss(e.target.value);
    if (e.target.value < 0) {
      setError({ error: true, msg: "Please select amount greater than 0" });
    }
  };
  const setCurrentIsDisabled = destinationChain ? false : true;
  const swapIsDisabled =
    enableSwap && destinationChain && inputSwaploss ? false : true;
  return (
    <div className={styles.swap}>
      {error.error && <p className={styles.error}>{error.msg}</p>}
      <h1>Most Profitable</h1>
      <div className={styles.inputAndBtn}>
        {maximumChange && (
          <input
            type="text"
            disabled
            value={`${maximumChange.name} ${
              maximumChange.market_data.price_change_percentage_24h > 0
                ? "up"
                : "down"
            } by ${maximumChange.market_data.price_change_percentage_24h.toFixed(
              2
            )} %`}
          ></input>
        )}
        <select
          className={styles.select}
          placeholder="Choose currency to swap"
          onChange={(choice) => {
            setDestinationChain(choice.target.value);
          }}
        >
          <option value="" disabled selected hidden>
            Choose currency to transfer
          </option>
          {Object.values(networkConfig).map((element) => {
            if (chainId != element.id) {
              return (
                <option key={element.id} value={element.id}>
                  {element.currency}
                </option>
              );
            }
          })}
        </select>
        <button
          className={`${styles.button} ${
            setCurrentIsDisabled ? styles.disabledButton : ""
          }`}
          onClick={async () => {
            setError({ error: false, msg: "" });
            await Moralis.enableWeb3();
            setEnableSwap(true);
            await setterRatio({
              // onComplete:
              // onError:
              onSuccess: handleSuccess,
              onError: (err) => {
                console.log(err);
                setError({
                  error: true,
                  msg: "Please set up current price correctly",
                });
                if (err) {
                  setEnableSwap(false);
                }
              },
            });
          }}
          disabled={setCurrentIsDisabled}
        >
          {isLoading || isFetching ? (
            <div className={styles.loader}></div>
          ) : (
            "Set Current Price"
          )}
        </button>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className={styles.inputFields}>
            <div className={styles.inputAddCurrency}>
              <input
                onChange={inputChangeHandler}
                value={inputSwaploss}
                type="number"
                placeholder="Amount to swap"
              />
              <div className={styles.currency}>
                {chainId && networkConfig[chainId]["currency"]}
              </div>
            </div>
            <button
              className={`${styles.button} ${
                swapIsDisabled ? styles.disabledButton : ""
              }`}
              onClick={async () => {
                setError({ error: false, msg: "" });
                await Moralis.enableWeb3();
                await transferTokens({
                  // onComplete:
                  // onError:
                  onSuccess: handleSuccess,
                  onError: (error) => {
                    console.log(error);
                    setError({
                      error: true,
                      msg: "An Error occured while swaping",
                    });
                  },
                });
              }}
              disabled={swapIsDisabled}
            >
              {isLoading || isFetching ? (
                <div className={styles.loader}></div>
              ) : (
                "Swap"
              )}
            </button>
          </div>
          {/* {error && <p style={{ color: "red" }}>Specify between 0 and 100</p>} */}
        </form>
      </div>
    </div>
  );
};
export default Swap;
