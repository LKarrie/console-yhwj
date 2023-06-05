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
import { debounce, isEmpty, isUndefined } from 'lodash'
import isEqual from 'react-fast-compare'
import classNames from 'classnames'
import { Icon, Dropdown } from '@kube-design/components'

import styles from './index.scss'

export default class Select extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    value: PropTypes.any,
    imageUrl: PropTypes.any,
    defaultValue: PropTypes.any,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func,
  }

  static defaultProps = {
    className: '',
    defaultValue: '',
    defaultimageUrl: '',
    options: [],
    onChange() {},
  }

  constructor(props) {
    super(props)
    this.state = {
      value: isUndefined(props.value) ? props.defaultValue : props.value,
      imageUrl: isUndefined(props.imageUrl)
        ? props.defaultimageUrl
        : props.imageUrl,
      showOptions: false,
      firstIntoPage: true,
    }

    this.optionsRef = React.createRef()
  }

  triggerChange = debounce(() => {
    const { onChange } = this.props

    onChange(this.state.value)
  })

  handleClick = value => {
    this.setState({ value, showOptions: false, firstIntoPage: false }, () => {
      this.triggerChange()
    })
  }

  toggleShowOptions = () => {
    this.setState({
      showOptions: !this.state.showOptions,
    })
  }

  handleShowOptions = () => {
    this.setState({ showOptions: true })
  }

  handleHideOptions = () => {
    this.setState({ showOptions: false })
  }

  renderOption(option, selected) {
    const onClick = () => this.handleClick(option.value)

    return (
      <div
        key={option.uid || option.value}
        onClick={onClick}
        className={classNames(styles.option, { [styles.selected]: selected })}
      >
        {option.label}
      </div>
    )
  }

  renderOptions() {
    const { options, disabled } = this.props
    const { value } = this.state
    const { imageUrl } = this.state

    if (disabled || isEmpty(options)) {
      return null
    }
    let selectOption = options.find(item => isEqual(item.value, value))
    // secretValue is null
    if (value === '' && this.state.firstIntoPage) {
      selectOption = options.find(item => item.url.includes(imageUrl))
    }

    return (
      <div className={styles.options}>
        {selectOption && this.renderOption(selectOption, true)}
        {this.state.firstIntoPage
          ? options
              // .filter(item => !isEqual(item.value, value))
              .filter(item => value === '' && !item.url.includes(imageUrl))
              .map(option => this.renderOption(option))
          : options
              .filter(item => !isEqual(item.value, value))
              // .filter(item => value === '' && !item.url.includes(imageUrl))
              .map(option => this.renderOption(option))}
      </div>
    )
  }

  renderControl() {
    const { value, defaultValue, placeholder, options, disabled } = this.props

    const _value = value || defaultValue
    const { imageUrl } = this.state

    let option =
      options.find(item => isEqual(item.value, _value)) || placeholder || {}
    if (this.state.firstIntoPage && value === '') {
      option =
        options.find(item => item.url.includes(imageUrl)) || placeholder || {}
    }

    return (
      <div className={styles.control}>
        <span className={styles.label}>{option.label}</span>
        {!disabled && (
          <Icon
            className={classNames(styles.rightIcon, {
              [styles.rightIcon_toggle]: this.state.showOptions,
            })}
            name="chevron-down"
            size={20}
          />
        )}
      </div>
    )
  }

  render() {
    const { className, disabled } = this.props
    return (
      <div
        className={classNames(
          styles.wrapper,
          { [styles.disabled]: disabled },
          className
        )}
        onClick={this.toggleShowOptions}
      >
        <Dropdown
          closeAfterClick={false}
          visible={this.state.showOptions}
          onOpen={this.handleShowOptions}
          onClose={this.handleHideOptions}
          content={this.renderOptions()}
        >
          {this.renderControl()}
        </Dropdown>
      </div>
    )
  }
}
