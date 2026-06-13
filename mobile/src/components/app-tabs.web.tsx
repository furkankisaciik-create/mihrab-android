import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
  TabListProps,
} from 'expo-router/ui';
import type { Href } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';

export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <CustomTabList>
          <TabTrigger name="home" href="/" asChild>
            <TabButton>Vakitler</TabButton>
          </TabTrigger>
          <TabTrigger name="qibla" href="/qibla" asChild>
            <TabButton>Kıble</TabButton>
          </TabTrigger>
          <TabTrigger name="notifications" href="/notifications" asChild>
            <TabButton>Bildirim</TabButton>
          </TabTrigger>
          <TabTrigger name="verse" href="/verse" asChild>
            <TabButton>İçerik</TabButton>
          </TabTrigger>
          <TabTrigger name="dhikr" href="/dhikr" asChild>
            <TabButton>Zikir</TabButton>
          </TabTrigger>
          <TabTrigger name="tracker" href="/tracker" asChild>
            <TabButton>Takip</TabButton>
          </TabTrigger>
          <TabTrigger name="qada" href="/qada" asChild>
            <Pressable style={styles.hiddenTab} />
          </TabTrigger>
          <TabTrigger name="duas" href="/duas" asChild>
            <Pressable style={styles.hiddenTab} />
          </TabTrigger>
          <TabTrigger name="quran" href={'/quran' as Href} asChild>
            <Pressable style={styles.hiddenTab} />
          </TabTrigger>
          <TabTrigger name="calendar" href={'/calendar' as Href} asChild>
            <Pressable style={styles.hiddenTab} />
          </TabTrigger>
          <TabTrigger name="holy-days" href={'/holy-days' as Href} asChild>
            <Pressable style={styles.hiddenTab} />
          </TabTrigger>
          <TabTrigger name="ramadan" href={'/ramadan' as Href} asChild>
            <Pressable style={styles.hiddenTab} />
          </TabTrigger>
          <TabTrigger name="mosques" href={'/mosques' as Href} asChild>
            <Pressable style={styles.hiddenTab} />
          </TabTrigger>
          <TabTrigger name="silent-mode" href={'/silent-mode' as Href} asChild>
            <Pressable style={styles.hiddenTab} />
          </TabTrigger>
          <TabTrigger name="home-widget" href={'/home-widget' as Href} asChild>
            <Pressable style={styles.hiddenTab} />
          </TabTrigger>
          <TabTrigger name="explore" href="/explore" asChild>
            <TabButton>Plan</TabButton>
          </TabTrigger>
        </CustomTabList>
      </TabList>
    </Tabs>
  );
}

export function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...props} style={({ pressed }) => pressed && styles.pressed}>
      <View style={[styles.tabButtonView, isFocused && styles.tabButtonViewFocused]}>
        <React.Fragment>
          <View style={[styles.tabDot, isFocused && styles.tabDotFocused]} />
          <TextLabel focused={Boolean(isFocused)}>
          {children}
          </TextLabel>
        </React.Fragment>
      </View>
    </Pressable>
  );
}

export function CustomTabList(props: TabListProps) {
  return (
    <View {...props} style={styles.tabListContainer}>
      <View style={styles.innerContainer}>{props.children}</View>
    </View>
  );
}

function TextLabel({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  return <Text style={[styles.tabLabel, focused && styles.tabLabelFocused]}>{children}</Text>;
}

const styles = StyleSheet.create({
  tabListContainer: {
    position: 'absolute',
    bottom: 14,
    width: '100%',
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  innerContainer: {
    maxWidth: 430,
    width: '100%',
    padding: 6,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    shadowColor: '#183A31',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
  },
  pressed: {
    opacity: 0.7,
  },
  hiddenTab: {
    display: 'none',
  },
  tabButtonView: {
    minWidth: 42,
    paddingVertical: 8,
    paddingHorizontal: 5,
    borderRadius: 18,
    alignItems: 'center',
    gap: 3,
  },
  tabButtonViewFocused: {
    backgroundColor: '#E8F1EC',
  },
  tabDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#B3BFBB',
  },
  tabDotFocused: {
    backgroundColor: '#1A594B',
  },
  tabLabel: {
    color: '#77847F',
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelFocused: {
    color: '#174D42',
    fontWeight: '800',
  },
});
