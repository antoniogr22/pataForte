import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Tela from '../components/Tela';
import Seletor from '../components/Seletor';
import Botao from '../components/Botao';
import { cores, raio, sombra } from '../config/theme';
import { listarClientes, listarAnimaisPorCliente, listarServicos } from '../services/cadastrosService';
import { criarAgendamento, listarHorariosOcupados } from '../services/agendamentosService';
import { ErroNegocio, mensagemDeErro } from '../utils/erros';
import { alerta } from '../utils/alerta';
import { HORARIOS, proximosDias, paraISO, horarioJaPassou, formatarMoeda, formatarDataBR } from '../utils/horarios';

export default function AgendamentoScreen() {
  const router = useRouter();
  const dias = useMemo(() => proximosDias(14), []);

  const [clientes, setClientes] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [animais, setAnimais] = useState([]);

  const [clienteId, setClienteId] = useState(null);
  const [animalId, setAnimalId] = useState(null);
  const [servicoId, setServicoId] = useState(null);
  const [data, setData] = useState(() => paraISO(new Date()));
  const [horario, setHorario] = useState(null);

  const [ocupados, setOcupados] = useState([]);
  const [carregandoHorarios, setCarregandoHorarios] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // Clientes e serviços (recarrega ao voltar de telas de cadastro)
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const [c, sv] = await Promise.all([listarClientes(), listarServicos()]);
          setClientes(c);
          setServicos(sv);
        } catch (e) {
          await alerta('Erro ao carregar dados', mensagemDeErro(e));
        }
      })();
    }, [])
  );

  // Animais do cliente (recarrega ao voltar da tela "Novo animal")
  const carregarAnimais = useCallback(async () => {
    if (!clienteId) { setAnimais([]); return; }
    try {
      setAnimais(await listarAnimaisPorCliente(clienteId));
    } catch (e) {
      await alerta('Erro ao carregar animais', mensagemDeErro(e));
    }
  }, [clienteId]);
  useFocusEffect(useCallback(() => { carregarAnimais(); }, [carregarAnimais]));

  // Regra 1: consulta no Supabase os horários já ocupados na data escolhida
  const carregarOcupados = useCallback(async () => {
    try {
      setCarregandoHorarios(true);
      const lista = await listarHorariosOcupados(data);
      setOcupados(lista);
      setHorario((atual) => (atual && lista.includes(atual) ? null : atual));
    } catch (e) {
      await alerta('Erro ao consultar horários', mensagemDeErro(e));
    } finally {
      setCarregandoHorarios(false);
    }
  }, [data]);
  useEffect(() => { carregarOcupados(); }, [carregarOcupados]);

  const trocarCliente = (id) => { setClienteId(id); setAnimalId(null); };

  const horarioOcupado = !!horario && ocupados.includes(horario);
  const formularioCompleto = !!(clienteId && animalId && servicoId && data && horario);
  const botaoDesabilitado = !formularioCompleto || horarioOcupado || salvando;

  const handleSalvar = async () => {
    try {
      setSalvando(true);
      await criarAgendamento({ clienteId, animalId, servicoId, data, horario });
      await alerta('Agendamento criado', `${formatarDataBR(data)} às ${horario}`);
      router.back();
    } catch (e) {
      if (e instanceof ErroNegocio && e.codigo === 'HORARIO_OCUPADO') {
        await alerta('Horário indisponível', e.message);
        setHorario(null);
        carregarOcupados(); // atualiza a grade com o que outro atendente acabou de marcar
      } else {
        await alerta('Erro ao agendar', mensagemDeErro(e));
      }
    } finally {
      setSalvando(false);
    }
  };

  const servicoSel = servicos.find((sv) => sv.id === servicoId);

  return (
    <Tela>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Seletor
            label="Cliente"
            placeholder="Selecione o cliente"
            itens={clientes.map((c) => ({ id: c.id, titulo: c.nome, subtitulo: c.telefone }))}
            valorId={clienteId}
            onSelect={trocarCliente}
            vazioTexto="Nenhum cliente cadastrado. Cadastre em Cadastros > Clientes."
          />
          <Seletor
            label="Animal"
            placeholder={clienteId ? 'Selecione o animal' : 'Escolha o cliente primeiro'}
            disabled={!clienteId}
            itens={animais.map((a) => ({ id: a.id, titulo: a.nome, subtitulo: [a.especie, a.raca].filter(Boolean).join(' • ') }))}
            valorId={animalId}
            onSelect={setAnimalId}
            vazioTexto="Este cliente ainda não tem animais cadastrados"
          />
          {clienteId ? (
            <Pressable
              style={s.link}
              onPress={() => router.push({ pathname: '/animal', params: { clienteId: String(clienteId) } })}
            >
              <Ionicons name="add-circle-outline" size={18} color={cores.primary} />
              <Text style={s.linkTxt}>Cadastrar novo animal para este cliente</Text>
            </Pressable>
          ) : null}
          <Seletor
            label="Serviço"
            placeholder="Selecione o serviço"
            itens={servicos.map((sv) => ({ id: sv.id, titulo: sv.nome, subtitulo: formatarMoeda(sv.valor) }))}
            valorId={servicoId}
            onSelect={setServicoId}
          />
          {servicoSel ? <Text style={s.valorServico}>Valor: {formatarMoeda(servicoSel.valor)}</Text> : null}
        </View>

        <View style={s.card}>
          <Text style={s.secao}>Data</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
            {dias.map((d) => {
              const ativo = d.iso === data;
              return (
                <Pressable key={d.iso} onPress={() => { setData(d.iso); setHorario(null); }} style={[s.dia, ativo && s.diaAtivo]}>
                  <Text style={[s.diaSemana, ativo && s.txtAtivo]}>{d.semana}</Text>
                  <Text style={[s.diaNum, ativo && s.txtAtivo]}>{d.dia}</Text>
                  <Text style={[s.diaSemana, ativo && s.txtAtivo]}>/{d.mes}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={s.horarioHeader}>
            <Text style={s.secao}>Horário</Text>
            {carregandoHorarios ? <ActivityIndicator size="small" color={cores.primary} /> : null}
          </View>

          <View style={s.grade}>
            {HORARIOS.map((h) => {
              const ocupado = ocupados.includes(h);
              const passou = horarioJaPassou(data, h);
              const off = ocupado || passou;
              const ativo = h === horario;
              return (
                <Pressable key={h} disabled={off} onPress={() => setHorario(h)} style={[s.slot, ativo && s.slotAtivo, off && s.slotOff]}>
                  <Text style={[s.slotTxt, ativo && s.txtAtivo, off && s.slotTxtOff]}>{h}</Text>
                  {ocupado ? <Text style={s.slotTag}>ocupado</Text> : null}
                </Pressable>
              );
            })}
          </View>

          {horarioOcupado ? (
            <View style={s.aviso}>
              <Ionicons name="warning-outline" size={18} color={cores.danger} />
              <Text style={s.avisoTxt}>O horário {horario} já está ocupado. Escolha outro.</Text>
            </View>
          ) : null}
        </View>

        <Botao titulo="Agendar serviço" onPress={handleSalvar} disabled={botaoDesabilitado} loading={salvando} />
      </ScrollView>
    </Tela>
  );
}

const s = StyleSheet.create({
  scroll: { padding: 20, paddingBottom: 48, gap: 20 },
  card: { backgroundColor: cores.card, borderRadius: raio.lg, padding: 20, ...sombra },
  secao: { fontSize: 15, fontWeight: '700', color: cores.text, marginBottom: 10 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -8, marginBottom: 18 },
  linkTxt: { color: cores.primary, fontSize: 14, fontWeight: '600' },
  valorServico: { color: cores.muted, fontSize: 14, marginTop: -6 },
  dia: {
    width: 62, paddingVertical: 10, borderRadius: raio.md, alignItems: 'center',
    borderWidth: 1, borderColor: cores.border, backgroundColor: cores.card,
  },
  diaAtivo: { backgroundColor: cores.primary, borderColor: cores.primary },
  diaSemana: { fontSize: 12, color: cores.muted },
  diaNum: { fontSize: 20, fontWeight: '800', color: cores.text },
  txtAtivo: { color: '#fff' },
  horarioHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 20 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: {
    width: '22%', minHeight: 50, borderRadius: raio.sm, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: cores.border, backgroundColor: cores.card,
  },
  slotAtivo: { backgroundColor: cores.primary, borderColor: cores.primary },
  slotOff: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  slotTxt: { fontSize: 15, fontWeight: '700', color: cores.text },
  slotTxtOff: { color: '#94A3B8', textDecorationLine: 'line-through' },
  slotTag: { fontSize: 10, color: cores.danger, fontWeight: '600' },
  aviso: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 14, padding: 12,
    backgroundColor: cores.dangerSoft, borderRadius: raio.sm,
  },
  avisoTxt: { color: cores.danger, fontSize: 14, flex: 1 },
});
