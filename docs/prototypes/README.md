# Protótipos

## `web-skin-editor-prototype.html`

Protótipo funcional standalone (HTML/CSS/JS inline, sem build step) usado como referência de design durante o change OpenSpec `web-skin-editor` (layout zero-scroll `100dvh`, menu lateral/gaveta de navegação, submenu do editor, `#dockHintStrip`, modal "Nova Skin", dock inferior de ferramentas com controles de altura "Subir/Descer").

**Não é servido pela aplicação** — não faz parte de `internal/web/static/` nem é embutido no binário. É um artefato de design isolado, mantido aqui para consulta futura sempre que a UI do editor for revisada ou estendida, evitando reconstruir o raciocínio de layout do zero.

Também inclui uma barra de teste de resolução (`.prototype-control-bar`, alternando `mode-mobile`/`mode-tablet`/`mode-desktop`) que é exclusiva do protótipo e não deve ser copiada para a produção.

Para abrir localmente: basta abrir o arquivo direto no navegador (`file://`) ou servir com a skill `static-server-dev`.
