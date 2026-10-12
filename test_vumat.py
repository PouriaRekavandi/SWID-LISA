# Let's perform a simple syntax check to make sure there are no obvious fortran syntax issues.
import os

# Read the file
with open('VUMAT_PA6_v13.for', 'r') as f:
    content = f.read()

# Make sure all lines that aren't comments start with at least 6 spaces (standard fixed-format Fortran)
lines = content.split('\n')
for i, line in enumerate(lines):
    if not line: continue
    if line[0] in ['C', 'c', '*']: continue
    if line.startswith('      ') or (len(line) > 5 and line[5] != ' '):
        pass
    else:
        # It's an error if we find non-comment code not indented by 6 spaces
        print(f"Warning on line {i+1}: {line}")

print("Fortran syntax review complete.")
