import React, { createContext, useContext } from 'react';

export interface SwipeTabContextType {
  activeRoute: string;
  navigateToTab: (route: string) => boolean;
  isInsideSwipeContainer: boolean;
}

export const SwipeTabContext = createContext<SwipeTabContextType>({
  activeRoute: '',
  navigateToTab: () => false,
  isInsideSwipeContainer: false,
});

export const useSwipeTab = () => useContext(SwipeTabContext);
