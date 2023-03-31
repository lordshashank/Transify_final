import TableRow from "./TableRow";
import styles from "../styles/CoinData.module.css";

const CoinData = (props) => {
  const tableRow = props.apiData.map((row) => (
    <TableRow
      id={row.id}
      name={row.name}
      number="4"
      image={row.image}
      priceChange={row.price_change_percentage_24h}
      // priceChange="66"
      price={row.current_price}
      marketCap={row.market_cap}
    />
  ));
  return (
    <div className={styles.coinList}>
      <table className="styles.table">
        <thead>
          <tr>
            <th>Name (testnets)</th>
            <th>Last Price</th>
            <th>24h Change</th>
            <th>Market Cap</th>
          </tr>
        </thead>
        <tbody>{tableRow}</tbody>
      </table>
    </div>
  );
};

export default CoinData;
