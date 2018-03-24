import React from "react";
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

const About = props => (
    <Auxilary>
        <div className={cssStyles.Outer}>
            <div className={cssStyles.PageContainer}>
                <p className={[cssStyles.Heading, cssStyles.p].join(' ')}>About</p>
                <p className={cssStyles.p}>SwapWatch is a community maintained project to help track transaction volume on the AirSwap decentralized exchange</p>
                {/* <p>This site and project is not affiliated with AirSwap</p> */}
                <p className={cssStyles.p}>Feel free to join us on <a className={cssStyles.a} href="https://t.me/airswaprojects">Telegram</a> or <a className={cssStyles.a} href="https://github.com/AirswapCommunity/swapwatch-react">GitHub</a></p>
                <p className={[cssStyles.SubHeading, cssStyles.p].join(' ')}>Main Contributors</p>
                <div className={cssStyles.ContributorContainer}>
                    <div>
                        <Avatar className={props.classes.avatar}>
                            <Avatar className={props.classes.avatarInternal}>
                                <img src={require('../../assets/images/codeNinja.png')} className={cssStyles.Photo} alt="evolve" />
                            </Avatar>
                        </Avatar>
                        <span className={cssStyles.ContributorName}>evolve</span>
                    </div>
                    <div>
                        <Avatar className={props.classes.avatar}>
                            <Avatar className={props.classes.avatarInternal}>
                                <img src={require('../../assets/images/homiedomi.png')} className={cssStyles.Photo} alt="homidomi" />
                            </Avatar>
                        </Avatar>
                        <span className={cssStyles.ContributorName}>homidomi</span>
                    </div>
                </div>
            </div>
        </div>
    </Auxilary>
);

export default withStyles(styles)(About);
