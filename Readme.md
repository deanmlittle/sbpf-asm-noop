# Solana Fibonacci ASM
A simple fibonacci sequence written in sBPF assembly. Tests are CU-optimized for f(93) at `904cus` as this is the largest sequence number that fits inside of a 64-bit unsigned integer type.

Benchmarks are as follows:

| F(n) | unlogged | logged  |
| -----| ---------| --------|
|  0   | 8 CUs    | 259 CUs |
|  1   | 8 CUs    | 259 CUs |
|  2   | 16 CUs   | 267 CUs |
|  5   | 37 CUs   | 288 CUs |
|  32  | 226 CUs  | 477 CUs |
|  93  | 653 CUs  | 904 CUs |