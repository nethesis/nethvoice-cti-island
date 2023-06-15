// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { type FC, useState, useRef, useEffect, useCallback, memo } from 'react'
import { useDispatch, useSelector, shallowEqual } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { Actions } from './Actions'
import { BarsGroup } from './BarsGroup'
import Progress from '../AudioPlayerView/Progress'
import { updateAudioPlayerSource } from '../../lib/phone/audio'
import fixWebmDuration from 'webm-duration-fix'
import Timer from './Timer'

// The number of groups to be created
// ...the minimun to have this effect is 2
const BAR_GROUPS_COUNT = 2

// The mime type of the recorded audio
const MIME_TYPE = 'video/webm;codecs=vp9'

export const RecorderView: FC<RecorderViewProps> = () => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const visibleContainerRef = useRef<HTMLDivElement>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const mediaChunks = useRef<BlobPart[]>([])

  // Initialize state dispatch
  const dispatch = useDispatch<Dispatch>()

  // Retrieve the local audio stream from webrtc state
  const localAudioStream = useSelector((state: RootState) => state.webrtc.localAudioStream)

  // Retrieve the local audio stream from recorder state
  const { recording, recorded } = useSelector(
    (state: RootState) => ({
      recording: state.recorder.recording,
      recorded: state.recorder.recorded,
    }),
    shallowEqual,
  )

  function handleRecordedMedia(event: BlobEvent) {
    mediaChunks.current.push(event.data)
  }

  async function handleRecordingStopped() {
    const blob = await fixWebmDuration(new Blob(mediaChunks.current, { type: MIME_TYPE }))
    const audioURL = URL.createObjectURL(blob)
    // The next function is async
    updateAudioPlayerSource(audioURL)
  }

  // Handle and manage audio recording start
  useEffect(() => {
    // @ts-ignore
    if (localAudioStream?.active && recording) {
      recorderRef.current = new MediaRecorder(localAudioStream, {
        mimeType: MIME_TYPE,
      })
      recorderRef.current.ondataavailable = handleRecordedMedia
      recorderRef.current.onstop = handleRecordingStopped
      // Start the media recording
      recorderRef.current.start()
    }
    // @ts-ignore
  }, [localAudioStream?.active, recording])

  // Handle and manage audio recorded
  useEffect(() => {
    if (recorded) {
      mediaChunks.current = []
      recorderRef.current?.stop()
    }
  }, [recorded])

  // Handle view close and reset state
  useEffect(() => {
    // Set visible container reference to recorder state
    dispatch.recorder.setVisibleContainerRef(visibleContainerRef)

    return () => {
      dispatch.recorder.reset()
    }
  }, [])

  return (
    <>
      {isOpen ? (
        <>
          {' '}
          <div className='pi-flex pi-w-full pi-justify-center pi-items-center pi-pt-4 pi-pb-9'>
            <div className='pi-font-medium pi-text-4xl pi-w-fit pi-h-fit pi-text-white'>
              <Timer />
            </div>
          </div>
          {/* Bars animation section  */}
          <div
            className={`pi-relative pi-w-full ${
              !recorded ? 'pi-h-8' : ''
            } pi-overflow-x-hidden pi-flex`}
            ref={visibleContainerRef}
          >
            {recorded ? (
              <Progress />
            ) : (
              // Create a custom numbers of bars groups
              Array.from({ length: BAR_GROUPS_COUNT }).map((_, i) => (
                <BarsGroup
                  key={i}
                  index={i}
                  startAnimation={recording}
                  audioStream={localAudioStream}
                />
              ))
            )}
          </div>
          {/* Actions section */}
          <Actions />
        </>
      ) : (
        <div className='pi-font-medium pi-text-base'>Recorder</div>
      )}
    </>
  )
}

export interface RecorderViewProps {}
