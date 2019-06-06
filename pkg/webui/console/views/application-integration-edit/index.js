// Copyright © 2019 The Things Network Foundation, The Things Industries B.V.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React, { Component } from 'react'
import { Container, Col, Row } from 'react-grid-system'
import bind from 'autobind-decorator'
import { connect } from 'react-redux'
import { defineMessages } from 'react-intl'
import { replace } from 'connected-react-router'

import Breadcrumb from '../../../components/breadcrumbs/breadcrumb'
import { withBreadcrumb } from '../../../components/breadcrumbs/context'
import IntlHelmet from '../../../lib/components/intl-helmet'
import Message from '../../../lib/components/message'
import WebhookForm from '../../components/webhook-form'
import toast from '../../../components/toast'
import Spinner from '../../../components/spinner'

import sharedMessages from '../../../lib/shared-messages'

import { webhookSelector, fetchingSelector, errorSelector } from '../../store/selectors/webhook'
import { selectSelectedApplicationId } from '../../store/selectors/application'
import { getWebhook } from '../../store/actions/webhook'
import diff from '../../../lib/diff'

import api from '../../api'

const m = defineMessages({
  editWebhook: 'Edit Webhook',
  updateSuccess: 'Successfully updated webhook',
  deleteSuccess: 'Successfully deleted webhook',
})

const webhookEntitySelector = [
  'base_url',
  'format',
  'uplink_message',
  'join_accept',
  'downlink_ack',
  'downlink_nack',
  'downlink_sent',
  'downlink_failed',
  'downlink_queued',
  'location_solved',
]

@connect(function (state) {
  const webhook = webhookSelector(state)
  return {
    appId: selectSelectedApplicationId(state),
    webhook,
    fetching: fetchingSelector(state),
    error: errorSelector(state),
  }
}, function (dispatch, { match }) {
  const { appId, webhookId } = match.params
  return {
    getWebhook: () => dispatch(getWebhook(appId, webhookId, { selector: webhookEntitySelector })),
    navigateToList: () => dispatch(replace(`/console/applications/${appId}/integrations`)),
  }
})
@withBreadcrumb('apps.single.integrations.edit', function (props) {
  const { appId, match: { params: { webhookId }}} = props
  return (
    <Breadcrumb
      path={`/console/applications/${appId}/integrations/${webhookId}`}
      icon="general_settings"
      content={sharedMessages.edit}
    />
  )
})
@bind
export default class ApplicationIntegrationEdit extends Component {
  componentDidMount () {
    const { getWebhook } = this.props

    getWebhook()
  }

  async handleSubmit (webhook) {
    const { appId, match: { params: { webhookId }}, webhook: originalWebhook } = this.props
    const patch = diff(originalWebhook, webhook, [ 'ids' ])

    await api.application.webhooks.update(appId, webhookId, patch)
  }

  handleSubmitSuccess () {
    toast({
      message: m.updateSuccess,
      type: toast.types.SUCCESS,
    })
  }

  async handleDelete () {
    const { appId, match: { params: { webhookId }}} = this.props

    await api.application.webhooks.delete(appId, webhookId)
  }

  async handleDeleteSuccess () {
    const { navigateToList } = this.props

    toast({
      message: m.deleteSuccess,
      type: toast.types.SUCCESS,
    })

    navigateToList()
  }

  render () {
    const { webhook, fetching, error } = this.props

    if (fetching || !webhook) {
      return <Spinner center />
    }

    if (error) {
      throw error
    }

    return (
      <Container>
        <Row>
          <Col lg={8} md={12}>
            <IntlHelmet title={m.editWebhook} />
            <Message component="h2" content={sharedMessages.editWebhook} />
          </Col>
        </Row>
        <Row>
          <Col lg={8} md={12}>
            <WebhookForm
              update
              initialWebhookValue={webhook}
              onSubmit={this.handleSubmit}
              onSubmitSuccess={this.handleSubmitSuccess}
              onDelete={this.handleDelete}
              onDeleteSuccess={this.handleDeleteSuccess}
            />
          </Col>
        </Row>
      </Container>
    )
  }
}
