import os
import re

files_to_update = [
    'c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/pages/Landing.tsx',
    'c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/pages/Features.tsx',
    'c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/components/Footer.tsx',
    'c:/Users/mrlem/Desktop/my_works/instagram_automation/frontend/src/components/Navbar.tsx'
]

literal_replacements = {
    'bg-black/20': 'bg-zinc-50',
    'bg-black/30': 'bg-zinc-100',
    'bg-black/40': 'bg-zinc-100',
    'bg-black/60': 'bg-zinc-100',
    'bg-black/80': 'bg-white/80',
    'bg-white/[0.02]': 'bg-zinc-50',
    'bg-white/[0.04]': 'bg-zinc-100',
    'bg-white/5': 'bg-zinc-100',
    'bg-white/10': 'bg-zinc-100',
    'bg-white/20': 'bg-zinc-200',
    
    'border-white/5': 'border-zinc-200',
    'border-white/10': 'border-zinc-300',
    'border-white/20': 'border-zinc-300',
    'border-[#1C2538]': 'border-zinc-200',
    
    'from-[#0B1020]/20': 'from-zinc-50',
    'from-[#0B1020]/60': 'from-zinc-100',
    'to-black/20': 'to-zinc-50',
    
    'bg-[#070707]': 'bg-white',
    'bg-[#0A0A0F]': 'bg-zinc-50',
    'bg-[#0B1020]': 'bg-zinc-50',
    'bg-[#121826]': 'bg-white',
    
    'mockup-dark': 'mockup-light',
    
    'stroke="white"': 'stroke="#18181b"',
    'fill="white"': 'fill="#18181b"',
}

regex_replacements = {
    r'\bto-black\b': 'to-white',
    r'\bfrom-black\b': 'from-white',
    r'\bvia-black\b': 'via-white',
    
    r'\bborder-zinc-700\b': 'border-zinc-300',
    r'\bborder-zinc-800\b': 'border-zinc-200',
    
    r'\bbg-black\b': 'bg-white',
    r'\bbg-zinc-950\b': 'bg-white',
    r'\bbg-zinc-900\b': 'bg-zinc-100',
    r'\bbg-zinc-850\b': 'bg-zinc-100',
    r'\bbg-zinc-805\b': 'bg-zinc-100',
    r'\bbg-zinc-800\b': 'bg-zinc-100',
    r'\bbg-zinc-700\b': 'bg-zinc-200',
    
    r'\btext-white\b': 'text-zinc-900',
    r'\btext-zinc-50\b': 'text-zinc-900',
    r'\btext-zinc-100\b': 'text-zinc-900',
    r'\btext-zinc-200\b': 'text-zinc-800',
    r'\btext-zinc-300\b': 'text-zinc-700',
    r'\btext-zinc-305\b': 'text-zinc-700',
    r'\btext-zinc-350\b': 'text-zinc-700',
    r'\btext-zinc-400\b': 'text-zinc-600',
    r'\btext-zinc-450\b': 'text-zinc-600',
    r'\btext-zinc-455\b': 'text-zinc-600',
    r'\btext-zinc-505\b': 'text-zinc-500',
    r'\btext-zinc-555\b': 'text-zinc-500',
    
    r'\bfill-white\b': 'fill-zinc-900',
    r'\bstroke-white\b': 'stroke-zinc-900',
}

for file_path in files_to_update:
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        for old, new in literal_replacements.items():
            content = content.replace(old, new)
            
        for old, new in regex_replacements.items():
            content = re.sub(old, new, content)
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
            
print("Successfully inverted all dark theme classes to light theme classes!")
