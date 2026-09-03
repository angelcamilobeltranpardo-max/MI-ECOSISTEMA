// ============================================================================
// engine/imagenUtil.js
//
// localStorage tiene un limite total (~5-10MB segun el navegador). Guardar
// fotos de camara sin procesar (varios MB cada una) lo agotaria rapido con
// pocos articulos. Por eso, antes de guardar cualquier imagen subida por el
// usuario, la redimensionamos a un maximo razonable y la recomprimimos como
// JPEG de calidad media -- sigue siendo una foto real del usuario, solo que
// en un tamaño que cabe comodamente en el almacenamiento del navegador.
// ============================================================================

const MAX_DIMENSION = 480;
const JPEG_QUALITY = 0.72;

export function procesarImagenSubida(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('El archivo seleccionado no es una imagen.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('No se pudo procesar la imagen.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > MAX_DIMENSION) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else if (height > MAX_DIMENSION) {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
