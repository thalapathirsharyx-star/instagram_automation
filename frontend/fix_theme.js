const fs = require('fs');

const files = [
  'src/pages/Features.tsx',
  'src/pages/SpamShield.tsx',
  'src/pages/PricingPage.tsx',
  'src/pages/Legal.tsx',
  'src/pages/DataDeletion.tsx'
];

files.forEach(f => {
  if (!fs.existsSync(f)) return;
  let c = fs.readFileSync(f, 'utf8');
  
  // Replace dark wrapper classes with light ones
  c = c.replace(/className="dark min-h-screen[^"]+"/g, 'className="min-h-screen bg-zinc-50 text-zinc-900 font-inter relative overflow-hidden"');
  
  // Backgrounds
  c = c.replace(/bg-\[#0A0A0F\]/g, 'bg-zinc-50');
  c = c.replace(/bg-\[#111118\]/g, 'bg-white');
  c = c.replace(/bg-white\/\[0\.02\]/g, 'bg-white');
  c = c.replace(/bg-white\/5/g, 'bg-zinc-50');
  c = c.replace(/bg-\[#1E293B\]/g, 'bg-zinc-100');
  c = c.replace(/bg-\[#0F172A\]/g, 'bg-zinc-50');
  
  // Borders
  c = c.replace(/border-white\/10/g, 'border-zinc-200');
  c = c.replace(/border-white\/5/g, 'border-zinc-200');
  c = c.replace(/border-zinc-300/g, 'border-zinc-200'); // sometimes explicitly defined dark
  
  // Text colors
  c = c.replace(/text-primary-foreground/g, 'text-zinc-900');
  c = c.replace(/text-zinc-300/g, 'text-zinc-600');
  c = c.replace(/text-zinc-400/g, 'text-zinc-600');
  
  fs.writeFileSync(f, c);
});

console.log('Fixed theme colors');
