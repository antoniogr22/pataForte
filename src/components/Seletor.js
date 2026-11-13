import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cores, raio, LARGURA_MAX } from '../config/theme';

// Campo "select": abre uma lista em modal. itens = [{ id, titulo, subtitulo? }]
export default function Seletor({
  label, placeholder = 'Selecione', itens, valorId, onSelect, disabled, erro,
  vazioTexto = 'Nenhum item disponível',
}) {
  const [aberto, setAberto] = useState(false);
  const selecionado = itens.find((i) => i.id === valorId);

  return (
    <View style={s.grupo}>
      <Text style={s.label}>{label}</Text>
      <Pressable
        disabled={disabled}
        onPress={() => setAberto(true)}
        style={[s.campo, disabled && s.campoOff, erro && s.campoErro]}
      >
        <Text style={[s.valor, !selecionado && s.placeholder]} numberOfLines={1}>
          {selecionado ? selecionado.titulo : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={cores.muted} />
      </Pressable>
      {erro ? <Text style={s.erro}>{erro}</Text> : null}

      <Modal visible={aberto} transparent animationType="slide" onRequestClose={() => setAberto(false)}>
        <View style={s.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setAberto(false)} />
          <View style={s.sheet}>
            <Text style={s.sheetTitulo}>{label}</Text>
            <FlatList
              data={itens}
              keyExtractor={(i) => String(i.id)}
              ListEmptyComponent={<Text style={s.vazio}>{vazioTexto}</Text>}
              renderItem={({ item }) => (
                <Pressable
                  style={[s.item, item.id === valorId && s.itemAtivo]}
                  onPress={() => { onSelect(item.id); setAberto(false); }}
                >
                  <Text style={s.itemTitulo}>{item.titulo}</Text>
                  {item.subtitulo ? <Text style={s.itemSub}>{item.subtitulo}</Text> : null}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  grupo: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: cores.text, marginBottom: 8 },
  campo: {
    minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: cores.border, borderRadius: raio.md, paddingHorizontal: 16,
    backgroundColor: cores.card,
  },
  campoOff: { backgroundColor: '#EEF2F6' },
  campoErro: { borderColor: cores.danger },
  valor: { flex: 1, fontSize: 16, color: cores.text },
  placeholder: { color: cores.muted },
  erro: { color: cores.danger, fontSize: 13, marginTop: 6 },
  overlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    width: '100%', maxWidth: LARGURA_MAX, maxHeight: '65%', backgroundColor: cores.card,
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20,
  },
  sheetTitulo: { fontSize: 18, fontWeight: '700', color: cores.text, marginBottom: 10 },
  item: { paddingVertical: 16, paddingHorizontal: 12, borderRadius: raio.sm },
  itemAtivo: { backgroundColor: cores.primarySoft },
  itemTitulo: { fontSize: 16, color: cores.text, fontWeight: '600' },
  itemSub: { fontSize: 13, color: cores.muted, marginTop: 3 },
  vazio: { textAlign: 'center', color: cores.muted, padding: 24, fontSize: 15 },
});
