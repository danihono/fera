// Foto de perfil: recorte quadrado no meio, 256 px (Perfil, Minha conta) e 72 px (ranking da turma).
// Vai como data URI no estado do app, sem Storage: cabe no plano grátis do Firebase.
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export class ErroFoto extends Error {}

export type FotoDePerfil = { foto: string; mini: string };

const LADO = 256;
const LADO_MINI = 72;

async function quadrada(uri: string, largura: number, altura: number, lado: number, compress: number) {
  const l = Math.min(largura, altura);
  const ctx = ImageManipulator.manipulate(uri);
  if (largura !== altura) ctx.crop({ originX: Math.floor((largura - l) / 2), originY: Math.floor((altura - l) / 2), width: l, height: l });
  ctx.resize({ width: lado, height: lado });
  const img = await ctx.renderAsync();
  const salvo = await img.saveAsync({ format: SaveFormat.JPEG, compress, base64: true });
  if (!salvo.base64) throw new ErroFoto('Não consegui ler essa foto.');
  return `data:image/jpeg;base64,${salvo.base64}`;
}

/** Abre a câmera ou a galeria (com recorte quadrado no celular). null se a pessoa cancelou. */
export async function escolherFotoDePerfil(fonte: 'camera' | 'galeria'): Promise<FotoDePerfil | null> {
  if (Platform.OS !== 'web') {
    const perm = fonte === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new ErroFoto(fonte === 'camera' ? 'Libera a câmera nos ajustes do celular.' : 'Libera as fotos nos ajustes do celular.');
  }
  const opcoes: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 1 };
  const r = fonte === 'camera' ? await ImagePicker.launchCameraAsync(opcoes) : await ImagePicker.launchImageLibraryAsync(opcoes);
  if (r.canceled || !r.assets[0]) return null;
  const a = r.assets[0];
  try {
    let { width, height } = a;
    // Na web o picker às vezes não sabe o tamanho: mede abrindo a imagem.
    if (!width || !height) ({ width, height } = await ImageManipulator.manipulate(a.uri).renderAsync());
    return {
      foto: await quadrada(a.uri, width, height, LADO, 0.8),
      mini: await quadrada(a.uri, width, height, LADO_MINI, 0.7),
    };
  } catch (e) {
    if (e instanceof ErroFoto) throw e;
    throw new ErroFoto('Não consegui abrir essa foto. Tenta outra (JPG ou PNG).');
  }
}
