package bedrock_test

import (
	"regexp"
	"testing"

	"mcskin/internal/bedrock"
)

var uuidRegex = regexp.MustCompile(`^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$`)

func TestNewUUID_Format(t *testing.T) {
	id, err := bedrock.NewUUID()
	if err != nil {
		t.Fatalf("unexpected error generating UUID: %v", err)
	}

	if len(id) != 36 {
		t.Fatalf("expected UUID length 36, got %d (%s)", len(id), id)
	}

	if !uuidRegex.MatchString(id) {
		t.Fatalf("UUID %q does not match RFC-4122 v4 pattern", id)
	}
}

func TestNewUUID_Uniqueness(t *testing.T) {
	seen := make(map[string]bool)
	count := 100

	for i := 0; i < count; i++ {
		id, err := bedrock.NewUUID()
		if err != nil {
			t.Fatalf("unexpected error on iteration %d: %v", i, err)
		}
		if seen[id] {
			t.Fatalf("duplicate UUID generated: %s", id)
		}
		seen[id] = true
	}
}
