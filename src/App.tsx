import React, { type FC } from 'react'
import { Events, Socket, WebRTC, Island, RestAPI } from './components'
import { Provider } from 'react-redux'
import { store } from './store'
import { Base64 } from 'js-base64'

interface PhoneIslandProps {
  dataConfig: string
  showAlways?: boolean
}

export const PhoneIsland: FC<PhoneIslandProps> = ({ dataConfig, showAlways = false }) => {
  const CONFIG: string[] = Base64.atob(dataConfig || '').split(':')
  const HOST_NAME: string = CONFIG[0]
  const USERNAME: string = CONFIG[1]
  const AUTH_TOKEN: string = CONFIG[2]
  const SIP_EXTEN: string = CONFIG[3]
  const SIP_SECRET: string = CONFIG[4]

  return (
    <>
      <Provider store={store}>
        <WebRTC hostName={HOST_NAME} sipExten={SIP_EXTEN} sipSecret={SIP_SECRET}>
          <RestAPI hostName={HOST_NAME} username={USERNAME} authToken={AUTH_TOKEN}>
            <Socket hostName={HOST_NAME} username={USERNAME} authToken={AUTH_TOKEN}>
              <Events>
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
