import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

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
}

export function IconCardSelector<T extends string>({
  options,
  selectedValue,
  selectedId,
  onSelect,
  label,
}: IconCardSelectorProps<T>) {
  const current = selectedValue !== undefined ? selectedValue : selectedId;

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
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
              <Text style={[styles.text, isSelected && styles.selectedText]} numberOfLines={1}>
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8B0000',
    marginBottom: 8,
    textAlign: 'right',
  },
  scrollContent: {
    paddingHorizontal: 4,
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
