import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeHorizontalScrollView } from './SafeHorizontalScrollView';

export interface SelectorOption<T = string> {
  value?: T;
  id?: T;
  label?: string;
  title?: string;
  subtitle?: string;
  icon: string;
  color?: string;
  badgeText?: string;
}

interface IconCardSelectorProps<T = string> {
  options: SelectorOption<T>[];
  selectedValue?: T;
  selectedId?: T;
  onSelect: (value: T) => void;
  label?: string;
  showArrows?: boolean;
}

export function IconCardSelector<T extends string>({
  options,
  selectedValue,
  selectedId,
  onSelect,
  label,
  showArrows = true,
}: IconCardSelectorProps<T>) {
  const current = selectedValue !== undefined ? selectedValue : selectedId;
  const scrollRef = useRef<ScrollView>(null);
  const scrollOffsetRef = useRef(0);

  // Auto-scroll to selected card on selection change
  useEffect(() => {
    if (!current || !scrollRef.current) return;
    const idx = options.findIndex(
      (opt) => (opt.value !== undefined ? opt.value : opt.id) === current
    );
    if (idx > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: idx * 115, animated: true });
      }, 150);
    }
  }, [current, options]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.x;
  };

  const handleScrollStep = (direction: 'left' | 'right') => {
    const step = 150;
    const newOffset =
      direction === 'left'
        ? Math.max(0, scrollOffsetRef.current - step)
        : scrollOffsetRef.current + step;
    scrollRef.current?.scrollTo({ x: newOffset, animated: true });
    scrollOffsetRef.current = newOffset;
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        {label ? <Text style={styles.label}>{label}</Text> : <View />}

        {showArrows && options.length > 2 && (
          <View style={styles.arrowControls}>
            <TouchableOpacity
              onPress={() => handleScrollStep('left')}
              style={styles.arrowBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.arrowBtnText}>◀</Text>
            </TouchableOpacity>

            <Text style={styles.swipeHintText}>اسحب ↔️</Text>

            <TouchableOpacity
              onPress={() => handleScrollStep('right')}
              style={styles.arrowBtn}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.arrowBtnText}>▶</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <SafeHorizontalScrollView
        ref={scrollRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((opt, idx) => {
          const keyVal = (opt.value !== undefined ? opt.value : opt.id) as T;
          const displayLabel = opt.label || opt.title || String(keyVal);
          const isSelected = current === keyVal;

          return (
            <TouchableOpacity
              key={String(keyVal || idx)}
              activeOpacity={0.8}
              onPress={() => onSelect(keyVal)}
              style={[styles.card, isSelected && styles.selectedCard]}
            >
              <Text style={styles.icon}>{opt.icon}</Text>
              <Text
                style={[styles.text, isSelected && styles.selectedText]}
                numberOfLines={1}
              >
                {displayLabel}
              </Text>
              {opt.subtitle && (
                <Text
                  style={[styles.subtitle, isSelected && styles.selectedSubtitle]}
                  numberOfLines={1}
                >
                  {opt.subtitle}
                </Text>
              )}
              {opt.badgeText && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{opt.badgeText}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </SafeHorizontalScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8B0000',
    textAlign: 'right',
  },
  arrowControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  swipeHintText: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  arrowBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowBtnText: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    flexDirection: 'row',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    minWidth: 95,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  selectedCard: {
    borderColor: '#8B0000',
    backgroundColor: '#8B0000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  icon: {
    fontSize: 26,
    marginBottom: 6,
  },
  text: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  selectedText: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 2,
  },
  selectedSubtitle: {
    color: '#FDE68A',
  },
  badge: {
    marginTop: 4,
    backgroundColor: '#D4A359',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1E1B4B',
  },
});
