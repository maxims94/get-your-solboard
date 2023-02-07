import { Notification } from '@mantine/core';

export default function LoadingNotification({state}) {
  return state.is_active ? (
    <div className="LoadingNotification">
      <Notification
        loading
        disallowClose
      >
        <span className="LoadingNotificationText">{state.text}</span>
      </Notification>
    </div>
  ) : null
}
