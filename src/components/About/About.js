import React, { Component } from "react";
import ReactDOM from 'react-dom';
import Auxilary from "../../hoc/Auxilary";
import cssStyles from "./About.css";
import { withStyles } from 'material-ui/styles';
import Avatar from 'material-ui/Avatar';

const styles = theme => ({
  avatar: {
    width: '200px',
    height: '200px',
    backgroundColor: 'white',
    border: '1px solid #d0d0d0',
    margin: '20px',
  },
  avatarInternal: {
    width: '180px',
    height: '180px',
    backgroundColor: 'gainsboro',
    border: '1px solid #d0d0d0',
  },
});

class About extends Component {
  constructor(props) {
    super(props);
    this.container = null;
    this.state = {
      containerWidth: 100,
      containerHeight: 100
    }
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentDidMount() {
    this.handleWindowSizeChange();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }


  setRef = (el) => {
    this.container = el;
  }

  handleWindowSizeChange = () => {
    var width = ReactDOM.findDOMNode(this.container).clientWidth;
    if (width > 0) {
      this.setState({ containerWidth: width })
    }
  };

  render() {
    let isMobile = this.state.containerWidth <= 600;

    let photoElementStyle;
    let avatarStyle;
    let avatarInternalStyle;
    let evolveSubtext;
    if (isMobile) {
      photoElementStyle = {width: '60px'}
      avatarStyle = {width: '70px',
                     height: '70px'}
      avatarInternalStyle = {width: '60px',
                             height: '60px'}
      evolveSubtext = 'evolve';
    } else {
      photoElementStyle = {width: '180px'}
      avatarStyle = {width: '200px',
                     height: '200px'}
      avatarInternalStyle = {width: '180px',
                             height: '180px'}
      evolveSubtext = 'evolve (aka: Cryptonious)';
    }

    return (
      <Auxilary>
        <div className={cssStyles.Outer}>
          <div className={cssStyles.PageContainer} ref={this.setRef}>
            <p className={[cssStyles.Heading, cssStyles.p].join(' ')}>About</p>
            <p className={cssStyles.p}>SwapWatch is a community maintained project to help track transaction volume on the AirSwap decentralized exchange</p>
            {/* <p>This site and project is not affiliated with AirSwap</p> */}
            <p className={cssStyles.p}>Feel free to join us on <a className={cssStyles.a} href="https://t.me/airswaprojects">Telegram</a> or <a className={cssStyles.a} href="https://github.com/AirswapCommunity/swapwatch-react">GitHub</a></p>
            <p className={[cssStyles.SubHeading, cssStyles.p].join(' ')}>Main Contributors</p>
            <div className={cssStyles.ContributorContainer}>
              <div>
                <Avatar className={this.props.classes.avatar}
                        style={avatarStyle}>
                  <Avatar className={this.props.classes.avatarInternal}
                          style={avatarInternalStyle}>
                    <img src={require('../../assets/images/codeNinja.png')} 
                         style={photoElementStyle}
                         className={cssStyles.Photo}
                         alt="evolve" />
                  </Avatar>
                </Avatar>
                <span className={cssStyles.ContributorName}>{evolveSubtext}</span>
              </div>
              <div>
                <Avatar className={this.props.classes.avatar}
                        style={avatarStyle}>
                  <Avatar className={this.props.classes.avatarInternal}
                          style={avatarInternalStyle}>
                    <img src={require('../../assets/images/homiedomi.png')} 
                         style={photoElementStyle}
                         className={cssStyles.Photo} 
                         alt="homiedomi" />
                  </Avatar>
                </Avatar>
                <span className={cssStyles.ContributorName}>homiedomi</span>
              </div>
            </div>
          </div>
        </div>
      </Auxilary>
    );
  }
};

export default withStyles(styles)(About);
