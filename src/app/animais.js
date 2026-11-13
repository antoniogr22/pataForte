import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import Tela from '../components/Tela';
import Avatar from '../components/Avatar';
import Botao from '../components/Botao';
import EstadoVazio from '../components/EstadoVazio';
import { cores, raio, sombra } from '../config/theme';
import { listarAnimais } from '../services/cadastrosService';
import { mensagemDeErro } from '../utils/erros';
import { alerta } from '../utils/alerta';

export default function AnimaisScreen() {
  const router = useRouter();
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setItens(await listarAnimais());
    } catch (e) {
      await alerta('Erro ao carregar animais', mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, []);
  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const detalhes = (a) =>
    [a.especie, a.raca, a.idade != null ? `${a.idade} ${a.idade === 1 ? 'ano' : 'anos'}` : null].filter(Boolean).join(' • ');

  return (
    <Tela>
      <FlatList
        data={itens}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 20, gap: 14 }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={cores.primary} />}
        ListEmptyComponent={!carregando ? <EstadoVazio texto="Nenhum animal cadastrado ainda." /> : null}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Avatar uri={item.foto_url} size={60} />
            <View style={{ flex: 1 }}>
              <Text style={s.nome}>{item.nome}</Text>
              <Text style={s.info}>{detalhes(item)}</Text>
              <Text style={s.info}>Tutor: {item.clientes?.nome}</Text>
            </View>
          </View>
        )}
      />
      <View style={s.rodape}>
        <Botao titulo="+ Novo animal" onPress={() => router.push('/animal')} />
      </View>
    </Tela>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: cores.card, borderRadius: raio.lg, padding: 16, ...sombra },
  nome: { fontSize: 18, fontWeight: '800', color: cores.text },
  info: { fontSize: 14, color: cores.muted, marginTop: 3 },
  rodape: { padding: 20, borderTopWidth: 1, borderTopColor: cores.border, backgroundColor: cores.bg },
});
