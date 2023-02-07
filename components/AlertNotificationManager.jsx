import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons';

import AlertNotification from '../components/AlertNotification'

export default function AlertNotificationManager({state}) {

  return state.is_active ? (
    <AlertNotification state={{text: state.text, is_error: state.is_error}} />
  ) : null

}
