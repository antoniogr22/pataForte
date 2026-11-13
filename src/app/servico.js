import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Switch, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, useNavigation } from 'expo-router';

import Tela from '../components/Tela';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import { cores, raio, sombra } from '../config/theme';
import { buscarServico, salvarServico } from '../services/cadastrosService';
import { mensagemDeErro } from '../utils/erros';
import { alerta } from '../utils/alerta';
import { parseValor } from '../utils/horarios';

// Cria um serviço novo ou, com ?id=, edita nome/descrição/valor/ativo (controle de valores)
export default function ServicoScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id } = useLocalSearchParams();
  const editando = !!id;

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: editando ? 'Editar serviço' : 'Novo serviço' });
    if (!editando) return;
    buscarServico(Number(id))
      .then((sv) => {
        setNome(sv.nome);
        setDescricao(sv.descricao || '');
        setValor(String(Number(sv.valor).toFixed(2)).replace('.', ','));
        setAtivo(sv.ativo);
      })
      .catch((e) => alerta('Erro ao carregar serviço', mensagemDeErro(e)));
  }, [id]);

  const handleSalvar = async () => {
    try {
      setSalvando(true);
      await salvarServico({ id: editando ? Number(id) : undefined, nome, descricao, valor: parseValor(valor), ativo });
      await alerta('Serviço salvo', `${nome} foi ${editando ? 'atualizado' : 'cadastrado'}.`);
      router.back();
    } catch (e) {
      await alerta('Não foi possível salvar', mensagemDeErro(e));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Tela>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
        <View style={s.card}>
          <Campo label="Nome do serviço *" value={nome} onChangeText={setNome} placeholder="Ex.: Banho e Tosa" />
          <Campo label="Descrição" value={descricao} onChangeText={setDescricao} placeholder="O que está incluso" multiline />
          <Campo label="Valor (R$) *" value={valor} onChangeText={setValor} keyboardType="decimal-pad" placeholder="Ex.: 50,00" />
          <View style={s.linhaAtivo}>
            <View style={{ flex: 1 }}>
              <Text style={s.ativoTitulo}>Serviço ativo</Text>
              <Text style={s.ativoDesc}>Serviços inativos não aparecem no agendamento</Text>
            </View>
            <Switch value={ativo} onValueChange={setAtivo} trackColor={{ true: cores.primary }} />
          </View>
          <Botao titulo="Salvar serviço" onPress={handleSalvar} loading={salvando} disabled={!nome.trim() || Number.isNaN(parseValor(valor))} />
        </View>
      </ScrollView>
    </Tela>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: cores.card, borderRadius: raio.lg, padding: 20, ...sombra },
  linhaAtivo: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 22 },
  ativoTitulo: { fontSize: 16, fontWeight: '700', color: cores.text },
  ativoDesc: { fontSize: 13, color: cores.muted, marginTop: 2 },
});
