import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Logo do cabeçalho: patinha + "PataForte"
export default function LogoHeader() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 16 }}>
      <Ionicons name="paw" size={26} color="#fff" />
      <Text style={{ color: '#fff', fontSize: 21, fontWeight: '800' }}>PataForte</Text>
    </View>
  );
}
