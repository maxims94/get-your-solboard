import { Notification, Loader } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';
import { useState } from 'react';

// state = {active, type, text, ts}
// All three are mandatory
// type = "loading" | "success" | "failure"
// ts is a timestamp

const MAX_DURATION = 5000

export default function OverlayNotification({state}) {

  // Internal decision to show or not
  const [show, setShow] = useState(true)
  
  // For automatic fading
  const [timeoutId, setTimeoutId] = useState()
  
  // To check for changes
  const [prevState, setPrevState] = useState({active: false, type: null, text: null, ts:null})

  const onCloseHandler = () => {
    setShow(false)
  }

  const isNewState = !(state.active == prevState.active && state.type == prevState.type && state.text == prevState.text && state.ts == prevState.ts)

  //console.log("render, isnewstate?:", isNewState)
  
  if (isNewState) {
    console.log("new notifier state")

    if (timeoutId) {
      console.log("Clear timeout")
      clearTimeout(timeoutId)
      setTimeoutId(null)
    }

    if (state.active) {
      setShow(true)

      if (state.type == "success" || state.type == "failure") {

        const tmp = setTimeout(() => {
          console.log("Timeout triggered")
          setShow(false)
        }, MAX_DURATION)

        setTimeoutId(tmp)
      }
    }

    setPrevState(state)
  }

  if (!(show && state.active)) {
    return null
  }

  if (state.type == "loading") {
    return (
      <Notification
        loading
        disallowClose
        className="OverlayNotification"
        // onClose={onCloseHandler}
      >
        <span className="OverlayNotificationText">{state.text}</span>
      </Notification>
    )
  }

  if (state.type == "success") {
    return (
      <Notification icon={<IconCheck size={18} />} color="teal" className="OverlayNotification" onClose={onCloseHandler}>
        <span className="OverlayNotificationText">{state.text}</span>
      </Notification>
    )
  }

  if (state.type == "failure") {
    return (
      <Notification icon={<IconX size={18} />} color="red" className="OverlayNotification" onClose={onCloseHandler}>
        <span className="OverlayNotificationText">{state.text}</span>
      </Notification>
    )
  }

  throw new Error("Invalid type")
}

/*
import { Alert, Notification } from '@mantine/core';
import { useState, useEffect } from 'react';

const MAX_DURATION = 5000

export default function AlertNotification({ state }) {
  const [show, setShow] = useState(!!state.text);

  useEffect(() => {
    if (state.text) {
      setShow(true);
      const timer = setTimeout(() => {setShow(false)}, MAX_DURATION);
      return () => {clearTimeout(timer)};
    }
  }, [state.text]);
  
  if (state.text == null) {
    return null
  }

  if (show) {

    //const onCloseHandler = () => setShow(false)
    const onCloseHandler = () => {}
    const icon = state.is_error ?  : 
    const color = state.is_error ? "red" : "teal"

    return (
      <Notification icon={icon} color={color} className="AlertNotification" onClose={onCloseHandler}>
        <span className="AlertNotificationText">{state.text}</span>
      </Notification>
    )
  }

  return null
};
*/
