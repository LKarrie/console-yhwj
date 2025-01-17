/*
 * This file is part of KubeSphere Console.
 * Copyright (C) 2019 The KubeSphere Console Authors.
 *
 * KubeSphere Console is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * KubeSphere Console is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with KubeSphere Console.  If not, see <https://www.gnu.org/licenses/>.
 */

import React from 'react'
import PropTypes from 'prop-types'

import EditModal from 'components/Modals/Edit'

import FormsConfig from './config'

export default class EditConfigTemplateModal extends React.Component {
  static propTypes = {
    module: PropTypes.string,
  }

  static defaultProps = {
    module: 'deployments',
  }

  get forms() {
    return FormsConfig[this.props.module]
  }

  render() {
    const { module, ...rest } = this.props
    // console.log("编辑")
    return (
      <EditModal
        title="EDIT_SETTINGS"
        icon="storage"
        module={module}
        forms={this.forms}
        {...rest}
      />
    )
  }
}
