import React, { Component } from "react";
import Auxilary from "../../hoc/Auxilary";
import { withStyles } from 'material-ui/styles';
import Input, { InputAdornment } from 'material-ui/Input';
import Paper from "material-ui/Paper";
import { MenuItem, MenuList } from "material-ui/Menu";
import cssStyles from './AutoCompleteInput.css';

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

class AutoCompleteInput extends Component {

    constructor(props) {
        super(props);

        this.state = {
            popupVisible: false,
            inputValue: '',
            displayProperty: props.displayField || null,
            secondaryProperty: props.secondaryField || null,
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
        var value = this.state.inputValue.length === 0 ? e.target.value.toUpperCase() : e.target.value;

        this.setState({ inputValue: value, selectedItem: null, popupVisible: true });

        if (!e.target.value) {

            if (this.props.cleared) {
                this.props.cleared();
            }
        }
    }

    handleItemSelected = (item) => {
        this.setState({
            popupVisible: false,
            inputValue: this.getDisplayValue(item),
            selectedItem: item
        });

        if (this.props.itemSelected) {
            this.props.itemSelected(item);
        }
    }

    handleKeyDown = (event) => {
        if (event.key === 'Tab' || event.key === 'Enter') {
            var match = this.findMatch();

            if (match) {
                this.handleItemSelected(match);
            }
        }
    }

    findMatch = (includeSecondary = true) => {
        return this.props.children.find((item) => {
            if (!this.state.inputValue) {
                return false;
            }

            var matchesSecondary = false;

            if (includeSecondary && this.getSecondaryValue(item)) {
                matchesSecondary = this.getSecondaryValue(item).toLowerCase().startsWith(this.state.inputValue.toLowerCase());
            }

            return this.getDisplayValue(item).toLowerCase().startsWith(this.state.inputValue.toLowerCase()) || matchesSecondary;
        });
    }

    getDisplayValue = (item) => {
        return this.state.displayProperty ? item[this.state.displayProperty] : item;
    }

    getSecondaryValue = (item) => {
        return this.state.secondaryProperty ? item[this.state.secondaryProperty] : undefined;
    }
    
    render() {
        var popup = null;
        var error = false;
        var suggestedValue = '';

        if (this.state.popupVisible) {
            var data = this.props.children
                .filter((item) => {
                    if (!this.state.inputValue) {
                        return true;
                    }

                    var matchesSecondary = false;

                    if (this.getSecondaryValue(item)) {
                        matchesSecondary = this.getSecondaryValue(item).toLowerCase().includes(this.state.inputValue.toLowerCase());
                    }
                            
                    return (matchesSecondary || this.getDisplayValue(item).toLowerCase().includes(this.state.inputValue.toLowerCase()));
                })
                .sort((a, b) => {
                    var aVal = this.getDisplayValue(a);
                    var bVal = this.getDisplayValue(b);

                    return aVal.localeCompare(bVal);
                })
                .map((item, i) => {
                    var displayValue = this.getDisplayValue(item);                   
                    var secondaryValue = this.getSecondaryValue(item);

                    var element = displayValue;

                    if (this.props.imageField) {
                        var path = `/tokens/${item[this.props.imageField]}`;
                        element = <div className={cssStyles.ComplexItemWrapper}><img src={path} alt='token logo' className={cssStyles.ItemImageField} /><div className={cssStyles.ItemDisplayField}>{displayValue}</div><div className={cssStyles.ItemSecondaryField}>{secondaryValue}</div></div>;
                    }

                    return <MenuItem key={i}
                        value={item}
                        onMouseDown={() => this.handleItemSelected(item)}
                        classes={{ root: this.props.classes.menuItemHovered }}>{element}</MenuItem>
                });

            error = data.length === 0;

            if (!error) {
               var match = this.findMatch(false);
               
                if (match) {
                    suggestedValue = this.getDisplayValue(match).slice(this.state.inputValue.length);
                } else {
                    match = this.findMatch();

                    if (match) {
                        suggestedValue = this.getSecondaryValue(match).slice(this.state.inputValue.length);
                    } 
                }
            }

            popup = error ? null : <Paper className={this.props.classes.paper}>
                <MenuList className={this.props.classes.menu}>{data}</MenuList>
            </Paper>;
        }

        var adorner = null;

        if (this.props.imageField && this.state.selectedItem) {
            var path = `/tokens/${this.state.selectedItem[this.props.imageField]}`;

            adorner = <InputAdornment position="start">
                <img src={path} alt='token logo' style={{ width: '24px' }} />
            </InputAdornment>;
        }

        var suggestedElement = null;

        if (!this.state.selectedItem) {
            suggestedElement = <span style={{ position: 'absolute', top: 12, left: 8 }}>{this.state.inputValue}<span style={{ color: '#00000060' }}>{suggestedValue}</span></span>
        }

        return (
            <Auxilary>
                <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
                    {suggestedElement}
                    <Input
                        placeholder={this.props.placeholder}
                        className={this.props.classes.input}
                        classes={{ underline: error ? this.props.classes.underlineError : this.props.classes.underline }}
                        fullWidth
                        error={error}
                        onFocus={this.handleGotFocus}
                        onBlur={this.handleLostFocus}
                        onChange={this.handleInputChanged}
                        onKeyDown={this.handleKeyDown}
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