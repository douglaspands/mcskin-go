/**
 * @file editor-file-loader.js
 * @description Asynchronous local skin PNG loading via FileReader, dimension
 * validation, and classic/slim arm alpha auto-detection.
 */

const VALID_DIMENSIONS = [
  { w: 64, h: 64 },
  { w: 64, h: 32 },
  { w: 128, h: 128 },
];

/** @private */
function isValidDimension(w, h) {
  return VALID_DIMENSIONS.some((d) => d.w === w && d.h === h);
}

/**
 * Detects classic (4px) vs slim (3px) arms by sampling the alpha of the
 * right arm's outer overlay columns at UV (54, 20)-(56, 32) — the region
 * a classic (Steve) skin's 4px-wide arm occupies but a slim (Alex) 3px-wide
 * arm never reaches, per the standard Minecraft skin template. Real slim
 * skins leave this region transparent; classic skins keep it opaque.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - Source image width (64 or 128).
 * @param {number} height - Source image height.
 * @returns {'classic'|'slim'}
 */
function detectModel(ctx, width, height) {
  if (height === 32) return "classic"; // legacy format predates slim arms
  const scale = width / 64;
  const x = Math.round(54 * scale);
  const xEnd = Math.min(width, Math.round(56 * scale));
  const yStart = Math.round(20 * scale);
  const rows = Math.max(1, Math.round(12 * scale));
  const cols = Math.max(1, xEnd - x);

  const region = ctx.getImageData(x, yStart, cols, rows).data;
  let alphaSum = 0;
  for (let i = 3; i < region.length; i += 4) alphaSum += region[i];
  const avgAlpha = alphaSum / (cols * rows);
  return avgAlpha < 32 ? "slim" : "classic";
}

/**
 * Loads a local PNG file into an offscreen canvas, validates its dimensions
 * (64x64, 64x32, or 128x128), and detects its classic/slim model.
 * @param {File} file
 * @returns {Promise<{canvas: HTMLCanvasElement, width: number, height: number, model: 'classic'|'slim'}>}
 */
export function loadSkinFile(file) {
  return new Promise((resolve, reject) => {
    if (!file || !/png$/i.test(file.type || file.name)) {
      reject(new Error("Escolha um arquivo PNG válido."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        if (!isValidDimension(img.width, img.height)) {
          reject(new Error(
            `Tamanho ${img.width}x${img.height} inválido. Use 64x64, 64x32 ou 128x128.`
          ));
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve({
          canvas,
          width: img.width,
          height: img.height,
          model: detectModel(ctx, img.width, img.height),
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
