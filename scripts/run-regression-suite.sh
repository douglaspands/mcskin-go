#!/usr/bin/env bash
# ==============================================================================
# run-regression-suite.sh
# Bateria Completa de Testes Regressivos Acumulados (ARTS) para mcskin
# Executa validação de ponta a ponta: Go, JS, Token Guardian, CLI, Bedrock e Web.
# ==============================================================================
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

TOTAL_STEPS=7
PASSED_STEPS=0
FAILED_STEPS=0

log_header() {
  echo ""
  echo "======================================================================"
  echo "  $1"
  echo "======================================================================"
}

log_step_pass() {
  echo "  ✅ [PASS] $1"
  PASSED_STEPS=$((PASSED_STEPS + 1))
}

log_step_fail() {
  echo "  ❌ [FAIL] $1"
  FAILED_STEPS=$((FAILED_STEPS + 1))
}

echo "======================================================================"
echo "  mcskin: Bateria Completa de Testes Regressivos Acumulados (ARTS)"
echo "======================================================================"

# ------------------------------------------------------------------------------
# Fase 1: Go Toolchain & Testes Unitários 100% Mockados
# ------------------------------------------------------------------------------
log_header "Fase 1/7: Go Toolchain & Testes Unitários (TC-GOV-05)"
if go vet ./... && go test -count=1 ./...; then
  log_step_pass "go vet e testes unitários passaram sem erros"
else
  log_step_fail "Falha nos testes unitários ou go vet"
fi

