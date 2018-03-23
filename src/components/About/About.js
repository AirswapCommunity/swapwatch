import React from "react";
import Auxilary from "../../hoc/Auxilary";
import styles from "./About.css";

const About = props => (
    <Auxilary>
        <div className={styles.Outer}>
            <div className={styles.PageContainer}>
                <p>This is the About page</p>
            </div>
        </div>
    </Auxilary>
);

export default About;
