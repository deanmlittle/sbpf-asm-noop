# Solana eBPF ASM Noop
An sbpf assembly program that has been heavily optimized to do nothing whatsover in just ___336 bytes___. It represents the current optimal implementation in regards to both computational and storage complexity as allowed by [solana_rbpf](https://github.com/solana-labs/rbpf). A more storage-optimal version may be possible with a VM library that places fewer seemingly arbitrary constraints on program section headers.

### Introduction
A noop program is useful for outputting CPI events and logging arbitrary data on chain. It also happens to provide us with the simplest possible example of a program - even simpler than [hello world](https://github.com/deanmlittle/hello-solana-asm), because it is designed to do nothing.

### Problem
The existing [noop program](https://github.com/solana-labs/solana-program-library/tree/master/account-compression/programs/noop) is not, in fact, a noop program. This is because it invokes the Rust `entrypoint!` macro which does a bunch of deserialization and things that cost us CUs. It is also much bigger than it needs to be as a result of all of these dependencies.

### Existing solutions
There exists a better Rust version of an actual `noop` program by [@caveymanloverboy](https://github.com/cavemanloverboy) which you can [check out here](https://github.com/cavemanloverboy/nanotoken/blob/main/noop/src/lib.rs). While this is optimal from a CU standpoint, unfortunately, when it comes to build size, the rust compiler leaves a lot to be desired. We can do better! ;)

### Assembly  to the rescue!
Presenting the `sbpf-asm-noop` program. Written in assembly with a custom linker, the sbpf-asm-noop program costs just 1CU, but weighs in at a *tiny* 336 bytes. It's so small you could deploy 3 of them in a single transaction! This program serves as an example of ___extreme___ sbpf binary optimization. Here's just a handful of things that have been optimized to make this program do absolutely nothing as efficiently as possible:

- removed all comments, hashes and compiler messages
- removed all dynamic data
- removed all program headers except the one mandatory PT_LOAD
- removed all section headers except null, .shstrtab and .text (these 3 are needed for rbpf to allow you to deploy the program)
- renamed .shstrtab to .s to save 7 bytes, as the constraint in rbpf is on the index of the section header string table, not the name of it.
- probably a few other things I forgot to mention

By doing all of the above, we are able to achieve an optimal sbpf binary size for our noop program. It is my hope that this serves as an extreme example of how much low hanging fruit there is in optimizing on-chain programs, that we can optimize other widely-used programs, and that we can promote the adoption of more resource-efficient programs, libraries and tooling.

### Rough benchmarks
| Version             | Size (*approx) |
|---------------------|----------------|
| Rust                | ~4kb*          |
| C                   | ~1kb*          |
| ASM                 | ~550b*         |
| ASM + custom linker | 336b           |