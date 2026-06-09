import os

files_to_update = [
    'c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/index.css',
    'c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/pages/Features.tsx',
    'c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/pages/Landing.tsx'
]

replacements = [
    ('#833AB4', '#4F39F6'),
    ('#833ab4', '#4F39F6'),
    ('#E1306C', '#8B5CF6'),
    ('#e1306c', '#8B5CF6'),
    ('#FCAF45', '#38BDF8'),
    ('#fcaf45', '#38BDF8'),
    ('#fcb045', '#38BDF8'),
    ('#FD1D1D', '#6366F1'),
    ('#fd1d1d', '#6366F1'),
    ('rgba(225, 48, 108', 'rgba(79, 57, 246')
]

for file_path in files_to_update:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        for old, new in replacements:
            content = content.replace(old, new)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
print("Successfully replaced all Instagram gradients with the #4F39F6 SaaS palette.")
