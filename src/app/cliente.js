import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import Tela from '../components/Tela';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import { cores, raio, sombra } from '../config/theme';
import { criarCliente } from '../services/cadastrosService';
import { mensagemDeErro } from '../utils/erros';
import { alerta } from '../utils/alerta';

export default function ClienteScreen() {
  const router = useRouter();
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [email, setEmail] = useState('');
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async () => {
    try {
      setSalvando(true);
      await criarCliente({ nome, telefone, endereco, email });
      await alerta('Cliente cadastrado', `${nome} foi adicionado.`);
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
          <Campo label="Nome *" value={nome} onChangeText={setNome} placeholder="Ex.: Maria Silva" />
          <Campo label="Telefone *" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="(51) 99999-0000" />
          <Campo label="Endereço" value={endereco} onChangeText={setEndereco} placeholder="Rua, número, bairro" />
          <Campo label="E-mail" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="cliente@email.com" />
          <Botao titulo="Salvar cliente" onPress={handleSalvar} loading={salvando} disabled={!nome.trim() || !telefone.trim()} />
        </View>
      </ScrollView>
    </Tela>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: cores.card, borderRadius: raio.lg, padding: 20, ...sombra },
});
