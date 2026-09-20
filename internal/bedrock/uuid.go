package bedrock

import (
	"crypto/rand"
	"fmt"
	"io"
)

// NewUUID generates a RFC-4122 compliant version 4 UUID using crypto/rand.
func NewUUID() (string, error) {
	var uuid [16]byte
	if _, err := io.ReadFull(rand.Reader, uuid[:]); err != nil {
		return "", fmt.Errorf("failed to generate random bytes: %w", err)
	}

	// Set version 4 (bits 4-7 of time_hi_and_version to 0100)
	uuid[6] = (uuid[6] & 0x0f) | 0x40
	// Set variant to RFC-4122 (bits 6-7 of clock_seq_hi_and_reserved to 10)
	uuid[8] = (uuid[8] & 0x3f) | 0x80

	return fmt.Sprintf("%08x-%04x-%04x-%04x-%012x",
		uuid[0:4],
		uuid[4:6],
		uuid[6:8],
		uuid[8:10],
		uuid[10:16],
	), nil
}
