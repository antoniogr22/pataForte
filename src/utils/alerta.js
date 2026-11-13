import { Alert, Platform } from 'react-native';

// Alert.alert do React Native NÃO funciona na web. Estes helpers funcionam
// no navegador (window.alert / window.confirm) e no Expo Go (Alert nativo).
export function alerta(titulo, mensagem = '') {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      window.alert(mensagem ? `${titulo}\n\n${mensagem}` : titulo);
      resolve();
      return;
    }
    Alert.alert(titulo, mensagem, [{ text: 'OK', onPress: () => resolve() }], { onDismiss: () => resolve() });
  });
}

export function confirmar(titulo, mensagem = '', textoConfirmar = 'Confirmar') {
  return new Promise((resolve) => {
    if (Platform.OS === 'web') {
      resolve(window.confirm(mensagem ? `${titulo}\n\n${mensagem}` : titulo));
      return;
    }
    Alert.alert(
      titulo,
      mensagem,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: textoConfirmar, onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) }
    );
  });
}
