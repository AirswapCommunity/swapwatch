import React from 'react';
import { CSSTransitionGroup } from 'react-transition-group';

const PageShell = (Page, slideIn) => {
    return props =>
    <CSSTransitionGroup
        transitionAppear={true}
        transitionAppearTimeout={600}
        transitionEnterTimeout={600}
        transitionLeaveTimeout={200}
        transitionName={slideIn ? 'SlideIn' : 'SlideOut'}
        style={{ display: 'flex', height: '100%', width: '100%' }}>
        <Page {...props} />
    </CSSTransitionGroup>
};

export default PageShell;
