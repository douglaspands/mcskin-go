unexport GOROOT

BINARY_NAME=mcskin
BIN_DIR=bin
DIST_DIR=dist

VERSION ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
COMMIT ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "none")
BUILD_DATE ?= $(shell date -u +'%Y-%m-%dT%H:%M:%SZ')
LDFLAGS = -s -w -X main.version=$(VERSION) -X main.commit=$(COMMIT) -X main.date=$(BUILD_DATE)

.PHONY: all test build build-all build-linux build-windows build-darwin-arm64 clean lint

all: test build

test:
	go test -v ./...

lint:
	go vet ./...

build: build-linux build-windows build-darwin-arm64

build-all: build

build-linux:
	mkdir -p $(BIN_DIR)
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="$(LDFLAGS)" -o $(BIN_DIR)/$(BINARY_NAME) ./cmd/$(BINARY_NAME)

build-windows:
	mkdir -p $(BIN_DIR)
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="$(LDFLAGS)" -o $(BIN_DIR)/$(BINARY_NAME).exe ./cmd/$(BINARY_NAME)

build-darwin-arm64:
	mkdir -p $(BIN_DIR)
	CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags="$(LDFLAGS)" -o $(BIN_DIR)/$(BINARY_NAME)-darwin-arm64 ./cmd/$(BINARY_NAME)

clean:
	rm -rf $(BIN_DIR) $(DIST_DIR) files/*.mcpack
