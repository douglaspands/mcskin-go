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
          showError("Tamanho inválido (<strong>" + w + "x" + h + " pixels</strong>). Skins do Minecraft precisam ter <strong>64x64</strong> ou <strong>128x128</strong> pixels!");
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
});

