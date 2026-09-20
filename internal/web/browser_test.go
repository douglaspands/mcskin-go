package web_test

import (
	"reflect"
	"testing"

	"mcskin/internal/web"
)

func TestBuildBrowserCommand(t *testing.T) {
	tests := []struct {
		goos         string
		url          string
		expectedName string
		expectedArgs []string
	}{
		{
			goos:         "windows",
			url:          "http://localhost:8080",
			expectedName: "cmd",
			expectedArgs: []string{"/c", "start", "", "http://localhost:8080"},
		},
		{
			goos:         "darwin",
			url:          "http://localhost:8080",
			expectedName: "open",
			expectedArgs: []string{"http://localhost:8080"},
		},
		{
			goos:         "linux",
			url:          "http://localhost:8080",
			expectedName: "xdg-open",
			expectedArgs: []string{"http://localhost:8080"},
		},
	}

	for _, tc := range tests {
		t.Run(tc.goos, func(t *testing.T) {
			name, args := web.BuildBrowserCommand(tc.goos, tc.url)
			if name != tc.expectedName {
				t.Errorf("expected command name %s, got %s", tc.expectedName, name)
			}
			if !reflect.DeepEqual(args, tc.expectedArgs) {
				t.Errorf("expected args %v, got %v", tc.expectedArgs, args)
			}
		})
	}
}

func TestOpenBrowser_WithMockRunner(t *testing.T) {
	var executedName string
	var executedArgs []string

	mockRunner := func(name string, args ...string) error {
		executedName = name
		executedArgs = args
		return nil
	}

	err := web.OpenBrowser("http://localhost:8080", "windows", mockRunner)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if executedName != "cmd" {
		t.Errorf("expected 'cmd', got %s", executedName)
	}
	expectedArgs := []string{"/c", "start", "", "http://localhost:8080"}
	if !reflect.DeepEqual(executedArgs, expectedArgs) {
		t.Errorf("expected %v, got %v", expectedArgs, executedArgs)
	}
}
