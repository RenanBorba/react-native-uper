import { Platform, PixelRatio } from 'react-native';

export function getPixelSize(pixels) {
  // retornar na plataforma selecionada
  return Platform.select({
    ios: pixels,
    // tamanho em pixel baseado na densidade
    android: PixelRatio.getPixelSizeForLayoutSize(pixels)
  });
};