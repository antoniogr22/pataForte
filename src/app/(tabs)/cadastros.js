import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Tela from '../../components/Tela';
import { cores, raio, sombra } from '../../config/theme';

const MENU = [
  { rota: '/clientes', icone: 'people-outline', titulo: 'Clientes', desc: 'Nome, telefone, endereço e e-mail' },
  { rota: '/animais', icone: 'paw-outline', titulo: 'Animais', desc: 'Pets de cada cliente, com foto' },
  { rota: '/servicos', icone: 'pricetags-outline', titulo: 'Serviços', desc: 'Catálogo e controle de valores' },
];

export default function CadastrosScreen() {
  const router = useRouter();
  return (
    <Tela>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>
        {MENU.map((m) => (
          <Pressable key={m.rota} onPress={() => router.push(m.rota)} style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }]}>
            <View style={s.icone}>
              <Ionicons name={m.icone} size={28} color={cores.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.titulo}>{m.titulo}</Text>
              <Text style={s.desc}>{m.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color={cores.muted} />
          </Pressable>
        ))}
      </ScrollView>
    </Tela>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: cores.card, padding: 18, borderRadius: raio.lg, ...sombra },
  icone: { width: 56, height: 56, borderRadius: 16, backgroundColor: cores.primarySoft, alignItems: 'center', justifyContent: 'center' },
  titulo: { fontSize: 18, fontWeight: '800', color: cores.text },
  desc: { fontSize: 14, color: cores.muted, marginTop: 3 },
});
