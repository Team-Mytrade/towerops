import {
  DialogPosition,
  DialogSize,
} from './dialog.types';

export const DIALOG_SIZES: Record<DialogSize, string> = {
  sm: 'fx-dialog__panel--sm',
  md: 'fx-dialog__panel--md',
  lg: 'fx-dialog__panel--lg',
  xl: 'fx-dialog__panel--xl',
  full: 'fx-dialog__panel--full',
};

export const DIALOG_POSITIONS: Record<DialogPosition, string> = {
  center: 'fx-dialog__panel--center',
  top: 'fx-dialog__panel--top',
};