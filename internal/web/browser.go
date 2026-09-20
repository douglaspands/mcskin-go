package web

import (
	"os/exec"
	"runtime"
)

// CommandRunner defines a function to execute an external command.
type CommandRunner func(name string, args ...string) error

func defaultRunner(name string, args ...string) error {
	cmd := exec.Command(name, args...)
	return cmd.Start()
}

// BuildBrowserCommand returns the executable name and arguments for a target OS and URL.
func BuildBrowserCommand(goos, url string) (string, []string) {
	switch goos {
	case "windows":
		return "cmd", []string{"/c", "start", "", url}
	case "darwin":
		return "open", []string{url}
	default:
		return "xdg-open", []string{url}
	}
}

// OpenBrowser launches the default browser for the given URL.
func OpenBrowser(url string, goos string, runner CommandRunner) error {
	if goos == "" {
		goos = runtime.GOOS
	}
	if runner == nil {
		runner = defaultRunner
	}

	name, args := BuildBrowserCommand(goos, url)
	return runner(name, args...)
}
