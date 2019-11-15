/*
 * Wazuh app - React component for registering agents.
 * Copyright (C) 2015-2019 Wazuh, Inc.
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Find more information about this on the LICENSE file.
 */
import React, { Component } from 'react';
import {
  EuiSideNav,
  EuiIcon
} from '@elastic/eui';

import {
  updateRulesetSection,
  updateLoadingStatus,
  updateItems,
  toggleShowFiles,
  cleanFilters,
  updateAdminMode,
  updateError,
  updateIsProcessing,
  updatePageIndex,
} from '../../../../redux/actions/rulesetActions';

import checkAdminMode from './utils/check-admin-mode';

import { WzRequest } from '../../../../react-services/wz-request';

import { connect } from 'react-redux';

class WzRulesetSideMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedItemName: 'rules'
    };

    this.rulesetSections = {
      management: { id: 'management', text: 'Management' },
      ruleset: { id: 'ruleset', text: 'Ruleset' },
      rules: { id: 'rules', text: 'Rules' },
      decoders: { id: 'decoders', text: 'Decoders' },
      lists: { id: 'lists', text: 'CDB lists' },
      groups: { id: 'groups', text: 'Groups' },
      configuration: { id: 'configuration', text: 'Configuration' },
    };

    this.paths = {
      rules: '/rules',
      decoders: '/decoders',
      lists: '/lists/files'
    }

    this.wzReq = WzRequest;
  }

  componentDidMount() {
    // Fetch the data in the first mount
    this.fetchData(this.rulesetSections.rules.id);
  }

  /**
 * Fetch the data for a section: rules, decoders, lists...
 * @param {String} newSection 
 */
  async fetchData(newSection) {
    try {
      const currentSection = this.props.state.section;
      if (Object.keys(this.props.state.filters).length && newSection === currentSection) return; // If there's any filter and the section is de same doesn't fetch again
      this.props.updateItems([]);// Clean the items to avoid flick
      this.props.changeSection(newSection);
      this.props.updateLoadingStatus(true);
      const result = await this.wzReq.apiReq('GET', this.paths[newSection], {});
      const items = result.data.data.items;
      //Set the admin mode
      const admin = await checkAdminMode();
      this.props.updateAdminMode(admin);
      this.props.updateItems(items);
      this.props.toggleShowFiles(false);
      this.props.changeSection(newSection);
      this.props.updateLoadingStatus(false);
    } catch (error) {
      this.props.updateError(error);
    }
  }

  clickMenuItem = async name => {
    const section = name;
    if(this.state.selectedItemName !== section){
      this.setState({
        selectedItemName: section,
      });
    this.props.cleanFilters();
    this.props.updateIsProcessing(true);
    this.props.updatePageIndex(0);
    if (['rules', 'decoders', 'lists'].includes(section)) {
      this.fetchData(section);
    } else if(section === 'ruleset') {
      this.fetchData(this.rulesetSections.rules.id);
    } else{

    }
  }
  };

  createItem = (item, data = {}) => {
    // NOTE: Duplicate `name` values will cause `id` collisions.
    return {
      ...data,
      id: item.id,
      name: item.text,
      isSelected: this.state.selectedItemName === item.id,
      onClick: () => this.clickMenuItem(item.id),
    };
  };

  render() {
    const sideNav = [
      this.createItem(this.rulesetSections.management, {
        icon: <EuiIcon type="indexRollupApp" />,
        items: [
          this.createItem(this.rulesetSections.ruleset, {
            disabled: true,
            icon: <EuiIcon type="managementApp" />,
            forceOpen: true,
            items: [
              this.createItem(this.rulesetSections.rules),
              this.createItem(this.rulesetSections.decoders),
              this.createItem(this.rulesetSections.lists),
            ],
          }),
          this.createItem(this.rulesetSections.groups, {
            icon: <EuiIcon type="spacesApp" />,
          }),
          this.createItem(this.rulesetSections.configuration, {
            icon: <EuiIcon type="devToolsApp" />,
          })
        ],
      })
    ];

    return (
      <EuiSideNav
        items={sideNav}
        style={{ padding: 16 }}
      />
    );
  }
}

const mapStateToProps = (state) => {
  return {
    state: state.rulesetReducers
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeSection: section => dispatch(updateRulesetSection(section)),
    updateLoadingStatus: status => dispatch(updateLoadingStatus(status)),
    updateItems: items => dispatch(updateItems(items)),
    toggleShowFiles: status => dispatch(toggleShowFiles(status)),
    cleanFilters: () => dispatch(cleanFilters()),
    updateAdminMode: status => dispatch(updateAdminMode(status)),
    updateError: error => dispatch(updateError(error)),
    updateIsProcessing: isPorcessing => dispatch(updateIsProcessing(isPorcessing)),
    updatePageIndex: pageIndex => dispatch(updatePageIndex(pageIndex))
  }
};



export default connect(mapStateToProps, mapDispatchToProps)(WzRulesetSideMenu);