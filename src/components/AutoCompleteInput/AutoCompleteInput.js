import React, { Component } from "react";
import Auxilary from "../../hoc/Auxilary";
import { withStyles } from 'material-ui/styles';
import Input from 'material-ui/Input';
import Paper from "material-ui/Paper";
import { MenuItem, MenuList } from "material-ui/Menu";

const styles = theme => ({
    input: {
        // margin: theme.spacing.unit,
        marginTop: theme.spacing.unit,
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        marginBottom: 0,
    },
    paper: {
        // margin: theme.spacing.unit,
        marginTop: 0,
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
        width: '100%',
    },
});

class AutoCompleteInput extends Component {

    constructor(props) {
        super(props);

        this.state = {
            popupVisible: false,
            inputValue: null
        }
    }

    handleGotFocus = (e) => {
        this.setState({ popupVisible: true });
    }

    handleLostFocus = (e) => {
        this.setState({ popupVisible: false });
    };

    handleInputChanged = (e) => {
        this.setState({ inputValue: e.target.value });
    }

    render() {
        var popup = null;
        var error = false;

        if (this.state.popupVisible && this.state.inputValue) {
            var data = this.props.children
                .filter((item) => {
                    return !this.state.inputValue || item.toLowerCase().includes(this.state.inputValue);
                })
                .map((item, i) => <MenuItem key={i} value={item}>{item}</MenuItem>);

            error = data.length === 0;

            popup = error ? null : <Paper className={this.props.classes.paper}>
                <MenuList>{data}</MenuList>
            </Paper>;
        }

        return (
            <Auxilary>
                <Input
                    placeholder={this.props.placeholder}
                    className={this.props.classes.input}
                    fullWidth
                    error={error}
                    onFocus={this.handleGotFocus}
                    onBlur={this.handleLostFocus}
                    onChange={this.handleInputChanged}
                    inputProps={{
                        'aria-label': 'Description',
                    }}
                />
                {popup}
            </Auxilary>
        );
    }
}

export default withStyles(styles)(AutoCompleteInput);