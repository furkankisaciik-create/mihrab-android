import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

type TabGlyphProps = {
  color: string;
  glyph: string;
};

function TabGlyph({ color, glyph }: TabGlyphProps) {
  return <Text style={[styles.glyph, { color }]}>{glyph}</Text>;
}

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1A594B',
        tabBarInactiveTintColor: '#788882',
        tabBarLabelStyle: styles.label,
        tabBarStyle: styles.tabBar,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Vakitler',
          tabBarIcon: ({ color }) => <TabGlyph color={color} glyph="⌂" />,
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: 'Kıble',
          tabBarIcon: ({ color }) => <TabGlyph color={color} glyph="⌖" />,
        }}
      />
      <Tabs.Screen
        name="verse"
        options={{
          title: 'İçerik',
          tabBarIcon: ({ color }) => <TabGlyph color={color} glyph="▤" />,
        }}
      />
      <Tabs.Screen
        name="dhikr"
        options={{
          title: 'Zikir',
          tabBarIcon: ({ color }) => <TabGlyph color={color} glyph="●" />,
        }}
      />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Takip',
          tabBarIcon: ({ color }) => <TabGlyph color={color} glyph="✓" />,
        }}
      />

      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="qada" options={{ href: null }} />
      <Tabs.Screen name="duas" options={{ href: null }} />
      <Tabs.Screen name="quran" options={{ href: null }} />
      <Tabs.Screen name="calendar" options={{ href: null }} />
      <Tabs.Screen name="holy-days" options={{ href: null }} />
      <Tabs.Screen name="ramadan" options={{ href: null }} />
      <Tabs.Screen name="mosques" options={{ href: null }} />
      <Tabs.Screen name="silent-mode" options={{ href: null }} />
      <Tabs.Screen name="home-widget" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="language" options={{ href: null }} />
      <Tabs.Screen name="ai" options={{ href: null }} />
      <Tabs.Screen name="premium" options={{ href: null }} />
      <Tabs.Screen name="family" options={{ href: null }} />
      <Tabs.Screen name="stats" options={{ href: null }} />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="backup" options={{ href: null }} />
      <Tabs.Screen name="privacy" options={{ href: null }} />
      <Tabs.Screen name="release" options={{ href: null }} />
      <Tabs.Screen name="quality" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E1E9E5',
    height: 70,
    paddingBottom: 9,
    paddingTop: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
  },
  glyph: {
    fontSize: 19,
    fontWeight: '800',
  },
});
