import React, { useRef } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSwipeTab } from '../../context/SwipeTabContext';

export interface SafeHorizontalScrollViewProps extends ScrollViewProps {
  children?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const SafeHorizontalScrollView = React.forwardRef<
  ScrollView,
  SafeHorizontalScrollViewProps
>((props, ref) => {
  const { setSwipeEnabled } = useSwipeTab();
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const disableSwipe = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
    setSwipeEnabled(false);
  };

  const scheduleEnableSwipe = (delay = 350) => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = setTimeout(() => {
      setSwipeEnabled(true);
      resetTimerRef.current = null;
    }, delay);
  };

  return (
    <View
      style={[styles.container, props.containerStyle]}
      onStartShouldSetResponderCapture={() => {
        disableSwipe();
        return false;
      }}
      onMoveShouldSetResponderCapture={() => {
        disableSwipe();
        return false;
      }}
      onTouchStart={disableSwipe}
      onTouchEnd={() => scheduleEnableSwipe(350)}
      onTouchCancel={() => scheduleEnableSwipe(200)}
    >
      <ScrollView
        ref={ref}
        horizontal
        nestedScrollEnabled={true}
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        {...props}
        onScrollBeginDrag={(e) => {
          disableSwipe();
          props.onScrollBeginDrag?.(e);
        }}
        onScrollEndDrag={(e) => {
          scheduleEnableSwipe(350);
          props.onScrollEndDrag?.(e);
        }}
        onMomentumScrollBegin={(e) => {
          disableSwipe();
          props.onMomentumScrollBegin?.(e);
        }}
        onMomentumScrollEnd={(e) => {
          scheduleEnableSwipe(150);
          props.onMomentumScrollEnd?.(e);
        }}
      >
        {props.children}
      </ScrollView>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});
