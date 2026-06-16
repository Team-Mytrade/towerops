import { environment } from '../../../environments/environment';

export const REALTIME_CONFIG = {
  websocketUrl: environment.realtime.websocketUrl,

  mqtt: {
    brokerUrl: environment.realtime.mqtt.brokerUrl,
    username: environment.realtime.mqtt.username,
    password: environment.realtime.mqtt.password,
    clientIdPrefix: environment.realtime.mqtt.clientIdPrefix,
  },
};