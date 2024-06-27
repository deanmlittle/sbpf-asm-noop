# Solana SDK and toolchain paths
SOLANA_SDK?=$(HOME)/.cache/solana/v1.41
LLVM_DIR?=$(SOLANA_SDK)/platform-tools/llvm
CLANG:=$(LLVM_DIR)/bin/clang
LD:=$(LLVM_DIR)/bin/ld.lld

# Set src/out directory and compiler flags
SRC:=src/noop
OUT:=build
DEPLOY:=deploy
ARCH:=-target sbf -march=bpfel+solana
LDFLAGS:=-shared -z notext --image-base 0x100000000 --strip-debug

# Define the target
TARGET:=$(DEPLOY)/noop.so

# Default target
all: $(TARGET)

# Build shared object
$(TARGET): $(OUT)/noop.o ${SRC}/noop.ld
	$(LD) $(LDFLAGS) -T ${SRC}/noop.ld -o $@ $<

# Compile assembly
$(OUT)/noop.o: ${SRC}/noop.s
	mkdir -pv $(OUT)
	$(CLANG) -Os $(ARCH) -c -o $@ $<

# Prepare for deploy
deploy:
	@if [ ! -f $(DEPLOY)/noop_keypair.json ]; then \
		echo "noop_keypair.json does not exist. Creating..."; \
		solana-keygen new --no-bip39-passphrase --outfile $(DEPLOY)/noop_keypair.json; \
	fi

# Cleanup
.PHONY: clean
clean:
	rm -f -rv $(OUT)

# Deploy rule can be run separately
.PHONY: deploy
