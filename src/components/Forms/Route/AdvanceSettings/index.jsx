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
import { get } from 'lodash'
import { MODULE_KIND_MAP } from 'utils/constants'

import { Form } from 'components/Base'

import Metadata from './Metadata'

export default class AdvancedSettings extends React.Component {
  get prefix() {
    return this.props.prefix || 'spec.template.spec.'
  }

  get cluster() {
    return this.props.cluster
  }

  get namespace() {
    return get(this.formTemplate, 'metadata.namespace')
  }

  get formTemplate() {
    const { formTemplate, module } = this.props
    return get(formTemplate, MODULE_KIND_MAP[module], formTemplate)
  }

  render() {
    const { store, formRef } = this.props
    return (
      <Form data={this.formTemplate} ref={formRef}>
        <Form.Group
          label={t('Add metadata')}
          desc={t(
            'Additional metadata settings for resources such as Label and Annotation'
          )}
          keepDataWhenUnCheck
          checkable
        >
          <Metadata
            store={store}
            prefix={this.prefix}
            cluster={this.cluster}
            namespace={this.namespace}
            formTemplate={this.formTemplate}
          />
        </Form.Group>
      </Form>
    )
  }
}
