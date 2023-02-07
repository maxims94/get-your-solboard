import { Alert, Notification } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons';
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
    const icon = state.is_error ? <IconX size={18} /> : <IconCheck size={18} />
    const color = state.is_error ? "red" : "teal"

    return (
      <Notification icon={icon} color={color} className="AlertNotification" onClose={onCloseHandler}>
        <span className="AlertNotificationText">{state.text}</span>
      </Notification>
    )
  }

  return null
};
