import {
  fetchDeviceSecret,
  forgetDeviceSecret,
  peekDeviceSecret,
} from "./chipAction";

const listeners = new Set<() => void>();

export const subscribeIdentity = (cb: () => void): (() => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

export const notifyIdentity = (): void => {
  listeners.forEach((cb) => cb());
};

export const connectChip = async (): Promise<void> => {
  await fetchDeviceSecret();
  notifyIdentity();
};

export const disconnectChip = (): void => {
  forgetDeviceSecret();
  notifyIdentity();
};

export const isChipConnected = (): boolean => peekDeviceSecret() !== null;
