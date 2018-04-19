import React from 'react';
import Tabs, {Tab} from 'material-ui/Tabs';

class TabsBar extends React.Component {
  state = {
    value: 0,
  };

  handleChange = (event, value) => {
    let selectedState;
    switch (value) {
      case 0:
        selectedState = 'Candlestick';
        break;
      case 1:
        selectedState = 'Mindmap';
        break;
      case 2:
        selectedState = 'Table';
        break;
      default:
        console.log('Unexpected state set in TabsBar.');
    }
    this.props.toggleState(selectedState);
    this.setState({value});
  };

  render() {
    return (
      <Tabs
        value={this.state.value}
        onChange={this.handleChange}
        textColor="inherit"
        indicatorColor={'#4FC0FF'}
      >
        <Tab icon={<i className="fa fa-line-chart"></i>} />
        <Tab icon={<i className="fa fa-sitemap"></i>} />
        <Tab icon={<i className="fa fa-table"></i>} />
      </Tabs>
    );
  }
}


export default TabsBar;
