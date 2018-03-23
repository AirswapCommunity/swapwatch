import React, { Component } from "react";
import Auxilary from "../../hoc/Auxilary";
import { withStyles } from 'material-ui/styles';
// import cssStyles from './CandlestickChart.css';

const styles = theme => ({
    input: {
        marginTop: theme.spacing.unit,
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        marginBottom: 0,
        fontFamily: 'Open Sans'
    },
    underline: {
        '&:after': {
            backgroundColor: '#008eff',
        },
    },
    underlineError: {
        '&:after': {
            backgroundColor: 'red',
        },
    },
    menuItemHovered: {
        fontFamily: 'Open Sans',
        '&:hover': {
            backgroundColor: '#008eff60',
        }
    },
    paper: {
        marginTop: 0,
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
        minWidth: '100%',
        position: 'absolute',
        left: 0,
        top: 40,
    },
    menu: {
        'overflow-y': 'auto',
        'overflow-x': 'hidden',
        'max-height': '400px',
    },
});


class CandlestickChart extends Component {

    constructor(props) {
        super(props);

        this.state = {
            ohlcData: null,
        }
    }


    
    render() {
        return (
            <Auxilary>
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                </div>
            </Auxilary>
        );
    }
}

export default withStyles(styles)(CandlestickChart);