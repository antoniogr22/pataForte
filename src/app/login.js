import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import Tela from '../components/Tela';
import Campo from '../components/Campo';
import Botao from '../components/Botao';
import { useAuth } from '../context/AuthContext';
import { alerta } from '../utils/alerta';
import { mensagemDeAuth } from '../utils/erros';
import { cores, raio, sombra } from '../config/theme';

export default function LoginScreen() {
  const { entrar, cadastrar } = useAuth();
  const [modo, setModo] = useState('login'); // 'login' | 'cadastro'
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [carregando, setCarregando] = useState(false);

  const cadastro = modo === 'cadastro';
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const senhaOk = senha.length >= 6;
  const confirmacaoOk = !cadastro || confirmacao === senha;
  const podeEnviar = emailOk && senhaOk && confirmacaoOk && !carregando;

  const trocarModo = () => {
    setModo(cadastro ? 'login' : 'cadastro');
    setConfirmacao('');
  };

  const handleEnviar = async () => {
    try {
      setCarregando(true);
      if (cadastro) {
        const { precisaConfirmar } = await cadastrar(email, senha);
        if (precisaConfirmar) {
          await alerta('Conta criada!', 'Enviamos um link de confirmação para o seu e-mail. Confirme e depois faça login.');
          setModo('login');
          setConfirmacao('');
        }
        // sem confirmação por e-mail: a sessão já nasce e o app libera as telas sozinho
      } else {
        await entrar(email, senha);
      }
    } catch (e) {
      await alerta(cadastro ? 'Não foi possível cadastrar' : 'Não foi possível entrar', mensagemDeAuth(e));
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Tela>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.centro} keyboardShouldPersistTaps="handled">
          <View style={s.logo}>
            <Ionicons name="paw" size={40} color="#fff" />
          </View>
          <Text style={s.titulo}>PataForte</Text>
          <Text style={s.sub}>Sistema de gestão para pet shop</Text>

          <View style={s.form}>
            <Text style={s.formTitulo}>{cadastro ? 'Criar conta' : 'Entrar'}</Text>
            <Campo
              label="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="voce@pataforte.com"
              erro={cadastro && email && !emailOk ? 'Informe um e-mail válido.' : null}
            />
            <Campo
              label="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              placeholder="Mínimo de 6 caracteres"
              erro={cadastro && senha && !senhaOk ? 'A senha precisa ter pelo menos 6 caracteres.' : null}
            />
            {cadastro ? (
              <Campo
                label="Confirmar senha"
                value={confirmacao}
                onChangeText={setConfirmacao}
                secureTextEntry
                placeholder="Repita a senha"
                erro={confirmacao && !confirmacaoOk ? 'As senhas não conferem.' : null}
              />
            ) : null}
            <Botao titulo={cadastro ? 'Cadastrar' : 'Entrar'} onPress={handleEnviar} loading={carregando} disabled={!podeEnviar} />
          </View>

          <Pressable onPress={trocarModo} style={s.troca} hitSlop={8}>
            <Text style={s.trocaTxt}>
              {cadastro ? 'Já tem uma conta? ' : 'Não tem uma conta ainda? '}
              <Text style={s.trocaLink}>{cadastro ? 'Entrar' : 'Cadastre-se'}</Text>
            </Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Tela>
  );
}

const s = StyleSheet.create({
  centro: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: {
    width: 84, height: 84, borderRadius: 24, backgroundColor: cores.primary,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16,
  },
  titulo: { fontSize: 30, fontWeight: '800', color: cores.text, textAlign: 'center' },
  sub: { fontSize: 16, color: cores.muted, textAlign: 'center', marginBottom: 28, marginTop: 4 },
  form: { backgroundColor: cores.card, borderRadius: raio.lg, padding: 24, ...sombra },
  formTitulo: { fontSize: 20, fontWeight: '700', color: cores.text, marginBottom: 20 },
  troca: { marginTop: 24, alignItems: 'center', padding: 8 },
  trocaTxt: { fontSize: 15, color: cores.muted },
  trocaLink: { color: cores.primary, fontWeight: '700' },
});
