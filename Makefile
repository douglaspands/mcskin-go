BINARY_NAME=png-to-mcpack
BIN_DIR=bin

.PHONY: all test build build-linux build-windows clean lint

all: test build

test:
	go test -v ./...

lint:
	go vet ./...

build: build-linux build-windows

build-linux:
	mkdir -p $(BIN_DIR)
	CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o $(BIN_DIR)/$(BINARY_NAME) ./cmd/$(BINARY_NAME)

build-windows:
	mkdir -p $(BIN_DIR)
	CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags="-s -w" -o $(BIN_DIR)/$(BINARY_NAME).exe ./cmd/$(BINARY_NAME)

clean:
	rm -rf $(BIN_DIR) files/*.mcpack
