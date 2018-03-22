import React, { Component } from "react";
import Auxilary from "../../hoc/Auxilary";
import { withStyles } from 'material-ui/styles';
import Input, { InputAdornment } from 'material-ui/Input';
import Paper from "material-ui/Paper";
import { MenuItem, MenuList } from "material-ui/Menu";
import cssStyles from './AutoCompleteInput.css';

const styles = theme => ({
    input: {
        // margin: theme.spacing.unit,
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
        // margin: theme.spacing.unit,
        marginTop: 0,
        marginLeft: theme.spacing.unit,
        marginRight: theme.spacing.unit,
        marginBottom: theme.spacing.unit,
        width: '100%',
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

class AutoCompleteInput extends Component {

    constructor(props) {
        super(props);

        this.state = {
            popupVisible: false,
            inputValue: '',
            displayProperty: props.displayField || null,
            selectedItem: null
        }
    }

    handleGotFocus = (e) => {
        this.setState({ popupVisible: true });
    }

    handleLostFocus = (e) => {
        this.setState({ popupVisible: false });
    };

    handleInputChanged = (e) => {
        this.setState({ inputValue: e.target.value, selectedItem: null });

        if (!e.target.value) {

            if (this.props.cleared) {
                this.props.cleared();
            }
        }
    }

    handleItemSelected = (item) => {
        this.setState({
            popupVisible: false,
            inputValue: this.state.displayProperty ? item[this.state.displayProperty] : item,
            selectedItem: item
        });

        if (this.props.itemSelected) {
            this.props.itemSelected(item);
        }
    }

    render() {
        var popup = null;
        var error = false;
        var displayProperty = this.state.displayProperty;

        if (this.state.popupVisible && this.state.inputValue) {
            var data = this.props.children
                .filter((item) => {
                    var value = displayProperty ? item[displayProperty].toLowerCase() : item.toLowerCase();
                    return (!this.state.inputValue || value.includes(this.state.inputValue.toLowerCase()));
                })
                .map((item, i) => {
                    var displayValue = displayProperty ? item[displayProperty] : item;

                    var element = displayValue;

                    if (this.props.imageField) {
                        var path = `/tokens/${item[this.props.imageField]}`;
                        element = <div style={{display: 'flex', alignItems: 'center'}}><img src={path} alt='token logo' style={{ width: '24px', marginRight: '10px' }}/>{displayValue}</div>;
                    }

                    return <MenuItem key={i}
                        value={item}
                        onMouseDown={() => this.handleItemSelected(item)}
                        classes={{ root: this.props.classes.menuItemHovered }}>{element}</MenuItem>
                });

            error = data.length === 0;

            popup = error ? null : <Paper className={this.props.classes.paper}>
                <MenuList className={this.props.classes.menu}>{data}</MenuList>
            </Paper>;
        }

        var adorner = null;

        if (this.props.imageField && this.state.selectedItem) {
            var path = `/tokens/${this.state.selectedItem[this.props.imageField]}`;

            adorner = <InputAdornment position="start">
                <img src={path} alt='token logo' style={{ width: '24px' }}/>
            </InputAdornment>;
        }

        return (
            <Auxilary>
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    <Input
                        placeholder={this.props.placeholder}
                        className={this.props.classes.input}
                        classes={{ underline: error ? this.props.classes.underlineError : this.props.classes.underline }}
                        fullWidth
                        error={error}
                        onFocus={this.handleGotFocus}
                        onBlur={this.handleLostFocus}
                        onChange={this.handleInputChanged}
                        inputProps={{ 'aria-label': 'Description' }}
                        value={this.state.inputValue}
                        type='search'
                        startAdornment={adorner}>
                    </Input>

                    {popup}
                </div>
            </Auxilary>
        );
    }
}

export default withStyles(styles)(AutoCompleteInput);