# Uživatelský návod

Jazyk přepneš nahoře pomocí „Čeština / English“. Volba se uloží v prohlížeči; načtená aktivita, výběr úseku i rozložení zůstávají zachované. Jazyk GUI nemění texty samotného videooverlaye.

## Instalace závislostí na macOS a Linuxu

Ve složce projektu spusť `bash scripts/install-deps.sh`, potom `python3 server.py`. Pouze kontrola bez instalace: `bash scripts/install-deps.sh --check`. Skript zajistí Python a FFmpeg a ověří enkodéry. Na macOS používá Homebrew; pokud chybí, vyžádá souhlas s jeho instalací. Na Linuxu podporuje apt-get, dnf, pacman a zypper a podle potřeby použije sudo. Na Arch Linuxu proběhne úplná aktualizace balíčků. Některé distribuce nemají všechny kodeky ve výchozích repozitářích; skript to oznámí, další repozitáře sám nepřidává. Prohlížeč musí být nainstalovaný.

## Použití

1. Načtěte TCX, FIT nebo Cadence JSON. Tlačítko „Otevřít ukázkovou jízdu“ načte syntetická data, nikoli skutečnou aktivitu.
2. Na mapě klikněte poblíž trasy: první klik vybere začátek, druhý konec. Opačné pořadí bodů se automaticky seřadí. Další klik začíná nový výběr. Pod mapou jsou skutečná data a časy s přesností na milisekundy. Lze je upravit ručně. Výchozí je místní čas počítače; přepínačem lze zobrazit UTC. Časové pásmo je uvedené pod přepínačem a stejné časy ukazuje přehrávací jezdec.
3. Na místech s více průjezdy se vybírá bod časově nejbližší aktuálnímu náhledu. Posuňte přehrávací jezdec k požadovanému průjezdu a klikněte znovu.
4. Rozbalte „Vzhled overlaye a mapa“ pod náhledem. Vyberte Race, Pulse (vektorové ikony místo názvů), nebo Minimal. Přesouvejte prvky tažením přímo v náhledu, upravte velikost, barvu a viditelnost. Rozložení se ukládá v prohlížeči; lze ho i exportovat a načíst jako JSON.
5. Volitelně načtěte fotografii jako orientační podklad. Podklad ani šachovnice se nikdy neexportují.
6. Výchozí je 3840 × 2160 (4K), 30 fps a MOV / ProRes 4444 s alfa kanálem pro Premiere Pro. Zvolte případně jiné rozlišení, FPS a formát, pak exportujte. „Snímek PNG“ uloží aktuální náhled bez výběrového rámečku. Výstup videa začíná vybraným bodem A v čase 0.

Náhled a velká výběrová mapa jsou pod sebou v hlavním sloupci. Vpravo je samostatný exportní panel, který zůstává dostupný při posouvání stránky. Na úzké obrazovce se export přesune pod mapu. Nastavení vzhledu je sbalené pod náhledem.

## Export do Premiere Pro

Pro přímou průhlednost vyberte MOV / ProRes 4444 + alfa (výchozí). Importujte výsledný MOV a položte jej do videostopy nad vlastní záběr. Nepoužívejte chroma key. U exportu byl ověřen skutečný alfa kanál, nikoli pouze označení kodeku.

Běžné zdejší exporty H.264 a H.265 v MP4 alfa kanál nemají. Apple HEVC with Alpha není v této aplikaci implementován.

Dokumentace: https://helpx.adobe.com/premiere/desktop/add-video-effects/work-with-composites/compositing-overview.html

## Export do videoeditoru

- **MP4 / H.264 nebo H.265:** export bez alfa kanálu. Aplikace podloží ukazatele zvolenou barvou (výchozí modrá). Ve střižně ji odstraňte efektem chroma key / klíčování barvy. Barva se nesmí shodovat s ukazateli či trasou. Vyhlazené hrany a stíny mohou po klíčování vyžadovat doladění. H.265 zde používá běžný HEVC, nikoli Apple HEVC s alfa kanálem.
- **WebM / VP9 + alfa:** komprimované průhledné video. Podpora alfa kanálu závisí na dekodéru editoru; pokud jej editor neinterpretuje, použijte MOV nebo PNG sekvenci. Pro kontrolní dekódování ve FFmpeg použijte vstupní `-c:v libvpx-vp9`.
- **MOV / ProRes 4444:** skutečný alfa kanál, žádný chroma key. Vložte MOV do stopy nad vlastní video. Pokud editor nabízí interpretaci alfa kanálu, použijte straight / unmatted. Běžný přehrávač může průhlednost zobrazit černě.
- **PNG sekvence / ZIP:** rozbalte a importujte jako obrazovou sekvenci se stejnou snímkovou frekvencí, jakou jste zvolili při exportu.
- **PNG snímek:** jednotlivý průhledný obrázek.

MP4, WebM, MOV a ZIP se ukládají do `exports/` vedle aplikace. Prohlížeč navíc nabídne stažení. Export se počítá snímek po snímku a není vázaný na rychlost přehrávání. Během něj neobnovujte stránku. Zrušení odstraní rozpracovaný soubor. U delších úseků počítejte s velkými soubory; orientační test 1 s / 1080p / 30 fps má přibližně 7 MB. Délka výstupu se zaokrouhlí nahoru na celý snímek.

## Čas a data

