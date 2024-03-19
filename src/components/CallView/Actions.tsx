// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import {
  muteCurrentCall,
  unmuteCurrentCall,
  pauseCurrentCall,
  unpauseCurrentCall,
  parkCurrentCall,
} from '../../lib/phone/call'
import { Button } from '../'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faPause,
  faPlay,
  faMicrophone,
  faMicrophoneSlash,
  faArrowDownUpAcrossLine,
  faSquareParking,
  faChevronDown,
  faChevronUp,
  faArrowRightArrowLeft,
} from '@fortawesome/free-solid-svg-icons'
import { faGridRound } from '@nethesis/nethesis-solid-svg-icons'
import { RootState, Dispatch } from '../../store'
import { useSelector, useDispatch } from 'react-redux'
import { sendDTMF } from '../../lib/webrtc/messages'
import { store } from '../../store'
import outgoingRingtone from '../../static/outgoing_ringtone'
import { TransferActions } from '../TransferView'
import { Tooltip } from 'react-tooltip/dist/react-tooltip.min.cjs'
import { useTranslation } from 'react-i18next'
import { isWebRTC } from '../../lib/user/default_device'
import { sendPhysicalDTMF } from '../../services/astproxy'
import { useEventListener, eventDispatch } from '../../utils'

const Actions: FC = () => {
  // Get multiple values from currentCall store
  const { paused, muted } = useSelector((state: RootState) => state.currentCall)
  const parked = useSelector((state: RootState) => state.currentCall.parked)

  // Get isOpen and view from island store
  const { view, actionsExpanded } = useSelector((state: RootState) => state.island)
  const transferring = useSelector((state: RootState) => state.currentCall.transferring)

  const dispatch = useDispatch<Dispatch>()

  function openKeypad() {
    dispatch.island.setIslandView(view !== 'keypad' ? 'keypad' : 'call')
    eventDispatch('phone-island-call-keypad-opened', {})
  }
  useEventListener('phone-island-call-keypad-open', () => {
    openKeypad()
  })

  function transfer() {
    // Open the transfer view
    dispatch.island.setIslandView(view !== 'transfer' ? 'transfer' : 'call')
    eventDispatch('phone-island-call-transfer-opened', {})
  }
  useEventListener('phone-island-call-transfer-open', () => {
    transfer()
  })
  useEventListener('phone-island-call-transfer-cancel', () => {
    cancelTransfer()
  })

  // Cancels the current transfer through dtmfs
  function cancelTransfer() {
    if (isWebRTC()) {
      sendDTMF('*')
    } else {
      sendPhysicalDTMF('*')
    }

    const { audioPlayerPlaying } = store.getState().player
    // Check if the local audio is already playing and start playing
    if (!audioPlayerPlaying) {
      dispatch.player.updateStartAudioPlayer({
        src: outgoingRingtone,
        loop: true,
      })
    }
    setTimeout(() => {
      if (isWebRTC()) {
        sendDTMF('1')
      } else {
        sendPhysicalDTMF('1')
      }

      dispatch.player.stopAudioPlayer()
      // The workarround to disable transfer because of the wrong conv.connection value from ws
      if (transferring) {
        setTimeout(() => {
          dispatch.currentCall.updateTransferring(false)
        }, 500)
      }

      eventDispatch('phone-island-call-transfer-canceled', {})
    }, 500)
  }

  useEventListener('phone-island-call-actions-open', () => {
    dispatch.island.toggleActionsExpanded(true)
    eventDispatch('phone-island-call-actions-opened', {})
  })
  useEventListener('phone-island-call-actions-close', () => {
    dispatch.island.toggleActionsExpanded(false)
    eventDispatch('phone-island-call-actions-closed', {})
  })
  function toggleActionsExpanded() {
    if (actionsExpanded) {
      dispatch.island.toggleActionsExpanded(false)
      eventDispatch('phone-island-call-actions-closed', {})
    } else {
      dispatch.island.toggleActionsExpanded(true)
      eventDispatch('phone-island-call-actions-opened', {})
    }
  }

  const { t } = useTranslation()

  // Phone island header section
  return (
    <>
      <div className='pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
        <Button
          variant='default'
          active={paused ? true : false}
          onClick={() => (paused ? unpauseCurrentCall() : pauseCurrentCall())}
          data-tooltip-id='tooltip'
          data-tooltip-content={paused ? `${t('Tooltip.Play')}` : `${t('Tooltip.Pause')}`}
        >
          {paused ? (
            <FontAwesomeIcon size='xl' icon={faPlay} />
          ) : (
            <FontAwesomeIcon size='xl' icon={faPause} />
          )}
        </Button>

        <Button
          variant='default'
          active={muted ? true : false}
          onClick={() => (muted ? unmuteCurrentCall() : muteCurrentCall())}
          data-tooltip-id='tooltip'
          data-tooltip-content={muted ? `${t('Tooltip.Unmute')}` : `${t('Tooltip.Mute')}`}
        >
          {muted ? (
            <FontAwesomeIcon size='xl' icon={faMicrophoneSlash} />
          ) : (
            <FontAwesomeIcon size='xl' icon={faMicrophone} />
          )}
        </Button>

        <Button
          active={transferring}
          onClick={transferring ? cancelTransfer : transfer}
          variant='default'
          data-tooltip-id='tooltip'
          data-tooltip-content={
            transferring ? `${t('Tooltip.Cancel transfer')}` : `${t('Tooltip.Transfer')}`
          }
        >
          {transferring ? (
            <FontAwesomeIcon className='' size='xl' icon={faArrowDownUpAcrossLine} />
          ) : (
            <FontAwesomeIcon size='xl' className='pi-rotate-90' icon={faArrowRightArrowLeft} />
          )}
        </Button>

        <Button
          active={actionsExpanded}
          variant='transparent'
          onClick={() => toggleActionsExpanded()}
          data-tooltip-id='tooltip'
          data-tooltip-content={
            actionsExpanded ? `${t('Tooltip.Collapse')}` : `${t('Tooltip.Expand')}`
          }
        >
          {actionsExpanded ? (
            <FontAwesomeIcon
              className='pi-text-gray-700 dark:pi-text-gray-100'
              size='xl'
              icon={faChevronUp}
            />
          ) : (
            <FontAwesomeIcon
              size='xl'
              className='pi-text-gray-700 dark:pi-text-gray-100'
              icon={faChevronDown}
            />
          )}
        </Button>
      </div>
      {/* Actions expanded section */}
      {actionsExpanded ? (
        <>
          {' '}
          <div className='pi-grid pi-grid-cols-4 pi-auto-cols-max pi-gap-y-5 pi-justify-items-center pi-place-items-center pi-justify-center'>
            <Button
              active={view === 'keypad'}
              variant='default'
              onClick={openKeypad}
              data-tooltip-id='tooltip'
              data-tooltip-content={t('Tooltip.Keyboard') || ''}
            >
              <FontAwesomeIcon size='xl' icon={faGridRound} />
            </Button>
            <Button
              active={parked}
              variant='default'
              onClick={parkCurrentCall}
              data-tooltip-id='tooltip'
              data-tooltip-content={t('Tooltip.Park') || ''}
            >
              <FontAwesomeIcon size='xl' icon={faSquareParking} />
            </Button>
            {transferring && <TransferActions />}
          </div>
        </>
      ) : (
        <></>
      )}
      {/* Buttons tooltips */}
      <Tooltip className='pi-z-20' id='tooltip' place='bottom' />
    </>
  )
}

export default Actions
