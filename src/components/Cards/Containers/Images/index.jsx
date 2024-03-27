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
// import { ReactComponent as BackIcon } from 'assets/back.svg'
import { get, isEmpty } from 'lodash'
import { Icon, Button } from '@kube-design/components'
import {
  cpuFormat,
  memoryFormat,
  // generateId,
  // cancelContainerDot,
  // resourceLimitKey,
} from 'utils'

import SecretStore from 'stores/secret'
import LimitRangeStore from 'stores/limitrange'
// import FederatedStore from 'stores/federated'
import QuotaStore from 'stores/quota'
import WorkspaceQuotaStore from 'stores/workspace.quota'
import ProjectStore from 'stores/project'

import { Panel, List } from 'components/Base'
import ContainerFormSimple from 'components/Forms/Workload/ContainerSettings/ContainerForm/Simple'

import styles from './index.scss'

export default class ContainerImages extends React.Component {
  constructor(props) {
    super(props)
    this.formRef = React.createRef()
    this.state = {
      // showContainer: false,
      selectContainer: {},
      selectContainerIndex: null,
      // limitRange: {},
      imageRegistries: [],
      // replicas: this.getReplicas(),
      // leftQuota: {},
    }

    // this.module = props.module

    this.limitRangeStore = new LimitRangeStore()
    this.imageRegistryStore = new SecretStore()
    this.quotaStore = new QuotaStore()
    this.workspaceQuotaStore = new WorkspaceQuotaStore()
    this.projectStore = new ProjectStore()

    // if (props.isFederated) {
    //   this.limitRangeStore = new FederatedStore({
    //     module: this.limitRangeStore.module,
    //   })
    //   this.imageRegistryStore = new FederatedStore({
    //     module: this.imageRegistryStore.module,
    //   })
    // }

    // this.handleContainer = this.handleContainer.bind(this)
    // this.containerRef = React.createRef()

    this.handleContainer = this.handleContainer.bind(this)
  }

  static propTypes = {
    className: PropTypes.string,
    detail: PropTypes.object,
    onContainersChange: PropTypes.func,
    namespace: PropTypes.string,
  }

  componentDidMount() {
    this.fetchData()
  }

  fetchData() {
    // 暂时不太清楚 为什么要做判断
    // const { isFederated } = this.props

    // const params = {
    //   cluster,
    //   namespace: get(this.formTemplate, 'metadata.namespace'),
    // }
    const params = {
      cluster: this.props.detail.cluster,
      namespace: this.props.detail.namespace,
    }

    Promise.all([
      this.limitRangeStore.fetchListByK8s(params),
      // isFederated
      //   ? this.imageRegistryStore.fetchList({
      //       ...params,
      //       limit: -1,
      //       type: `kubernetes.io/dockerconfigjson`,
      //     })
      //   : this.imageRegistryStore.fetchListByK8s({
      //       ...params,
      //       fieldSelector: `type=kubernetes.io/dockerconfigjson`,
      //     }),
      this.imageRegistryStore.fetchListByK8s({
        ...params,
        fieldSelector: `type=kubernetes.io/dockerconfigjson`,
      }),
    ]).then(([limitRanges, imageRegistries]) => {
      this.setState({
        limitRange: get(limitRanges, '[0].limit'),
        imageRegistries,
      })
    })
  }

  handleContainer(container) {
    // console.log('handleContainer')
    const containers = this.props.detail.containers
    containers.splice(this.state.selectContainerIndex, 1, container)
    this.props.onContainersChange(containers)

    // if (has(data, 'resources.limits')) {
    //   data.resources.limits = omitBy(data.resources.limits, isEmpty)
    // }

    // data.type = data.type || 'worker'

    // merge init containers and worker containers, in order to fix container type change.
    // const containers = get(
    //   this.fedFormTemplate,
    //   `${this.prefix}spec.containers`,
    //   []
    // ).map(c => ({ ...c, type: 'worker' }))
    // const initContainers = get(
    //   this.fedFormTemplate,
    //   `${this.prefix}spec.initContainers`,
    //   []
    // ).map(c => ({ ...c, type: 'init' }))

    // const mergedContainers = concat(containers, initContainers)

    // const { selectContainer } = this.state
    // // find if data exist in all containers
    // const containerIndex = mergedContainers.findIndex(
    //   item => item.name === selectContainer.name
    // )

    // // update containers
    // if (containerIndex > -1) {
    //   mergedContainers[containerIndex] = data
    // } else {
    //   mergedContainers.push(data)
    // }

    // // split mergedContainers and update formTemplate
    // const _containers = []
    // const _initContainers = []
    // mergedContainers.forEach(item => {
    //   if (item.type === 'worker') {
    //     delete item.type
    //     _containers.push(item)
    //   } else {
    //     delete item.type
    //     _initContainers.push(item)
    //   }
    // })

    // _initContainers.forEach(item => {
    //   cancelContainerDot(item)
    // })

    // _containers.forEach(item => {
    //   cancelContainerDot(item)
    // })

    // set(this.fedFormTemplate, `${this.prefix}spec.containers`, _containers)
    // set(
    //   this.fedFormTemplate,
    //   `${this.prefix}spec.initContainers`,
    //   _initContainers
    // )
  }

