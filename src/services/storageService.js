import { supabase } from './supabase';

const BUCKET = 'animais';
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

// base64 -> bytes (sem depender de atob, que varia entre web e nativo)
function base64ParaBytes(b64) {
  const limpo = (b64.includes(',') ? b64.split(',')[1] : b64).replace(/[^A-Za-z0-9+/]/g, '');
  const bytes = new Uint8Array(Math.floor((limpo.length * 3) / 4));
  let p = 0;
  for (let i = 0; i < limpo.length; i += 4) {
    const a = ALFABETO.indexOf(limpo[i]);
    const b = ALFABETO.indexOf(limpo[i + 1]);
    const c = i + 2 < limpo.length ? ALFABETO.indexOf(limpo[i + 2]) : -1;
    const d = i + 3 < limpo.length ? ALFABETO.indexOf(limpo[i + 3]) : -1;
    bytes[p++] = (a << 2) | (b >> 4);
    if (c !== -1) bytes[p++] = ((b & 15) << 4) | (c >> 2);
    if (d !== -1) bytes[p++] = ((c & 3) << 6) | d;
  }
  return bytes.slice(0, p);
}

// Recebe o "asset" do expo-image-picker, envia ao bucket e devolve a URL pública
export async function enviarFotoAnimal(asset) {
  const mime = asset.mimeType || 'image/jpeg';
  const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
  const caminho = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const bytes = asset.base64
    ? base64ParaBytes(asset.base64)
    : new Uint8Array(await (await fetch(asset.uri)).arrayBuffer());

  const { error } = await supabase.storage.from(BUCKET).upload(caminho, bytes, {
    contentType: mime,
    upsert: false,
  });
  if (error) throw error;

  return supabase.storage.from(BUCKET).getPublicUrl(caminho).data.publicUrl;
}
