# PataForte | App (Expo Router + Supabase) v3

## 1. Banco de dados (Supabase)
- Banco NOVO: SQL Editor > cole `supabase/schema.sql` > Run.
- Banco que JÁ existe (corrige o erro do enum "pendente"): cole `supabase/migracao_v3.sql` > Run.
  Ambos já criam o bucket público `animais` e as policies de upload das fotos.

## 2. Autenticação
Authentication > Sign In / Providers > Email.
Para testar sem confirmar e-mail, desligue "Confirm email". Ligado, o novo usuário precisa clicar no link recebido.

## 3. Rodar
```bash
npm install
npx expo install --fix            # alinha as versões ao seu SDK
cp .env.example .env              # URL e anon key (Project Settings > API)
npx expo start -c --web
```
Celular: `npx expo start` e escaneie o QR no Expo Go.

## Rotas (src/app)
login | (tabs): index (agenda), historico, cadastros | agendamento | clientes, cliente | animais, animal | servicos, servico
