import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '../context/AuthContext';
import { cores } from '../config/theme';

const headerPadrao = {
  headerStyle: { backgroundColor: cores.primary },
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerTitleStyle: { fontWeight: '700', fontSize: 19 },
  contentStyle: { backgroundColor: cores.pagina },
};

// Deslogado: só /login. Logado: tabs e todas as telas de cadastro/agendamento.
function Rotas() {
  const { session, carregando } = useAuth();

  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.pagina }}>
        <ActivityIndicator size="large" color={cores.primary} />
      </View>
    );
  }

  const logado = !!session;

  return (
    <Stack screenOptions={headerPadrao}>
      <Stack.Protected guard={!logado}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
      </Stack.Protected>

      <Stack.Protected guard={logado}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="agendamento" options={{ title: 'Novo agendamento' }} />
        <Stack.Screen name="clientes" options={{ title: 'Clientes' }} />
        <Stack.Screen name="cliente" options={{ title: 'Novo cliente' }} />
        <Stack.Screen name="animais" options={{ title: 'Animais' }} />
        <Stack.Screen name="animal" options={{ title: 'Novo animal' }} />
        <Stack.Screen name="servicos" options={{ title: 'Serviços' }} />
        <Stack.Screen name="servico" options={{ title: 'Serviço' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="light" />
        <Rotas />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
