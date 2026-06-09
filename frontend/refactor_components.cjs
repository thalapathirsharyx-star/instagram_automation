const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  let files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });
  return arrayOfFiles;
}

const files = getAllFiles(srcDir);

let totalReplacements = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // 1. Color Replacements (Backgrounds)
  content = content.replace(/bg-purple-\d{3}/g, 'bg-brand');
  content = content.replace(/bg-violet-\d{3}/g, 'bg-brand');
  content = content.replace(/bg-indigo-\d{3}/g, 'bg-brand');
  content = content.replace(/bg-\[\#4F39F6\]/gi, 'bg-brand');
  content = content.replace(/bg-\[\#38BDF8\]/gi, 'bg-info');
  content = content.replace(/bg-pink-500/g, 'bg-brand');
  
  // Hardcoded dark backgrounds to standard Surface/Background
  content = content.replace(/bg-\[\#0A0A0F\]/gi, 'bg-background');
  content = content.replace(/bg-\[\#111118\]/gi, 'bg-surface');
  content = content.replace(/bg-zinc-950/g, 'bg-[#09090B]');
  
  // 2. Text Colors
  content = content.replace(/text-purple-\d{3}/g, 'text-brand');
  content = content.replace(/text-pink-\d{3}/g, 'text-brand');
  content = content.replace(/text-indigo-\d{3}/g, 'text-brand');
  content = content.replace(/text-\[\#4F39F6\]/gi, 'text-brand');
  content = content.replace(/text-\[\#38BDF8\]/gi, 'text-info');
  
  // Typography scale standardization (remove slate/gray)
  content = content.replace(/text-slate-500/g, 'text-zinc-500');
  content = content.replace(/text-slate-400/g, 'text-zinc-500');
  content = content.replace(/text-gray-500/g, 'text-zinc-500');
  content = content.replace(/text-gray-400/g, 'text-zinc-500');
  content = content.replace(/text-muted-foreground/g, 'text-zinc-500');
  content = content.replace(/text-primary-foreground/g, 'text-zinc-900');
  
  // 3. Borders
  content = content.replace(/border-purple-\d{3}/g, 'border-brand');
  content = content.replace(/border-pink-\d{3}/g, 'border-brand');
  content = content.replace(/border-\[\#4F39F6\]/gi, 'border-brand');
  content = content.replace(/border-white\/10/g, 'border-zinc-200');
  content = content.replace(/border-white\/5/g, 'border-zinc-200');
  
  // 4. Status Colors
  content = content.replace(/bg-green-500/g, 'bg-success');
  content = content.replace(/text-green-500/g, 'text-success');
  content = content.replace(/bg-amber-\d{3}/g, 'bg-warning');
  content = content.replace(/text-amber-\d{3}/g, 'text-warning');
  content = content.replace(/bg-red-500/g, 'bg-danger');
  content = content.replace(/text-red-500/g, 'text-danger');
  content = content.replace(/text-rose-500/g, 'text-danger');
  
  // 5. Button Refactoring
  content = content.replace(/btn-premium-cta/g, 'btn-primary');
  content = content.replace(/w3-button-primary/g, 'btn-primary');
  
  // 6. Card Refactoring
  content = content.replace(/w3-card/g, 'card-standard');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    totalReplacements++;
  }
});

console.log(`Refactored ${totalReplacements} files.`);
