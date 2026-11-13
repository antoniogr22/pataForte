import React from 'react';
import { View, StyleSheet } from 'react-native';
import { cores, LARGURA_MAX } from '../config/theme';

// Moldura das telas: no navegador vira uma coluna central (como um celular);
// no celular ocupa a tela toda.
export default function Tela({ children, style }) {
  return (
    <View style={s.pagina}>
      <View style={[s.coluna, style]}>{children}</View>
    </View>
  );
}

const s = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: cores.pagina },
  coluna: {
    flex: 1,
    width: '100%',
    maxWidth: LARGURA_MAX,
    alignSelf: 'center',
    backgroundColor: cores.bg,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: cores.border,
  },
});
