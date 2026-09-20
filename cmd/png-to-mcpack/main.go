package main

import (
	"flag"
	"fmt"
	"io"
	"os"

	"png-to-mcpack/internal/bedrock"
	"png-to-mcpack/internal/converter"
)

var (
	version = "dev"
	commit  = "none"
	date    = "unknown"
)

func main() {
	os.Exit(run(os.Args[1:], os.Stdout, os.Stderr))
}

func run(args []string, stdout, stderr io.Writer) int {
	if len(args) == 0 {
		printUsage(stderr)
		return 1
	}

	for _, arg := range args {
		if arg == "-h" || arg == "--help" {
			printUsage(stdout)
			return 0
		}
		if arg == "-v" || arg == "--version" {
			fmt.Fprintf(stdout, "png-to-mcpack version %s (commit: %s, built at: %s)\n", version, commit, date)
			return 0
		}
	}

	fs := flag.NewFlagSet("png-to-mcpack", flag.ContinueOnError)
	fs.SetOutput(stderr)

	var classic bool
	var slim bool
	var both bool
	var showVersion bool
	var overwrite bool
	var inputFlag string

	fs.BoolVar(&classic, "classic", false, "Generate only classic humanoid model (4px arms / Steve)")
	fs.BoolVar(&slim, "slim", false, "Generate only slim humanoid model (3px arms / Alex)")
	fs.BoolVar(&both, "both", false, "Generate both classic and slim models in the pack (default)")
	fs.BoolVar(&showVersion, "version", false, "Display version information")
	fs.BoolVar(&showVersion, "v", false, "Display version information (shorthand)")
	fs.BoolVar(&overwrite, "force", true, "Overwrite existing .mcpack output file if already present")
	fs.StringVar(&inputFlag, "input", "", "Path to input PNG skin file")
	fs.StringVar(&inputFlag, "i", "", "Path to input PNG skin file (shorthand)")

	if err := fs.Parse(args); err != nil {
		return 1
	}

	if showVersion {
		fmt.Fprintf(stdout, "png-to-mcpack version %s (commit: %s, built at: %s)\n", version, commit, date)
		return 0
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
	fmt.Fprintln(w, "Usage: png-to-mcpack [options] <path/to/skin.png>")
	fmt.Fprintln(w, "")
	fmt.Fprintln(w, "Convert Minecraft PNG skin textures into Bedrock .mcpack archives.")
	fmt.Fprintln(w, "")
	fmt.Fprintln(w, "Options:")
	fmt.Fprintln(w, "  --both          Generate both classic and slim models in the pack (default)")
	fmt.Fprintln(w, "  --classic       Generate only classic humanoid geometry (4px arms / Steve)")
	fmt.Fprintln(w, "  --slim          Generate only slim humanoid geometry (3px arms / Alex)")
	fmt.Fprintln(w, "  --force         Overwrite existing .mcpack output file (default true)")
	fmt.Fprintln(w, "  -i, --input     Path to input PNG skin file")
	fmt.Fprintln(w, "  -v, --version   Display version information")
	fmt.Fprintln(w, "  -h, --help      Display this help message")
}
