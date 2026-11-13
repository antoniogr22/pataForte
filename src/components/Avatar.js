import React, { useEffect, useState } from 'react';
import { Image, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../config/theme';

// Miniatura redonda do pet. Sem foto (ou se falhar), mostra uma patinha.
export default function Avatar({ uri, size = 52 }) {
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [uri]);

  const base = { width: size, height: size, borderRadius: size / 2 };

  if (uri && !falhou) {
    return <Image source={{ uri }} style={[base, { backgroundColor: cores.primarySoft }]} onError={() => setFalhou(true)} />;
  }
  return (
    <View style={[base, { backgroundColor: cores.primarySoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: cores.primaryBorda }]}>
      <Ionicons name="paw" size={size * 0.48} color={cores.primary} />
    </View>
  );
}
