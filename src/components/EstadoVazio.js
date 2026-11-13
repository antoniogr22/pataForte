import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, sombra } from '../config/theme';

// Empty state: patinha grande centralizada + texto
export default function EstadoVazio({ texto }) {
  return (
    <View style={s.card}>
      <View style={s.circulo}>
        <Ionicons name="paw-outline" size={86} color={cores.primary} />
      </View>
      <Text style={s.texto}>{texto}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: cores.card, borderRadius: raio.lg, paddingVertical: 48, paddingHorizontal: 24,
    alignItems: 'center', ...sombra,
  },
  circulo: {
    width: 176, height: 176, borderRadius: 88, backgroundColor: cores.primarySoft,
    borderWidth: 3, borderColor: cores.primaryBorda, alignItems: 'center', justifyContent: 'center',
  },
  texto: { marginTop: 28, fontSize: 20, color: cores.text, textAlign: 'center' },
});
