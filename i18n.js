/* GUI translations. Overlay rendering is independent of the interface language. */
(function(root){
'use strict';
const english = {
  "TVÁ JÍZDA. TVOJE DATA.": "YOUR RIDE. YOUR DATA.",
  "● LOKÁLNÍ APLIKACE": "● LOCAL APPLICATION",
  "＋ Načíst aktivitu": "＋ Load activity",
  "Dej jízdě další rozměr": "Give your ride another dimension",
  "Z trasy na mapě rovnou do videa. S průhledností a vlastním stylem.": "From your route to your video. Transparent overlays, your own style.",
  "Otevřít ukázkovou jízdu ↗": "Open demo ride ↗",
  "Kompozice overlaye": "Overlay composition",
  "Podklad": "Background",
  "Odstranit podklad": "Remove background",
  "TVŮJ ZÁBĚR, TVOJE ČÍSLA": "YOUR FOOTAGE, YOUR NUMBERS",
  "Přetáhni ukazatele přímo v náhledu": "Drag widgets directly in the preview",
  "Přehrát": "Play",
  "▧ Šachovnice = průhledné pozadí": "▧ Checkerboard = transparent background",
  "Celý záznam": "Entire activity",
  "Vzhled overlaye a mapa": "Overlay appearance and map",
  "Styl, ukazatele, plánovaná trasa a rozložení": "Style, widgets, planned route and layout",
  "Styl": "Style",
  "Race · podle reference": "Race · reference style",
  "Pulse · ikony": "Pulse · icons",
  "Minimal · čistá typografie": "Minimal · clean typography",
  "Zobrazení výkonu": "Power display",
  "Průměr za 3 s": "3-second average",
  "Okamžitý výkon": "Instantaneous power",
  "Akcent": "Accent",
  "Velikost": "Size",
  "Obnovit vzhled": "Reset appearance",
  "VIDITELNÉ UKAZATELE": "VISIBLE WIDGETS",
  "Mapa v overlayi": "Overlay map",
  "Celá trasa + poloha": "Entire route + position",
  "Detail · sever nahoře": "Follow · north up",
  "Detail · směr jízdy nahoře": "Follow · heading up",
  "Šířka detailu": "Visible width",
  "Pozadí mapy": "Map background",
  "Průhledné": "Transparent",
  "Tmavá karta": "Dark card",
  "Načíst trasu": "Load route",
  "Odebrat": "Remove",
  "Trasa z aktivity. Volitelně načti plán GPX / TCX bez časových údajů.": "Using the activity route. Optionally load a planned GPX / TCX route without timestamps.",
  "ROZLOŽENÍ": "LAYOUT",
  "Uložit JSON": "Save JSON",
  "Načíst JSON": "Load JSON",
  "Pozice se ukládají automaticky v tomto prohlížeči.": "Positions are saved automatically in this browser.",
  "Mapa & výběr úseku": "Map & segment selection",
  "Celá trasa": "Fit route",
  "Načti TCX, FIT nebo Cadence JSON": "Load TCX, FIT or Cadence JSON",
  "Data se zpracují pouze na tomto počítači.": "Data is processed only on this computer.",
  "Podklad výběrové mapy": "Selection map background",
  "Ulice": "Streets",
  "Tlumený": "Muted",
  "Bez podkladu": "No tiles",
  "Klikni na trasu:": "Click the route:",
  "1. začátek": "1. start",
  "2. konec": "2. end",
  "Klikni na trasu: <b>1. začátek</b> → <b>2. konec</b>": "Click the route: <b>1. start</b> → <b>2. end</b>",
  "Začátek vybrán. <b>Teď klikni na konec úseku.</b>": "Start selected. <b>Now click the end of the segment.</b>",
  "Úsek vybrán. <b>Dalším kliknutím začneš nový výběr.</b>": "Segment selected. <b>Click again to start a new selection.</b>",
  "ZAČÁTEK · SKUTEČNÝ ČAS": "START · ACTUAL TIME",
  "KONEC · SKUTEČNÝ ČAS": "END · ACTUAL TIME",
  "↺ Celý záznam": "↺ Entire activity",
  "Zobrazení času": "Time display",
  "Místní čas počítače": "Computer local time",
  "Časová osa": "Timeline",
  "Skutečný čas (včetně pauz)": "Elapsed time (including pauses)",
  "Bez pauz (Cadence: totalTime)": "Active time (Cadence: totalTime)",
  "Na křížení trasy se vybere průjezd nejblíž času náhledu. Přesný úsek uprav pomocí data a času. Úhel se odhaduje z výšky a vzdálenosti v okolí bodu.": "At route crossings, the pass nearest to the preview time is selected. Adjust the exact segment using the date and time fields. The angle is estimated from nearby elevation and distance samples.",
  "Připraveno do střižny.": "Ready for your editor.",
  "Průhlednost nebo pozadí pro klíčování.": "Transparency or a background for color keying.",
  "Formát": "Format",
  "MOV · ProRes 4444 + alfa · Premiere": "MOV · ProRes 4444 + alpha · Premiere",
  "WebM · VP9 + alfa": "WebM · VP9 + alpha",
  "MP4 · H.264 · bez alfa": "MP4 · H.264 · no alpha",
  "MP4 · H.265 · bez alfa": "MP4 · H.265 · no alpha",
  "PNG sekvence · ZIP": "PNG sequence · ZIP",
  "Pozadí pro MP4": "MP4 background",
  "Rozlišení": "Resolution",
  "Snímek PNG": "PNG snapshot",
  "Exportovat úsek ↗": "Export segment ↗",
  "Zrušit export": "Cancel export",
  "Průhledný export s alfa kanálem.": "Transparent export with an alpha channel.",
  "Začni načtením aktivity nebo otevři ukázkovou jízdu.": "Load an activity or open the demo ride to get started.",
  "Pro Premiere Pro: skutečný alfa kanál. MOV vlož do videostopy nad záběr; klíčování není potřeba.": "For Premiere Pro: a real alpha channel. Place the MOV on a track above your footage; no color keying is needed.",
  "MP4 je bez průhlednosti. Vybranou barvu pozadí odstraň ve střižně pomocí chroma key. Zvol barvu, která není v ukazatelích ani v trase.": "MP4 has no transparency. Remove the selected background color in your editor using chroma key. Choose a color that does not appear in the widgets or route.",
  "Kadence": "Cadence",
  "Výkon": "Power",
  "Tep": "Heart rate",
  "Rychlost": "Speed",
  "Trasa": "Route",
  "Výška": "Elevation",
  "Vzdálenost": "Distance",
  "Stoupání / klesání": "Climb / descent",
  "Mapové dlaždice se nenačetly. Trasa i export fungují dál; pro podklad je potřeba internet.": "Map tiles could not be loaded. The route and export still work; map tiles require an internet connection.",
  "není v souboru": "not in file",
  "Nalezené vzorky · ": "Available samples · ",
  "Úsek {0} → {1} · {2} s": "Segment {0} → {1} · {2} s",
  "{0} bodů · {1} · {2} km": "{0} points · {1} · {2} km",
  " · plánovaná trasa": " · planned route",
  "Aktivita načtena. Klikni na trasu pro začátek a konec exportu.": "Activity loaded. Click the route to choose the export start and end.",
  "Klikni blíž ke zvýrazněné trase.": "Click closer to the highlighted route.",
  "Vyber jiný bod pro konec úseku.": "Choose a different point for the end of the segment.",
  "Plán načten. Bílá šipka ukazuje skutečnou polohu; průběh po plánované trase je přibližný.": "Planned route loaded. The white arrow shows your actual position; progress along the planned route is approximate.",
  "Načítám FIT…": "Loading FIT…",
  "FIT se nepodařilo načíst.": "Could not load FIT.",
  "Ukázková jízda není dostupná.": "The demo ride is unavailable.",
  "Časová osa změněna; výběr úseku byl obnoven.": "Timeline changed; segment selection has been reset.",
  "Zadej datum a čas uvnitř aktivity; konec musí následovat po začátku.": "Enter a date and time within the activity; the end must be after the start.",
  "Rozložení načteno.": "Layout loaded.",
  "Nepodařilo se vytvořit snímek.": "Could not create a frame.",
  "Nejdřív načti aktivitu.": "Load an activity first.",
  "Průhledný PNG snímek je připraven.": "Transparent PNG snapshot is ready.",
  "Chyba exportu.": "Export error.",
  "Ruším export…": "Cancelling export…",
  "Načti aktivitu a vyber neprázdný úsek.": "Load an activity and select a non-empty segment.",
  "Probíhá export. Nech aplikaci otevřenou; delší úseky mohou zabrat čas i místo na disku.": "Exporting. Keep the app open; longer segments can take time and disk space.",
  "{0} / {1} snímků · {2} % · zbývá přibližně {3}": "{0} / {1} frames · {2} % · approximately {3} remaining",
  "Export zrušen. Rozpracovaný soubor byl odstraněn.": "Export cancelled. The incomplete file was removed.",
  "Export zrušen.": "Export cancelled.",
  "Dokončuji soubor…": "Finalizing file…",
  "Export dokončen.": "Export complete.",
  "Stáhnout ": "Download ",
  "Hotovo. Soubor je uložen i ve složce TelemetryStudio/exports.": "Done. The file is also saved in the TelemetryStudio/exports folder.",
  "Export se nezdařil: ": "Export failed: ",
  "Export nebyl dokončen.": "Export was not completed.",
  "Export stále běží.": "Export is still running.",
  "Soubor musí obsahovat alespoň dva body s platným časem.": "The file must contain at least two points with valid timestamps.",
  "Očekáván export Cadence jako pole záznamů.": "Expected a Cadence export containing an array of records.",
  "TCX není platný XML soubor.": "TCX is not a valid XML file.",
  "Tento záznam nemá aktivní čas. Použij skutečný čas.": "This activity has no active time. Use elapsed time.",
  "Aktivní čas v souboru není vzestupný.": "Active time in the file is not increasing.",
  "Neplatné rozložení.": "Invalid layout.",
  "Neplatné nastavení mapy.": "Invalid map settings.",
  "Neplatný režim výkonu.": "Invalid power mode.",
  "Neplatná pozice ukazatele.": "Invalid widget position.",
  "Trasa není platné XML.": "The route is not valid XML.",
  "Trasa musí obsahovat alespoň dva propojené GPS body.": "The route must contain at least two connected GPS points.",
  "Neznámý video formát.": "Unknown video format.",
  "Neplatný přístup.": "Invalid access token.",
  "Požadavek je příliš velký.": "The request is too large.",
  "Neplatné parametry exportu.": "Invalid export parameters.",
  "Jiný export už běží.": "Another export is already running.",
  "FFmpeg není dostupný. Použijte PNG sekvenci.": "FFmpeg is unavailable. Use a PNG sequence.",
  "Export není aktivní.": "Export is not active.",
  "Neplatný snímek.": "Invalid frame.",
  "Export nemá všechny snímky.": "The export is missing frames.",
  "Neznámý požadavek.": "Unknown request.",
  "FIT je prázdný nebo přesahuje limit 60 MB.": "FIT is empty or exceeds the 60 MB limit.",
  "FIT je poškozený nebo jej nelze načíst: ": "FIT is corrupt or could not be read: ",
  "FIT musí obsahovat alespoň dva záznamy aktivity s platným časem; samotná plánovaná trasa nestačí.": "FIT must contain at least two activity records with valid timestamps; a planned route alone is not sufficient.",
  "Přiblížit": "Zoom in",
  "Oddálit": "Zoom out"
};
let language='cs';
try { if(root.localStorage?.getItem('telemetry-language')==='en')language='en'; } catch {}
function t(key,...args){
 let value=String(key);
 if(language==='en'){
  if(Object.hasOwn(english,value))value=english[value];
  else {const prefix=Object.keys(english).filter(k=>k.endsWith(': ')).find(k=>value.startsWith(k));if(prefix)value=english[prefix]+t(value.slice(prefix.length));}
 }
 return value.replace(/\{(\d+)\}/g,(match,index)=>args[index]??match);
}
let nodes=[],attributes=[];
function capture(document){
 const walker=document.createTreeWalker(document.body,4);
 while(walker.nextNode()){
  const node=walker.currentNode;
  if(node.parentElement.closest('script,style'))continue;
  const key=node.textContent.trim();
  if(Object.hasOwn(english,key))nodes.push([node,key,node.textContent.match(/^\s*/)[0],node.textContent.match(/\s*$/)[0]]);
 }
 for(const el of document.querySelectorAll('[title],[aria-label]'))for(const attr of ['title','aria-label']){
  const key=el.getAttribute(attr);if(Object.hasOwn(english,key))attributes.push([el,attr,key]);
 }
}
function apply(document){
 document.documentElement.lang=language;
 for(const [node,key,before,after]of nodes)if(node.isConnected)node.textContent=before+t(key)+after;
 for(const [el,attr,key]of attributes)el.setAttribute(attr,t(key));
}
function setLanguage(value){language=value==='en'?'en':'cs';try{root.localStorage?.setItem('telemetry-language',language);}catch{}}
root.I18n={t,capture,apply,setLanguage,get language(){return language;},english};
})(globalThis);
