import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { cores } from '../config/theme';
import { STATUS } from '../utils/status';

export default function StatusBadge({ status }) {
  const concluido = status === STATUS.CONCLUIDO;
  return (
    <View style={[s.box, { backgroundColor: concluido ? cores.successSoft : cores.warnSoft }]}>
      <Text style={[s.txt, { color: concluido ? cores.success : cores.warn }]}>{concluido ? 'Concluído' : 'Pendente'}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  box: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  txt: { fontSize: 13, fontWeight: '700' },
});
