// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { Story, Meta } from '@storybook/react'
import React from 'react'
import { PhoneIsland } from '../App'
import { eventDispatch, useEventListener } from '../utils'

const meta = {
  title: 'Phone Island',
  component: PhoneIsland,
  argTypes: {},
  parameters: {
    controls: { expanded: true },
  },
}

export default meta as Meta

// Uses the configuration token from .env
const config = process.env.CONFIG_TOKEN
const transferNumber = process.env.DEST_TRANSFER_NUMBER

const CallTemplate: Story<any> = (args) => {
  const handleExtensionCallStart = () => {
    eventDispatch('phone-island-call-start', { number: process.env.DEST_NUMBER_EXTENSION })
  }

  const handleExternalCallStart = () => {
    eventDispatch('phone-island-call-start', { number: process.env.DEST_NUMBER_EXTERNAL })
  }

  const handleTransferCall = () => {
    eventDispatch('phone-island-transfer-call', { to: process.env.DEST_TRANSFER_NUMBER })
  }

  let transferObject: any = {}
  transferObject.to = transferNumber
  return (
    <div className='pi-flex pi-gap-2 pi-flex-col pi-w-fit'>
      <button
        onClick={handleExtensionCallStart}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Call Extension Number ({process.env.DEST_NUMBER_EXTENSION})
      </button>
      <button
        onClick={handleExternalCallStart}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Call External Number ({process.env.DEST_NUMBER_EXTERNAL})
      </button>
      <button
        onClick={() => handleTransferCall()}
        className='pi-flex pi-content-center pi-items-center pi-justify-center pi-font-medium pi-tracking-wide pi-transition-colors pi-duration-200 pi-transform focus:pi-outline-none focus:pi-ring-2 focus:pi-z-20 focus:pi-ring-offset-2 disabled:pi-opacity-75 pi-bg-sky-600 pi-text-white pi-border pi-border-transparent hover:pi-bg-sky-700 focus:pi-ring-sky-500 focus:pi-ring-offset-white pi-rounded-md pi-px-3 pi-py-2 pi-text-sm pi-leading-4'
      >
        Transfer ({process.env.DEST_TRANSFER_NUMBER})
      </button>
      <PhoneIsland dataConfig={config} showAlways={false} {...args} />
    </div>
  )
}

export const Call = CallTemplate.bind({})
Call.args = {}
