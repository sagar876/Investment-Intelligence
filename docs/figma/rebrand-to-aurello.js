// Pending Figma update (blocked by the Starter-plan MCP call limit on 2026-11-17).
// Run once via the Figma MCP `use_figma` tool against file OxOBImRVz6XYbV9s0OCLOL.
// Every colour in the file is bound to these primitives, so this single call rebrands
// all pages to the aurelloai.com palette and swaps type to Outfit / Instrument Sans.
const hex = h => ({ r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 });
const cols = await figma.variables.getLocalVariableCollectionsAsync();
const prim = cols.find(c => c.name === 'Primitives'); const mode = prim.modes[0].modeId;
const P = (await figma.variables.getLocalVariablesAsync('COLOR')).filter(v => v.variableCollectionId === prim.id);
const map = { 'navy/950':'#0A1F3D','navy/900':'#0B3A7A','slate/700':'#455A73','slate/600':'#5B6E86','slate/500':'#7A8DA3','slate/300':'#B9CCD8','slate/200':'#D5E2E9','slate/100':'#EAF3F7','slate/50':'#F6F9FB','blue/700':'#0A2A55','blue/600':'#0B3A7A','blue/400':'#0A8794','blue/50':'#E9F2F6','violet/600':'#066670','violet/50':'#E3F5F4' };
for (const v of P) if (map[v.name]) v.setValueForMode(mode, hex(map[v.name]));
for (const v of P) { if (v.name === 'violet/600') v.name = 'teal/700'; if (v.name === 'violet/50') v.name = 'teal/50'; }
for (const [n,h] of [['brand/aqua','#22D3C5'],['brand/teal','#0A8794'],['brand/night','#07142A'],['brand/sky','#5FA3F0']]) {
  if (!P.find(v => v.name === n)) { const x = figma.variables.createVariable(n, prim, 'COLOR'); x.setValueForMode(mode, hex(h)); x.scopes = []; x.setVariableCodeSyntax('WEB', `var(--${n.replace('/','-')})`); }
}
const fonts = await figma.listAvailableFontsAsync();
const has = (f,s) => fonts.some(x => x.fontName.family === f && x.fontName.style === s);
for (const s of await figma.getLocalTextStylesAsync()) {
  if (s.name.startsWith('Mono')) continue;
  const fam = /^(Display|Heading|Figure)/.test(s.name) ? 'Outfit' : 'Instrument Sans';
  if (!has(fam, s.fontName.style)) continue;
  await figma.loadFontAsync({ family: fam, style: s.fontName.style }); s.fontName = { family: fam, style: s.fontName.style };
}
return 'rebranded';
