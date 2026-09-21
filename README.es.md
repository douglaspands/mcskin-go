# mcskin

<p align="center">
  <a href="README.md">Português (Brasil)</a> • <a href="README.en.md">English</a> • <b>Español</b>
</p>

> **Crea e instala skins de Minecraft Bedrock directamente en el navegador — sin publicidad, sin registro, 100% seguro para niños.** Un editor 3D/2D y conversor que corre en tu ordenador doméstico y se conecta con teléfonos y tablets de la misma red Wi-Fi mediante código QR.

[![Edad Recomendada](https://img.shields.io/badge/ni%C3%B1os-6%2B%20a%C3%B1os-orange.svg)]()
[![Cero Anuncios](https://img.shields.io/badge/anuncios-cero-brightgreen.svg)]()
[![Red Local](https://img.shields.io/badge/privacidad-100%25%20red%20local-success.svg)]()
[![Formato Bedrock](https://img.shields.io/badge/bedrock-.mcpack%20oficial-blueviolet.svg)]()
[![Versión Go](https://img.shields.io/badge/go-1.25%2B-blue.svg)](https://golang.org)
[![Plataformas](https://img.shields.io/badge/plataformas-windows%20%7C%20linux-lightgrey.svg)]()
[![Cero Dependencias](https://img.shields.io/badge/dependencias-cero-brightgreen.svg)]()
[![Licencia](https://img.shields.io/badge/licencia-MIT-green.svg)](LICENSE)

---

## 💡 ¿Por qué se creó `mcskin`?

La mayoría de los sitios de skins en internet son trampas para un niño de 6 años que solo quiere personalizar su personaje: anuncios parpadeantes por doquier, botones falsos de descarga que intentan instalar malware, solicitud obligatoria de cuentas con correo y menús difíciles de usar en pantallas táctiles.

**`mcskin`** fue creado para devolver la tranquilidad a los padres y la alegría de crear a los niños:

| ¿Qué ocurre en sitios típicos de internet? | ¿Cómo es en `mcskin`? |
| :--- | :--- |
| ❌ **Anuncios invasivos**, banners parpadeantes y vídeos emergentes | ✅ **Cero anuncios**: pantalla limpia, silenciosa y 100% centrada en la creatividad |
| ❌ **Botones falsos de "Descargar"** que llevan a virus o malware | ✅ **1 clic seguro**: genera paquetes oficiales `.mcpack` directamente en tu equipo |
| ❌ **Registro obligatorio**, inicios de sesión o datos personales | ✅ **Sin cuentas ni contraseñas**: total anonimato y privacidad para la familia |
| ❌ **Botones diminutos** y menús difíciles para dedos pequeños | ✅ **Diseñado para niños (6+)**: botones grandes (64px+) y controles táctiles amigables |
| ❌ **Transferencias engorrosas** con cables, memorias USB o correos | ✅ **Conexión instantánea por QR**: tabletas y móviles se conectan vía Wi-Fi local |
| ❌ **Skins incompatibles** con brazos deformados en el juego | ✅ **Bedrock Oficial Dual-Model**: genera automáticamente variantes Steve (4px) y Alex (3px) |

---

## 🚀 Cómo Empezar en 3 Sencillos Pasos

No necesitas instalar aplicaciones de tiendas (App Store o Google Play), ni configurar servidores complejos:

```
 [1. Iniciar en PC]   ───────>   [2. Conectar Tablet/Móvil]   ───────>   [3. ¡Pintar y Jugar!]
 Doble clic en ejecutable        Apunta la cámara al código QR            Dibuja tu skin y ábrela
 (abre navegador local)          (abre directo en el navegador)           en Minecraft con 1 toque
```

### 1️⃣ Iniciar en el Ordenador
- **En Windows**: Haz doble clic en el archivo `mcskin.exe`. El navegador se abrirá automáticamente en *"CREA SKINS GENIALES"*.
- **En Linux / macOS**: Ejecuta en la terminal:
  ```bash
  ./bin/mcskin --web
  ```

### 2️⃣ Conectar una Tablet o Teléfono (Opcional)
- Apunta la cámara del móvil o tableta al **código QR** mostrado en la pantalla del ordenador.
- El editor se abrirá al instante en el navegador del dispositivo, conectado mediante la red Wi-Fi de tu casa. ¡Sin cables, sin Bluetooth y sin instalar nada!

### 3️⃣ ¡Pintar y Jugar!
- Selecciona colores de la paleta y pinta libremente en el modelo 3D o en la plantilla 2D desplegada.
- Al terminar, haz clic en **"Descargar Paquete Bedrock (.mcpack)"** y pulsa en **"Abrir con Minecraft"**. ¡Tu skin estará lista en el Vestidor del juego!

---

## 🎨 Escaparate de la Interfaz Web — "CREA SKINS GENIALES"

El editor fue desarrollado pensando por completo en la ergonomía infantil, garantizando que los pequeños creadores exploren su imaginación sin frustraciones.

<p align="center">
  <img src="docs/screenshots/editor-3d-redesign-desktop.jpg" alt="Editor 3D con diseño inmersivo sin desplazamiento, barra de herramientas inferior y menú superior" width="760"><br>
  <sub><b>Editor 3D Inmersivo</b>: cabe en pantalla sin barras de desplazamiento vertical, con barra inferior accesible, colores vivos, código QR y navegación simplificada.</sub>
</p>

<p align="center">
  <img src="docs/screenshots/editor-2d-folha-grade.jpg" alt="Editor 2D con plantilla desplegada y cuadrícula sutil" width="460">
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="docs/screenshots/editor-mobile-drawer.jpg" alt="Menú lateral deslizante en teléfono móvil" width="230">
</p>
<p align="center"><sub><b>Izquierda</b>: modo 2D desplegado con cuadrícula de precisión y zoom para partes ocultas. <b>Derecha</b>: menú lateral deslizante en tablet o móvil.</sub></p>

<p align="center">
  <img src="docs/screenshots/editor-nova-skin-modal.jpg" alt="Ventana modal Nueva Skin con opciones Steve, Alex y En Blanco" width="360"><br>
  <sub><b>Modal Nueva Skin</b>: punto de partida intuitivo para Steve Clásico (4px), Alex Fino (3px) o lienzo en blanco.</sub>
</p>

### Detalles Pensados para los Pequeños:

- 🧒 **Botones Grandes (64px+) y Zonas Táctiles Cómodas**: Nada de botones diminutos que provocan toques accidentales. Todas las herramientas están adaptadas para pantallas táctiles.
- 🔄/🖌️ **Selector "Pintar" vs. "Girar"**: Un bloqueo de seguridad que evita estropear el dibujo al intentar rotar el modelo, o mover la vista sin querer al colorear.
- 📐 **Diseño Inmersivo 100dvh (Cero Desplazamiento)**: La interfaz completa se ajusta a la pantalla del dispositivo sin barras de desplazamiento molestas.
- 🧊/📜 **Alternador 3D y 2D Integrado**: Cambia con 1 toque entre el personaje tridimensional interactivo y la plantilla plana (2D) para pintar dobleces y áreas ocultas con exactitud milimétrica.
- 🤖 **Importación Inteligente de Skins creadas por IA**: Carga imágenes generadas por ChatGPT, Midjourney, DALL-E o Bing en cualquier resolución — el sistema remuestrea preservando la nitidez píxel a píxel de forma automática.
- 🪄 **Detección y Eliminación de Fondo en 1 Toque**: Detecta fondos planos sólidos y ofrece eliminarlos automáticamente sin requerir que los padres editen máscaras.
- 🔲 **Cuadrícula de Precisión Sutil**: Líneas de referencia ultrafinas en 16x con sombreado suave para distinguir cada píxel sin ensuciar la skin.
- 🔊 **Efectos de Sonido Lúdicos**: Sonidos de subida de nivel celebran el momento en que el niño completa y descarga su diseño.

---

### 📦 Conversor Rápido (para skins PNG ya existentes)

Si el niño ya tiene una imagen de skin preparada, no es necesario dibujarla desde cero:

<p align="center">
  <img src="docs/screenshots/conversor-skin.png" alt="Pantalla del Conversor de Skin con Dropzone y código QR" width="720"><br>
  <sub><b>Conversor Rápido</b>: arrastra el archivo PNG o imagen de IA, escribe el nombre del paquete y escanea el código QR en la tablet para instalar en Minecraft Bedrock.</sub>
</p>

---

## 🎮 Cómo Equipar la Skin en Minecraft Bedrock

Después de descargar el archivo `.mcpack`, instalarlo en el juego es sumamente fácil:

### En Windows 10 / 11:
1. Haz **doble clic** en el archivo `.mcpack` descargado.
2. Minecraft se iniciará automáticamente mostrando: `Importación iniciada...` y luego `Importación de paquete de aspectos correcta`.

### En Móvil o Tableta (Android / iOS / iPadOS):
1. Descarga el archivo `.mcpack` en el navegador del dispositivo.
2. Toca la notificación de descarga finalizada y selecciona **"Abrir con Minecraft"** (o abre el archivo mediante la app de *Archivos* / *Descargas*).

### Dentro del Juego (Vestidor):
1. En la pantalla de inicio de Minecraft, entra en el **Vestidor** (o *Dressing Room*).
2. Toca el icono de percha (**Aspectos clásicos**).
3. Localiza el paquete con el nombre de tu skin.
4. Por defecto, `mcskin` genera ambos modelos oficiales:
   - **`<Nombre> (Classic)`**: brazos estándar de 4 píxeles (Steve).
   - **`<Nombre> (Slim)`**: brazos delgados de 3 píxeles (Alex).
5. ¡Elige tu preferido y pulsa en **Equipar**!

---

## 💻 Uso por Línea de Comandos (CLI)

Para usuarios avanzados, administradores de servidores o desarrolladores, `mcskin` ofrece un modo de consola rápido y sin dependencias:

```bash
mcskin [opciones] <ruta/a/skin.png>
```

### Tabla Completa de Opciones

| Opción | Descripción |
| :--- | :--- |
| *(sin flag)* | **Por defecto:** Genera ambos modelos (Clásico 4px y Fino 3px) en el mismo `.mcpack`. |
| `--both` | Fuerza explícitamente la inclusión de ambos modelos (Clásico y Fino). |
| `--classic` | Restringe la generación exclusivamente al modelo clásico (brazos de 4px / Steve). |
| `--slim` | Restringe la generación exclusivamente al modelo fino (brazos de 3px / Alex). |
| `--force` | Sobrescribe el archivo `.mcpack` si ya existe (por defecto: `true`). |
| `-i`, `--input` | Especifica la ruta del PNG de entrada mediante argumento con nombre. |
| `-w`, `--web` | Inicia el servidor web local con el Conversor y el Editor 3D/2D. |
| `-p`, `--port` | Define el puerto del servidor web (por defecto: `8080`). Se usa con `--web`. |
| `--no-browser` | En modo web, evita abrir automáticamente el navegador predeterminado. |
| `-v`, `--version` | Muestra la versión, hash de commit y fecha de compilación del ejecutable. |
| `-h`, `--help` | Muestra la ayuda con todos los parámetros disponibles. |

> *Nota: Las opciones `--classic` y `--slim` son mutuamente excluyentes.*

### Ejemplos en Consola

```bash
# Conversión por defecto generando ambos modelos (Steve y Alex):
./bin/mcskin mis_skins/guerrero.png
# -> Genera: mis_skins/guerrero.mcpack

# Restringir solo al modelo clásico Steve (4px):
./bin/mcskin --classic mis_skins/steve_custom.png

# Restringir solo al modelo fino Alex (3px):
./bin/mcskin --slim mis_skins/alex_custom.png

# Iniciar servidor web en puerto personalizado sin abrir navegador:
./bin/mcskin --web --port 9090 --no-browser
```

---

## 📦 Estructura Técnica del Archivo `.mcpack`

El archivo `.mcpack` generado es un archivo ZIP estandarizado conforme a las especificaciones oficiales de Minecraft Bedrock:

```text
[nombre_skin].mcpack
├── manifest.json       # Manifiesto con UUIDs v4 (RFC-4122) únicos para el paquete
├── skins.json          # Registro de skins y mapeo de geometrías (classic y slim)
├── texts/
│   └── en_US.lang      # Claves de localización para nombres en el juego
└── [nombre_skin].png   # Imagen de textura compartida en la raíz del paquete
```

### Requisitos Técnicos de la Imagen PNG:
- **Formato**: PNG válido (RGBA).
- **Dimensiones aceptadas**:
  - `64x64` píxeles (estándar moderno de Minecraft).
  - `128x128` píxeles (skins en alta definición HD soportadas por Bedrock).
  - `64x32` píxeles (formato clásico heredado previo a la 1.8).

---

## 📥 Descargas Oficiales de Releases (CI/CD)

Los ejecutables oficiales se compilan automáticamente mediante GitHub Actions ([`.github/workflows/release.yml`](.github/workflows/release.yml)) en cada lanzamiento:

- **Windows (`amd64`)**: Archivo `mcskin_<tag>_windows_amd64.zip` con icono nativo y manifiesto embebido (`mcskin.exe`).
- **Linux (`amd64`)**: Archivo `mcskin_<tag>_linux_amd64.tar.gz` con binario estático y documentación.
- **Integridad**: Incluye archivo `checksums.txt` con los hashes SHA-256 de todos los ejecutables.

Visita la página de **[Releases en GitHub](https://github.com/douglaspands/mcskin/releases)** para descargar la versión más reciente.

---

## 🛠️ Guía para Desarrolladores

Esta sección está destinada a quienes deseen compilar el proyecto desde el código fuente o ejecutar pruebas.

### Requisitos Previos
- [Go](https://go.dev/dl/) versión 1.25 o superior.
- Git.
- `make` (opcional, para atajos de compilación).

### Compilación con Makefile

```bash
# Compila los binarios para Linux y Windows en la carpeta bin/:
make build

# Compila únicamente para Linux (amd64):
make build-linux

# Compila únicamente para Windows (.exe con manifiesto incrustado):
make build-windows

# Ejecuta todas las pruebas unitarias:
make test

# Ejecuta el linter oficial (go vet):
make lint

# Limpia ejecutables y archivos temporales:
make clean
```

### Test-Driven Development (TDD) y Aislamiento en Memoria
El proyecto aplica una disciplina estricta de **TDD** y **100% de aislamiento en memoria**:

```bash
# Ejecuta la suite de pruebas compacta (silenciosa si todo pasa):
./scripts/test-compact.sh

# Ejecuta pruebas unitarias por paquete:
go test -v ./internal/bedrock/...
go test -v ./internal/converter/...
go test -v ./internal/skin/...
go test -v ./internal/pack/...
go test -v ./cmd/mcskin/...
```

> **Regla de Aislamiento**: Las pruebas unitarias están 100% simuladas en memoria (`bytes.Buffer`, `bytes.Reader`). Ninguna prueba unitaria realiza llamadas de red ni escribe en disco fuera de directorios efímeros (`t.TempDir()`).

### Verificación de `.mcpack` con la Skill del Proyecto
Para validar esquemas JSON, unicidad de UUIDv4 y dimensiones de texturas en cualquier paquete:

```bash
python3 .agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack.py ruta/a/skin.mcpack
```

---

## 📄 Licencia

Este proyecto se distribuye bajo los términos de la licencia [MIT](LICENSE). Es libre y gratuito para uso personal, educativo y comercial.
