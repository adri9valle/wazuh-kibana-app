import React, { Component, Fragment } from 'react';
// Eui components
import {
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
  EuiPage,
  EuiTitle,
  EuiText,
  EuiTab,
  EuiTabs,
  EuiToolTip,
  EuiButtonIcon,
} from '@elastic/eui';

import { connect } from 'react-redux';

import GroupsHandler from './utils/groups-handler';

import { cleanInfo } from '../../../../../redux/actions/groupsActions';
import WzGroupsActionButtonsAgents from './actions-buttons-agents';
import WzGroupAgentsTable from './group-agents-table';

class WzGroupDetail extends Component {
  constructor(props) {
    super(props);

    this.tabs = [
      {
        id: 'agents',
        name: 'Agents',
        disabled: false,
      },
      {
        id: 'files',
        name: 'Files',
        disabled: false,
      },
    ];

    this.state = {
      selectedTabId: 'agents',
    };

    this.groupsHandler = GroupsHandler;
  }

  componentWillUnmount() {
    // When the component is going to be unmounted its info is clear
  }

  onSelectedTabChanged = id => {
    this.setState({
      selectedTabId: id,
    });
  };

  renderTabs() {
    return this.tabs.map((tab, index) => (
      <EuiTab
        {...(tab.href && { href: tab.href, target: '_blank' })}
        onClick={() => this.onSelectedTabChanged(tab.id)}
        isSelected={tab.id === this.state.selectedTabId}
        disabled={tab.disabled}
        key={index}
      >
        {tab.name}
      </EuiTab>
    ));
  }

  renderAgents() {
    return (
      <Fragment>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText color="subdued" style={{ paddingBottom: '15px' }}>
              From here you can list and manage your agents
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>
            <WzGroupAgentsTable {...this.props} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  }

  renderFiles() {
    return (
      <Fragment>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText color="subdued" style={{ paddingBottom: '15px' }}>
              From here you can list and see your group files, also, you can edit the group
              configuration
            </EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>{/* <WzGroupsTable /> */}</EuiFlexItem>
        </EuiFlexGroup>
      </Fragment>
    );
  }

  render() {
    const { itemDetail } = this.props.state;

    return (
      <EuiPage style={{ background: 'transparent' }}>
        <EuiPanel>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiFlexGroup>
                <EuiFlexItem grow={false}>
                  <EuiToolTip position="right" content={`Back to groups`}>
                    <EuiButtonIcon
                      aria-label="Back"
                      color="subdued"
                      iconSize="l"
                      iconType="arrowLeft"
                      onClick={() => this.props.cleanInfo()}
                    />
                  </EuiToolTip>
                </EuiFlexItem>
                <EuiFlexItem grow={false}>
                  <EuiTitle>
                    <h1>{itemDetail.name}</h1>
                  </EuiTitle>
                </EuiFlexItem>
              </EuiFlexGroup>
            </EuiFlexItem>
            {(this.state.selectedTabId === 'agents' && (
              <WzGroupsActionButtonsAgents {...this.props} />
            )) ||
              (this.state.selectedTabId === 'files' && <h1>Buttons</h1>)}
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem>
              <EuiTabs>{this.renderTabs()}</EuiTabs>
            </EuiFlexItem>
          </EuiFlexGroup>
          <EuiFlexGroup>
            <EuiFlexItem>
              {(this.state.selectedTabId === 'agents' && this.renderAgents()) ||
                (this.state.selectedTabId === 'files' && this.renderFiles())}
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </EuiPage>
    );
  }
}

const mapStateToProps = state => {
  return {
    state: state.groupsReducers,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    cleanInfo: () => dispatch(cleanInfo()),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WzGroupDetail);