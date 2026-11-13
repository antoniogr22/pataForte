import React from 'react';
import { Pressable } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import LogoHeader from '../../components/LogoHeader';
import { cores, LARGURA_MAX } from '../../config/theme';

export default function TabsLayout() {
  const { sair } = useAuth();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: cores.primary },
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        headerTitleStyle: { fontWeight: '700', fontSize: 19 },
        headerLeft: () => <LogoHeader />,
        headerRight: () => (
          <Pressable onPress={sair} style={{ marginRight: 16 }} hitSlop={12}>
            <Ionicons name="log-out-outline" size={26} color="#fff" />
          </Pressable>
        ),
        sceneStyle: { backgroundColor: cores.pagina },
        tabBarActiveTintColor: cores.primary,
        tabBarInactiveTintColor: cores.muted,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '600' },
        // a barra inferior respeita o mesmo limite de largura do conteúdo
        tabBarStyle: {
          width: '100%',
          maxWidth: LARGURA_MAX,
          alignSelf: 'center',
          backgroundColor: '#fff',
          borderTopColor: cores.border,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Agendamentos',
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="historico"
        options={{
          title: 'Histórico',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cadastros"
        options={{
          title: 'Cadastros',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
