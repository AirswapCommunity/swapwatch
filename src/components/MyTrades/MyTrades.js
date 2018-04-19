import React from 'react';
import Auxilary from '../../hoc/Auxilary';
import cssStyles from './MyTrades.css';

const MyTrades = (props) => (
    <Auxilary>
        <div className={cssStyles.Outer}>
            <div className={cssStyles.PageContainer}>
                <div className={cssStyles.MessageContainer}>
                    <p>Coming Soon</p>
                </div>
            </div>
        </div>
    </Auxilary>
);

export default MyTrades;
