import os
import re

files_to_update = [
    'c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/pages/Landing.tsx',
    'c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/pages/Features.tsx',
    'c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/index.css'
]

literal_replacements = {
    'bg-[#0c0c0d]': 'bg-white',
    'bg-[#09090b]': 'bg-white',
    'bg-[#121214]': 'bg-white',
    'bg-[#000000]': 'bg-white',
    'bg-[#26262b]': 'bg-zinc-100',
    'bg-[#090b11]/80': 'bg-white',
    'bg-[#0c0f17]': 'bg-white',
    'bg-zinc-405': 'bg-zinc-100',
    'bg-zinc-400': 'bg-zinc-100',
    
    # CSS specific
    'background: #121826;': 'background: #ffffff;',
    'background-color: #07080C !important;': 'background-color: #ffffff !important;',
    'background-color: #202024 !important;': 'background-color: #f4f4f5 !important;',
    
    # Border fixes for visibility
    'border-zinc-100/10': 'border-zinc-200',
    'border-white/10': 'border-zinc-200',
    'border-white/5': 'border-zinc-200'
}

for file_path in files_to_update:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for old, new in literal_replacements.items():
            content = content.replace(old, new)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
print("Successfully cleaned up the remaining dark backgrounds!")
