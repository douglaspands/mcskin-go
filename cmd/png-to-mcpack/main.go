package main

import (
	"flag"
	"fmt"
	"io"
	"os"

	"png-to-mcpack/internal/converter"
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
	}

	fs := flag.NewFlagSet("png-to-mcpack", flag.ContinueOnError)
	fs.SetOutput(stderr)

	var slim bool
	var overwrite bool
	var inputFlag string

	fs.BoolVar(&slim, "slim", false, "Use slim humanoid model (3px arms / Alex) instead of classic (4px arms / Steve)")
	fs.BoolVar(&overwrite, "force", true, "Overwrite existing .mcpack output file if already present")
	fs.StringVar(&inputFlag, "input", "", "Path to input PNG skin file")
	fs.StringVar(&inputFlag, "i", "", "Path to input PNG skin file (shorthand)")

	if err := fs.Parse(args); err != nil {
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

	res, err := converter.Convert(converter.Options{
		InputPath: inputPath,
		Slim:      slim,
		Overwrite: overwrite,
	})
	if err != nil {
		fmt.Fprintf(stderr, "Error: %v\n", err)
		return 1
	}

	modelType := "classic (4px)"
	if res.Slim {
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
	fmt.Fprintln(w, "  --slim          Configure skin with slim humanoid geometry (3px arms / Alex)")
	fmt.Fprintln(w, "  --force         Overwrite existing .mcpack output file (default true)")
	fmt.Fprintln(w, "  -i, --input     Path to input PNG skin file")
	fmt.Fprintln(w, "  -h, --help      Display this help message")
}
