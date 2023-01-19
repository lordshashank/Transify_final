import TableRow from "./TableRow";
import styles from "../styles/CoinData.module.css";

const CoinData = (props) => {
  const tableRow = props.apiData.map((row) => (
    <TableRow
      id={row.id}
      name={row.name}
      number="4"
      image={row.image.small}
      priceChange={row.market_data.price_change_percentage_24h}
      price={row.market_data.current_price.usd}
      marketCap={row.market_data.market_cap.usd}
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
