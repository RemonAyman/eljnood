import React, { createContext, useContext } from 'react';

export interface SwipeTabContextType {
  activeRoute: string;
  navigateToTab: (route: string) => boolean;
  isInsideSwipeContainer: boolean;
  swipeEnabled: boolean;
  setSwipeEnabled: (enabled: boolean) => void;
}

export const SwipeTabContext = createContext<SwipeTabContextType>({
  activeRoute: '',
  navigateToTab: () => false,
  isInsideSwipeContainer: false,
  swipeEnabled: true,
  setSwipeEnabled: () => {},
});

export const useSwipeTab = () => useContext(SwipeTabContext);
