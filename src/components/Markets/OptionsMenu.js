import React from "react";
import IconButton from 'material-ui/IconButton';
import Menu, { MenuItem } from 'material-ui/Menu';


class OptionsMenu extends React.Component {
  state = {
    anchorEl: null,
  };

  handleClick = event => {
    this.setState({ anchorEl: event.currentTarget });
  };

  handleClose = (element) => {
    if(element) {
      this.props.toggleIndicator(element);
    }
    this.setState({ anchorEl: null });
  };

  render() {
    const { anchorEl } = this.state;

    const {indicator} = this.props

    var checkBollingerBand = indicator.BollingerBand ? <i className="fa fa-check"></i> : null
    var checkEMA = indicator.EMA ? <i className="fa fa-check"></i> : null
    var checkVolume = indicator.Volume ? <i className="fa fa-check"></i> : null
    
    return (
      <div>
        <IconButton
          aria-label="Options"
          aria-owns={anchorEl ? 'long-menu' : null}
          aria-haspopup="true"
          onClick={this.handleClick}
        >
          <i className="fa fa-bars"></i>
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={()=>this.handleClose('BollingerBand')}>{checkBollingerBand} Bollinger Bands</MenuItem>
          <MenuItem onClick={()=>this.handleClose('EMA')}>{checkEMA} EMA</MenuItem>
          <MenuItem onClick={()=>this.handleClose('Volume')}>{checkVolume} Volume</MenuItem>
        </Menu>
      </div>
    );
    
  }
}

export default OptionsMenu;