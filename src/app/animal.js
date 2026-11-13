import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import Tela from '../components/Tela';
import Avatar from '../components/Avatar';
import Seletor from '../components/Seletor';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import { cores, raio, sombra } from '../config/theme';
import { listarClientes, criarAnimal } from '../services/cadastrosService';
import { enviarFotoAnimal } from '../services/storageService';
import { mensagemDeErro } from '../utils/erros';
import { alerta } from '../utils/alerta';

const ESPECIES = [{ id: 'cão', label: 'Cão' }, { id: 'gato', label: 'Gato' }];

export default function AnimalScreen() {
  const router = useRouter();
  const params = useLocalSearchParams(); // params chegam como string
  const clienteInicial = params.clienteId ? Number(params.clienteId) : null;

  const [clientes, setClientes] = useState([]);
  const [clienteId, setClienteId] = useState(clienteInicial);
  const [nome, setNome] = useState('');
  const [especie, setEspecie] = useState(null);
  const [raca, setRaca] = useState('');
  const [idade, setIdade] = useState('');
  const [foto, setFoto] = useState(null); // asset do image picker
  const [salvando, setSalvando] = useState(false);
  const [tentou, setTentou] = useState(false);

  useEffect(() => {
    listarClientes().then(setClientes).catch((e) => alerta('Erro', mensagemDeErro(e)));
  }, []);

  const escolherFoto = async () => {
    try {
      const r = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
        base64: true,
      });
      if (!r.canceled && r.assets?.length) setFoto(r.assets[0]);
    } catch (e) {
      await alerta('Não foi possível abrir a galeria', mensagemDeErro(e));
    }
  };

  // Regra 2: sem cliente selecionado o animal não pode ser salvo
  const handleSalvar = async () => {
    setTentou(true);
    try {
      setSalvando(true);
      const fotoUrl = foto ? await enviarFotoAnimal(foto) : null;
      await criarAnimal({ clienteId, nome, especie, raca, idade, fotoUrl });
      await alerta('Animal cadastrado', `${nome} foi vinculado ao cliente.`);
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
          <View style={s.fotoBloco}>
            <Avatar uri={foto?.uri} size={104} />
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <Botao
                titulo={foto ? 'Trocar foto' : 'Adicionar foto'}
                variante="secundario"
                onPress={escolherFoto}
                style={{ minHeight: 44 }}
              />
              {foto ? <Botao titulo="Remover" variante="secundario" onPress={() => setFoto(null)} style={{ minHeight: 44 }} /> : null}
            </View>
          </View>

          <Seletor
            label="Cliente responsável *"
            placeholder="Selecione o cliente"
            itens={clientes.map((c) => ({ id: c.id, titulo: c.nome, subtitulo: c.telefone }))}
            valorId={clienteId}
            onSelect={setClienteId}
            erro={tentou && !clienteId ? 'O cliente é obrigatório.' : null}
            vazioTexto="Nenhum cliente cadastrado. Cadastre em Cadastros > Clientes."
          />
          <Campo label="Nome do animal *" value={nome} onChangeText={setNome} placeholder="Ex.: Thor" />

          <Text style={s.label}>Espécie *</Text>
          <View style={s.especies}>
            {ESPECIES.map((e) => (
              <Pressable key={e.id} onPress={() => setEspecie(e.id)} style={[s.especie, especie === e.id && s.especieAtiva]}>
                <Text style={[s.especieTxt, especie === e.id && { color: '#fff' }]}>{e.label}</Text>
              </Pressable>
            ))}
          </View>

          <Campo label="Raça" value={raca} onChangeText={setRaca} placeholder="Ex.: Poodle" />
          <Campo
            label="Idade (anos)"
            value={idade}
            onChangeText={(t) => setIdade(t.replace(/\D/g, ''))}
            keyboardType="number-pad"
            maxLength={2}
            placeholder="Ex.: 3"
          />

          <Botao titulo="Salvar animal" onPress={handleSalvar} loading={salvando} disabled={!clienteId || !nome.trim() || !especie} />
        </View>
      </ScrollView>
    </Tela>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: cores.card, borderRadius: raio.lg, padding: 20, ...sombra },
  fotoBloco: { alignItems: 'center', marginBottom: 22 },
  label: { fontSize: 14, fontWeight: '600', color: cores.text, marginBottom: 8 },
  especies: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  especie: { flex: 1, minHeight: 52, borderRadius: raio.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: cores.border },
  especieAtiva: { backgroundColor: cores.primary, borderColor: cores.primary },
  especieTxt: { fontWeight: '700', fontSize: 16, color: cores.text },
});
