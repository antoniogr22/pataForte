import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { cores, raio } from '../config/theme';

export default function Botao({ titulo, onPress, disabled, loading, variante = 'primario', style }) {
  const inativo = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      style={({ pressed }) => [s.base, s[variante], inativo && s.inativo, pressed && !inativo && { opacity: 0.85 }, style]}
    >
      {loading ? (
        <ActivityIndicator color={variante === 'secundario' ? cores.primary : '#fff'} />
      ) : (
        <Text style={[s.texto, variante === 'secundario' && !inativo && { color: cores.primary }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: { minHeight: 52, borderRadius: raio.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  primario: { backgroundColor: cores.primary },
  secundario: { backgroundColor: cores.primarySoft },
  perigo: { backgroundColor: cores.danger },
  inativo: { backgroundColor: '#CBD5E1' },
  texto: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
