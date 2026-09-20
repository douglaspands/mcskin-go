package web

import (
	"fmt"
	"net"
	"strings"
)

// AddrsProviderFunc represents a function that returns network interface addresses.
type AddrsProviderFunc func() ([]net.Addr, error)

// ServerInfo contains details about server port and access URLs.
type ServerInfo struct {
	Port         int      `json:"port"`
	LocalURL     string   `json:"localUrl"`
	NetworkURLs  []string `json:"networkUrls"`
	PreferredURL string   `json:"preferredUrl"`
}

// FilterLANIPv4 extracts non-loopback, non-link-local IPv4 addresses from network interfaces.
func FilterLANIPv4(addrs []net.Addr) []string {
	var results []string

	for _, addr := range addrs {
		var ip net.IP

		switch v := addr.(type) {
		case *net.IPNet:
			ip = v.IP
		case *net.IPAddr:
			ip = v.IP
		default:
			// Fallback parsing from string if mock or generic
			ipStr := addr.String()
			if idx := strings.Index(ipStr, "/"); idx != -1 {
				ipStr = ipStr[:idx]
			}
			ip = net.ParseIP(ipStr)
		}

		if ip == nil || ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
			continue
		}

		ipv4 := ip.To4()
		if ipv4 == nil {
			continue
		}

		// Avoid 127.* or 169.254.*
		if ipv4[0] == 127 || (ipv4[0] == 169 && ipv4[1] == 254) {
			continue
		}

		results = append(results, ipv4.String())
	}

	return results
}

// ResolveServerInfo builds ServerInfo containing local and network URLs for the given port.
func ResolveServerInfo(port int, provider AddrsProviderFunc) ServerInfo {
	if provider == nil {
		provider = net.InterfaceAddrs
	}

	localURL := fmt.Sprintf("http://localhost:%d", port)
	var networkURLs []string

	if addrs, err := provider(); err == nil {
		lanIPs := FilterLANIPv4(addrs)
		for _, ip := range lanIPs {
			networkURLs = append(networkURLs, fmt.Sprintf("http://%s:%d", ip, port))
		}
	}

	preferredURL := localURL
	if len(networkURLs) > 0 {
		preferredURL = networkURLs[0]
	}

	return ServerInfo{
		Port:         port,
		LocalURL:     localURL,
		NetworkURLs:  networkURLs,
		PreferredURL: preferredURL,
	}
}
