/**
 * @file editor-file-loader.js
 * @description Asynchronous local skin PNG loading via FileReader, AI resolution
 * downsampling, solid background detection/removal, and classic/slim arm auto-detection.
 */

const VALID_DIMENSIONS = [{ w: 64, h: 64 }, { w: 64, h: 32 }, { w: 128, h: 128 }];

/** @public */
export function isValidDimension(w, h) {
  return VALID_DIMENSIONS.some((d) => d.w === w && d.h === h);
}

/** @public */
export function isPowerOfTwo(v) {
  return v >= 64 && (v & (v - 1)) === 0;
}

/**
 * Resolves standard target dimensions or flexible downsampling dimensions.
 * Accepts arbitrary square dimensions >= 64 and rectangular 2:1 dimensions >= 64x32.
 * @param {number} w
 * @param {number} h
 * @returns {{targetW: number, targetH: number, isAI: boolean, isHighRes: boolean}|null}
 */
export function resolveTargetDimensions(w, h) {
  if (isValidDimension(w, h)) {
    return { targetW: w, targetH: h, isAI: false, isHighRes: w === 128 && h === 128 };
  }
  if (w === h && w >= 64) {
    const isHigh = w > 64;
    return { targetW: isHigh ? 128 : 64, targetH: isHigh ? 128 : 64, isAI: true, isHighRes: isHigh };
  }
  if (w === 2 * h && h >= 32) {
    return { targetW: 64, targetH: 32, isAI: true, isHighRes: false };
  }
  return null;
}

/**
 * Calculates intermediate downsampling steps (iterative halving).
 * @param {number} srcW
 * @param {number} srcH
 * @param {number} targetW
 * @param {number} targetH
 * @returns {Array<{w: number, h: number}>}
 */
export function calculateDownsampleSteps(srcW, srcH, targetW, targetH) {
  const steps = [];
  let curW = srcW;
  let curH = srcH;
  while (curW > targetW * 2 || curH > targetH * 2) {
    curW = Math.max(targetW, Math.floor(curW / 2));
    curH = Math.max(targetH, Math.floor(curH / 2));
    steps.push({ w: curW, h: curH });
  }
  if (curW !== targetW || curH !== targetH || steps.length === 0) {
    steps.push({ w: targetW, h: targetH });
  }
  return steps;
}

/**
 * Downsamples an image or canvas through stepped multi-pass scaling,
 * preserving edge detail and alpha boundaries.
 * @param {HTMLImageElement|HTMLCanvasElement} source
 * @param {number} targetW
 * @param {number} targetH
 * @returns {HTMLCanvasElement}
 */
export function downsampleImage(source, targetW, targetH) {
  const steps = calculateDownsampleSteps(source.width, source.height, targetW, targetH);
  let curSource = source;
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const c = document.createElement("canvas");
    c.width = step.w;
    c.height = step.h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(curSource, 0, 0, step.w, step.h);
    curSource = c;
  }
  return curSource;
}

/**
 * Detects classic (4px) vs slim (3px) arms by sampling the alpha of the
 * right arm's outer overlay columns at UV (54, 20)-(56, 32).
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width - Source image width (64 or 128).
 * @param {number} height - Source image height.
 * @returns {'classic'|'slim'}
 */
