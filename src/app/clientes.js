import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Tela from '../components/Tela';
import Botao from '../components/Botao';
import EstadoVazio from '../components/EstadoVazio';
import { cores, raio, sombra } from '../config/theme';
import { listarClientes } from '../services/cadastrosService';
import { mensagemDeErro } from '../utils/erros';
import { alerta } from '../utils/alerta';

export default function ClientesScreen() {
  const router = useRouter();
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setItens(await listarClientes());
    } catch (e) {
      await alerta('Erro ao carregar clientes', mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  return (
    <Tela>
      <FlatList
        data={itens}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 20, gap: 14 }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={cores.primary} />}
        ListEmptyComponent={!carregando ? <EstadoVazio texto="Nenhum cliente cadastrado ainda." /> : null}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Text style={s.nome}>{item.nome}</Text>
            <View style={s.linha}><Ionicons name="call-outline" size={16} color={cores.muted} /><Text style={s.info}>{item.telefone}</Text></View>
            {item.email ? <View style={s.linha}><Ionicons name="mail-outline" size={16} color={cores.muted} /><Text style={s.info}>{item.email}</Text></View> : null}
            {item.endereco ? <View style={s.linha}><Ionicons name="location-outline" size={16} color={cores.muted} /><Text style={s.info}>{item.endereco}</Text></View> : null}
          </View>
        )}
      />
      <View style={s.rodape}>
        <Botao titulo="+ Novo cliente" onPress={() => router.push('/cliente')} />
      </View>
    </Tela>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: cores.card, borderRadius: raio.lg, padding: 18, gap: 6, ...sombra },
  nome: { fontSize: 18, fontWeight: '800', color: cores.text, marginBottom: 2 },
  linha: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  info: { fontSize: 15, color: cores.muted, flex: 1 },
  rodape: { padding: 20, borderTopWidth: 1, borderTopColor: cores.border, backgroundColor: cores.bg },
});