TCX: standardní Trackpoint, Time, Position, HeartRateBpm, Cadence a Garmin ActivityExtension Speed / Watts. Rychlost se převádí z m/s na km/h; pokud chybí, odvozuje se ze vzdálenosti a času, případně z GPS. Vzdálenost je celková vzdálenost aktivity, nikoli vzdálenost od bodu A.

Cadence: podporováno pole záznamů i vnořená pole z přiloženého exportu. Volba „Skutečný čas“ zachovává pauzy podle timestamp; „Bez pauz“ používá totalTime. Aktivní čas bez pauz je dostupný v Cadence JSON s totalTime a v TCX s rozšířením TotalTime. Po změně časové osy se výběr obnoví.

Hodnoty se mezi blízkými vzorky lineárně interpolují. V mezerách delších než 30 s se rychlost, kadence, výkon a tep zobrazují jako pomlčka. Nulový výkon zůstává nula. Chybějící data se nevymýšlejí. Miniatura trasy nabízí celou trasu, detail se severem nahoře nebo detail otáčený podle směru jízdy. Mapa výběru se do overlaye nevkládá.

## Mapa a rychlost

Rychlost je číselný údaj jako ostatní senzory, s jednotkou KM/H. Ve stylu Pulse má ikonu jízdního kola s čárami pohybu.

V panelu Vzhled jsou režimy mapy:
- **Celá trasa + poloha:** celý tvar trasy, zvýrazněná projetá část a výrazná bílá šipka jezdce.
- **Detail · sever nahoře:** mapa sleduje jezdce a zachovává sever nahoře.
- **Detail · směr jízdy nahoře:** mapa se otáčí tak, aby aktuální směr jízdy mířil vzhůru.

Detail má volitelnou šířku 250 m, 500 m, 1 km nebo 2 km. Mapa může mít průhledné pozadí nebo tmavou kartu. Všechny tyto možnosti se používají také při exportu. Velká výběrová mapa pod náhledem nabízí běžný podklad, tlumený podklad a zobrazení bez dlaždic; tyto dlaždice se do overlaye neexportují.

**Načíst trasu** otevře plán GPX (track nebo route) či TCX, i bez časových údajů. Plán se objeví v overlayi a oranžovou přerušovanou čarou ve výběrové mapě. Telemetrická aktivita se dál načítá horním tlačítkem. Bílá šipka ukazuje skutečnou GPS polohu. Postup na plánované trase je přibližný podle nejbližšího úseku; na kříženích či opakovaných okruzích může být nejednoznačný. Při odchylce přes 100 m se místo průběhu zobrazí vzdálenost od trasy. Poloha mimo rám mapy je označena oranžovou šipkou na okraji.

Tlačítko Odebrat vrátí trasu z aktivity. Plán zůstává načtený do obnovení stránky; soubor rozložení ukládá vzhled mapy, nikoli samotný plán. Bez platné aktuální GPS polohy mapa neukazuje pohybující se značku.

## Výkon

Výchozí je klouzavý průměr výkonu za poslední 3 sekundy. V panelu Vzhled → Zobrazení výkonu lze přepnout na okamžitý výkon. Volba se ukládá s rozložením a platí pro náhled, PNG i videoexport. Průměr je časově vážený, takže nepravidelné vzorkování jej nezkresluje. Na začátku záznamu používá dostupnou historii, započítává nulový výkon a nepřemosťuje chybějící data ani pauzy delší než 30 s. Vybraný exportní úsek může použít historii před svým začátkem.

## Nové ukazatele a import

Pulse nyní používá větší vektorové ikony vlevo od čísla, včetně detailního převodníku a klik pro kadenci. Zapnutím „Stoupání / klesání“ přidáte podepsaný úhel ve stupních. Jde o odhad z výšky a vzdálenosti, vyhlazený přes přibližně 40 m okolí, nikoli údaj z náklonoměru. Bez výšky nebo dostatečného pohybu ukazuje pomlčku.

TCX importer čte i CyclingCadence, BikeCadence, RunCadence / RunningCadence, Power, PowerInWatts, HeartRate a HR; přeskočí prázdný zápis, pokud následuje platná hodnota. Pod mapou je přehled skutečně nalezených vzorků jednotlivých senzorů.

Po aktualizaci ukončete starý server pomocí Ctrl+C a spusťte znovu Spustit.command, poté obnovte stránku.

## Soukromí a připojení

Aktivity i renderování zůstávají v počítači. Jediným externím požadavkem jsou mapové dlaždice OpenStreetMap; poskytovatel vidí IP adresu a požadovanou oblast mapy. Bez internetu funguje import, čára trasy, náhled i export, ale nemusí být dostupný mapový podklad. Ukázkový soubor `demo.json` obsahuje pouze syntetická data.


## FIT

FIT se dekóduje na místním Python serveru pomocí přiloženého fitdecode 0.11.0. Čtou se zprávy record: čas, GPS, rychlost, výkon, tep, kadence, výška a vzdálenost. Rozšířená rychlost a výška mají přednost před základními poli. Cadence rozšíření timestamp_ms zachovává milisekundy; total_time umožňuje osu bez pauz. U ostatních FIT záznamů je dostupná skutečná časová osa. Nuly zůstávají nulami, chybějící senzory se zobrazí pomlčkou. Kontroluje se CRC; poškozený soubor se odmítne. Limit je 60 MB. FIT bez alespoň dvou časovaných bodů aktivity není podporován. Libovolná proprietární vývojářská pole se na senzory automaticky nepřevádějí.
