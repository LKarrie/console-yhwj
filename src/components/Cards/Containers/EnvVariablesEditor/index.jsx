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
import classnames from 'classnames'
import { isEmpty } from 'lodash'

import { Icon } from '@kube-design/components'
import { Card } from 'components/Base'
import EnvironmentsSimple from 'components/Forms/Workload/ContainerSettings/ContainerForm/EnvironmentsSimple'
import styles from './index.scss'

const HIDE_RULE = ['password', 'secret']

export default class ContainerItem extends React.Component {
  constructor(props) {
    super(props)
    this.handleEnv = this.handleEnv.bind(this)
    this.handleEnvClose = this.handleEnvClose.bind(this)
  }

  static propTypes = {
    className: PropTypes.string,
    detail: PropTypes.object,
    expand: PropTypes.bool,
    loading: PropTypes.bool,
    onEnvChange: PropTypes.func,
  }

  static defaultProps = {
    detail: {},
    expand: false,
    loading: true,
  }

  state = {
    isExpand: this.props.expand,
    defaultExpand: this.props.expand,
    isEdit: false,
    isSubmitting: false,
  }

  static getDerivedStateFromProps(props, state) {
    if (props.expand !== state.defaultExpand) {
      return {
        isExpand: props.expand,
        defaultExpand: props.expand,
      }
    }

    return null
  }

  componentDidMount() {
    this.setState({
      isSubmitting: false,
    })
  }

  handleHideValue = name => {
    const _name = name.toLowerCase()
    let isHide = false
    HIDE_RULE.forEach(item => {
      if (_name.includes(item)) {
        isHide = true
      }
    })
    return isHide
  }

  handleExpand = () => {
    this.setState({
      isExpand: !this.state.isExpand,
    })
  }

  handleEdit = () => {
    this.state.isExpand
      ? this.setState({
          isEdit: !this.state.isEdit,
        })
      : this.setState({
          // isEdit: this.state.isEdit ? true : true,
          isEdit: true,
          isExpand: true,
        })
  }

  handleEnv(env) {
    const { detail } = this.props
    detail.env = env
    this.setState({ isSubmitting: true })
    this.props.onEnvChange(detail, () => {
      this.setState({ isSubmitting: false })
    })
  }

  handleEnvClose() {
    this.setState({
      isEdit: false,
    })
  }

  renderTitle() {
    const { type, name } = this.props.detail
    return (
      <div className={styles.title}>
        <Icon name="docker" size={20} />
        {type === 'init'
          ? t('INIT_CONTAINER_VALUE', { value: name })
          : t('CONTAINER_VALUE', { value: name })}
      </div>
    )
  }

  renderOperations() {
    return (
      <div
        style={{ display: 'flex' }}
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <div className={styles.arrow} onClick={this.handleExpand}>
          <Icon name="caret-down" size={12} type="light" />
        </div>
        {this.props.enableEdit ? (
          <div className={styles.edit} onClick={this.handleEdit}>
            <Icon
              name={this.state.isEdit ? 'close' : 'pen'}
              size={12}
              type="light"
            />
          </div>
        ) : null}
      </div>
    )
  }

  renderContent() {
    const { variables } = this.props.detail

    if (isEmpty(variables)) return null

    return (
      <div
        className={styles.content}
        onClick={e => {
          e.stopPropagation()
        }}
      >
        <ul className={styles.variables}>
          {variables.map(({ name, value }) => {
            const isHider = this.handleHideValue(name)
            const _value = isHider ? '******' : value
            return (
              <li key={name}>
                <div className={styles.name}>{name}</div>
                <div>{_value}</div>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  render() {
    const {
      isFederated,
      cluster,
      namespace,
      projectDetail,
      env,
    } = this.props.detail

    const { isSubmitting } = this.state

    return (
      <>
        <Card
          className={classnames(styles.main, {
            [styles.expanded]: this.state.isExpand,
          })}
          title={this.renderTitle()}
          operations={this.renderOperations()}
          empty={t('EMPTY_WRAPPER', { resource: t('ENVIRONMENT_VARIABLE') })}
          loading={this.props.loading}
          onClick={this.handleExpand}
        >
          {this.state.isEdit ? (
            <div
              onClick={e => {
                e.stopPropagation()
              }}
            >
              <EnvironmentsSimple
                namespace={namespace}
                isFederated={isFederated}
                cluster={cluster}
                projectDetail={projectDetail}
                checkable={false}
                env={env}
                onSave={this.handleEnv}
                onCancel={this.handleEnvClose}
                isSubmitting={isSubmitting}
              />
            </div>
          ) : (
            this.renderContent()
          )}
        </Card>
      </>
    )
  }
}
