package main

import (
	"context"
	"flag"
	"fmt"
	"io"
	"net/http"
	"os"
	"runtime"
	"time"

	"mcskin/internal/bedrock"
	"mcskin/internal/converter"
	"mcskin/internal/web"
)

var (
	version = "dev"
	commit  = "none"
	date    = "unknown"

	currentOS       = runtime.GOOS
	webServerRunner = defaultWebServerRunner
)

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

func defaultWebServerRunner(port int, openBrowser bool, stdout, stderr io.Writer) int {
	staticFS, err := web.GetStaticFS()
	if err != nil {
		fmt.Fprintf(stderr, "Erro ao carregar arquivos estáticos do servidor web: %v\n", err)
		return 1
	}

	addr := fmt.Sprintf(":%d", port)
	srv := &http.Server{Addr: addr}

	cfg := web.Config{
		Port:     port,
		StaticFS: staticFS,
		ShutdownTrigger: func() error {
			ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
			defer cancel()
			return srv.Shutdown(ctx)
		},
	}

	srv.Handler = web.NewHandler(cfg)
	info := web.ResolveServerInfo(port, nil)

	fmt.Fprintln(stdout, "===========================================================")
	fmt.Fprintln(stdout, " ⛏️  CRIE SKINS LEGAIS - Servidor Web Iniciado!")
	fmt.Fprintf(stdout, "  Acesse no computador: %s\n", info.LocalURL)
	if len(info.NetworkURLs) > 0 {
		fmt.Fprintln(stdout, "  Acesse em celulares e tablets na mesma rede Wi-Fi:")
		for _, u := range info.NetworkURLs {
			fmt.Fprintf(stdout, "    👉 %s\n", u)
		}
	}
	fmt.Fprintln(stdout, "  Pressione Ctrl+C para encerrar o servidor.")
	fmt.Fprintln(stdout, "===========================================================")

	if openBrowser {
		_ = web.OpenBrowser(info.LocalURL, currentOS, nil)
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		fmt.Fprintf(stderr, "Erro no servidor web: %v\n", err)
		return 1
	}

	return 0
}

func run(args []string, stdout, stderr io.Writer) int {
	if len(args) == 0 {
		if currentOS == "windows" || currentOS == "darwin" {
			return webServerRunner(8080, true, stdout, stderr)
		}
		printUsage(stderr)
		return 1
	}

	for _, arg := range args {
		if arg == "-h" || arg == "--help" {
			printUsage(stdout)
			return 0
		}
		if arg == "-v" || arg == "--version" {
			fmt.Fprintf(stdout, "mcskin version %s (commit: %s, built at: %s)\n", version, commit, date)
			return 0
		}
	}

	fs := flag.NewFlagSet("mcskin", flag.ContinueOnError)
	fs.SetOutput(stderr)

	var classic bool
	var slim bool
	var both bool
	var showVersion bool
	var overwrite bool
	var inputFlag string
	var webMode bool
	var port int
	var noBrowser bool

	fs.BoolVar(&classic, "classic", false, "Generate only classic humanoid model (4px arms / Steve)")
	fs.BoolVar(&slim, "slim", false, "Generate only slim humanoid model (3px arms / Alex)")
	fs.BoolVar(&both, "both", false, "Generate both classic and slim models in the pack (default)")
	fs.BoolVar(&showVersion, "version", false, "Display version information")
	fs.BoolVar(&showVersion, "v", false, "Display version information (shorthand)")
	fs.BoolVar(&overwrite, "force", true, "Overwrite existing .mcpack output file if already present")
	fs.StringVar(&inputFlag, "input", "", "Path to input PNG skin file")
	fs.StringVar(&inputFlag, "i", "", "Path to input PNG skin file (shorthand)")

	fs.BoolVar(&webMode, "web", false, "Start interactive web server mode ('CRIE SKINS LEGAIS')")
	fs.BoolVar(&webMode, "w", false, "Start interactive web server mode (shorthand)")
	fs.IntVar(&port, "port", 8080, "Port for web server")
	fs.IntVar(&port, "p", 8080, "Port for web server (shorthand)")
	fs.BoolVar(&noBrowser, "no-browser", false, "Do not open default browser automatically in web mode")

	if err := fs.Parse(args); err != nil {
		return 1
	}

	if showVersion {
		fmt.Fprintf(stdout, "mcskin version %s (commit: %s, built at: %s)\n", version, commit, date)
		return 0
	}

	if webMode {
		return webServerRunner(port, !noBrowser, stdout, stderr)
	}

	if classic && slim {
		fmt.Fprintln(stderr, "Error: --classic and --slim flags are mutually exclusive and cannot be used together")
		return 1
	}

	inputPath := inputFlag
	if inputPath == "" && fs.NArg() > 0 {
		inputPath = fs.Arg(0)
	}

	if inputPath == "" {
		fmt.Fprintln(stderr, "Error: no input PNG file specified")
		printUsage(stderr)
		return 1
	}

	modelMode := bedrock.ModelModeBoth
	if classic {
		modelMode = bedrock.ModelModeClassic
	} else if slim {
		modelMode = bedrock.ModelModeSlim
	}

	res, err := converter.Convert(converter.Options{
		InputPath: inputPath,
		Model:     modelMode,
		Overwrite: overwrite,
	})
	if err != nil {
		fmt.Fprintf(stderr, "Error: %v\n", err)
		return 1
	}

	modelType := "both (classic & slim)"
	switch res.Model {
	case bedrock.ModelModeClassic:
		modelType = "classic (4px)"
	case bedrock.ModelModeSlim:
		modelType = "slim (3px)"
	}

	fmt.Fprintf(stdout, "Successfully converted %q to Bedrock skin pack [%s]:\n", res.SkinName, modelType)
	fmt.Fprintf(stdout, "  Output: %s (%d bytes)\n", res.OutputPath, res.OutputSize)
	return 0
}

func printUsage(w io.Writer) {
	fmt.Fprintln(w, "Usage: mcskin [options] <path/to/skin.png>")
	fmt.Fprintln(w, "   or: mcskin --web [options]")
	fmt.Fprintln(w, "")
	fmt.Fprintln(w, "Convert Minecraft PNG skin textures into Bedrock .mcpack archives.")
	fmt.Fprintln(w, "")
	fmt.Fprintln(w, "CLI Conversion Options:")
	fmt.Fprintln(w, "  --both          Generate both classic and slim models in the pack (default)")
	fmt.Fprintln(w, "  --classic       Generate only classic humanoid geometry (4px arms / Steve)")
	fmt.Fprintln(w, "  --slim          Generate only slim humanoid geometry (3px arms / Alex)")
	fmt.Fprintln(w, "  --force         Overwrite existing .mcpack output file (default true)")
	fmt.Fprintln(w, "  -i, --input     Path to input PNG skin file")
	fmt.Fprintln(w, "")
	fmt.Fprintln(w, "Web Server Options ('CRIE SKINS LEGAIS'):")
	fmt.Fprintln(w, "  -w, --web       Start local web server with friendly Minecraft UI")
	fmt.Fprintln(w, "  -p, --port      Port for web server (default: 8080)")
	fmt.Fprintln(w, "  --no-browser    Do not automatically open default browser on launch")
	fmt.Fprintln(w, "")
	fmt.Fprintln(w, "General Options:")
	fmt.Fprintln(w, "  -v, --version   Display version information")
	fmt.Fprintln(w, "  -h, --help      Display this help message")
}
