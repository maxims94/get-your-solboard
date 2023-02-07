import { Notification } from '@mantine/core';

export default function AlertNotification({state}) {
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
  
  return state.is_active? (
    <Alert icon={<IconAlertCircle size={16} />} title="{state.text}" color="red" variant="filled">
    </Alert>
  ) : null
}
