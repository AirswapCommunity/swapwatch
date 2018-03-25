import React from "react";
import Auxilary from "../../hoc/Auxilary";
import styles from "./Donate.css";

const Donate = props => (
    <Auxilary>
        <div className={styles.Outer}>
            <div className={styles.PageContainer}>
                <p>This is the Donate page</p>
            </div>
        </div>
    </Auxilary>
);

export default Donate;
