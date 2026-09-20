// CRIE SKINS LEGAIS - Client Interactivity, Character Renderer & Particle FX
document.addEventListener("DOMContentLoaded", function() {
  var selectedFile = null;
  var loadedImage = null;
  var currentUrl = window.location.href;

  // DOM Elements
  var dropzone = document.getElementById("dropzone");
  var skinInput = document.getElementById("skinInput");
  var previewBox = document.getElementById("previewBox");
  var skinCanvas = document.getElementById("skinCanvas");
  var fileNameDisplay = document.getElementById("fileNameDisplay");
  var fileDimsDisplay = document.getElementById("fileDimsDisplay");
  var btnChangeSkin = document.getElementById("btnChangeSkin");
  var btnConvert = document.getElementById("btnConvert");
  var successBanner = document.getElementById("successBanner");
  var errorBanner = document.getElementById("errorBanner");
  var errorMessageText = document.getElementById("errorMessageText");
  var downloadFallbackBtn = document.getElementById("downloadFallbackBtn");
  var qrcodeCanvas = document.getElementById("qrcodeCanvas");
  var networkUrlDisplay = document.getElementById("networkUrlDisplay");
  var btnCopyUrl = document.getElementById("btnCopyUrl");
  var modelCards = document.querySelectorAll(".model-card");
  var confettiCanvas = document.getElementById("confettiCanvas");

  // =========================================================================
  // Web Audio Synth (Sons 8-Bit Minecraft sem arquivos externos)
  // =========================================================================
  var audioCtx = null;
  function playSound(type) {
    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === "suspended") {
        audioCtx.resume();
      }
      var now = audioCtx.currentTime;

      if (type === "click") {
        var osc = audioCtx.createOscillator();
        var gain = audioCtx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(420, now);
        osc.frequency.exponentialRampToValueAtTime(840, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.06);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === "success") {
        // Melodia animada de subida de nível do Minecraft
        var melody = [
          { f: 523.25, t: 0.00 }, // C5
          { f: 659.25, t: 0.09 }, // E5
          { f: 783.99, t: 0.18 }, // G5
          { f: 1046.50, t: 0.27 } // C6
        ];
        melody.forEach(function(item) {
          var noteOsc = audioCtx.createOscillator();
          var noteGain = audioCtx.createGain();
          noteOsc.type = "square";
          noteOsc.frequency.setValueAtTime(item.f, now + item.t);
          noteGain.gain.setValueAtTime(0.15, now + item.t);
          noteGain.gain.linearRampToValueAtTime(0.01, now + item.t + 0.12);
          noteOsc.connect(noteGain);
          noteGain.connect(audioCtx.destination);
          noteOsc.start(now + item.t);
          noteOsc.stop(now + item.t + 0.12);
        });
      }
    } catch (e) {
      // Audio autoplay silencioso se bloqueado pelo navegador
    }
  }

  // =========================================================================
  // Partículas Comemorativas (Confetti Minecraft)
  // =========================================================================
  var particles = [];
  var animationFrameId = null;

  function launchConfetti() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    var ctx = confettiCanvas.getContext("2d");
    particles = [];

    var colors = ["#2ecc71", "#5da632", "#fecb00", "#4deeea", "#ffffff"];
    for (var i = 0; i < 60; i++) {
      particles.push({
        x: window.innerWidth * Math.random(),
        y: -20 - Math.random() * 50,
        vx: (Math.random() - 0.5) * 4,
        vy: 3 + Math.random() * 5,
        size: 8 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 6
      });
    }

    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    function updateParticles() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      var active = false;

      particles.forEach(function(p) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;

        if (p.y < confettiCanvas.height + 20) {
          active = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          // Desenha quadradinho pixel-art
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (active) {
        animationFrameId = requestAnimationFrame(updateParticles);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      }
    }

    updateParticles();
  }

  // =========================================================================
  // Renderizador Completo do Personagem Minecraft (Canvas 2D)
  // =========================================================================
  function getSelectedModel() {
    var radio = document.querySelector("input[name=model]:checked");
    return radio ? radio.value : "both";
  }

  function renderSkinCharacter(img, model) {
    if (!skinCanvas || !img) return;
    var ctx = skinCanvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, skinCanvas.width, skinCanvas.height);

    var isSlim = (model === "slim");
    var armWidth = isSlim ? 3 : 4;
    var scale = img.width / 64; // Suporta 64x64 e 128x128

    // Tamanho final desenhado (multiplicador para caber confortavelmente em 96x128)
    var px = 3.5; 
    var originX = 48 - (isSlim ? 7.5 : 8) * px; // Centralizado no canvas
    var originY = 10;

    // Função auxiliar para desenhar partes com escala
    function drawPart(sx, sy, sw, sh, dx, dy, dw, dh) {
      ctx.drawImage(
        img,
        sx * scale, sy * scale, sw * scale, sh * scale,
        originX + dx * px, originY + dy * px, dw * px, dh * px
      );
    }

    // 1. Cabeça (Base e Capacete)
    drawPart(8, 8, 8, 8, isSlim ? 3.5 : 4, 0, 8, 8);
    drawPart(40, 8, 8, 8, isSlim ? 3.5 : 4, 0, 8, 8);

    // 2. Tronco (Base e Jaqueta)
    drawPart(20, 20, 8, 12, isSlim ? 3.5 : 4, 8, 8, 12);
    if (img.height >= 64) {
      drawPart(20, 36, 8, 12, isSlim ? 3.5 : 4, 8, 8, 12);
    }

    // 3. Braço Direito
    drawPart(44, 20, armWidth, 12, isSlim ? 0.5 : 0, 8, armWidth, 12);
    if (img.height >= 64) {
      drawPart(44, 36, armWidth, 12, isSlim ? 0.5 : 0, 8, armWidth, 12);
    }

    // 4. Braço Esquerdo
    var armLeftX = isSlim ? 11.5 : 12;
    if (img.height >= 64) {
      drawPart(36, 52, armWidth, 12, armLeftX, 8, armWidth, 12);
      drawPart(52, 52, armWidth, 12, armLeftX, 8, armWidth, 12);
    } else {
      // Em skins antigas 64x32, espelha o braço direito
      drawPart(44, 20, armWidth, 12, armLeftX, 8, armWidth, 12);
    }

    // 5. Perna Direita
    drawPart(4, 20, 4, 12, isSlim ? 3.5 : 4, 20, 4, 12);
    if (img.height >= 64) {
      drawPart(4, 36, 4, 12, isSlim ? 3.5 : 4, 20, 4, 12);
    }

    // 6. Perna Esquerda
    var legLeftX = isSlim ? 7.5 : 8;
    if (img.height >= 64) {
      drawPart(20, 52, 4, 12, legLeftX, 20, 4, 12);
      drawPart(4, 52, 4, 12, legLeftX, 20, 4, 12);
    } else {
      drawPart(4, 20, 4, 12, legLeftX, 20, 4, 12);
    }
  }

  // =========================================================================
  // Seleção de Modelo
  // =========================================================================
  modelCards.forEach(function(card) {
    card.addEventListener("click", function() {
      modelCards.forEach(function(c) { c.classList.remove("selected"); });
      card.classList.add("selected");
      var radio = card.querySelector("input[type=radio]");
      if (radio) radio.checked = true;
      playSound("click");

      if (loadedImage) {
        renderSkinCharacter(loadedImage, getSelectedModel());
      }
    });
  });

  // =========================================================================
  // Dropzone & Arquivos
  // =========================================================================
  dropzone.addEventListener("click", function() {
    skinInput.click();
  });

  btnChangeSkin.addEventListener("click", function() {
    skinInput.click();
  });

  dropzone.addEventListener("dragover", function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.add("dragover");
  });

  dropzone.addEventListener("dragleave", function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove("dragover");
  });

  dropzone.addEventListener("drop", function(e) {
    e.preventDefault();
    e.stopPropagation();
    dropzone.classList.remove("dragover");
    if (e.dataTransfer && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  });

  skinInput.addEventListener("change", function() {
    if (skinInput.files && skinInput.files.length > 0) {
      handleFileSelected(skinInput.files[0]);
    }
  });

  function showError(msg) {
    errorMessageText.innerHTML = msg;
    errorBanner.classList.add("active");
    successBanner.classList.remove("active");
  }

  function hideErrors() {
    errorBanner.classList.remove("active");
  }

  function handleFileSelected(file) {
    hideErrors();
    if (!file.name.toLowerCase().endsWith(".png")) {
      showError("Por favor, selecione uma imagem no formato <strong>PNG</strong>!");
      return;
    }

    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var w = img.width;
        var h = img.height;

        if ((w !== 64 || (h !== 64 && h !== 32)) && (w !== 128 || h !== 128)) {
          showError("Tamanho inválido (<strong>" + w + "x" + h + " pixels</strong>). Skins do Minecraft precisam ter <strong>64x64</strong>, <strong>64x32</strong> ou <strong>128x128</strong> pixels!");
          return;
        }

        selectedFile = file;
        loadedImage = img;
        fileNameDisplay.textContent = file.name;
        fileDimsDisplay.textContent = w + " x " + h + " pixels (" + (h === 32 ? "Clássica Antiga" : "Moderna HD") + ")";

        // Renderiza personagem no canvas
        renderSkinCharacter(img, getSelectedModel());
        previewBox.classList.add("active");
        btnConvert.disabled = false;
        playSound("click");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // =========================================================================
  // Conversão e Download
  // =========================================================================
  btnConvert.addEventListener("click", function() {
    if (!selectedFile) return;

    btnConvert.disabled = true;
    btnConvert.innerHTML = "<span>⏳ CRIANDO PACOTE...</span>";
    hideErrors();
    successBanner.classList.remove("active");

    var modelValue = getSelectedModel();
    var formData = new FormData();
    formData.append("skin", selectedFile);
    formData.append("name", selectedFile.name.replace(/\.[^/.]+$/, ""));
    formData.append("model", modelValue);

    fetch("/api/convert", {
      method: "POST",
      body: formData
    })
    .then(function(res) {
      if (!res.ok) {
        return res.json().then(function(errData) {
          throw new Error(errData.error || "Erro ao gerar arquivo");
        });
      }
      return res.blob();
    })
    .then(function(blob) {
      playSound("success");
      launchConfetti();

      var cleanName = selectedFile.name.replace(/\.[^/.]+$/, "") + ".mcpack";
      var blobUrl = window.URL.createObjectURL(blob);

      // Dispara o download automático no navegador
      var a = document.createElement("a");
      a.href = blobUrl;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Atualiza o botão de baixar novamente
      downloadFallbackBtn.href = blobUrl;
      downloadFallbackBtn.download = cleanName;
      successBanner.classList.add("active");

      btnConvert.disabled = false;
      btnConvert.innerHTML = "<span>⚡ BAIXAR PACOTE .MCPACK! ⚡</span>";
    })
    .catch(function(err) {
      showError(err.message);
      btnConvert.disabled = false;
      btnConvert.innerHTML = "<span>⚡ BAIXAR PACOTE .MCPACK! ⚡</span>";
    });
  });

  // =========================================================================
  // Informações de Rede, Geração de QR Code e Modal para Tablets
  // =========================================================================
  var qrBoxClickable = document.getElementById("qrBoxClickable");
  var btnExpandQr = document.getElementById("btnExpandQr");
  var qrModal = document.getElementById("qrModal");
  var btnCloseQrModal = document.getElementById("btnCloseQrModal");
  var qrcodeCanvasGiant = document.getElementById("qrcodeCanvasGiant");
  var giantUrlDisplay = document.getElementById("giantUrlDisplay");
  var manualIpDisplay = document.getElementById("manualIpDisplay");
  var activeUrl = currentUrl;

  function renderQRCodeToContainer(container, text, size) {
    if (!container) return;
    container.innerHTML = "";

    // Gerador visual de QR Code SVG usando o padrão de alta compatibilidade do douglaspands/file-server
    var encoded = encodeURIComponent(text);
    var qrImg = document.createElement("img");
    qrImg.src = "https://api.qrserver.com/v1/create-qr-code/?size=" + size + "x" + size + "&data=" + encoded + "&margin=2&format=svg";
    qrImg.alt = "QR Code";
    qrImg.onerror = function() {
      // Fallback caso offline
      container.innerHTML = '<div style="padding: 10px; text-align: center; font-size: 0.82rem; color: #222; font-weight: bold;">Acesso direto:<br><span style="font-family: monospace; color: #2e6482; user-select: all;">' + text + '</span></div>';
    };
    container.appendChild(qrImg);
  }

  function renderQR(url) {
    activeUrl = url;

    // QR Code no card lateral (220x220)
    if (qrcodeCanvas) {
      renderQRCodeToContainer(qrcodeCanvas, url, 220);
    }

    // QR Code gigante no modal (340x340)
    if (qrcodeCanvasGiant) {
      renderQRCodeToContainer(qrcodeCanvasGiant, url, 340);
    }

    if (networkUrlDisplay) networkUrlDisplay.textContent = url;
    if (giantUrlDisplay) giantUrlDisplay.textContent = url;
    if (manualIpDisplay) {
      // Exibe atalho limpo (ex: 192.168.1.10:8080) facilitando para a criança digitar
      manualIpDisplay.textContent = url.replace(/^https?:\/\//, "");
    }
  }

  fetch("/api/info")
    .then(function(res) { return res.json(); })
    .then(function(info) {
      var targetUrl = info.preferredUrl || currentUrl;
      renderQR(targetUrl);
    })
    .catch(function() {
      renderQR(currentUrl);
    });

  // Modal para ampliar o QR Code
  function openQrModal() {
    if (qrModal) {
      qrModal.classList.add("active");
      playSound("click");
    }
  }

  function closeQrModal() {
    if (qrModal) {
      qrModal.classList.remove("active");
    }
  }

  if (btnExpandQr) btnExpandQr.addEventListener("click", openQrModal);
  if (qrBoxClickable) qrBoxClickable.addEventListener("click", openQrModal);
  if (btnCloseQrModal) btnCloseQrModal.addEventListener("click", closeQrModal);
  if (qrModal) {
    qrModal.addEventListener("click", function(e) {
      if (e.target === qrModal) {
        closeQrModal();
      }
    });
  }

  // Copiar Endereço
  btnCopyUrl.addEventListener("click", function() {
    var text = networkUrlDisplay ? networkUrlDisplay.textContent : activeUrl;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function() {
        btnCopyUrl.textContent = "✓ Copiado!";
        setTimeout(function() { btnCopyUrl.textContent = "📋 Copiar Endereço"; }, 2000);
      });
    } else {
      var input = document.createElement("input");
      input.value = text;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      btnCopyUrl.textContent = "✓ Copiado!";
      setTimeout(function() { btnCopyUrl.textContent = "📋 Copiar Endereço"; }, 2000);
    }
    playSound("click");
  });

  // =========================================================================
  // Navegação por Abas (Conversor vs Criador 3D)
  // =========================================================================
  var tabConverter = document.getElementById("tabConverter");
  var tabEditor = document.getElementById("tabEditor");
  var viewConverter = document.getElementById("viewConverter");
  var viewEditor = document.getElementById("viewEditor");

  function switchTab(targetTab) {
    if (targetTab === "viewEditor") {
      tabConverter.classList.remove("active");
      tabEditor.classList.add("active");
      viewConverter.classList.remove("active");
      viewEditor.classList.add("active");
      viewEditor.style.display = "block";
      viewConverter.style.display = "none";
      initEditorIfNeeded();
    } else {
      tabEditor.classList.remove("active");
      tabConverter.classList.add("active");
      viewEditor.classList.remove("active");
      viewConverter.classList.add("active");
      viewConverter.style.display = "block";
      viewEditor.style.display = "none";
    }
    playSound("click");
  }

  if (tabConverter) tabConverter.addEventListener("click", function() { switchTab("viewConverter"); });
  if (tabEditor) tabEditor.addEventListener("click", function() { switchTab("viewEditor"); });

  // =========================================================================
  // MÓDULO DO EDITOR / CRIADOR DE SKINS (3D & 2D)
  // =========================================================================
  var editorInitialized = false;
  var textureCanvas = document.createElement("canvas");
  var textureCtx = textureCanvas.getContext("2d", { willReadFrequently: true });
  var texW = 64, texH = 64;
  textureCanvas.width = texW;
  textureCanvas.height = texH;

  var editor3DCanvas = document.getElementById("editor3DCanvas");
  var editor2DCanvas = document.getElementById("editor2DCanvas");
  var ctx2D = editor2DCanvas ? editor2DCanvas.getContext("2d") : null;

  var viewport3D = null;
  var currentModelType = "classic"; // "classic" ou "slim"
  var currentTool = "pencil"; // "pencil", "bucket", "eraser", "pipette"
  var currentColor = "#5da632"; // Verde grama
  var currentLayer = "base"; // "base" ou "overlay"
  var touchMode = "paint"; // "paint" ou "rotate"
  var isGlassMode = false;
  var isPointerDown = false;
  var lastX = 0, lastY = 0;
  var lastPaintedCoord = null;
  var zoomFactor2D = 1; // Multiplicador de zoom da Folha 2D (1x a 4x)
  var BASE_2D_CANVAS_SIZE = 512;
  var MIN_ZOOM_2D = 1, MAX_ZOOM_2D = 4;
  var gridEnabled = false; // Grade de pixels (3D e 2D)

  // Distância entre dois toques (usado no gesto de pinça para zoom)
  function touchDistance(touches) {
    var dx = touches[0].clientX - touches[1].clientX;
    var dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  var undoStack = [];
  var redoStack = [];
  var MAX_UNDO = 20;

  function pushUndo() {
    redoStack = [];
    var imgData = textureCtx.getImageData(0, 0, texW, texH);
    undoStack.push(imgData);
    if (undoStack.length > MAX_UNDO) {
      undoStack.shift();
    }
  }

  function undo() {
    if (undoStack.length === 0) return;
    var current = textureCtx.getImageData(0, 0, texW, texH);
    redoStack.push(current);
    var prev = undoStack.pop();
    textureCtx.putImageData(prev, 0, 0);
    syncTexture();
    playSound("click");
  }

  function redo() {
    if (redoStack.length === 0) return;
    var current = textureCtx.getImageData(0, 0, texW, texH);
    undoStack.push(current);
    var next = redoStack.pop();
    textureCtx.putImageData(next, 0, 0);
    syncTexture();
    playSound("click");
  }

  function hexToRgba(hex, alpha) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    var num = parseInt(hex, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255,
      a: (alpha !== undefined) ? alpha : 255
    };
  }

  function rgbaToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Constrói uma cópia ampliada da textura com linhas finas de grade
  // desenhadas em cada fronteira de pixel, usada apenas para exibição no
  // boneco 3D. O `textureCanvas` original (fonte da exportação PNG/.mcpack)
  // nunca é alterado. A ampliação é necessária porque, no tamanho nativo da
  // textura (1 unidade = 1 pixel do skin), uma linha de 1px cobre a coluna/
  // linha inteira do pixel vizinho, escurecendo quase toda a superfície.
  var GRID_OVERLAY_SCALE = 4;

  function buildGridOverlayCanvas() {
    var scale = GRID_OVERLAY_SCALE;
    var gridCanvas = document.createElement("canvas");
    gridCanvas.width = texW * scale;
    gridCanvas.height = texH * scale;
    var gCtx = gridCanvas.getContext("2d");
    gCtx.imageSmoothingEnabled = false;
    gCtx.drawImage(textureCanvas, 0, 0, texW, texH, 0, 0, gridCanvas.width, gridCanvas.height);

    gCtx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    gCtx.lineWidth = 1;
    for (var gx = 0; gx <= texW; gx++) {
      var lx = gx * scale + 0.5;
      gCtx.beginPath();
      gCtx.moveTo(lx, 0);
      gCtx.lineTo(lx, gridCanvas.height);
      gCtx.stroke();
    }
    for (var gy = 0; gy <= texH; gy++) {
      var ly = gy * scale + 0.5;
      gCtx.beginPath();
      gCtx.moveTo(0, ly);
      gCtx.lineTo(gridCanvas.width, ly);
      gCtx.stroke();
    }
    return gridCanvas;
  }

  // Sincroniza a textura com a viewport 3D e o Canvas 2D
  function syncTexture() {
    if (viewport3D) {
      if (gridEnabled) {
        // O canvas de overlay é maior que a skin real (para caber linhas finas
        // de grade); texW/texH mantêm o mapeamento UV correto nesse caso.
        viewport3D.setTexture(buildGridOverlayCanvas(), texW, texH);
      } else {
        viewport3D.setTexture(textureCanvas);
      }
    }
    render2DSheet();
  }

  // Gera Templates Iniciais
  function loadTemplate(type) {
    pushUndo();
    textureCtx.clearRect(0, 0, texW, texH);

    function fillBox(x, y, w, h, col) {
      textureCtx.fillStyle = col;
      textureCtx.fillRect(x, y, w, h);
    }

    if (type === "steve") {
      var skinTone = "#d39a74", hair = "#462c16", shirt = "#0093a8", pants = "#2e3e7e", shoes = "#404040";
      // Cabeça
      fillBox(8, 8, 8, 8, skinTone); // Rosto
      fillBox(8, 0, 8, 8, hair);     // Cabelo topo
      fillBox(0, 8, 8, 8, hair);     // Cabelo lados
      fillBox(16, 8, 8, 8, hair);
      fillBox(24, 8, 8, 8, hair);    // Cabelo trás
      fillBox(9, 12, 2, 1, "#ffffff"); // Olhos
      fillBox(13, 12, 2, 1, "#ffffff");
      fillBox(10, 12, 1, 1, "#2980b9");
      fillBox(13, 12, 1, 1, "#2980b9");
      fillBox(10, 14, 4, 1, "#7d3f28"); // Boca/Barba

      // Tronco
      fillBox(20, 20, 8, 12, shirt);
      fillBox(32, 20, 8, 12, shirt);
      fillBox(16, 20, 4, 12, shirt);
      fillBox(28, 20, 4, 12, shirt);
      fillBox(20, 16, 8, 4, shirt);
      fillBox(28, 16, 8, 4, shirt);

      // Braço Direito
      var armW = (currentModelType === "slim") ? 3 : 4;
      fillBox(44, 20, armW, 4, shirt);
      fillBox(44, 24, armW, 8, skinTone);
      fillBox(40, 20, 4, 12, skinTone);
      fillBox(44 + armW, 20, 4, 12, skinTone);

      // Pernas
      fillBox(4, 20, 4, 10, pants);
      fillBox(12, 20, 4, 10, pants);
      fillBox(0, 20, 4, 10, pants);
      fillBox(8, 20, 4, 10, pants);
      fillBox(4, 30, 4, 2, shoes);
      fillBox(12, 30, 4, 2, shoes);

      if (texH >= 64) {
        // Braço Esquerdo
        fillBox(36, 52, armW, 4, shirt);
        fillBox(36, 56, armW, 8, skinTone);
        fillBox(32, 52, 4, 12, skinTone);
        fillBox(40 + armW, 52, 4, 12, skinTone);
        // Perna Esquerda
        fillBox(20, 52, 4, 10, pants);
        fillBox(28, 52, 4, 10, pants);
        fillBox(16, 52, 4, 10, pants);
        fillBox(24, 52, 4, 10, pants);
        fillBox(20, 62, 4, 2, shoes);
        fillBox(28, 62, 4, 2, shoes);
      }
    } else if (type === "alex") {
      var skinTone = "#e0ac69", hair = "#b25119", shirt = "#5c7444", pants = "#4a3b32", boots = "#30261f";
      fillBox(8, 8, 8, 8, skinTone);
      fillBox(8, 0, 8, 8, hair);
      fillBox(0, 8, 8, 8, hair);
      fillBox(16, 8, 8, 8, hair);
      fillBox(24, 8, 8, 8, hair);
      fillBox(9, 12, 2, 1, "#ffffff");
      fillBox(13, 12, 2, 1, "#ffffff");
      fillBox(10, 12, 1, 1, "#1e824c");
      fillBox(13, 12, 1, 1, "#1e824c");
      fillBox(10, 14, 4, 1, "#c07d53");

      fillBox(20, 20, 8, 12, shirt);
      fillBox(32, 20, 8, 12, shirt);
      fillBox(16, 20, 4, 12, shirt);
      fillBox(28, 20, 4, 12, shirt);
      fillBox(20, 16, 8, 4, shirt);
      fillBox(28, 16, 8, 4, shirt);

      var armW = 3;
      fillBox(44, 20, armW, 4, shirt);
      fillBox(44, 24, armW, 8, skinTone);
      fillBox(40, 20, 4, 12, skinTone);
      fillBox(44 + armW, 20, 4, 12, skinTone);

      fillBox(4, 20, 4, 9, pants);
      fillBox(12, 20, 4, 9, pants);
      fillBox(4, 29, 4, 3, boots);
      fillBox(12, 29, 4, 3, boots);

      if (texH >= 64) {
        fillBox(36, 52, armW, 4, shirt);
        fillBox(36, 56, armW, 8, skinTone);
        fillBox(32, 52, 4, 12, skinTone);
        fillBox(40 + armW, 52, 4, 12, skinTone);

        fillBox(20, 52, 4, 9, pants);
        fillBox(28, 52, 4, 9, pants);
        fillBox(20, 61, 4, 3, boots);
        fillBox(28, 61, 4, 3, boots);
      }
    } else if (type === "blank") {
      // Deixa em branco limpo quadriculado
      for (var y = 0; y < texH; y += 4) {
        for (var x = 0; x < texW; x += 4) {
          fillBox(x, y, 4, 4, ((x / 4 + y / 4) % 2 === 0) ? "#f0f0f0" : "#e0e0e0");
        }
      }
    }

    syncTexture();
  }

  // Pintar Pixel Unificado
  function paintPixel(px, py) {
    if (px < 0 || px >= texW || py < 0 || py >= texH) return;

    if (currentTool === "pipette") {
      var pData = textureCtx.getImageData(px, py, 1, 1).data;
      if (pData[3] > 10) {
        currentColor = rgbaToHex(pData[0], pData[1], pData[2]);
        var picker = document.getElementById("customColorPicker");
        var cBox = document.getElementById("currentColorBox");
        if (picker) picker.value = currentColor;
        if (cBox) cBox.style.background = currentColor;
      }
      return;
    }

    if (currentTool === "bucket") {
      var rgba = hexToRgba(currentColor, isGlassMode ? 128 : 255);
      floodFill(px, py, rgba.r, rgba.g, rgba.b, rgba.a);
      syncTexture();
      playSound("click");
      return;
    }

    if (lastPaintedCoord && lastPaintedCoord.x === px && lastPaintedCoord.y === py) {
      return; // Já pintado neste arraste
    }
    lastPaintedCoord = { x: px, y: py };

    if (currentTool === "eraser") {
      textureCtx.clearRect(px, py, 1, 1);
    } else {
      var rgba = hexToRgba(currentColor, isGlassMode ? 128 : 255);
      textureCtx.fillStyle = "rgba(" + rgba.r + "," + rgba.g + "," + rgba.b + "," + (rgba.a / 255) + ")";
      textureCtx.clearRect(px, py, 1, 1);
      textureCtx.fillRect(px, py, 1, 1);
    }

    // Se em modo 64x32 clássico, espelha membros do lado direito para o esquerdo
    if (texH === 32) {
      // Espelhamento clássico de braço (40-55, 16-31) e perna (0-15, 16-31)
      if (px >= 40 && px < 56 && py >= 16 && py < 32) {
        // Braço
      }
    }

    syncTexture();
  }

  // Algoritmo de Flood Fill (Balde de Tinta)
  function floodFill(startX, startY, fillR, fillG, fillB, fillA) {
    if (startX < 0 || startX >= texW || startY < 0 || startY >= texH) return;
    var imgData = textureCtx.getImageData(0, 0, texW, texH);
    var data = imgData.data;
    var sIdx = (startY * texW + startX) * 4;
    var sR = data[sIdx], sG = data[sIdx + 1], sB = data[sIdx + 2], sA = data[sIdx + 3];

    if (sR === fillR && sG === fillG && sB === fillB && sA === fillA) return;

    var queue = [[startX, startY]];
    var visited = new Uint8Array(texW * texH);

    while (queue.length > 0) {
      var pt = queue.pop();
      var x = pt[0], y = pt[1];
      var idx = y * texW + x;
      if (visited[idx]) continue;
      visited[idx] = 1;

      var pIdx = idx * 4;
      if (data[pIdx] === sR && data[pIdx + 1] === sG && data[pIdx + 2] === sB && data[pIdx + 3] === sA) {
        data[pIdx] = fillR;
        data[pIdx + 1] = fillG;
        data[pIdx + 2] = fillB;
        data[pIdx + 3] = fillA;

        if (x > 0) queue.push([x - 1, y]);
        if (x < texW - 1) queue.push([x + 1, y]);
        if (y > 0) queue.push([y - 1, y]);
        if (y < texH - 1) queue.push([y + 1, y]);
      }
    }

    textureCtx.putImageData(imgData, 0, 0);
  }

  // Renderizador da Folha Aberta 2D com Rótulos Grandes e Amigáveis
  function render2DSheet() {
    if (!ctx2D || !editor2DCanvas) return;

    var scale = (BASE_2D_CANVAS_SIZE / texW) * zoomFactor2D;
    var cW = Math.round(texW * scale);
    var cH = Math.round(texH * scale);
    if (editor2DCanvas.width !== cW || editor2DCanvas.height !== cH) {
      editor2DCanvas.width = cW;
      editor2DCanvas.height = cH;
    }
    ctx2D.clearRect(0, 0, cW, cH);
    ctx2D.imageSmoothingEnabled = false;

    // Fundo quadriculado
    for (var y = 0; y < texH; y++) {
      for (var x = 0; x < texW; x++) {
        ctx2D.fillStyle = ((x + y) % 2 === 0) ? "#1f1f1f" : "#282828";
        ctx2D.fillRect(x * scale, y * scale, scale, scale);
      }
    }

    // Desenha textura atual
    ctx2D.drawImage(textureCanvas, 0, 0, texW, texH, 0, 0, cW, texH * scale);

    // Grade de Pixels (opcional, apenas visual)
    if (gridEnabled) {
      ctx2D.strokeStyle = "rgba(0, 0, 0, 0.45)";
      ctx2D.lineWidth = 1;
      for (var gx = 0; gx <= texW; gx++) {
        var lx = Math.round(gx * scale) + 0.5;
        ctx2D.beginPath();
        ctx2D.moveTo(lx, 0);
        ctx2D.lineTo(lx, texH * scale);
        ctx2D.stroke();
      }
      for (var gy = 0; gy <= texH; gy++) {
        var ly = Math.round(gy * scale) + 0.5;
        ctx2D.beginPath();
        ctx2D.moveTo(0, ly);
        ctx2D.lineTo(cW, ly);
        ctx2D.stroke();
      }
    }

    // Rótulos explicativos suaves para crianças
    ctx2D.lineWidth = 1;
    ctx2D.strokeStyle = "rgba(77, 238, 234, 0.45)";
    ctx2D.strokeRect(0, 0, 32 * scale, 16 * scale); // Cabeça Base
    ctx2D.strokeRect(32 * scale, 0, 32 * scale, 16 * scale); // Cabeça Overlay
    ctx2D.strokeRect(16 * scale, 16 * scale, 24 * scale, 16 * scale); // Tronco

    ctx2D.font = "bold 11px sans-serif";
    ctx2D.fillStyle = "#fecb00";
    ctx2D.fillText("CABEÇA", 4, 12);
    if (texH >= 64) {
      ctx2D.fillText("TRONCO", 18 * scale, 20 * scale);
      ctx2D.fillText("BRAÇO D", 41 * scale, 20 * scale);
      ctx2D.fillText("PERNA D", 2 * scale, 20 * scale);
    }
  }

  // Inicialização Única do Editor
  function initEditorIfNeeded() {
    if (editorInitialized) return;
    editorInitialized = true;

    // 1. Inicia Viewport 3D
    if (window.Skin3D && editor3DCanvas) {
      viewport3D = new Skin3D.Viewport(editor3DCanvas);
      viewport3D.modelType = currentModelType;
    }

    // 2. Carrega Template Inicial Steve
    loadTemplate("steve");

    // 3. Monta Paleta de Cores do Minecraft
    var paletteGrid = document.getElementById("paletteGrid");
    var mcColors = [
      { name: "Grama", color: "#5da632" },
      { name: "Terra", color: "#866043" },
      { name: "Pedra", color: "#7d7d7d" },
      { name: "Diamante", color: "#4deeea" },
      { name: "Ouro", color: "#fecb00" },
      { name: "Redstone", color: "#ff4757" },
      { name: "Lápis-Lazúli", color: "#2f56b5" },
      { name: "Carvão", color: "#222222" },
      { name: "Slime", color: "#7cd332" },
      { name: "Pele 1", color: "#f1c27d" },
      { name: "Pele 2", color: "#d39a74" },
      { name: "Pele 3", color: "#8d5524" },
      { name: "Azul Olho", color: "#2980b9" },
      { name: "Branco", color: "#ffffff" },
      { name: "Preto", color: "#000000" },
      { name: "Madeira", color: "#a0522d" },
      { name: "Água", color: "#1e90ff" },
      { name: "Lava", color: "#ff4500" }
    ];

    if (paletteGrid) {
      paletteGrid.innerHTML = "";
      mcColors.forEach(function(item, idx) {
        var swatch = document.createElement("button");
        swatch.type = "button";
        swatch.className = "color-swatch" + (idx === 0 ? " active" : "");
        swatch.style.background = item.color;
        swatch.title = item.name;
        swatch.addEventListener("click", function() {
          document.querySelectorAll(".color-swatch").forEach(function(s) { s.classList.remove("active"); });
          swatch.classList.add("active");
          currentColor = item.color;
          var picker = document.getElementById("customColorPicker");
          var cBox = document.getElementById("currentColorBox");
          if (picker) picker.value = item.color;
          if (cBox) cBox.style.background = item.color;
          playSound("click");
        });
        paletteGrid.appendChild(swatch);
      });
    }

    var customColorPicker = document.getElementById("customColorPicker");
    var currentColorBox = document.getElementById("currentColorBox");
    if (customColorPicker) {
      customColorPicker.addEventListener("input", function() {
        currentColor = customColorPicker.value;
        if (currentColorBox) currentColorBox.style.background = currentColor;
        document.querySelectorAll(".color-swatch").forEach(function(s) { s.classList.remove("active"); });
      });
    }

    // 4. Alternador de Toque (Pintar vs Girar)
    var btnTouchPaint = document.getElementById("btnTouchPaint");
    var btnTouchRotate = document.getElementById("btnTouchRotate");
    if (btnTouchPaint && btnTouchRotate) {
      btnTouchPaint.addEventListener("click", function() {
        touchMode = "paint";
        btnTouchPaint.classList.add("active");
        btnTouchRotate.classList.remove("active");
        playSound("click");
      });
      btnTouchRotate.addEventListener("click", function() {
        touchMode = "rotate";
        btnTouchRotate.classList.add("active");
        btnTouchPaint.classList.remove("active");
        playSound("click");
      });
    }

    // 5. Alternador de Visualização (3D vs 2D)
    var btnMode3D = document.getElementById("btnMode3D");
    var btnMode2D = document.getElementById("btnMode2D");
    var wrapper3D = document.getElementById("wrapper3D");
    var wrapper2D = document.getElementById("wrapper2D");
    if (btnMode3D && btnMode2D && wrapper3D && wrapper2D) {
      btnMode3D.addEventListener("click", function() {
        btnMode3D.classList.add("active");
        btnMode2D.classList.remove("active");
        wrapper3D.style.display = "flex";
        wrapper2D.style.display = "none";
        if (viewport3D) viewport3D.render();
        playSound("click");
      });
      btnMode2D.addEventListener("click", function() {
        btnMode2D.classList.add("active");
        btnMode3D.classList.remove("active");
        wrapper2D.style.display = "flex";
        wrapper3D.style.display = "none";
        render2DSheet();
        playSound("click");
      });
    }

    // 5.1 Tela Cheia (Fullscreen) do Editor
    var editorCardEl = document.querySelector(".editor-card");
    var btnFullscreen = document.getElementById("btnFullscreen");

    function getFullscreenElement() {
      return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
    }

    function isNativeFullscreenActive() {
      return !!getFullscreenElement();
    }

    function onFullscreenChange() {
      var active = isNativeFullscreenActive() || (editorCardEl && editorCardEl.classList.contains("is-fullscreen-fallback"));
      if (btnFullscreen) {
        btnFullscreen.innerHTML = active ? "🡼 Sair da Tela Cheia" : "⛶ Tela Cheia";
      }
      // Aguarda o layout se ajustar antes de redimensionar o viewport 3D
      setTimeout(function() {
        if (viewport3D) {
          viewport3D.render();
        }
      }, 60);
    }

    function toggleFullscreen() {
      if (!editorCardEl) return;

      if (isNativeFullscreenActive()) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
        return;
      }

      if (editorCardEl.classList.contains("is-fullscreen-fallback")) {
        editorCardEl.classList.remove("is-fullscreen-fallback");
        onFullscreenChange();
        return;
      }

      var requestFs = editorCardEl.requestFullscreen || editorCardEl.webkitRequestFullscreen || editorCardEl.msRequestFullscreen;
      if (requestFs) {
        requestFs.call(editorCardEl);
      } else {
        // Navegador sem suporte à Fullscreen API (ex.: iOS Safari): usa overlay CSS de tela cheia
        editorCardEl.classList.add("is-fullscreen-fallback");
        onFullscreenChange();
      }
    }

    if (btnFullscreen) {
      btnFullscreen.addEventListener("click", function() {
        toggleFullscreen();
        playSound("click");
      });
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("MSFullscreenChange", onFullscreenChange);
    window.addEventListener("resize", function() {
      if (viewport3D) viewport3D.render();
    });

    // 5.2 Controles de Zoom do Boneco 3D
    var zoom3DSlider = document.getElementById("zoom3DSlider");
    var btnZoom3DIn = document.getElementById("btnZoom3DIn");
    var btnZoom3DOut = document.getElementById("btnZoom3DOut");
    var ZOOM_3D_STEP = 5;

    function setViewport3DZoom(z) {
      if (!viewport3D) return;
      var applied = viewport3D.setZoom(z);
      if (zoom3DSlider) zoom3DSlider.value = applied;
    }

    if (zoom3DSlider) {
      zoom3DSlider.addEventListener("input", function() {
        setViewport3DZoom(parseFloat(zoom3DSlider.value));
      });
    }
    if (btnZoom3DIn) {
      btnZoom3DIn.addEventListener("click", function() {
        if (viewport3D) setViewport3DZoom(viewport3D.zoom - ZOOM_3D_STEP);
        playSound("click");
      });
    }
    if (btnZoom3DOut) {
      btnZoom3DOut.addEventListener("click", function() {
        if (viewport3D) setViewport3DZoom(viewport3D.zoom + ZOOM_3D_STEP);
        playSound("click");
      });
    }

    // 5.3 Controles de Zoom da Folha 2D
    var zoom2DSlider = document.getElementById("zoom2DSlider");
    var btnZoom2DIn = document.getElementById("btnZoom2DIn");
    var btnZoom2DOut = document.getElementById("btnZoom2DOut");
    var ZOOM_2D_STEP = 0.5;

    function setZoom2D(z) {
      zoomFactor2D = Math.max(MIN_ZOOM_2D, Math.min(MAX_ZOOM_2D, z));
      if (zoom2DSlider) zoom2DSlider.value = zoomFactor2D;
      render2DSheet();
    }

    if (zoom2DSlider) {
      zoom2DSlider.addEventListener("input", function() {
        setZoom2D(parseFloat(zoom2DSlider.value));
      });
    }
    if (btnZoom2DIn) {
      btnZoom2DIn.addEventListener("click", function() {
        setZoom2D(zoomFactor2D + ZOOM_2D_STEP);
        playSound("click");
      });
    }
    if (btnZoom2DOut) {
      btnZoom2DOut.addEventListener("click", function() {
        setZoom2D(zoomFactor2D - ZOOM_2D_STEP);
        playSound("click");
      });
    }

    // 5.4 Alternar Grade de Pixels (3D e 2D)
    var btnToggleGrid = document.getElementById("btnToggleGrid");
    if (btnToggleGrid) {
      btnToggleGrid.addEventListener("click", function() {
        gridEnabled = !gridEnabled;
        btnToggleGrid.classList.toggle("active", gridEnabled);
        syncTexture();
        playSound("click");
      });
    }

    // 6. Ferramentas (Lápis, Balde, Borracha, Pipeta)
    var tools = [
      { id: "toolPencil", name: "pencil" },
      { id: "toolBucket", name: "bucket" },
      { id: "toolEraser", name: "eraser" },
      { id: "toolPipette", name: "pipette" }
    ];
    tools.forEach(function(t) {
      var btn = document.getElementById(t.id);
      if (btn) {
        btn.addEventListener("click", function() {
          tools.forEach(function(o) {
            var b = document.getElementById(o.id);
            if (b) b.classList.remove("active");
          });
          btn.classList.add("active");
          currentTool = t.name;
          playSound("click");
        });
      }
    });

    // 7. Camadas (Base vs 3D Outer Layer) & Modo Vidro
    var btnLayerBase = document.getElementById("btnLayerBase");
    var btnLayerOverlay = document.getElementById("btnLayerOverlay");
    if (btnLayerBase && btnLayerOverlay) {
      btnLayerBase.addEventListener("click", function() {
        currentLayer = "base";
        btnLayerBase.classList.add("active");
        btnLayerOverlay.classList.remove("active");
        playSound("click");
      });
      btnLayerOverlay.addEventListener("click", function() {
        currentLayer = "overlay";
        btnLayerOverlay.classList.add("active");
        btnLayerBase.classList.remove("active");
        playSound("click");
      });
    }

    var chkGlassMode = document.getElementById("chkGlassMode");
    if (chkGlassMode) {
      chkGlassMode.addEventListener("change", function() {
        isGlassMode = chkGlassMode.checked;
        playSound("click");
      });
    }

    // 8. Ocultar Partes do Corpo
    document.querySelectorAll(".btn-part").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var partName = btn.getAttribute("data-part");
        var active = btn.classList.toggle("active");
        if (viewport3D) {
          viewport3D.partVisible[partName] = active;
          viewport3D.render();
        }
        playSound("click");
      });
    });

    // 9. Botões de Visão Rápida (Frente, Costas, etc.)
    document.querySelectorAll(".btn-snap").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var dir = btn.getAttribute("data-dir");
        if (viewport3D) {
          viewport3D.snapTo(dir);
        }
        playSound("click");
      });
    });

    // 10. Desfazer / Refazer
    var btnUndo = document.getElementById("btnUndo");
    var btnRedo = document.getElementById("btnRedo");
    if (btnUndo) btnUndo.addEventListener("click", undo);
    if (btnRedo) btnRedo.addEventListener("click", redo);

    // 11. Seleção de Modelos (Steve / Alex / Branco)
    var tplSteve = document.getElementById("tplSteve");
    var tplAlex = document.getElementById("tplAlex");
    var tplBlank = document.getElementById("tplBlank");

    function setModelTemplate(btn, type, model) {
      document.querySelectorAll(".btn-template").forEach(function(b) { b.classList.remove("active"); });
      btn.classList.add("active");
      currentModelType = model;
      if (viewport3D) {
        viewport3D.modelType = model;
      }
      loadTemplate(type);
      playSound("click");
    }

    if (tplSteve) tplSteve.addEventListener("click", function() { setModelTemplate(tplSteve, "steve", "classic"); });
    if (tplAlex) tplAlex.addEventListener("click", function() { setModelTemplate(tplAlex, "alex", "slim"); });
    if (tplBlank) tplBlank.addEventListener("click", function() { setModelTemplate(tplBlank, "blank", currentModelType); });

    // 12. Seletor de Resolução / Formato (64x64, 64x32, 128x128)
    var editorDimSelect = document.getElementById("editorDimSelect");
    if (editorDimSelect) {
      editorDimSelect.addEventListener("change", function() {
        var val = editorDimSelect.value;
        pushUndo();
        if (val === "64x32") {
          texW = 64; texH = 32;
        } else if (val === "128x128") {
          texW = 128; texH = 128;
        } else {
          texW = 64; texH = 64;
        }
        textureCanvas.width = texW;
        textureCanvas.height = texH;
        loadTemplate(tplBlank.classList.contains("active") ? "blank" : (tplAlex.classList.contains("active") ? "alex" : "steve"));
        playSound("click");
      });
    }

    // 13. Abrir Skin (Upload PNG)
    var btnUploadSkin = document.getElementById("btnUploadSkin");
    var editorFileInput = document.getElementById("editorFileInput");
    if (btnUploadSkin && editorFileInput) {
      btnUploadSkin.addEventListener("click", function() {
        editorFileInput.click();
      });
      editorFileInput.addEventListener("change", function() {
        if (editorFileInput.files && editorFileInput.files.length > 0) {
          var file = editorFileInput.files[0];
          var reader = new FileReader();
          reader.onload = function(e) {
            var img = new Image();
            img.onload = function() {
              if ((img.width === 64 && (img.height === 64 || img.height === 32)) || (img.width === 128 && img.height === 128)) {
                texW = img.width;
                texH = img.height;
                textureCanvas.width = texW;
                textureCanvas.height = texH;
                pushUndo();
                textureCtx.clearRect(0, 0, texW, texH);
                textureCtx.drawImage(img, 0, 0);
                if (editorDimSelect) editorDimSelect.value = texW + "x" + texH;
                syncTexture();
                playSound("click");
              } else {
                alert("Por favor, selecione uma skin com dimensões válidas: 64x64, 64x32 ou 128x128 pixels.");
              }
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // 14. Eventos no Canvas 3D (Touch / Mouse com Dedo ou Caneta)
    if (editor3DCanvas) {
      var pinch3DStartDist = null;
      var pinch3DStartZoom = null;

      editor3DCanvas.addEventListener("wheel", function(e) {
        e.preventDefault();
        if (viewport3D) setViewport3DZoom(viewport3D.zoom + (e.deltaY > 0 ? ZOOM_3D_STEP * 0.6 : -ZOOM_3D_STEP * 0.6));
      }, { passive: false });

      function handlePointerStart(e) {
        isPointerDown = true;
        lastPaintedCoord = null;
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        lastX = clientX;
        lastY = clientY;

        if (touchMode === "paint" && viewport3D) {
          pushUndo();
          var hit = viewport3D.pickPixel(clientX, clientY, currentLayer === "overlay");
          if (hit) {
            paintPixel(hit.pixelX, hit.pixelY);
          }
        }
      }

      function handlePointerMove(e) {
        if (!isPointerDown) return;
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;

        if (touchMode === "rotate" && viewport3D) {
          var dx = clientX - lastX;
          var dy = clientY - lastY;
          lastX = clientX;
          lastY = clientY;

          viewport3D.rotY += dx * 0.012;
          viewport3D.rotX += dy * 0.012;
          // Limita inclinação vertical
          viewport3D.rotX = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, viewport3D.rotX));
          viewport3D.render();
        } else if (touchMode === "paint" && viewport3D) {
          var hit = viewport3D.pickPixel(clientX, clientY, currentLayer === "overlay");
          if (hit) {
            paintPixel(hit.pixelX, hit.pixelY);
          }
        }
      }

      function handlePointerEnd() {
        isPointerDown = false;
        lastPaintedCoord = null;
      }

      editor3DCanvas.addEventListener("mousedown", handlePointerStart);
      window.addEventListener("mousemove", handlePointerMove);
      window.addEventListener("mouseup", handlePointerEnd);

      editor3DCanvas.addEventListener("touchstart", function(e) {
        if (e.cancelable) e.preventDefault();
        if (e.touches.length === 2) {
          isPointerDown = false;
          pinch3DStartDist = touchDistance(e.touches);
          pinch3DStartZoom = viewport3D ? viewport3D.zoom : null;
          return;
        }
        handlePointerStart(e);
      }, { passive: false });

      editor3DCanvas.addEventListener("touchmove", function(e) {
        if (e.cancelable) e.preventDefault();
        if (e.touches.length === 2 && pinch3DStartDist && pinch3DStartZoom !== null) {
          var newDist = touchDistance(e.touches);
          setViewport3DZoom(pinch3DStartZoom * (pinch3DStartDist / newDist));
          return;
        }
        handlePointerMove(e);
      }, { passive: false });

      editor3DCanvas.addEventListener("touchend", function(e) {
        if (e.touches.length < 2) {
          pinch3DStartDist = null;
          pinch3DStartZoom = null;
        }
        handlePointerEnd();
      });
    }

    // 15. Eventos no Canvas 2D (Pintura em Folha Aberta)
    if (editor2DCanvas) {
      var isDrawing2D = false;
      var pinch2DStartDist = null;
      var pinch2DStartZoom = null;

      editor2DCanvas.addEventListener("wheel", function(e) {
        e.preventDefault();
        setZoom2D(zoomFactor2D + (e.deltaY < 0 ? ZOOM_2D_STEP * 0.5 : -ZOOM_2D_STEP * 0.5));
      }, { passive: false });

      function get2DCoord(e) {
        var rect = editor2DCanvas.getBoundingClientRect();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var clientY = e.touches ? e.touches[0].clientY : e.clientY;
        var scale = editor2DCanvas.width / texW;
        var px = Math.floor((clientX - rect.left) / scale);
        var py = Math.floor((clientY - rect.top) / scale);
        return { x: px, y: py };
      }

      function handle2DStart(e) {
        isDrawing2D = true;
        lastPaintedCoord = null;
        pushUndo();
        var coord = get2DCoord(e);
        paintPixel(coord.x, coord.y);
      }

      function handle2DMove(e) {
        if (!isDrawing2D) return;
        var coord = get2DCoord(e);
        paintPixel(coord.x, coord.y);
      }

      function handle2DEnd() {
        isDrawing2D = false;
        lastPaintedCoord = null;
      }

      editor2DCanvas.addEventListener("mousedown", handle2DStart);
      window.addEventListener("mousemove", handle2DMove);
      window.addEventListener("mouseup", handle2DEnd);

      editor2DCanvas.addEventListener("touchstart", function(e) {
        if (e.cancelable) e.preventDefault();
        if (e.touches.length === 2) {
          isDrawing2D = false;
          pinch2DStartDist = touchDistance(e.touches);
          pinch2DStartZoom = zoomFactor2D;
          return;
        }
        handle2DStart(e);
      }, { passive: false });

      editor2DCanvas.addEventListener("touchmove", function(e) {
        if (e.cancelable) e.preventDefault();
        if (e.touches.length === 2 && pinch2DStartDist && pinch2DStartZoom !== null) {
          var newDist = touchDistance(e.touches);
          setZoom2D(pinch2DStartZoom * (newDist / pinch2DStartDist));
          return;
        }
        handle2DMove(e);
      }, { passive: false });

      editor2DCanvas.addEventListener("touchend", function(e) {
        if (e.touches.length < 2) {
          pinch2DStartDist = null;
          pinch2DStartZoom = null;
        }
        handle2DEnd();
      });
    }

    // 16. Baixar Skin (.PNG)
    var btnDownloadPng = document.getElementById("btnDownloadPng");
    if (btnDownloadPng) {
      btnDownloadPng.addEventListener("click", function() {
        var a = document.createElement("a");
        a.href = textureCanvas.toDataURL("image/png");
        a.download = "skin_" + currentModelType + "_" + texW + "x" + texH + ".png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        playSound("click");
      });
    }

    // 17. Criar Pacote .mcpack Direto do Editor
    var btnEditorConvert = document.getElementById("btnEditorConvert");
    if (btnEditorConvert) {
      btnEditorConvert.addEventListener("click", function() {
        btnEditorConvert.disabled = true;
        btnEditorConvert.innerHTML = "<span>⏳ CRIANDO PACOTE...</span>";
        playSound("click");

        textureCanvas.toBlob(function(blob) {
          if (!blob) {
            btnEditorConvert.disabled = false;
            btnEditorConvert.innerHTML = "<span>⚡ CRIAR PACOTE .MCPACK! ⚡</span>";
            return;
          }
          var cleanName = "skin_customizada_" + currentModelType;
          var formData = new FormData();
          formData.append("skin", blob, cleanName + ".png");
          formData.append("name", cleanName);
          formData.append("model", currentModelType === "slim" ? "slim" : "classic");

          fetch("/api/convert", {
            method: "POST",
            body: formData
          })
          .then(function(res) {
            if (!res.ok) {
              return res.json().then(function(err) {
                throw new Error(err.error || "Erro ao gerar mcpack");
              });
            }
            return res.blob();
          })
          .then(function(mcpackBlob) {
            var blobUrl = URL.createObjectURL(mcpackBlob);
            var a = document.createElement("a");
            a.href = blobUrl;
            a.download = cleanName + ".mcpack";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            playSound("success");
            launchConfetti();

            var banner = document.getElementById("editorSuccessBanner");
            var msg = document.getElementById("editorSuccessMsg");
            var fallback = document.getElementById("editorDownloadFallbackBtn");
            if (banner && msg) {
              msg.innerHTML = "Seu pacote <strong>" + cleanName + ".mcpack</strong> foi baixado com sucesso!<br>Dê 2 cliques nele no seu aparelho para abrir diretamente no Minecraft.";
              banner.style.display = "block";
              if (fallback) {
                fallback.href = blobUrl;
                fallback.download = cleanName + ".mcpack";
                fallback.style.display = "inline-block";
              }
            }

            btnEditorConvert.disabled = false;
            btnEditorConvert.innerHTML = "<span>⚡ CRIAR PACOTE .MCPACK! ⚡</span>";
          })
          .catch(function(err) {
            alert("Erro ao criar pacote: " + err.message);
            btnEditorConvert.disabled = false;
            btnEditorConvert.innerHTML = "<span>⚡ CRIAR PACOTE .MCPACK! ⚡</span>";
          });
        }, "image/png");
      });
    }
  }
});

