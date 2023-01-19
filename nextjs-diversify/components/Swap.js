import classes from "../styles/CoinData.module.css";
import { contractAddresses, abi } from "../constants";
// dont export from moralis when using react
import { useMoralis, useWeb3Contract } from "react-moralis";
import { useEffect, useState, useRef } from "react";
import { useNotification } from "@web3uikit/core";
import { ethers } from "ethers";
import { networkConfig } from "../helper.config";

const Swap = (props) => {
  const {
    Moralis,
    isWeb3Enabled,
    chainId: chainIdHex,
    account,
    deactivateWeb3,
    user,
  } = useMoralis();

  const [inputSwaploss, setInputSwapLoss] = useState();
  const [chainId, setChainId] = useState("5");
  const [userAccount, setUserAccount] = useState();
  // const [currentChainPrice, setCurrentChainPrice] = useState("0");
  // const [destinationChainPrice, setDestinationChainPrice] = useState("0");
  const [priceRatio, setPriceRatio] = useState();
  const [error, setError] = useState(false);
  const [destinationChain, setDestinationChain] = useState();
  useEffect(() => {
    setChainId(parseInt(chainIdHex));
    setUserAccount(account);

    // async () => {
    //   setChainId(parseInt(chainIdHex));

    // };
  }, [isWeb3Enabled]);
  console.log(isWeb3Enabled);
  // if (isWeb3Enabled) {
  // useEffect(() => {
  //   const x = props.data.filter(
  //     (e) => e.name == networkConfig[chainId]["name"]
  //   )[0].market_data.current_price.usd;
  // }, [isWeb3Enabled]);
  // }
  //
  console.log(0);
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
  }, [Moralis]);
  const contractAddress =
    chainId in contractAddresses ? contractAddresses[chainId][0] : null;
  const swapLoss = props.swapLoss;
  console.log(chainId);
  // if (chainId) {

  // }
  // setCurrentChainPrice(
  //   props.data.filter((e) => e.name == networkConfig[chainId]["name"])[0]
  //     .market_data.current_price.usd
  // );
  // setDestinationChainPrice(
  //   props.data.filter(
  //     (e) => e.name == networkConfig[destinationChain]["name"]
  //   )[0].market_data.current_price.usd
  // );
  // setPriceRatio(currentChainPrice / destinationChainPrice);
  // const currentChainPrice = props.data.filter(
  //   (e) => e.name == networkConfig[chainId]["name"]
  // )[0].market_data.current_price.usd;
  // const destinationChainPrice = props.data.filter(
  //   (e) => e.name == networkConfig[destinationChain]["name"]
  // )[0].market_data.current_price.usd;
  // priceRatio = currentChainPrice / destinationChainPrice;
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
  }, [props.data, chainId]);
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
  // console.log((priceRatio * 1000000).toFixed(0));
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

  let max = [];
  if (props.data) {
    const priceData = props.data.map((data) => {
      return data.market_data.price_change_percentage_24h;
    });
    const maxPrice = Math.max(priceData[0], priceData[1], priceData[2]);
    max = props.data.filter(
      (data) => data.market_data.price_change_percentage_24h == maxPrice
    );
  }

  const inputChangeHandler = (e) => {
    setInputSwapLoss(e.target.value);
  };

  return (
    <div className={classes.swap}>
      <h1>Most Profitable</h1>
      <div className={classes.inputAndBtn}>
        {max != [] &&
          max.map((max) => (
            <input
              type="text"
              disabled
              value={`${max.name} ${
                max.market_data.price_change_percentage_24h > 0 ? "up" : "down"
              } by ${max.market_data.price_change_percentage_24h.toFixed(2)} %`}
            ></input>
          ))}
        <select
          className={classes.select}
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
              return <option value={element.id}>{element.currency}</option>;
            }
          })}
        </select>
        <button
          className={classes.button}
          onClick={async () => {
            await Moralis.enableWeb3();
            await setterRatio({
              // onComplete:
              // onError:
              onSuccess: handleSuccess,
              onError: (error) => console.log(error),
            });
          }}
          disabled={isLoading || isFetching}
        >
          {isLoading || isFetching ? (
            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
          ) : (
            "Set Current Price"
          )}
        </button>
        <form
          className={classes.form}
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <div className={classes.inputFields}>
            <div className={classes.inputAddCurrency}>
              <input
                onChange={inputChangeHandler}
                value={inputSwaploss}
                type="number"
                placeholder="Amount to swap"
              />
              <div className={classes.currency}>
                {chainId && networkConfig[chainId]["currency"]}
              </div>
            </div>
            <button
              className={classes.button}
              onClick={async () => {
                if (!inputSwaploss) return;
                await Moralis.enableWeb3();
                await transferTokens({
                  // onComplete:
                  // onError:
                  onSuccess: handleSuccess,
                  onError: (error) => console.log(error),
                });
              }}
              disabled={isLoading || isFetching}
            >
              {isLoading || isFetching ? (
                <div className="animate-spin spinner-border h-80 w-80 border-b-2 rounded-full"></div>
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
