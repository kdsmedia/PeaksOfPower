import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: Platform.select({ ios: insets.bottom + 56, android: insets.bottom + 56, default: 64 }),
          paddingTop: 6,
          paddingBottom: Platform.select({ ios: insets.bottom + 6, android: insets.bottom + 6, default: 6 }),
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'PLAY',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="casino" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'KOIN',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-balance-wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lobby"
        options={{
          title: 'LOBBY',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="grid-view" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