  handleEdit(container, index) {
    // console.log('edit')
    this.setState({
      selectContainer: container || {},
      selectContainerIndex: index,
    })
  }

  hideContainer(current) {
    current.setState({
      selectContainer: {},
    })
  }

  renderContainerForm(selectContainer) {
    // const {
    //   withService,
    //   isFederated,
    //   cluster,
    //   supportGpuSelect,
    //   projectDetail,
    // } = this.props
    const { limitRange, imageRegistries } = this.state
    // const type = !data.image ? 'Add' : 'Edit'
    const params = {
      limitRange,
      imageRegistries,
    }
    return (
      <div>
        {/* <Form ref={this.formRef} data={selectContainer} > */}
        <ContainerFormSimple
          type={'Edit'}
          // module={this.module}
          namespace={this.props.namespace}
          data={selectContainer}
          // projectDetail={projectDetail}
          onSave={this.handleContainer}
          onCancel={() => {
            this.hideContainer(this)
          }}
          // withService={withService}
          // isFederated={isFederated}
          // workspaceQuota={this.workspaceQuota}
          // cluster={cluster}
          // supportGpuSelect={supportGpuSelect}
          // containers={this.containers}
          {...params}
        />
        {/* </Form> */}
      </div>
    )
  }

  getExtras(container) {
    const limits = get(container, 'resources.limits', {})
    const requests = get(container, 'resources.requests', {})
    let extras
    if (isEmpty(limits) && isEmpty(requests)) {
      extras = (
        <div className={styles.limits}>
          <Icon name="exclamation" />
          <span>&nbsp;{t('NO_RESOURCE_LIMIT')}</span>
        </div>
      )
    } else {
      extras = (
        <div className={styles.limits}>
          {(limits.cpu || requests.cpu) && (
            <span className={styles.limit}>
              <Icon name="cpu" size={20} />
              <span>{`${requests.cpu ? cpuFormat(requests.cpu) : 0} – ${
                limits.cpu ? cpuFormat(limits.cpu) : '∞'
              }`}</span>
            </span>
          )}
          {(limits.memory || requests.memory) && (
            <span className={styles.limit}>
              <Icon name="memory" size={20} />
              {`${
                requests.memory ? `${memoryFormat(requests.memory)} MiB` : 0
              } – ${
                limits.memory ? `${memoryFormat(limits.memory)} MiB` : '∞'
              }`}
            </span>
          )}
        </div>
      )
    }
    return extras
  }

  getExtras2(container) {
    const limits = get(container, 'resources.limits', {})
    const requests = get(container, 'resources.requests', {})
    let extras
    if (isEmpty(limits) && isEmpty(requests)) {
      extras = (
        <div className={styles.limits2}>
          <Icon name="exclamation" />
          <span>&nbsp;{t('NO_RESOURCE_LIMIT')}</span>
        </div>
      )
    } else {
      extras = (
        <div className={styles.limits2}>
          {(limits.cpu || requests.cpu) && (
            <span className={styles.limit}>
              <Icon name="cpu" size={18} style={{ marginRight: '6px' }} />
              &nbsp;CPU:&nbsp;
              <span>{`${requests.cpu ? cpuFormat(requests.cpu) : 0} – ${
                limits.cpu ? cpuFormat(limits.cpu) : '∞'
              }`}</span>
            </span>
          )}
          {(limits.memory || requests.memory) && (
            <span className={styles.limit}>
              <Icon name="memory" size={20} />
              &nbsp;内存:&nbsp;
              {`${
                requests.memory ? `${memoryFormat(requests.memory)} MiB` : 0
              } – ${
                limits.memory ? `${memoryFormat(limits.memory)} MiB` : '∞'
              }`}
            </span>
          )}
        </div>
      )
    }
    return extras
  }

  renderContainers() {
    const containers = this.props.detail.containers
    const { showContainer, selectContainer } = this.state
    if (showContainer) {
      return this.renderContainerForm(selectContainer)
    }

    return containers.map((item, index) => (
      <div className={styles.oneline}>
        <div className={styles.limitsdiv}>{this.getExtras2(item)}</div>
        <List.Item
          className="psbcitem"
          key={index}
          icon="docker"
          title={item.name}
          description={t('IMAGE_VALUE', { value: item.image })}
          // extras={this.getExtras(item)}
          operations={
            this.props.enableEdit ? (
              <Button
                type="flat"
                icon="pen"
                onClick={() => {
                  this.handleEdit(item, index)
                }}
              />
            ) : null
          }
        />
      </div>
    ))
  }

  render() {
    const { className, loading, ...rest } = this.props
    // const title = this.props.title || t('CONTAINER_PL')
    const { selectContainer } = this.state

    if (!(Object.keys(selectContainer).length === 0)) {
      return this.renderContainerForm(selectContainer)
    }

    return (
      <Panel
        className={classnames(styles.card, 'PanelYhwj')}
        // title={title}
        {...rest}
      >
        {this.renderContainers()}
      </Panel>
    )
  }
}
