import React from "react";
import Auxilary from "../../hoc/Auxilary";
import styles from "./MyTrades.css";

const MyTrades = props => (
    <Auxilary>
        <div className={styles.Outer}>
            <div className={styles.PageContainer}>
                <p>This is the MyTrades page</p>
            </div>
        </div>
    </Auxilary>
);

export default MyTrades;
