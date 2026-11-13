import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Tela from '../components/Tela';
import Botao from '../components/Botao';
import EstadoVazio from '../components/EstadoVazio';
import { cores, raio, sombra } from '../config/theme';
import { listarServicos } from '../services/cadastrosService';
import { mensagemDeErro } from '../utils/erros';
import { alerta } from '../utils/alerta';
import { formatarMoeda } from '../utils/horarios';

export default function ServicosScreen() {
  const router = useRouter();
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setCarregando(true);
      setItens(await listarServicos({ incluirInativos: true }));
    } catch (e) {
      await alerta('Erro ao carregar serviços', mensagemDeErro(e));
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
        ListEmptyComponent={!carregando ? <EstadoVazio texto="Nenhum serviço cadastrado ainda." /> : null}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/servico', params: { id: String(item.id) } })}
            style={({ pressed }) => [s.card, pressed && { opacity: 0.85 }, !item.ativo && { opacity: 0.6 }]}
          >
            <View style={{ flex: 1 }}>
              <Text style={s.nome}>{item.nome}</Text>
              {item.descricao ? <Text style={s.desc}>{item.descricao}</Text> : null}
              {!item.ativo ? <Text style={s.inativo}>Inativo</Text> : null}
            </View>
            <Text style={s.valor}>{formatarMoeda(item.valor)}</Text>
            <Ionicons name="create-outline" size={20} color={cores.muted} />
          </Pressable>
        )}
      />
      <View style={s.rodape}>
        <Botao titulo="+ Novo serviço" onPress={() => router.push('/servico')} />
      </View>
    </Tela>
  );
}

const s = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: cores.card, borderRadius: raio.lg, padding: 18, ...sombra },
  nome: { fontSize: 18, fontWeight: '800', color: cores.text },
  desc: { fontSize: 14, color: cores.muted, marginTop: 3 },
  inativo: { fontSize: 12, fontWeight: '700', color: cores.warn, marginTop: 4 },
  valor: { fontSize: 17, fontWeight: '800', color: cores.primary },
  rodape: { padding: 20, borderTopWidth: 1, borderTopColor: cores.border, backgroundColor: cores.bg },
});
