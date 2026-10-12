with open('VUMAT_PA6_v13.for', 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('  100     continue'):
        new_lines.append('  100     continue\n')
    elif line.startswith('  110     continue'):
        new_lines.append('  110     continue\n')
    elif line.startswith('  200 continue'):
        new_lines.append('  200 continue\n')
    else:
        new_lines.append(line)

with open('VUMAT_PA6_v13.for', 'w') as f:
    f.writelines(new_lines)
