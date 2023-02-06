import { Notification } from '@mantine/core';

export default function LoadingNotification({state}) {
  return state.is_active ? (
    <div className="LoadingNotification">
      <Notification
        loading
        title={state.text}
        disallowClose
      >
      </Notification>
    </div>
  ) : null
}
