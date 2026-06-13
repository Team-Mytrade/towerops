import {
  DrawerPosition,
  DrawerSize
} from './drawer.types';

export const DRAWER_SIZES: Record<
  DrawerSize,
  string
> = {
  sm: 'w-[320px]',

  md: 'w-[480px]',

  lg: 'w-[720px]',

  xl: 'w-[960px]',

  full: 'w-screen'
};

export const DRAWER_BOTTOM_SIZES: Record<
  DrawerSize,
  string
> = {
  sm: 'h-[30vh]',

  md: 'h-[50vh]',

  lg: 'h-[70vh]',

  xl: 'h-[85vh]',

  full: 'h-screen'
};

export const DRAWER_POSITIONS: Record<
  DrawerPosition,
  string
> = {
  left:
    'left-0 top-0 h-screen border-r',

  right:
    'right-0 top-0 h-screen border-l',

  top:
    'top-0 left-0 w-screen border-b',

  bottom:
    'bottom-0 left-0 w-screen border-t rounded-t-2xl'
};