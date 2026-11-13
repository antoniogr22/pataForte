import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { cores, raio } from '../config/theme';

export default function Campo({ label, erro, style, ...props }) {
  return (
    <View style={s.grupo}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={cores.muted} style={[s.input, erro && s.inputErro, style]} {...props} />
      {erro ? <Text style={s.erro}>{erro}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  grupo: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: cores.text, marginBottom: 8 },
  input: {
    minHeight: 52, borderWidth: 1, borderColor: cores.border, borderRadius: raio.md,
    paddingHorizontal: 16, backgroundColor: cores.card, color: cores.text, fontSize: 16,
  },
  inputErro: { borderColor: cores.danger },
  erro: { color: cores.danger, fontSize: 13, marginTop: 6 },
});
