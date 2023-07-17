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
import { get, set, isEmpty } from 'lodash'
import classnames from 'classnames'
import { Icon, InputSearch, Loading } from '@kube-design/components'
import Select from './Select'
import Input from './Input'

import styles from './index.scss'

export default class DropdownContent extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      dockerList: [],
      harborList: [],
      hubData: {},
      visible: false,
      isLoading: false,
      secretChange: false,
    }
    this.store = props.store
    this.dropContentRef = React.createRef()
  }

  static defaultProps = {
    imageRegistries: [],
    className: '',
    value: '',
    onChange: () => {},
  }

  get secretValue() {
    const { formTemplate } = this.props

    // pullSecret not found is bug
    return get(formTemplate, 'pullSecret', '')
  }

  get hubType() {
    switch (this.secretValue) {
      case '':
        if (this.registryUrl.includes('harbor') && !this.state.secretChange) {
          return 'harbor'
        }
        // 内网取消 dockerhub
        // return 'dockerHub'
        return 'harbor'
      case 'harbor':
        return 'harbor'
      default:
        return 'others'
    }
  }

  get registryUrl() {
    const { imageRegistries } = this.props
    // const { value } = this.props
    if (!isEmpty(imageRegistries) && this.secretValue) {
      const selectedSecret = imageRegistries.find(
        item => item.value === this.secretValue
      )

      let url = get(selectedSecret, 'url', '')
      if (url) {
        // remove url scheme
        url = url.replace(/^(http(s)?:\/\/)?(.*)$/, '$3')
        return url
      }
    }
    if (this.secretValue === '') {
      let imageUrl = imageRegistries.length === 0 ? '' : imageRegistries[0].url
      imageUrl = imageUrl.replace(/^(http(s)?:\/\/)?(.*)$/, '$3')
      // return url
      return imageUrl
    }

    return ''
  }

  get registryUrlWithoutImageName() {
    const { imageRegistries } = this.props
    if (!isEmpty(imageRegistries) && this.secretValue) {
      const selectedSecret = imageRegistries.find(
        item => item.value === this.secretValue
      )

      let url = get(selectedSecret, 'url', '')
      if (url) {
        // remove url scheme
        url = url.replace(/^(http(s)?:\/\/)?(.*)$/, '$3')
        return url
      }
    }

    return ''
  }

  get imageName() {
    const { value } = this.props

    if (value.startsWith(this.registryUrl)) {
      const reg = new RegExp(`${this.registryUrl}(/)?`)
      return value.replace(reg, '')
    }

    return value
  }

  get secretsOptions() {
    const { imageRegistries } = this.props
    const options = imageRegistries.map(item => ({
      label: `${item.value} (${item.url})`,
      // label: `${item.value}`,
      value: item.value,
      url: item.url,
    }))
    // 内网取消 dockerhub
    // return [{ label: `Docker Hub`, value: '', url: '' }, ...options]
    return [...options]
  }

  componentDidMount() {
    // 内网取消 dockerhub
    // this.fetchDockerList()
  }

  componentWillUnmount() {
    this.isUnMounted = true
    document.removeEventListener('click', this.handleDOMClick)
  }

  handleDOMClick = e => {
    if (
      this.dropContentRef &&
      this.dropContentRef.current &&
      !this.dropContentRef.current.contains(e.target)
    ) {
      this.hideContent()
    }
  }

  showContent = () => {
    // console.log('showContent')

    this.setState({ visible: true }, () => {
      document.addEventListener('click', this.handleDOMClick)

      if (this.hubType !== 'dockerHub') {
        // this.fetchHarborList('', this.state.harborData)
        if (this.state.harborData) {
          this.fetchHarborListWithTags('', this.state.harborData)
        } else {
          const harborData = this.props.imageRegistries.filter(hub =>
            hub.url.includes(this.registryUrl)
          )[0]
          const tmp = (this.imageName || '').split(':')
          const searchnanme = tmp[0]
          this.fetchHarborListWithTags(searchnanme, harborData)
        }
      }
      this.render
    })
  }

  hideContent = () => {
    if (this.hubType !== 'dockerHub') {
      this.setState({ harborList: [] })
    }

    this.setState({ visible: false }, () => {
      document.removeEventListener('click', this.handleDOMClick)
    })
  }

  handleDetailRedirect = e => {
    const { image } = e.currentTarget.dataset

    window.open(`https://hub.docker.com/_/${image}`)
  }

  handleSecretChange = value => {
    if (value) {
      const harborData = this.props.imageRegistries.filter(
        hub => hub.value === value
      )[0]

      this.setState({ harborData })
    }

    const { formTemplate } = this.props

    set(formTemplate, 'pullSecret', value)
    // this.props.onChange(this.registryUrl)
    this.props.onChange(this.registryUrlWithoutImageName)
    this.setState({ secretChange: true })
  }

  handleInputChange = (e, value) => {
    let image = value
    // if (this.registryUrl) {
    if (this.registryUrlWithoutImageName) {
      image = `${this.registryUrl}/${value}`.replace(/\/+/g, '/')
    }
    image = image.replace(/\s+/g, '')
    this.props.onChange(image)
  }

  handleKeyUp = e => {
    if (e.keyCode === 13) {
      this.handleConfirm()
    }
  }

  handleConfirm = () => {
    if (this.imageName) {
      this.props.onEnter()
    }
  }

  handleDockerImageSelected = async e => {
    const { image, logo, short_description } = e.currentTarget.dataset
    this.props.onChange(image)
    this.hideContent()
    this.props.onEnter({ logo, short_description })
  }

  handleHarborImageSelected = async imageDetail => {
    const { harborData } = this.state
    const projectName = imageDetail.project_name
    const repository = imageDetail.repository_name.replace(
      `${projectName}/`,
      ''
    )

    const tag = await this.fetchHarborImageTag(
      harborData,
      projectName,
      repository
    )
    const image = `${imageDetail.repository_name}:${tag}`
    const logo = ''
    const short_description = ''
    this.props.onChange(`${this.registryUrl}/${image}`)
    this.hideContent()
    this.props.onEnter({ logo, short_description })
  }

  handleHarborImageShowTags = async imageDetail => {
    const image = imageDetail.repository_name
    const logo = ''
    const short_description = ''
    this.props.onChange(`${this.registryUrl}/${image}`)
    this.hideContent()
    this.props.onEnter({ logo, short_description })
  }

  handleSearchDockerHub = keyword => {
    this.fetchDockerList(keyword)
  }

  handleSearchHarbor = keyword => {
    // this.fetchHarborList(keyword, this.state.harborData)
    if (this.state.harborData) {
      this.fetchHarborListWithTags(keyword, this.state.harborData)
    } else {
      const harborData = this.props.imageRegistries.filter(hub =>
        hub.url.includes(this.registryUrl)
      )[0]
      this.fetchHarborListWithTags(keyword, harborData)
    }
  }

  fetchDockerList = async keyword => {
    this.setState({ isLoading: true })

    const result = await this.store
      .getDockerImagesLists({
        q: keyword || '',
        image_filter: keyword ? undefined : 'official',
        page_size: 10,
        type: 'image',
      })
      .finally(() => {
        !this.isUnMounted && this.setState({ isLoading: false })
      })

    !this.isUnMounted &&
      this.setState({ dockerList: get(result, 'summaries', []) })
  }

  fetchHarborList = async (keyword, harborData) => {
    const url = get(harborData, 'url')

    if (!url || isEmpty(harborData)) return

    this.setState({ isLoading: true })

    const result = await this.store
      .getHarborImagesLists({
        harborData,
        params: {
          q: keyword || '',
        },
      })
      .finally(() => {
        !this.isUnMounted && this.setState({ isLoading: false })
      })

    !this.isUnMounted &&
      this.setState({ harborList: get(result, 'repository', []) })
  }

  fetchHarborListWithTags = async (keyword, harborData) => {
    const url = get(harborData, 'url')
    if (!url || isEmpty(harborData)) return

    const tmp = (keyword || '').split(':')
    const searchnanme = tmp[0]
    let searchtag = ''
    if (tmp.length > 1) {
      searchtag = tmp[1]
    }

    this.setState({ isLoading: true })

    const result = await this.store.getHarborImagesLists({
      harborData,
      params: {
        q: searchnanme,
      },
    })
    const images = get(result, 'repository', [])

    const res = []
    if (images && images.length > 0) {
      // tags
      for (const image of images) {
        const projectName = image.project_name
        const repository = image.repository_name.replace(`${projectName}/`, '')

        const resultWithTags = await this.store.getHarborImageTag(
          harborData,
          projectName,
          repository,
          {
            with_tag: true,
            with_scan_overview: true,
            with_label: true,
            page_size: 5,
            page: 1,
          }
        )

        if (
          resultWithTags &&
          resultWithTags.length > 0 &&
          resultWithTags[0].tags.length > 0
        ) {
          resultWithTags.map(e => {
            const imageWithTag = { ...image }
            if (e.tags && e.tags.length > 0) {
              imageWithTag.repository_name = `${image.repository_name}:${e.tags[0].name}`
              // console.log(`searchtag ${searchtag}`)
              // console.log(e.tags[0].name.includes(searchtag))
              if (e.tags[0].name.includes(searchtag)) {
                res.push(imageWithTag)
              }
            } else if (searchtag === '') {
              // console.log('image tag is <none>')
              // if (searchtag === '') {
              // console.log('searchtag is null')
              imageWithTag.repository_name = image.repository_name
              res.push(imageWithTag)
              // }
            }
            return null
          })
        }
      }
    }
    !this.isUnMounted && this.setState({ isLoading: false, harborList: res })
  }

  fetchHarborImageTag = async (harborData, projectName, repository) => {
    const result = await this.store.getHarborImageTag(
      harborData,
      projectName,
      repository,
      {
        with_tag: true,
        with_scan_overview: true,
        with_label: true,
        page_size: 15,
        page: 1,
      }
    )
    // get latest version
    if (result && result.length > 0 && result[0].tags.length > 0) {
      return result[0].tags[0].name
    }
    return ''
  }

  renderContent = () => {
    if (this.state.visible) {
      return (
        <div
          className={classnames(styles.dropContent, {
            [styles.dropContent_hide]: !this.state.visible,
          })}
          ref={this.dropContentRef}
        >
          <div className={styles.header}>
            <InputSearch
              className={styles.search}
              onSearch={
                this.hubType === 'dockerHub'
                  ? this.handleSearchDockerHub
                  : this.handleSearchHarbor
              }
              placeholder={t('SEARCH')}
            />
            {this.state.isLoading && (
              <Loading className="float-left" size={28} />
            )}
          </div>
          {this.hubType === 'dockerHub'
            ? this.renderDockerList()
            : this.renderHarborList()}
        </div>
      )
    }
    return null
  }

  renderDockerList() {
    if (isEmpty(this.state.dockerList)) {
      return (
        <ul className={styles.listContent}>
          <div
            className={classnames(styles.selectedContent, styles.emptyContent)}
          >
            <div>
              <Icon name="docker" className={styles.icon} />
              <p className={styles.desc}>{t('NO_IMAGE_FOUND')}</p>
            </div>
          </div>
        </ul>
      )
    }

    return (
      <ul className={styles.listContent}>
        {this.state.dockerList.map(image => (
          <li className={styles.ImageItem} key={image.name}>
            <img
              src={get(image, 'logo_url.large') || '/assets/no_img.svg'}
              alt={image.name}
            />
            <div className={styles.info}>
              <p
                onClick={this.handleDockerImageSelected}
                className={styles.clickable}
                data-image={image.slug}
                data-logo={get(image, 'logo_url.large', '')}
                data-short_description={image.short_description}
              >
                {image.name}
              </p>
              <p>{image.short_description}</p>
            </div>
            <div className={styles.starContainer}>
              <Icon className={styles.star} name="star" />
              {image.star_count}
            </div>
            <div className={styles.actions}>
              <span
                className={styles.clickable}
                onClick={this.handleDetailRedirect}
                data-image={image.slug}
              >
                <Icon name="paper" size={16} changeable />
              </span>
              <span
                className={styles.clickable}
                onClick={this.handleDockerImageSelected}
                data-image={image.slug}
                data-logo={get(image, 'logo_url.large', '')}
                data-short_description={image.short_description}
              >
                <Icon name="check" size={16} changeable />
              </span>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  renderHarborList() {
    if (isEmpty(this.state.harborList)) {
      return (
        <ul className={styles.listContent}>
          <div
            className={classnames(styles.selectedContent, styles.emptyContent)}
          >
            <div>
              <Icon name="docker" className={styles.icon} />
              <p className={styles.desc}>{t('NO_IMAGE_FOUND')}</p>
            </div>
          </div>
        </ul>
      )
    }
    return (
      <ul className={styles.listContent}>
        {this.state.harborList.map(image => (
          <li className={styles.ImageItem} key={image.repository_name}>
            <img src={'/assets/no_img.svg'} alt={image.repository_name} />
            <div className={styles.info}>
              <p
                // onClick={e => this.handleHarborImageSelected(image, e)}
                onClick={e => this.handleHarborImageShowTags(image, e)}
                className={styles.clickable}
              >
                {image.repository_name}
              </p>
            </div>
            <div className={styles.actions}>
              <span
                className={styles.clickable}
                // onClick={e => this.handleHarborImageSelected(image, e)}
                onClick={e => this.handleHarborImageShowTags(image, e)}
              >
                <Icon name="check" size={16} changeable />
              </span>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  render() {
    return (
      <>
        <Input
          className={styles.imageInput}
          onChange={this.handleInputChange}
          value={this.imageName}
          autoComplete="off"
          placeholder={
            this.secretValue ? 'nginx:latest' : t('IMAGE_PLACEHOLDER')
          }
          onBlur={this.handleConfirm}
          onKeyUp={this.handleKeyUp}
        >
          <Select
            value={this.secretValue}
            imageUrl={this.registryUrl}
            className={styles.secretSelect}
            options={this.secretsOptions}
            onChange={this.handleSecretChange}
            disabled={this.secretsOptions.length <= 1}
          />
        </Input>
        {this.hubType !== 'others' &&
        !globals.config.enableImageSearch ? null : (
          <Icon
            name="templet"
            changeable
            className={styles.dropDownIcon}
            onClick={this.showContent}
          />
        )}
        {this.renderContent()}
      </>
    )
  }
}
