// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'

const ListAvatar: FC<ListAvatarProps> = ({ username, status }) => {
  const { avatars } = useSelector((state: RootState) => state.avatars)

  return (
    <div
      style={{
        backgroundImage: `url(${avatars && username && avatars[username] && avatars[username]})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'contain',
      }}
      className='pi-w-12 pi-h-12 pi-rounded-full pi-bg-gray-200 pi-flex-shrink-0 pi-relative'
    >
      {/* The status bullet */}
      {status && (
        <span
          style={{ marginBottom: '1px', marginRight: '1px' }}
          className={`pi-absolute pi-rounded-full pi-w-3 pi-h-3 ${
            status === 'online' ? 'pi-bg-green-600' : 'pi-bg-red-600'
          } pi-bottom-0 pi-right-0 pi-border-2 pi-border-white`}
        ></span>
      )}
    </div>
  )
}

interface ListAvatarProps {
  username?: string
  status?: string
}

export default ListAvatar
