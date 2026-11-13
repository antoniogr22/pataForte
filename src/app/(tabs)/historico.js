import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';

import Tela from '../../components/Tela';
import Avatar from '../../components/Avatar';
import Seletor from '../../components/Seletor';
import EstadoVazio from '../../components/EstadoVazio';
import { cores, raio, sombra } from '../../config/theme';
import { listarHistorico } from '../../services/agendamentosService';
import { listarAnimais } from '../../services/cadastrosService';
import { mensagemDeErro } from '../../utils/erros';
import { alerta } from '../../utils/alerta';
import { formatarDataBR, formatarMoeda } from '../../utils/horarios';

const TODOS = 'todos';

export default function HistoricoScreen() {
  const [itens, setItens] = useState([]);
  const [animais, setAnimais] = useState([]);
  const [animalId, setAnimalId] = useState(TODOS);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    listarAnimais().then(setAnimais).catch(() => {});
  }, []);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setItens(await listarHistorico(animalId === TODOS ? null : animalId));
    } catch (e) {
      await alerta('Erro ao carregar histórico', mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, [animalId]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const total = itens.reduce((soma, i) => soma + Number(i.valor), 0);

  const opcoes = [
    { id: TODOS, titulo: 'Todos os animais' },
    ...animais.map((a) => ({ id: a.id, titulo: a.nome, subtitulo: a.clientes?.nome ? `Tutor: ${a.clientes.nome}` : undefined })),
  ];

  return (
    <Tela>
      <FlatList
        data={itens}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 20, gap: 14 }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={cores.primary} />}
        ListHeaderComponent={
          <View style={{ gap: 6 }}>
            <View style={s.resumo}>
              <Text style={s.resumoLabel}>Total dos serviços realizados</Text>
              <Text style={s.resumoValor}>{formatarMoeda(total)}</Text>
            </View>
            <View style={{ marginTop: 14 }}>
              <Seletor label="Filtrar por animal" itens={opcoes} valorId={animalId} onSelect={setAnimalId} />
            </View>
          </View>
        }
        ListEmptyComponent={!carregando ? <EstadoVazio texto="Nenhum serviço concluído ainda." /> : null}
        renderItem={({ item }) => (
          <View style={s.card}>
            <Avatar uri={item.animais?.foto_url} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={s.animal}>{item.animais?.nome}</Text>
              <Text style={s.info}>{item.servicos?.nome}</Text>
              <Text style={s.info}>{formatarDataBR(item.data_servico)}</Text>
            </View>
            <Text style={s.valor}>{formatarMoeda(item.valor)}</Text>
          </View>
        )}
      />
    </Tela>
  );
}

const s = StyleSheet.create({
  resumo: { padding: 20, borderRadius: raio.lg, backgroundColor: cores.primary, ...sombra },
  resumoLabel: { color: '#D6EBE3', fontSize: 15 },
  resumoValor: { color: '#fff', fontSize: 34, fontWeight: '800', marginTop: 4 },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: cores.card, padding: 16,
    borderRadius: raio.md, ...sombra,
  },
  animal: { fontSize: 17, fontWeight: '700', color: cores.text },
  info: { fontSize: 14, color: cores.muted, marginTop: 2 },
  valor: { fontSize: 17, fontWeight: '800', color: cores.primary },
});
