package web_test

import (
	"net"
	"testing"

	"mcskin/internal/web"
)

type mockAddr struct {
	ipStr string
}

func (m mockAddr) Network() string { return "ip+net" }
func (m mockAddr) String() string  { return m.ipStr }

func TestFilterLANIPv4(t *testing.T) {
	tests := []struct {
		name     string
		input    []net.Addr
		expected []string
	}{
		{
			name: "filters loopback, ipv6, and link-local",
			input: []net.Addr{
				mockAddr{ipStr: "127.0.0.1/8"},
				mockAddr{ipStr: "::1/128"},
				mockAddr{ipStr: "fe80::1/64"},
				mockAddr{ipStr: "169.254.1.2/16"},
				mockAddr{ipStr: "192.168.1.100/24"},
				mockAddr{ipStr: "10.0.0.5/8"},
			},
			expected: []string{"192.168.1.100", "10.0.0.5"},
		},
		{
			name: "empty when only loopback present",
			input: []net.Addr{
				mockAddr{ipStr: "127.0.0.1/8"},
			},
			expected: []string{},
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			got := web.FilterLANIPv4(tc.input)
			if len(got) != len(tc.expected) {
				t.Fatalf("expected %d addrs, got %d: %v", len(tc.expected), len(got), got)
			}
			for i, exp := range tc.expected {
				if got[i] != exp {
					t.Errorf("at index %d: expected %s, got %s", i, exp, got[i])
				}
			}
		})
	}
}

func TestResolveServerInfo(t *testing.T) {
	mockProvider := func() ([]net.Addr, error) {
		return []net.Addr{
			mockAddr{ipStr: "127.0.0.1/8"},
			mockAddr{ipStr: "192.168.0.42/24"},
		}, nil
	}

	info := web.ResolveServerInfo(8080, mockProvider)
	if info.Port != 8080 {
		t.Errorf("expected port 8080, got %d", info.Port)
	}
	if info.LocalURL != "http://localhost:8080" {
		t.Errorf("expected local URL http://localhost:8080, got %s", info.LocalURL)
	}
	if len(info.NetworkURLs) != 1 || info.NetworkURLs[0] != "http://192.168.0.42:8080" {
		t.Errorf("expected network URL http://192.168.0.42:8080, got %v", info.NetworkURLs)
	}
	if info.PreferredURL != "http://192.168.0.42:8080" {
		t.Errorf("expected preferred URL http://192.168.0.42:8080, got %s", info.PreferredURL)
	}
}