export function detectModel(ctx, width, height) {
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
 * Detects if outer non-UV corners have a uniform opaque background color.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @returns {{r: number, g: number, b: number}|null}
 */
export function detectSolidBackground(ctx, width, height) {
  const corners = [{ x: 0, y: 0 }, { x: width - 1, y: 0 }, { x: 0, y: height - 1 }, { x: width - 1, y: height - 1 }];
  const colors = corners.map((c) => ctx.getImageData(c.x, c.y, 1, 1).data);
  const allOpaque = colors.every((c) => c[3] > 220);
  if (!allOpaque) return null;

  const [r0, g0, b0] = colors[0];
  const isUniform = colors.every((c) =>
    Math.abs(c[0] - r0) <= 15 && Math.abs(c[1] - g0) <= 15 && Math.abs(c[2] - b0) <= 15
  );
  return isUniform ? { r: r0, g: g0, b: b0 } : null;
}

/**
 * Converts background color in non-UV/border regions to transparent alpha.
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {{r: number, g: number, b: number}} bg
 */
export function removeBackgroundColor(ctx, width, height, bg) {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const tol = 25;
  const matchesBg = (idx) => (
    data[idx + 3] > 0 && Math.abs(data[idx] - bg.r) <= tol &&
    Math.abs(data[idx + 1] - bg.g) <= tol && Math.abs(data[idx + 2] - bg.b) <= tol
  );

  const queue = [];
  const visited = new Uint8Array(width * height);
  for (let x = 0; x < width; x++) queue.push([x, 0], [x, height - 1]);
  for (let y = 0; y < height; y++) queue.push([0, y], [width - 1, y]);

  while (queue.length > 0) {
    const [x, y] = queue.pop();
    const idx = y * width + x;
    if (visited[idx]) continue;
    visited[idx] = 1;
    const pIdx = idx * 4;
    if (matchesBg(pIdx)) {
      data[pIdx + 3] = 0;
      if (x > 0) queue.push([x - 1, y]);
      if (x < width - 1) queue.push([x + 1, y]);
      if (y > 0) queue.push([y - 1, y]);
      if (y < height - 1) queue.push([y + 1, y]);
    }
  }
  ctx.putImageData(imgData, 0, 0);
}

/**
 * Prompts user for background removal confirmation via modal dialog.
 * @returns {Promise<boolean>}
 */
export function promptBackgroundRemoval() {
  return new Promise((resolve) => {
    const modal = document.getElementById("modalBgRemoval");
    const btnConfirm = document.getElementById("btnConfirmBgRemoval");
    const btnCancel = document.getElementById("btnCancelBgRemoval");

    if (!modal || !btnConfirm || !btnCancel) {
      if (typeof window !== "undefined" && window.confirm) {
        resolve(window.confirm("Detectamos um fundo sólido nesta imagem. Deseja tentar remover o fundo e deixá-lo transparente?"));
      } else {
        resolve(false);
      }
      return;
    }

    modal.style.display = "flex";
    modal.classList.add("open");

    const cleanup = (choice) => {
      modal.style.display = "none";
      modal.classList.remove("open");
      btnConfirm.removeEventListener("click", onConfirm);
      btnCancel.removeEventListener("click", onCancel);
      resolve(choice);
    };

    const onConfirm = () => cleanup(true);
    const onCancel = () => cleanup(false);

    btnConfirm.addEventListener("click", onConfirm);
    btnCancel.addEventListener("click", onCancel);
  });
}

/**
 * Processes an image element, applying stepped downsampling if needed.
 * @param {HTMLImageElement} img
 * @returns {{canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, targetW: number, targetH: number, isAI: boolean, isHighRes: boolean}|null}
 */
export function processImageDimensions(img) {
  const resolved = resolveTargetDimensions(img.width, img.height);
  if (!resolved) return null;
  let canvas;
  let ctx;
  if (resolved.isAI) {
    canvas = downsampleImage(img, resolved.targetW, resolved.targetH);
    ctx = canvas.getContext("2d", { willReadFrequently: true });
  } else {
    canvas = document.createElement("canvas");
    canvas.width = resolved.targetW;
    canvas.height = resolved.targetH;
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, resolved.targetW, resolved.targetH);
  }
  return {
    canvas,
    ctx,
    targetW: resolved.targetW,
    targetH: resolved.targetH,
    isAI: resolved.isAI,
    isHighRes: resolved.isHighRes,
  };
}

/**
 * Loads a local PNG file, validates dimensions, downsamples AI resolutions,
 * optionally removes solid backgrounds, and detects model type.
 * @param {File} file
 * @returns {Promise<{canvas: HTMLCanvasElement, width: number, height: number, model: 'classic'|'slim', isAI: boolean, isHighRes: boolean, originalWidth: number, originalHeight: number}>}
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
      img.onload = async () => {
        const processed = processImageDimensions(img);
        if (!processed) {
          reject(new Error(`Tamanho ${img.width}x${img.height} inválido. Use 64x64, 64x32 ou 128x128.`));
          return;
        }

        const { canvas, ctx, targetW, targetH, isAI, isHighRes } = processed;
        const solidBg = detectSolidBackground(ctx, targetW, targetH);
        if (solidBg) {
          const confirmed = await promptBackgroundRemoval();
          if (confirmed) {
            removeBackgroundColor(ctx, targetW, targetH, solidBg);
          }
        }

        resolve({
          canvas,
          width: targetW,
          height: targetH,
          model: detectModel(ctx, targetW, targetH),
          isAI,
          isHighRes,
          originalWidth: img.width,
          originalHeight: img.height,
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

