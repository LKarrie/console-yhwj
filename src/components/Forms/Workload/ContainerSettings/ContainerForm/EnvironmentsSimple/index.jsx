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
import { Button, Form } from '@kube-design/components'
// import { EnvironmentInputWithDisabled } from 'components/Inputs'
import RootStore from 'stores/root'
import { lazy } from 'utils'
import EnvironmentInputWithDisabled from '../../../../../Inputs/EnvironmentInputWithDisabled'
import styles from './index.scss'

const getActions = lazy(() =>
  import(/* webpackChunkName: "actions" */ 'actions')
)

export default class Environments extends React.Component {
  constructor(props) {
    super(props)
    this.handleErrorStatus = this.handleErrorStatus.bind(this)
  }

  static propTypes = {
    onSave: PropTypes.func,
    onCancel: PropTypes.func,
  }

  static defaultProps = {
    onSave() {},
    onCancel() {},
    isSubmitting: false,
  }

  state = {
    env: this.props.env,
    envChange: false,
    hasErrorIndex: [],
  }

  rootStore = new RootStore()

  get store() {
    return this.props.detailStore
  }

  // envError = ''

  static defaultProps = {
    prefix: '',
    checkable: true,
  }

  get prefix() {
    const { prefix } = this.props

    return prefix ? `${prefix}.` : ''
  }

  componentDidMount() {
    getActions().then(actions =>
      this.rootStore.registerActions(actions.default)
    )
  }

  handleErrorStatus = (err = '', index) => {
    const { hasErrorIndex } = this.state
    // this.envError = err
    if (typeof err.message === 'undefined') {
      if (hasErrorIndex.includes(index)) {
        this.setState({ hasErrorIndex: hasErrorIndex.filter(e => e !== index) })
      }
    } else if (!hasErrorIndex.includes(index)) {
      this.setState({ hasErrorIndex: [...hasErrorIndex, index] })
    }
  }

  onChange = env => {
    this.setState({ env, envChange: true })
  }

  handleSubmit = () => {
    const { onSave } = this.props
    onSave(this.state.env)
  }

  handleCancel = () => {
    const { onCancel } = this.props
    onCancel()
  }

  // envValidator = (rule, value, callback) => {
  //   if (this.envError === '') {
  //     callback()
  //   }
  // }

  render() {
    const {
      checkable,
      namespace,
      isFederated,
      cluster,
      projectDetail,
      isSubmitting,
    } = this.props

    const { env, envChange, hasErrorIndex } = this.state

    return (
      <div className={styles.wrapper}>
        <Form.Group
          label={t('ENVIRONMENT_VARIABLE_PL')}
          desc={t('CONTAINER_ENVIRONMENT_DESC_EDIT')}
          checkable={checkable}
        >
          <Form.Item>
            <EnvironmentInputWithDisabled
              rootStore={this.rootStore}
              name={`${this.prefix}env`}
              namespace={namespace}
              isFederated={isFederated}
              cluster={cluster}
              projectDetail={projectDetail}
              handleInputError={this.handleErrorStatus}
              onChange={this.onChange}
              value={env}
            />
          </Form.Item>
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Button onClick={this.handleCancel}>{t('CANCEL')}</Button>
            <Button
              type="control"
              loading={isSubmitting}
              disabled={
                !envChange || !(hasErrorIndex.length === 0) || isSubmitting
              }
              onClick={this.handleSubmit}
            >
              {t('OK')}
            </Button>
          </div>
        </Form.Group>
      </div>
    )
  }
}
