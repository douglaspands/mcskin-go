/**
 * @file editor-layout.js
 * @description Dynamic 3D stage sizing (ResizeObserver/visualViewport) and
 * reactive #dockHintStrip guidance.
 */

const DEFAULT_HINT = "Toque ou clique em uma ferramenta para começar a pintar!";

const HINTS = {
  toolPencil: { icon: "✏️", text: "Pincel: Toque no boneco para pintar pixels individuais com a cor ativa.", badge: "Pintar" },
  toolBucket: { icon: "🪣", text: "Balde: Preencha áreas inteiras com a cor ativa.", badge: "Preencher" },
  toolRecolor: { icon: "🔄", text: "Trocar Cor: Substitua todos os pixels da mesma cor em todo o boneco!", badge: "Substituir" },
  toolEraser: { icon: "🧹", text: "Borracha: Apague pixels deixando transparentes.", badge: "Apagar" },
  toolColorPicker: { icon: "🎨", text: "Cores: Escolha entre a paleta Minecraft ou selecione qualquer cor personalizada.", badge: "Cores" },
  toolLayerToggle: { icon: "👕", text: "Camada: Alterne entre a Camada Base e a Camada Externa (3D).", badge: "Camada" },
  btnMode3D: { icon: "🧊", text: "Modo 3D: Visualize e pinte seu personagem em três dimensões.", badge: "Visão 3D" },
  btnMode2D: { icon: "📜", text: "Modo 2D: Desenhe na folha de textura aberta com máxima precisão de pixels.", badge: "Folha 2D" },
  btnUndo: { icon: "↩️", text: "Desfazer: Reverte a última alteração realizada.", badge: "Desfazer" },
  btnRedo: { icon: "↪️", text: "Refazer: Reaplica a última alteração desfeita.", badge: "Refazer" },
  btnToggleGrid: { icon: "▦", text: "Grade: Mostra ou esconde as linhas de grade dos pixels no boneco.", badge: "Grade" },
  btnHeaderFullscreen: { icon: "⛶", text: "Tela Cheia: Expande o aplicativo para tela inteira no aparelho.", badge: "Tela Cheia" },
  btnTouchPaint: { icon: "🖌️", text: "Pintar: Toque e arraste para desenhar no boneco.", badge: "Pintar" },
  btnTouchRotate: { icon: "🖐️", text: "Girar: Arraste com um dedo para girar o boneco livremente.", badge: "Girar" },
  btnZoom3DIn: { icon: "🔍+", text: "Aproximar: Aumenta o zoom da visualização.", badge: "Zoom" },
  btnZoom3DOut: { icon: "🔍−", text: "Afastar: Diminui o zoom da visualização.", badge: "Zoom" },
  btnZoom3DReset: { icon: "⟲", text: "Recentrar: Restaura a posição inicial e o zoom da câmera.", badge: "Recentrar" },
  btnPanUp: { icon: "▲", text: "Subir: Move a visualização para cima (ver pernas e pés).", badge: "Mover" },
  btnPanDown: { icon: "▼", text: "Descer: Move a visualização para baixo (ver cabeça).", badge: "Mover" },
};

const MANNEQUIN_HINTS = {
  head: { icon: "👤", text: "Foco: Cabeça do boneco.", badge: "Cabeça" },
  torso: { icon: "👕", text: "Foco: Tronco e peito do boneco.", badge: "Tronco" },
  rightArm: { icon: "💪", text: "Foco: Braço direito do boneco.", badge: "Braço D" },
  leftArm: { icon: "💪", text: "Foco: Braço esquerdo do boneco.", badge: "Braço E" },
  rightLeg: { icon: "🦵", text: "Foco: Perna direita do boneco.", badge: "Perna D" },
  leftLeg: { icon: "🦵", text: "Foco: Perna esquerda do boneco.", badge: "Perna E" },
};

/**
 * Sets #dockHintStrip's text, icon, and badge with highlight animation.
 * @param {string} text
 * @param {string} [icon]
 * @param {string} [badge]
 */
export function setDockHint(text, icon = "💡", badge = "Dica") {
  const strip = document.getElementById("dockHintStrip");
  const textEl = document.getElementById("dockHintText");
  const iconEl = document.getElementById("dockHintIcon");
  const badgeEl = document.getElementById("dockHintBadge");

  if (!strip || !textEl) return;
  textEl.textContent = text || DEFAULT_HINT;
  if (iconEl && icon) iconEl.textContent = icon;
  if (badgeEl && badge) badgeEl.textContent = badge;

  strip.classList.remove("highlight");
  void strip.offsetWidth;
  strip.classList.add("highlight");
}

/** @private */
function resolveHint(el) {
  const target = el?.closest?.("[id], [data-mannequin-part]");
  if (!target) return null;
  if (target.id && HINTS[target.id]) return HINTS[target.id];
  if (target.dataset.mannequinPart && MANNEQUIN_HINTS[target.dataset.mannequinPart]) {
    return MANNEQUIN_HINTS[target.dataset.mannequinPart];
  }
  return null;
}

/** @private */
function bindDockHints() {
  const root = document.querySelector(".editor-container");
  if (!root) return;

  root.addEventListener("pointerenter", (e) => {
    const hint = resolveHint(e.target);
    if (hint) setDockHint(hint.text, hint.icon, hint.badge);
  }, true);

  root.addEventListener("pointerleave", (e) => {
    if (resolveHint(e.target)) setDockHint(DEFAULT_HINT, "✏️", "Ativo");
  }, true);

  root.addEventListener("pointerup", (e) => {
    const hint = resolveHint(e.target);
    if (hint) setDockHint(hint.text, hint.icon, hint.badge);
  });
}

/** @private */
function bindStageResize(getViewport3D) {
  const stage = document.querySelector(".immersive-3d-stage") || document.querySelector(".editor-stage");
  if (!stage) return;

  let pending = false;
  const scheduleRender = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      pending = false;
      getViewport3D()?.render();
    });
  };

  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(scheduleRender).observe(stage);
  }
  window.addEventListener("orientationchange", scheduleRender);
  window.visualViewport?.addEventListener("resize", scheduleRender);
}

/**
 * Initializes editor layout reactivity: dynamic stage sizing and dock hint strip guidance.
 * @param {object} opts
 * @param {Function} opts.getViewport3D - Returns the active 3D viewport instance.
 */
export function initEditorLayout({ getViewport3D }) {
  bindDockHints();
  bindStageResize(getViewport3D);
}
