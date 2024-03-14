import React, { type FC, useState, useEffect } from 'react'
import { Events, Socket, WebRTC, Island, RestAPI } from './components'
import { Provider } from 'react-redux'
import { store } from './store'
import { Base64 } from 'js-base64'
import wakeUpWorker from './workers/wake_up'
import loadI18n from './lib/i18n'

import 'react-tooltip/dist/react-tooltip.css'
import { useEventListener, eventDispatch, setJSONItem, getJSONItem } from './utils'
import { detach } from './lib/webrtc/messages'
import { checkDarkTheme, setTheme } from './lib/darkTheme'

interface PhoneIslandProps {
  dataConfig: string
  i18nLoader?: () => void
  showAlways?: boolean
}

interface DeviceInputOutputTypes {
  deviceId: string
}

export const PhoneIsland: FC<PhoneIslandProps> = ({ dataConfig, i18nLoader = undefined, showAlways = false }: PhoneIslandProps) => {
  const CONFIG: string[] = Base64.atob(dataConfig || '').split(':')
  const HOST_NAME: string = CONFIG[0]
  const USERNAME: string = CONFIG[1]
  const AUTH_TOKEN: string = CONFIG[2]
  const SIP_EXTEN: string = CONFIG[3]
  const SIP_SECRET: string = CONFIG[4]
  const SIP_HOST: string = CONFIG[5]
  const SIP_PORT: string = CONFIG[6]

  // Initialize the state to manage the reload events
  const [reload, setReload] = useState<boolean>(false)
  const [reloadedWebRTC, setReloadedWebRTC] = useState<boolean>(false)
  const [reloadedSocket, setReloadedSocket] = useState<boolean>(false)

  useEffect(() => {
    const worker = new Worker(wakeUpWorker, { type: 'module' })
    worker.onmessage = (event: MessageEvent<string>) => {
      // Handle wakeup message
      if (event.data === 'wakeup') {
        setReload(true)
      }
    }

    return () => {
      worker.terminate()
    }
  }, [])

  useEffect(() => {
    if (reloadedSocket && reloadedWebRTC) {
      setReload(false)
      setReloadedWebRTC(false)
      setReloadedSocket(false)
    }
  }, [reloadedSocket, reloadedWebRTC])

  useEventListener('phone-island-call-keypad-close', () => {
    store.dispatch.island.setIslandView('call')
    eventDispatch('phone-island-call-keypad-closed', {})
  })
  useEventListener('phone-island-call-transfer-close', () => {
    store.dispatch.island.setIslandView('call')
    eventDispatch('phone-island-call-transfer-closed', {})
  })
  useEventListener('phone-island-recording-close', () => {
    store.dispatch.island.setIslandView(null)
    eventDispatch('phone-island-recording-closed', {})
  })
  useEventListener('phone-island-audio-player-close', () => {
    store.dispatch.island.setIslandView(null)
    eventDispatch('phone-island-audio-player-closed', {})
  })

  useEventListener('phone-island-detach', (data) => {
    detach()
    store.dispatch.currentUser.updateCurrentDefaultDevice(data?.deviceInformationObject)
    eventDispatch('phone-island-detached', {})
  })

  useEventListener('phone-island-audio-input-change', (data: DeviceInputOutputTypes) => {
    setJSONItem('phone-island-audio-input-device', { deviceId: data.deviceId })
    eventDispatch('phone-island-audio-input-changed', {})
  })
  useEventListener('phone-island-audio-output-change', (data: DeviceInputOutputTypes) => {
    const remoteAudioElement: any = store.getState().player.remoteAudio
    // set audio output
    remoteAudioElement?.current
      .setSinkId(data.deviceId)
      .then(function () {
        console.info('Default audio output device change with success!')
        // set device to localstorage
        setJSONItem('phone-island-audio-output-device', { deviceId: data.deviceId })

        // dispatch event
        eventDispatch('phone-island-audio-output-changed', {})
      })
      .catch(function (err) {
        console.error('Default audio output device change error:', err)
      })
  })

  const [firstRenderI18n, setFirstRenderI18n] = useState(true)
  const [firstAudioOutputInit, setFirstAudioOutputInit] = useState(true)

  //initialize i18n
  useEffect(() => {
    if (firstRenderI18n) {
      i18nLoader ? i18nLoader() : loadI18n()
      setFirstRenderI18n(false)
    }
  }, [firstRenderI18n])

  const remoteAudioElement: any = store.getState().player.remoteAudio

  //get output device from localstorage
  useEffect(() => {
    if (firstAudioOutputInit && remoteAudioElement) {
      const defaultAudioOutputDevice: any = getJSONItem(
        `phone-island-audio-output-device`,
      )?.deviceId
      eventDispatch('phone-island-audio-output-change', { deviceId: defaultAudioOutputDevice })
      setFirstAudioOutputInit(false)
    }
  }, [firstAudioOutputInit, remoteAudioElement])

  useEffect(() => {
    checkDarkTheme()
  }, [])

  useEventListener('phone-island-theme-change', (theme: any) => {
    setTheme(theme?.selectedTheme)
  })

  return (
    <>
      <Provider store={store}>
        <WebRTC
          hostName={HOST_NAME}
          sipExten={SIP_EXTEN}
          sipSecret={SIP_SECRET}
          sipHost={SIP_HOST}
          sipPort={SIP_PORT}
          reload={reload}
          reloadedCallback={() => setReloadedWebRTC(true)}
        >
          <RestAPI hostName={HOST_NAME} username={USERNAME} authToken={AUTH_TOKEN}>
            <Socket
              hostName={HOST_NAME}
              username={USERNAME}
              authToken={AUTH_TOKEN}
              reload={reload}
              reloadedCallback={() => setReloadedSocket(true)}
            >
              <Events sipHost={SIP_HOST}>
                <Island showAlways={showAlways} />
              </Events>
            </Socket>
          </RestAPI>
        </WebRTC>
      </Provider>
    </>
  )
}

PhoneIsland.displayName = 'PhoneIsland'
