import React from "react";
import styles from "./Markets.css";
import Auxilary from "../../hoc/Auxilary";

import AutoCompleteInput from "../AutoCompleteInput/AutoCompleteInput";

const Markets = props => {
    const data = ['AirSwap', 'Wrapped Eth'];

    return (
        <Auxilary>
            <div className={styles.Outer}>
                <div className={styles.Container}>
                    <div style={{ float: 'left', width: '33%' }}>
                        <AutoCompleteInput placeholder="Token 1">{data}</AutoCompleteInput>
                    </div>
                    <div style={{ float: 'left', width: '33%', marginLeft: '10%' }}>
                        <AutoCompleteInput placeholder="Token 2">{data}</AutoCompleteInput>
                    </div>
                </div>
            </div>
        </Auxilary>
    );
}

export default Markets;