# ------------------------------------------------------------------------------
# Fase 2: Qualidade Frontend & Sintaxe JavaScript
# ------------------------------------------------------------------------------
log_header "Fase 2/7: Sintaxe JavaScript (TC-GOV-03)"
if node --check internal/web/static/js/*.js; then
  log_step_pass "Sintaxe de todos os módulos JavaScript validada (node --check)"
else
  log_step_fail "Erro de sintaxe encontrado nos arquivos JavaScript"
fi

# ------------------------------------------------------------------------------
# Fase 3: Governança Token Guardian (< 300 linhas, < 15 KB)
# ------------------------------------------------------------------------------
log_header "Fase 3/7: Orçamento Token Guardian (TC-GOV-02)"
TG_VIOLATIONS=0

for f in internal/web/static/js/*.js cmd/mcskin/*.go internal/skin/*.go internal/bedrock/*.go internal/pack/*.go internal/converter/*.go; do
  [ -f "$f" ] || continue
  case "$f" in *_test.go) continue ;; esac
  lines=$(wc -l < "$f")
  bytes=$(wc -c < "$f")
  if [ "$lines" -gt 300 ]; then
    echo "  ⚠️ Violação de linhas: $f tem $lines linhas (limite: 300)"
    TG_VIOLATIONS=$((TG_VIOLATIONS + 1))
  fi
  if [ "$bytes" -gt 15360 ]; then
    echo "  ⚠️ Violação de tamanho: $f tem $bytes bytes (limite: 15 KB)"
    TG_VIOLATIONS=$((TG_VIOLATIONS + 1))
  fi
done

if [ "$TG_VIOLATIONS" -eq 0 ]; then
  log_step_pass "Todos os arquivos de código respeitam o orçamento Token Guardian"
else
  log_step_fail "Encontradas $TG_VIOLATIONS violações do Token Guardian"
fi

# ------------------------------------------------------------------------------
# Fase 4: Compilação Cruzada Nativa (Linux & Windows)
# ------------------------------------------------------------------------------
log_header "Fase 4/7: Compilação Cruzada (TC-GOV-04)"
if make build; then
  if [ -f "bin/mcskin" ] && [ -f "bin/mcskin.exe" ]; then
    log_step_pass "Binários nativos Linux (bin/mcskin) e Windows (bin/mcskin.exe) compilados"
  else
    log_step_fail "Arquivos binários esperados não foram encontrados em bin/"
  fi
else
  log_step_fail "Falha no comando make build"
fi

# ------------------------------------------------------------------------------
# Fase 5: CLI, Conversão & Casos de Borda
# ------------------------------------------------------------------------------
log_header "Fase 5/7: CLI & Regras de Conversão (TC-CLI-01 a TC-CLI-06)"
CLI_OK=true

# Testa flags básicas
./bin/mcskin --version > /dev/null || CLI_OK=false
./bin/mcskin --help > /dev/null || CLI_OK=false

# Testa conversão de skin válida
if ./bin/mcskin files/argentino_pedro.png > /dev/null; then
  if [ ! -f "files/argentino_pedro.mcpack" ]; then
    echo "  ⚠️ Arquivo .mcpack não foi gerado no local esperado"
    CLI_OK=false
  fi
else
  CLI_OK=false
fi

# Testa rejeição de dimensão inválida (deve retornar erro != 0)
if ./bin/mcskin files/pedro_mickey.png > /dev/null 2>&1; then
  echo "  ⚠️ Falha: arquivo com dimensões inválidas (2048x2048) foi aceito indevidamente"
  CLI_OK=false
fi

if [ "$CLI_OK" = true ]; then
  log_step_pass "Comandos da CLI, conversão e rejeição de erros validados"
else
  log_step_fail "Falha nos testes funcionais da CLI"
fi

# ------------------------------------------------------------------------------
# Fase 6: Conformidade do Pacote Bedrock (.mcpack)
# ------------------------------------------------------------------------------
log_header "Fase 6/7: Conformidade Bedrock & Manifesto RFC-4122 (TC-BED-01 a TC-BED-06)"
BEDROCK_OK=false
if [ -f "files/argentino_pedro.mcpack" ]; then
  if python3 .agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack.py files/argentino_pedro.mcpack > /dev/null; then
    BEDROCK_OK=true
  fi
  rm -f files/argentino_pedro.mcpack
fi

if [ "$BEDROCK_OK" = true ]; then
  log_step_pass "Pacote .mcpack verificado com sucesso pelo bedrock-skin-pack-verifier"
else
  log_step_fail "Pacote .mcpack rejeitado pelo verificador de conformidade Bedrock"
fi

# ------------------------------------------------------------------------------
# Fase 7: Responsividade Web (Mobile, Tablet, Desktop) & Lousa 3D
# ------------------------------------------------------------------------------
log_header "Fase 7/7: Responsividade e Palco 3D Web (TC-UI-01 a 09, TC-RSP-01 a 03)"
UI_OK=true

# Verifica marcações essenciais no HTML
grep -q 'id="editor3DCanvas"' internal/web/static/index.html || UI_OK=false
grep -q 'id="btnToggleGrid"' internal/web/static/index.html || UI_OK=false
grep -q 'id="btnPanUp"' internal/web/static/index.html || UI_OK=false
grep -q 'id="btnPanDown"' internal/web/static/index.html || UI_OK=false
grep -q 'id="desktopSidebarMenu"' internal/web/static/index.html || UI_OK=false

# Verifica regras canônicas de responsividade no CSS
grep -q '@media (max-width: 640px)' internal/web/static/style.css || UI_OK=false
grep -q '@media (min-width: 641px) and (max-width: 1023px)' internal/web/static/style.css || UI_OK=false
grep -q '@media (min-width: 1024px)' internal/web/static/style.css || UI_OK=false
grep -q '\.btn-toggle-grid\.active' internal/web/static/style.css || UI_OK=false

if [ "$UI_OK" = true ]; then
  log_step_pass "Invariantes de responsividade, lousa 3D e controles validados no frontend"
else
  log_step_fail "Invariantes de responsividade ou controles ausentes no frontend"
fi

# ------------------------------------------------------------------------------
# Relatório Resumo
# ------------------------------------------------------------------------------
log_header "Resumo da Bateria Regressiva Acumulada"
echo "  Total de Fases:      $TOTAL_STEPS"
echo "  Fases Aprovadas:     $PASSED_STEPS"
echo "  Fases com Falha:     $FAILED_STEPS"
echo "======================================================================"

if [ "$FAILED_STEPS" -eq 0 ]; then
  echo "  🎉 SUCESSO: Todos os testes regressivos acumulados foram APROVADOS!"
  echo "======================================================================"
  exit 0
else
  echo "  💥 ERRO: Regressão detectada! Verifique os logs acima antes de aprovar."
  echo "======================================================================"
  exit 1
fi
