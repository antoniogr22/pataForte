import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import Tela from '../../components/Tela';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import Botao from '../../components/Botao';
import EstadoVazio from '../../components/EstadoVazio';
import { cores, raio, sombra } from '../../config/theme';
import { listarAgendamentos, concluirAgendamento } from '../../services/agendamentosService';
import { mensagemDeErro } from '../../utils/erros';
import { alerta, confirmar } from '../../utils/alerta';
import { STATUS } from '../../utils/status';
import { formatarDataBR, formatarMoeda, normalizarHorario } from '../../utils/horarios';

const FILTROS = [
  { id: null, label: 'Todos' },
  { id: STATUS.PENDENTE, label: 'Pendentes' },
  { id: STATUS.CONCLUIDO, label: 'Concluídos' },
];

export default function AgendaScreen() {
  const router = useRouter();
  const [itens, setItens] = useState([]);
  const [filtro, setFiltro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [concluindoId, setConcluindoId] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setItens(await listarAgendamentos(filtro));
    } catch (e) {
      await alerta('Erro ao carregar agendamentos', mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }, [filtro]);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  // Regra 3: confirma e chama concluirAgendamento (status -> Concluído + histórico)
  const handleConcluir = async (ag) => {
    const ok = await confirmar('Concluir serviço', `Marcar "${ag.servico}" de ${ag.animal} como concluído?`, 'Concluir');
    if (!ok) return;
    try {
      setConcluindoId(ag.id);
      const hist = await concluirAgendamento(ag.id);
      await alerta(
        'Serviço concluído',
        `Registrado no histórico de ${hist.animais.nome}: ${hist.servicos.nome} • ${formatarMoeda(hist.valor)}`
      );
    } catch (e) {
      await alerta('Não foi possível concluir', mensagemDeErro(e));
    } finally {
      setConcluindoId(null);
      carregar();
    }
  };

  return (
    <Tela>
      <View style={s.filtros}>
        {FILTROS.map((f) => (
          <Pressable key={String(f.id)} onPress={() => setFiltro(f.id)} style={[s.chip, filtro === f.id && s.chipAtivo]}>
            <Text style={[s.chipTxt, filtro === f.id && { color: '#fff' }]}>{f.label}</Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={itens}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={{ padding: 20, gap: 16 }}
        refreshControl={<RefreshControl refreshing={carregando} onRefresh={carregar} tintColor={cores.primary} />}
        ListEmptyComponent={!carregando ? <EstadoVazio texto="Nenhum agendamento encontrado." /> : null}
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.linhaTopo}>
              <Text style={s.quando}>{formatarDataBR(item.data)} • {normalizarHorario(item.horario)}</Text>
              <StatusBadge status={item.status} />
            </View>

            <View style={s.linhaAnimal}>
              <Avatar uri={item.foto_url} size={56} />
              <View style={{ flex: 1 }}>
                <Text style={s.animal} numberOfLines={1}>
                  {item.animal} <Text style={s.especie}>({item.especie})</Text>
                </Text>
                <Text style={s.info}>Cliente: {item.cliente}</Text>
                <Text style={s.info}>{item.servico} • {formatarMoeda(item.valor_servico)}</Text>
              </View>
            </View>

            {item.status === STATUS.PENDENTE ? (
              <Botao
                titulo="Concluir serviço"
                variante="secundario"
                style={{ marginTop: 14 }}
                loading={concluindoId === item.id}
                onPress={() => handleConcluir(item)}
              />
            ) : null}
          </View>
        )}
      />

      <View style={s.rodape}>
        <Botao titulo="+ Novo agendamento" onPress={() => router.push('/agendamento')} />
      </View>
    </Tela>
  );
}

const s = StyleSheet.create({
  filtros: { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 20 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 999, backgroundColor: cores.card, borderWidth: 1, borderColor: cores.border },
  chipAtivo: { backgroundColor: cores.primary, borderColor: cores.primary },
  chipTxt: { fontSize: 15, fontWeight: '600', color: cores.text },
  card: { backgroundColor: cores.card, borderRadius: raio.lg, padding: 18, ...sombra },
  linhaTopo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  quando: { fontSize: 15, fontWeight: '700', color: cores.primary },
  linhaAnimal: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  animal: { fontSize: 19, fontWeight: '800', color: cores.text },
  especie: { fontSize: 14, fontWeight: '500', color: cores.muted },
  info: { fontSize: 14, color: cores.muted, marginTop: 3 },
  rodape: { padding: 20, borderTopWidth: 1, borderTopColor: cores.border, backgroundColor: cores.bg },
});
