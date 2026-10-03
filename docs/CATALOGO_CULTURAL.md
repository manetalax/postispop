# Referencias culturales del catálogo de países

Revisión editorial del 2 de octubre de 2026. El inventario contiene los 195 códigos del catálogo existente: 193 Estados miembros de la ONU y dos observadores. Es una colección de referencias concretas, no un retrato completo de sus habitantes, lenguas, religiones o cocinas.

## Cobertura comprobada

- 195 países tienen un monumento, conjunto histórico o paisaje identificado en una fuente documentada.
- 195 países tienen una referencia culinaria documentada; 195 cuentan con ambos tipos de referencia.
- La cobertura de referencias alcanza los 195 códigos; la fidelidad y finalización de las ilustraciones se revisan por separado. Ningún país debe presentarse como un diseño terminado por aparecer aquí.

El archivo `assets/country-cultural-data.json` es la fuente de datos editorial. `assets/designs/country-cultural-data.js` expone el mismo objeto como `countryCulturalData` para uso local, sin descargas ni dependencias externas.

Cada objeto está indexado por código de dos letras. `landmark` y `food` contienen `name`, `source`, `verified` y, cuando se registra, `verificationLevel`. El booleano exterior `verified` solo es verdadero cuando **ambas referencias** están documentadas. No certifica la fidelidad de una ilustración ni su revisión visual. `editorialCandidates` conserva las dos ideas que ya figuraban en el catálogo; no las convierte en hechos verificados. `checkedAt` indica la revisión de las referencias añadidas.

## Niveles de documentación

`institutional-page` identifica una página o documento institucional cuyo contenido se pudo abrir. `institutional-indexed` indica que el buscador mostró la referencia explícita de la fuente institucional, pero la lectura directa pudo estar bloqueada o incompleta; no acredita haber leído toda la página. `reported-local-testimony` indica testimonio local publicado por un medio identificado. `encyclopedia-page` identifica una entrada enciclopédica consultada, sin atribuirle condición de fuente oficial. `documented-reference` conserva una revisión documentada previa sin asignar retrospectivamente un modo de acceso. Las URL se ofrecen para revisión; pueden cambiar. Las revisiones aportadas por cada investigador se conservan también en los archivos `assets/cultural-research-*.json`. Ninguno de estos niveles certifica una ilustración.

Se priorizan UNESCO, turismo institucional, ministerios, embajadas y museos. Cuando se utiliza una asociación cultural, una enciclopedia o periodismo local, se identifica su alcance en las notas. Las referencias no implican que una institución respalde PostisPop.

## Criterio de uso en las ilustraciones

Usar nombres concretos y señalar el lugar o la tradición elegida. Evitar títulos como «así son todos», «la única comida» o «la cultura auténtica». Las tradiciones compartidas se describen como compartidas; no se atribuye exclusividad gastronómica a una bandera.

Un templo, lugar sagrado o patrimonio indígena se trata con respeto; no se convierte en caricatura de una comunidad. Para Rapa Nui, Tongariro, los templos de Asia y otros lugares con significados locales, la forma arquitectónica/paisajística no autoriza a inventar ritos, escritura, símbolos sagrados o indumentaria. La gastronomía elegida tampoco expresa restricciones alimentarias de toda la población.

Las fuentes documentan la relación del lugar o alimento con el país. No se han copiado fotografías, ilustraciones ni textos largos de estas páginas. No utilizar los logotipos de las instituciones ni sugerir su patrocinio. Los SVG propios requieren revisión visual separada frente a referencias fiables; una fuente correcta no corrige por sí sola una silueta equivocada.

Cuando falta `food`, omitir un plato rotulado como local hasta verificarlo. Cuando falta `landmark`, una silueta geográfica y bandera pueden conservar la categoría de edición inicial, con la ampliación cultural pendiente. La ausencia de un motivo aquí significa falta de verificación en esta sesión, no ausencia de patrimonio.

## Lugares verificados

| Código | Referencia elegida | Fuente |
|---|---|---|
| AF | Minarete de Jam | [Fuente](https://whc.unesco.org/en/list/211/) |
| AL | Casco histórico de Berat | [Fuente](https://whc.unesco.org/en/list/569) |
| DZ | Casba de Argel | [Fuente](https://whc.unesco.org/en/list/565/) |
| AD | Valle de Madriu-Perafita-Claror | [Fuente](https://whc.unesco.org/en/list/1160) |
| AO | Mbanza Kongo | [Fuente](https://whc.unesco.org/en/statesparties/ao) |
| AG | Astillero naval de Antigua (Nelson’s Dockyard) | [Fuente](https://whc.unesco.org/en/list/1499) |
| AR | Parque nacional Los Glaciares | [Fuente](https://whc.unesco.org/en/list/145/) |
| AM | Monasterios de Haghpat y Sanahin | [Fuente](https://whc.unesco.org/en/list/777/) |
| AU | Ópera de Sídney | [Fuente](https://whc.unesco.org/en/list/166/) |
| AT | Centro histórico de Salzburgo | [Fuente](https://whc.unesco.org/en/list/784/) |
| AZ | Ciudad amurallada de Bakú | [Fuente](https://whc.unesco.org/en/list/958/) |
| BS | Escalinata de la Reina, Nassau | [Fuente](https://www.bahamas.com/plan-your-trip/things-to-do/the-queens-staircase) |
| BH | Qal'at al-Bahrain | [Fuente](https://whc.unesco.org/en/list/1192/) |
| BD | Los Sundarbans | [Fuente](https://whc.unesco.org/en/list/798/) |
| BB | Bridgetown y su guarnición histórica | [Fuente](https://whc.unesco.org/en/list/1376/) |
| BY | Castillo de Mir | [Fuente](https://whc.unesco.org/en/list/625/) |
| BE | Grand-Place de Bruselas | [Fuente](https://whc.unesco.org/en/list/857/) |
| BZ | Altun Ha | [Fuente](https://www.travelbelize.org/es/attraction/altun-ha/) |
| BJ | Palacios Reales de Abomey | [Fuente](https://whc.unesco.org/en/statesparties/bj) |
| BT | Paro Taktsang | [Fuente](https://bhutan.travel/journal/editorial/a-winter-s-tale) |
| BO | Tiwanaku | [Fuente](https://whc.unesco.org/en/list/567/) |
| BA | Puente Viejo de Mostar | [Fuente](https://whc.unesco.org/en/list/946) |
| BW | Delta del Okavango | [Fuente](https://whc.unesco.org/en/statesparties/bw) |
| BR | Parque nacional de Iguaçu | [Fuente](https://whc.unesco.org/en/list/355/) |
| BN | Kampong Ayer | [Fuente](https://www.bruneitourism.com/places/kampong-ayer-cultural-and-tourism-gallery/) |
| BG | Monasterio de Rila | [Fuente](https://whc.unesco.org/en/list/216/) |
| BF | Corte Real de Tiébélé | [Fuente](https://whc.unesco.org/en/statesparties/bf) |
| BI | Cascadas de Karera | [Fuente](https://whc.unesco.org/en/statesparties/bi) |
| CV | Cidade Velha | [Fuente](https://whc.unesco.org/en/statesparties/cv) |
| KH | Angkor | [Fuente](https://whc.unesco.org/en/list/668/) |
| CM | Reserva de Fauna de Dja | [Fuente](https://whc.unesco.org/en/statesparties/cm) |
| CA | Parques de las Montañas Rocosas canadienses | [Fuente](https://whc.unesco.org/en/list/304/) |
| CF | Parque Nacional de Manovo-Gounda Saint-Floris | [Fuente](https://whc.unesco.org/en/statesparties/cf) |
| TD | Lagos de Ounianga | [Fuente](https://whc.unesco.org/en/statesparties/td) |
| CL | Parque nacional Rapa Nui | [Fuente](https://whc.unesco.org/en/list/715/) |
| CN | Gran Muralla | [Fuente](https://whc.unesco.org/en/list/438/) |
| CO | Puerto y fortificaciones de Cartagena | [Fuente](https://whc.unesco.org/en/list/285/) |
| KM | Medinas de los sultanatos históricos de Comoras | [Fuente](https://whc.unesco.org/en/statesparties/km) |
| CG | Macizo Forestal de Odzala-Kokoua | [Fuente](https://whc.unesco.org/en/statesparties/cg) |
| CD | Parque Nacional de Virunga | [Fuente](https://whc.unesco.org/en/statesparties/cd) |
| CR | Parque nacional Isla del Coco | [Fuente](https://whc.unesco.org/en/list/820/) |
| CI | Ciudad histórica de Grand-Bassam | [Fuente](https://whc.unesco.org/en/statesparties/ci) |
| HR | Ciudad vieja de Dubrovnik | [Fuente](https://whc.unesco.org/en/list/95/) |
| CU | Habana Vieja y sus fortificaciones | [Fuente](https://whc.unesco.org/en/list/204/) |
| CY | Sitio arqueológico de Pafos | [Fuente](https://whc.unesco.org/en/list/79) |
| CZ | Centro histórico de Praga | [Fuente](https://whc.unesco.org/en/list/616/) |
| DK | Castillo de Kronborg | [Fuente](https://whc.unesco.org/en/list/696/) |
| DJ | Lago Assal | [Fuente](https://whc.unesco.org/en/statesparties/dj) |
| DM | Parque nacional Morne Trois Pitons | [Fuente](https://whc.unesco.org/en/list/814) |
| DO | Ciudad Colonial de Santo Domingo | [Fuente](https://whc.unesco.org/en/list/526) |
| EC | Islas Galápagos | [Fuente](https://whc.unesco.org/en/list/1/) |
| EG | Pirámides de Guiza | [Fuente](https://www.experienceegypt.eg/en/attraction/18/archeological-sites) |
| SV | Joya de Cerén | [Fuente](https://whc.unesco.org/en/activities/751/) |
| GQ | Parque Nacional de Monte Alén | [Fuente](https://whc.unesco.org/en/statesparties/gq) |
| ER | Arquitectura modernista de Asmara | [Fuente](https://whc.unesco.org/en/statesparties/er) |
| EE | Casco histórico de Tallin | [Fuente](https://whc.unesco.org/en/list/822/) |
| SZ | Minas de Ngwenya | [Fuente](https://whc.unesco.org/en/statesparties/sz) |
| ET | Iglesias excavadas en la roca de Lalibela | [Fuente](https://whc.unesco.org/en/list/18/) |
| FJ | Ciudad portuaria histórica de Levuka | [Fuente](https://whc.unesco.org/en/list/1399) |
| FI | Fortaleza de Suomenlinna | [Fuente](https://whc.unesco.org/en/list/583/) |
| FR | Mont-Saint-Michel | [Fuente](https://montsaintmichel.gouv.fr/) |
| GA | Parque Nacional de Ivindo | [Fuente](https://whc.unesco.org/en/statesparties/ga) |
| GM | Círculos de piedra de Senegambia | [Fuente](https://whc.unesco.org/en/statesparties/gm) |
| GE | Monumentos históricos de Mtskheta | [Fuente](https://whc.unesco.org/en/list/708/) |
| DE | Catedral de Colonia | [Fuente](https://whc.unesco.org/en/list/292/) |
| GH | Edificaciones tradicionales asante | [Fuente](https://whc.unesco.org/en/statesparties/gh) |
| GR | Acrópolis de Atenas | [Fuente](https://www.visitgreece.gr/en/experiences/culture/archaeological-sites-monuments/acropolis-of-Athens) |
| GD | Fort George | [Fuente](https://www.puregrenada.com/fort-george-2/?v=0b3b97fa6688) |
| GT | Parque Nacional Tikal | [Fuente](https://whc.unesco.org/en/list/00064/) |
| GN | Reserva Natural del Monte Nimba | [Fuente](https://whc.unesco.org/en/statesparties/gn) |
| GW | Archipiélago de Bijagós · Omatí Minhô | [Fuente](https://whc.unesco.org/en/statesparties/gw) |
| GY | Cataratas Kaieteur | [Fuente](https://guyanatourism.com/kaieteur-falls/) |
| HT | Parque Histórico Nacional: Ciudadela, Sans Souci y Ramiers | [Fuente](https://whc.unesco.org/en/list/180) |
| HN | Sitio maya de Copán | [Fuente](https://whc.unesco.org/en/list/129/) |
| HU | Budapest y las orillas del Danubio | [Fuente](https://whc.unesco.org/en/list/400/) |
| IS | Parque nacional de Þingvellir | [Fuente](https://whc.unesco.org/en/list/1152/) |
| IN | Taj Mahal | [Fuente](https://whc.unesco.org/en/list/252/) |
| ID | Conjunto de templos de Borobudur | [Fuente](https://whc.unesco.org/en/list/592/) |
| IR | Persépolis | [Fuente](https://whc.unesco.org/en/list/114/) |
| IQ | Babilonia | [Fuente](https://whc.unesco.org/en/list/278/) |
| IE | Sceilg Mhichíl (Skellig Michael) | [Fuente](https://whc.unesco.org/en/list/757/) |
| IL | Masada | [Fuente](https://whc.unesco.org/en/list/1040/) |
| IT | Coliseo de Roma | [Fuente](https://www.italia.it/it/lazio/roma/colosseo) |
| JM | Montañas Blue y John Crow | [Fuente](https://whc.unesco.org/en/list/1356/) |
| JP | Monte Fuji | [Fuente](https://faq.japan-travel.jnto.go.jp/en/fuji-guide/) |
| JO | Petra | [Fuente](https://whc.unesco.org/en/list/326/) |
| KZ | Mausoleo de Khoja Ahmed Yasawi | [Fuente](https://whc.unesco.org/en/list/1103/) |
| KE | Monte Kenia | [Fuente](https://whc.unesco.org/en/list/800/) |
| KI | Área protegida de las Islas Fénix | [Fuente](https://whc.unesco.org/en/list/1325) |
| KP | Conjunto de tumbas de Koguryo | [Fuente](https://whc.unesco.org/en/list/1091/) |
| KR | Templo Bulguksa | [Fuente](https://whc.unesco.org/en/list/736/) |
| KW | Torres de Kuwait | [Fuente](https://e.gov.kw/sites/kgoenglish/Pages/Visitors/TourismInKuwait/ActivitiesInKuwaitAttractiveSpots.aspx) |
| KG | Montaña sagrada de Sulaiman-Too | [Fuente](https://whc.unesco.org/en/list/1230/) |
| LA | Luang Prabang | [Fuente](https://whc.unesco.org/en/list/479/) |
| LV | Centro histórico de Riga | [Fuente](https://whc.unesco.org/en/list/852) |
| LB | Baalbek | [Fuente](https://whc.unesco.org/en/list/294/) |
| LS | Parque Maloti-Drakensberg | [Fuente](https://whc.unesco.org/en/statesparties/ls) |
| LR | Isla de Providence | [Fuente](https://whc.unesco.org/en/statesparties/lr) |
| LY | Sitio arqueológico de Leptis Magna | [Fuente](https://whc.unesco.org/en/statesparties/ly) |
| LI | Castillo de Vaduz | [Fuente](https://en.tourismus.li/map/poi/schloss-vaduz-8fb7e6cf-99b5-4ffb-b600-9e4c66398e1f.html) |
| LT | Centro histórico de Vilna | [Fuente](https://whc.unesco.org/en/list/541) |
| LU | Barrio antiguo y fortificaciones de Luxemburgo | [Fuente](https://whc.unesco.org/en/list/699) |
| MG | Colina Real de Ambohimanga | [Fuente](https://whc.unesco.org/en/statesparties/mg) |
| MW | Parque Nacional del Lago Malawi | [Fuente](https://whc.unesco.org/en/statesparties/mw) |
| MY | Parque de Kinabalu | [Fuente](https://whc.unesco.org/en/list/1012/) |
| MV | Atolón Baa | [Fuente](https://visitmaldives.com/index.php/en/places/baa-atoll-biosphere-reserve) |
| ML | Ciudades antiguas de Djenné | [Fuente](https://whc.unesco.org/en/statesparties/ml) |
| MT | Ciudad de La Valeta | [Fuente](https://whc.unesco.org/en/list/131) |
| MH | Atolón Bikini | [Fuente](https://whc.unesco.org/en/list/1339/) |
| MR | Parque nacional del Banc d'Arguin | [Fuente](https://whc.unesco.org/en/list/506/) |
| MU | Paisaje cultural de Le Morne | [Fuente](https://whc.unesco.org/en/statesparties/mu) |
| MX | Chichén Itzá | [Fuente](https://whc.unesco.org/en/list/483/) |
| FM | Nan Madol | [Fuente](https://whc.unesco.org/en/list/1503) |
| MD | Reserva cultural y natural de Orheiul Vechi | [Fuente](https://moldova.travel/orheiul-vechi/) |
| MC | Palacio del Príncipe de Mónaco | [Fuente](https://palais.mc/en/index.html) |
| MN | Paisaje cultural del valle del Orkhon | [Fuente](https://whc.unesco.org/en/list/1081/) |
| ME | Región natural e histórica de Kotor | [Fuente](https://whc.unesco.org/en/list/125/) |
| MA | Ksar de Ait Ben Haddou | [Fuente](https://whc.unesco.org/en/list/444/) |
| MZ | Isla de Mozambique | [Fuente](https://whc.unesco.org/en/statesparties/mz) |
| MM | Bagan | [Fuente](https://whc.unesco.org/en/list/1588/) |
| NA | Mar de Arena del Namib | [Fuente](https://whc.unesco.org/en/statesparties/na) |
| NR | Laguna Buada | [Fuente](https://nauru-data.sprep.org/dataset/nauru-island-hydrology) |
| NP | Valle de Katmandú | [Fuente](https://whc.unesco.org/en/list/121/) |
| NL | Molinos de Kinderdijk-Elshout | [Fuente](https://whc.unesco.org/en/list/818/) |
| NZ | Parque nacional de Tongariro | [Fuente](https://whc.unesco.org/en/list/421/) |
| NI | Ruinas de León Viejo | [Fuente](https://whc.unesco.org/en/list/613/) |
| NE | Centro histórico de Agadez | [Fuente](https://whc.unesco.org/en/statesparties/ne) |
| NG | Bosque Sagrado de Osun-Osogbo | [Fuente](https://whc.unesco.org/en/statesparties/ng) |
| MK | Región de Ohrid | [Fuente](https://whc.unesco.org/en/list/99/) |
| NO | Fiordos Geirangerfjord y Nærøyfjord | [Fuente](https://whc.unesco.org/en/list/1195/) |
| OM | Fuerte de Bahla | [Fuente](https://whc.unesco.org/en/list/433/) |
| PK | Ruinas de Mohenjo-Daro | [Fuente](https://whc.unesco.org/en/list/138/) |
| PW | Laguna meridional de las Islas Rocosas | [Fuente](https://whc.unesco.org/en/list/1386) |
| PS | Paisaje cultural de Battir | [Fuente](https://whc.unesco.org/en/list/1492/) |
| PA | Conjunto Monumental Histórico de Panamá Viejo | [Fuente](https://sicultura.micultura.gob.pa/espacios-culturales/monumentos-sitios-declarados-patrimonio/conjunto-monumental-historico-de-panama-viejo-sitio-arqueologico-de-panama-viejo) |
| PG | Sitio agrícola temprano de Kuk | [Fuente](https://whc.unesco.org/en/list/887/) |
| PY | Misiones de La Santísima Trinidad de Paraná y Jesús de Tavarangue | [Fuente](https://whc.unesco.org/en/list/648/) |
| PE | Machu Picchu | [Fuente](https://whc.unesco.org/en/list/274/) |
| PH | Terrazas de arroz de las cordilleras filipinas | [Fuente](https://whc.unesco.org/en/list/722/) |
| PL | Centro histórico de Cracovia | [Fuente](https://whc.unesco.org/en/list/29/) |
| PT | Torre de Belém | [Fuente](https://www.visitportugal.com/es/content/torre-de-belem) |
| QA | Yacimiento arqueológico de Al Zubarah | [Fuente](https://whc.unesco.org/en/list/1402/) |
| RO | Delta del Danubio | [Fuente](https://whc.unesco.org/en/list/588/) |
| RU | Kremlin y Plaza Roja de Moscú | [Fuente](https://whc.unesco.org/en/list/545/) |
| RW | Parque Nacional de Nyungwe | [Fuente](https://whc.unesco.org/en/statesparties/rw) |
| KN | Fortaleza de Brimstone Hill | [Fuente](https://whc.unesco.org/en/list/910) |
| LC | Pitons | [Fuente](https://whc.unesco.org/en/list/1161) |
| VC | Fort Charlotte | [Fuente](https://tourism.gov.vc/tourism/index.php/national-sites-of-svg/fort-charlotte) |
| WS | Museo Robert Louis Stevenson, Vailima | [Fuente](https://www.samoa.travel/plan-book/activities/robert-louis-stevenson-museum-rls-museum/) |
| SM | Centro histórico de San Marino y monte Titano | [Fuente](https://whc.unesco.org/en/list/1245/) |
| ST | Roças de Santo Tomé y Príncipe | [Fuente](https://whc.unesco.org/en/statesparties/st) |
| SA | Yacimiento arqueológico de Hegra | [Fuente](https://whc.unesco.org/en/list/1293/) |
| SN | Isla de Gorée | [Fuente](https://whc.unesco.org/en/list/26/) |
| RS | Monasterio de Studenica | [Fuente](https://whc.unesco.org/en/list/389/) |
| SC | Reserva Natural de Vallée de Mai | [Fuente](https://whc.unesco.org/en/statesparties/sc) |
| SL | Complejo Gola-Tiwai | [Fuente](https://whc.unesco.org/en/statesparties/sl) |
| SG | Jardín Botánico de Singapur | [Fuente](https://whc.unesco.org/en/list/1483/) |
| SK | Vlkolínec | [Fuente](https://whc.unesco.org/en/list/622/) |
| SI | Cuevas de Škocjan | [Fuente](https://whc.unesco.org/en/list/390/) |
| SB | Rennell Oriental | [Fuente](https://whc.unesco.org/en/list/854/) |
| SO | Faro Secondo-Lido de Mogadiscio | [Fuente](https://whc.unesco.org/en/statesparties/so) |
| ZA | Áreas protegidas de la Región Floral del Cabo | [Fuente](https://whc.unesco.org/en/list/1007/) |
| SS | Paisaje migratorio Boma-Badingilo | [Fuente](https://whc.unesco.org/en/statesparties/ss) |
| ES | Alhambra de Granada | [Fuente](https://www.spain.info/es/destino/granada/) |
| LK | Antigua ciudad de Sigiriya | [Fuente](https://whc.unesco.org/en/list/202/) |
| SD | Sitios arqueológicos de Meroe | [Fuente](https://whc.unesco.org/en/statesparties/sd) |
| SR | Reserva Natural de Surinam Central | [Fuente](https://whc.unesco.org/en/list/1017/) |
| SE | Palacio y jardines de Drottningholm | [Fuente](https://whc.unesco.org/en/list/559/) |
| CH | Alpes suizos Jungfrau-Aletsch | [Fuente](https://whc.unesco.org/en/list/1037/) |
| SY | Palmira | [Fuente](https://whc.unesco.org/en/list/23/) |
| TJ | Yacimiento protourbano de Sarazm | [Fuente](https://whc.unesco.org/en/list/1141/) |
| TZ | Parque nacional del Kilimanjaro | [Fuente](https://whc.unesco.org/en/list/403/) |
| TH | Ciudad histórica de Ayutthaya | [Fuente](https://whc.unesco.org/en/list/576/) |
| TL | Isla de Ataúro | [Fuente](https://timorleste.tl/destinations) |
| TG | Koutammakou · tierra de los batammariba | [Fuente](https://whc.unesco.org/en/statesparties/tg) |
| TO | Trilito Ha‘amonga ‘a Maui, Tongatapu | [Fuente](https://www.tongatourism.travel/our-islands/tongatapu) |
| TT | Lago de asfalto de La Brea (Pitch Lake) | [Fuente](https://nationaltrust.tt/location/pitch-lake/) |
| TN | Anfiteatro de El Jem | [Fuente](https://whc.unesco.org/en/list/38/) |
| TR | Göreme y paisajes rocosos de Capadocia | [Fuente](https://whc.unesco.org/en/list/357/) |
| TM | Antigua Merv | [Fuente](https://whc.unesco.org/en/list/886/) |
| TV | Área de conservación marina de Funafuti | [Fuente](https://tourism.gov.tv/funafuti-marine-conservation-2/) |
| UG | Tumbas de los reyes de Buganda en Kasubi | [Fuente](https://whc.unesco.org/en/statesparties/ug) |
| UA | Catedral de Santa Sofía de Kyiv | [Fuente](https://whc.unesco.org/en/list/527/) |
| AE | Sitios culturales de Al Ain | [Fuente](https://whc.unesco.org/en/list/1343/) |
| GB | Stonehenge | [Fuente](https://whc.unesco.org/en/list/373/) |
| US | Gran Cañón | [Fuente](https://whc.unesco.org/en/list/75/) |
| UY | Barrio histórico de Colonia del Sacramento | [Fuente](https://whc.unesco.org/en/list/747) |
| UZ | Samarcanda | [Fuente](https://whc.unesco.org/en/list/603/) |
| VU | Dominio del jefe Roi Mata | [Fuente](https://whc.unesco.org/en/list/1280) |
| VA | Basílica de San Pedro | [Fuente](https://whc.unesco.org/en/list/286/) |
| VE | Parque nacional Canaima | [Fuente](https://whc.unesco.org/en/list/701/) |
| VN | Bahía de Ha Long y archipiélago de Cat Ba | [Fuente](https://whc.unesco.org/en/list/672/) |
| YE | Ciudad vieja de Saná | [Fuente](https://whc.unesco.org/en/list/385/) |
| ZM | Mosi-oa-Tunya · cataratas Victoria | [Fuente](https://whc.unesco.org/en/statesparties/zm) |
| ZW | Gran Zimbabue | [Fuente](https://whc.unesco.org/en/statesparties/zw) |

## Referencias culinarias verificadas

La selección no pretende ser exhaustiva ni una receta. Los nombres no implican que el alimento se origine o se consuma exclusivamente en ese país. Los matices por país se conservan en el campo `notes`.

| Código | Referencia elegida | Fuente |
|---|---|---|
| AF | Qabeli palaw | [Fuente](https://www.afghanhouse.org/cuisine/dish/qabeli-pilau) |
| AL | Byrek con queso o espinacas | [Fuente](https://akt.gov.al/en/culinary/cottage-cheese-or-spinach-pie/) |
| DZ | Cuscús | [Fuente](https://ich.unesco.org/en/RL/knowledge-know-how-and-practices-pertaining-to-the-production-and-consumption-of-couscous-01602?RL=01602&lang=en) |
| AD | Escudella | [Fuente](https://www.culturapopular.ad/categories/escudella) |
| AO | Funge | [Fuente](https://en.wikipedia.org/wiki/Angolan_cuisine) |
| AG | Ducana | [Fuente](https://uae.antiguabarbudaembassy.com/culture-tourism) |
| AR | Empanadas | [Fuente](https://www.argentina.gob.ar/jefatura/turismo/viaja-por-argentina/empanadas) |
| AM | Lavash | [Fuente](https://ich.unesco.org/es/RL/el-lavash-preparacion-significado-y-aspecto-del-pan-tradicional-como-expresion-cultural-en-armenia-00985) |
| AU | Lamington | [Fuente](https://www.australia.com/en/things-to-do/food-and-drinks/typical-aussie-foods-to-try.html) |
| AT | Apfelstrudel vienés | [Fuente](https://www.austria.info/en-gb/recipes/apple-strudel/) |
| AZ | Gutab de carne | [Fuente](https://azerbaijan.travel/gutab-with-meat) |
| BS | Ensalada de caracola (conch salad) | [Fuente](https://www.nassauparadiseisland.com/blog/where-to-eat-conch-in-nassau-paradise-island) |
| BH | Balaleet | [Fuente](https://www.bahrain.com/en/try-these-places-for-a-taste-of-authentic-bahraini-breakfast) |
| BD | Pitha | [Fuente](https://www.beautifulbangladesh.gov.bd/newsletter/single/476) |
| BB | Cou-cou con pez volador | [Fuente](https://www.visitbarbados.org/local-cuisine) |
| BY | Draniki | [Fuente](https://www.belarus.by/en/about-belarus/cuisine) |
| BE | Gofre de Bruselas | [Fuente](https://www.visitflanders.com/en/stories/flemish-street-food-every-taste) |
| BZ | Arroz y frijoles beliceños | [Fuente](https://www.travelbelize.org/cuisine/) |
| BJ | Amiwô | [Fuente](https://en.wikipedia.org/wiki/Amiwo) |
| BT | Ema datshi | [Fuente](https://www.moenr.gov.bt/wp-content/uploads/2018/11/Bhutan-eCookbook.pdf) |
| BO | Salteña | [Fuente](https://es.wikipedia.org/wiki/Salte%C3%B1a) |
| BA | Ćevapi de Sarajevo | [Fuente](https://www.visitsarajevo.ba/wp-content/uploads/2018/06/visit_sarajevo-eng-web.pdf) |
| BW | Seswaa | [Fuente](https://en.wikipedia.org/wiki/Seswaa) |
| BR | Pão de queijo | [Fuente](https://www.gov.br/turismo/pt-br/assuntos/ultimas-noticia/dia-nacional-do-cafe-aromas-e-roteiros-pelo-brasil) |
| BN | Ambuyat | [Fuente](https://www.bruneitourism.com/activities-tour/ambuyat-experience-at-teratak-setiawan/) |
| BG | Banitsa | [Fuente](https://bulgariatravel.org/wp-content/uploads/2020/04/discover_bulgaria.pdf) |
| BF | Tô | [Fuente](https://en.wikipedia.org/wiki/Cuisine_of_Burkina_Faso) |
| BI | Ibiharage | [Fuente](https://en.wikipedia.org/wiki/Burundian_cuisine) |
| CV | Cachupa | [Fuente](https://www.visit-caboverde.com/sobre-cabo-verde/gastronomia) |
| KH | Amok de pescado | [Fuente](https://akp.gov.kh/post/detail/348901) |
| CM | Ndolé | [Fuente](https://en.wikipedia.org/wiki/Cameroonian_cuisine) |
| CA | Poutine | [Fuente](https://travel.destinationcanada.com/en-ca/things-to-do/authentic-quebec-foods-you-need-to-try) |
| CF | Kanda ti nyma | [Fuente](https://en.wikipedia.org/wiki/Central_African_Republic_cuisine) |
| TD | Boule | [Fuente](https://en.wikipedia.org/wiki/Chadian_cuisine) |
| CL | Pastel de choclo | [Fuente](https://chile.travel/blog/cocina-tipica-un-viaje-por-los-sabores-de-chile/) |
| CN | Pato asado de Pekín | [Fuente](https://english.visitbeijing.com.cn/article/47ONG9Wn3mb) |
| CO | Arepas | [Fuente](https://colombia.travel/es/blog/un-recorrido-por-la-cocina-colombiana-regiones-caribe-pacifico-y-andina) |
| KM | Mkatre wa djungu | [Fuente](https://www.unesco.org/fr/articles/tisser-lheritage-lunesco-soutient-la-sauvegarde-du-patrimoine-culturel-immateriel-aux-comores-0) |
| CG | Saka-saka | [Fuente](https://en.wikipedia.org/wiki/Pondu) |
| CD | Pondu | [Fuente](https://en.wikipedia.org/wiki/Pondu) |
| CR | Gallo pinto costarricense | [Fuente](https://www.visitcostarica.com/things-to-do/culinary-adventures) |
| CI | Attiéké | [Fuente](https://ich.unesco.org/en/RL/skills-related-to-attieke-production-in-cote-d-ivoire-02086) |
| HR | Štrukli de Zagorje | [Fuente](https://www.infozagreb.hr/en/news/zagorje-strukli-protected-cultural-asset-en) |
| CU | Ajiaco cubano | [Fuente](https://www.cuba.travel/destinos/la-habana/restaurantes-de-la-habana) |
| CY | Queso halloumi | [Fuente](https://www.visitcyprus.com/discover-cyprus/food-drink/local-produce/) |
| CZ | Svíčková na smetaně | [Fuente](https://www.visitczechia.com/es-es/things-to-do/places/gastronomic-tourism/czech-cuisine-and-regional-products/g-svickova-na-smetane) |
| DK | Smørrebrød | [Fuente](https://www.visitdenmark.com/denmark/things-to-do/eat-drink/traditional-danish-food) |
| DJ | Lahoh | [Fuente](https://en.wikipedia.org/wiki/Djiboutian_cuisine) |
| DM | Sopa callaloo | [Fuente](https://legacy.discoverdominica.com/en/posts/42/a-taste-of-the-island-dominicas-delicious-culinary-experiences) |
| DO | La bandera dominicana | [Fuente](https://es.godominicanrepublic.com/blog/post/5-platos-imperdibles-de-la-gastronomia-dominicana) |
| EC | Encebollado | [Fuente](https://ecuador.travel/en/elementor-5966-2-2/) |
| EG | Koshary | [Fuente](https://www.experienceegypt.eg/en) |
| SV | Pupusas | [Fuente](https://elsalvador.travel/preforocimap/gastronomia-salvadorena/) |
| GQ | Pepesup | [Fuente](https://en.wikipedia.org/wiki/Cuisine_of_Equatorial_Guinea) |
| ER | Injera | [Fuente](https://1997-2001.state.gov/about_state/business/com_guides/1999/africa/eritrea99_09.html) |
| EE | Kama con kéfir | [Fuente](https://visitestonia.com/en/what-to-do/five-classic-foods-to-try-in-estonia) |
| SZ | Pap | [Fuente](https://www.thekingdomofeswatini.com/food-drink/) |
| ET | Injera | [Fuente](https://ethiopianembassy.org/culture/) |
| FJ | Kokoda | [Fuente](https://www.fiji.travel/fiji-guide/things-to-know/destination-guide/culture-language-region-of-fiji) |
| FI | Pastel de Carelia (karjalanpiirakka) | [Fuente](https://finland.fi/life-society/rolling-out-pies-rye-bread-and-other-essential-eastern-finnish-recipes/) |
| FR | Baguette | [Fuente](https://ich.unesco.org/es/RL/la-artesania-y-la-cultura-de-la-baguette-barra-de-pan-01883) |
| GA | Nyembwe | [Fuente](https://en.wikipedia.org/wiki/Gabonese_cuisine) |
| GM | Domoda | [Fuente](https://en.wikipedia.org/wiki/Gambian_cuisine) |
| GE | Khachapuri de Imericia | [Fuente](https://georgia.travel/imeretian-khachapuri) |
| DE | Currywurst | [Fuente](https://www.germany.travel/en/campaign/culinary-germany/home.html) |
| GH | Banku con salsa de okra | [Fuente](https://visitghana.com/oti-region/) |
| GR | Moussaka | [Fuente](https://visitgreece.gr/experiences/gastronomy/traditional-cuisine/?pg=4) |
| GD | Oil down | [Fuente](https://www.puregrenada.com/grenada-the-spice-of-the-caribbean-officially-becomes-the-first-culinary-capital/) |
| GT | Pepián | [Fuente](https://biblioteca.inguat.gob.gt/library/index.php?lang=es&mode=advanced&query=%40title%3DSpecial%3AGSMSearchPage%40process%3D%40field1%3Dencabezamiento%40value1%3DGASTRONOMIA.+%40mode%3Dadvanced&recnum=60&title=9392) |
| GN | Konkoé | [Fuente](https://en.wikipedia.org/wiki/Guinean_cuisine) |
| GW | Caldo de mancarra | [Fuente](https://en.wikipedia.org/wiki/Guinea-Bissauan_cuisine) |
| GY | Pepperpot guyanés | [Fuente](https://en.wikipedia.org/wiki/Guyanese_pepperpot) |
| HT | Sopa joumou | [Fuente](https://ich.unesco.org/es/RL/la-sopa-joumou-01853) |
| HN | Baleadas | [Fuente](https://www.consuladohondurasmadrid.es/conoce-honduras/) |
| HU | Sopa goulash (gulyás) | [Fuente](https://visithungary.com/documents/a/af/af6/af6b60d1f3140320e50d3ebbecca34921166197.pdf) |
| IS | Skyr | [Fuente](https://www.visiticeland.com/article/enjoy-icelandic-food/) |
| IN | Dosa | [Fuente](https://www.prod.incredibleindia.gov.in/content/incredible-india-v2/en/destinations/chennai/food-and-cuisine/dosa.html) |
| ID | Nasi goreng | [Fuente](https://www.indonesia.travel/gb/en/travel-ideas/gastronomy/don-t-leave-indonesia-before-you-get-a-taste-of-these-12-favorite-local-foods) |
| IR | Kelane del Kurdistán iraní | [Fuente](https://visitiran.ir/en/cuisine/kelane) |
| IQ | Masgouf | [Fuente](https://iraqiembassy.us/art-and-culture/) |
| IE | Estofado irlandés (Irish stew) | [Fuente](https://www.bordbia.ie/recipes/lamb-recipes/irish-stew) |
| IL | Shakshuka de berenjena | [Fuente](https://foodish.anumuseum.org.il/en/recipe/eggplant-shakshouka/) |
| IT | Pizza napolitana | [Fuente](https://www.italia.it/en/campania/naples/things-to-do/pizza) |
| JM | Ackee con pescado salado | [Fuente](https://www.visitjamaica.com/blog/post/ackee-and-saltfish-in-jamaica/) |
| JP | Onigiri | [Fuente](https://www.maff.go.jp/e/policies/market/japan-cuisine/japan/7/index.html) |
| JO | Mansaf | [Fuente](https://ich.unesco.org/en/RL/al-mansaf-in-jordan-a-festive-banquet-and-its-social-and-cultural-meanings-01849) |
| KZ | Baursak | [Fuente](https://www.gov.kz/memleket/entities/mfa-istanbul/press/news/details/899316?lang=tr) |
| KE | Ugali con sukuma wiki | [Fuente](https://bucketlist.magicalkenya.com/experiences/kenyan-western-culture-culinary-experience/) |
| KI | Babai (taro gigante de pantano) | [Fuente](https://crga48.spc.int/sites/default/files/documents_uploads/Pacific%20Community%20Results%20Report%202017.pdf) |
| KP | Raengmyon de Pyongyang | [Fuente](https://ich.unesco.org/en/RL/pyongyang-raengmyon-custom-01695) |
| KR | Kimchi | [Fuente](https://ich.unesco.org/es/RL/kimjang-modo-de-preparar-y-compartir-conservas-kimchi-en-la-republica-de-corea-00881) |
| KW | Machboos | [Fuente](https://kuwaittimes.com/article/25692/lifestyle/art-fashion/kuwaiti-ramadan-tables-welcome-affordable-truffles/) |
| KG | Boorsok | [Fuente](https://old.cbtkyrgyzstan.kg/tour-products/) |
| LA | Khao niew (arroz glutinoso) | [Fuente](https://www.tourismlaos.org/welcome/food-flavours/) |
| LV | Guisantes grises con tocino | [Fuente](https://www.latvia.travel/en/flavours-latvia) |
| LB | Man'ouché | [Fuente](https://ich.unesco.org/es/RL/al-man-ouche-una-practica-culinaria-emblematica-en-libano-02000) |
| LS | Motoho | [Fuente](https://www.gov.ls/about-lesotho/tourism/) |
| LR | Dumboy | [Fuente](https://en.wikipedia.org/wiki/Liberian_cuisine) |
| LY | Bazin | [Fuente](https://en.wikipedia.org/wiki/Libyan_cuisine) |
| LI | Käsknöpfle | [Fuente](https://en.tourismus.li/rezepte/detail/kasknopfle-dc0e5593-abe1-418e-943e-a897c7979b3e.html) |
| LT | Cepelinai | [Fuente](https://lithuania.travel/en/what-to-do/food-and-drink/lithuanian-products/cepelinai) |
| LU | Bouneschlupp | [Fuente](https://luxembourg.public.lu/en/society-and-culture/culinary-delights/cuisine-international.html) |
| MG | Romazava | [Fuente](https://madagascar-tourisme.com/en/restaurants-and-nightlife/restaurants/) |
| MW | Nsima | [Fuente](https://ich.unesco.org/en/RL/nsima-culinary-tradition-of-malawi-01292) |
| MY | Nasi lemak | [Fuente](https://www.tourism.gov.my/media/view/tourism-malaysia-showcases-malaysian-breakfast-culture-in-singapore) |
| MV | Mas huni | [Fuente](https://old.visitmaldives.com/portfolio-item/maldivian-side-of-life/) |
| ML | Tigadeguena | [Fuente](https://en.wikipedia.org/wiki/Malian_cuisine) |
| MT | Pastizzi | [Fuente](https://www.visitmalta.com/es/maltese-pastizzi-taste-of-malta/) |
| MH | Bwiro | [Fuente](https://en.wikipedia.org/wiki/Marshallese_cuisine) |
| MR | Cuscús | [Fuente](https://ich.unesco.org/en/RL/knowledge-know-how-and-practices-pertaining-to-the-production-and-consumption-of-couscous-01602?RL=01602&lang=en) |
| MU | Dholl puri | [Fuente](https://www.mymauritius.travel/sites/default/files/pdf/mtpa-mauritius_5.pdf) |
| MX | Tamales | [Fuente](https://www.gob.mx/agricultura/articulos/tamales-variedad-y-sabor-de-nuestra-tradicion) |
| FM | Banana Karat de Pohnpei | [Fuente](https://islandfood.org/) |
| MD | Mămăligă | [Fuente](https://moldova.travel/en/gastronomy/) |
| MC | Barbajuan | [Fuente](https://www.visitmonaco.com/en/routes-and-walks/27551/getaway-with-friends) |
| MN | Buuz | [Fuente](https://m.mongolia.travel/themes/taste) |
| ME | Kačamak | [Fuente](https://www.montenegro.travel/en/explore-montenegro/food-wine/food-routes) |
| MA | Cuscús | [Fuente](https://ich.unesco.org/en/RL/knowledge-know-how-and-practices-pertaining-to-the-production-and-consumption-of-couscous-01602?RL=01602&lang=en) |
| MZ | Matapa | [Fuente](https://en.wikipedia.org/wiki/Mozambican_cuisine) |
| MM | Mohinga | [Fuente](https://www.moi.gov.mm/nlm/sites/default/files/newspaper-pdf/2025-12/25_Dec_25_gnlm.pdf) |
| NA | Kapana | [Fuente](https://en.wikipedia.org/wiki/Kapana_%28grilled_meat%29) |
| NR | Pescado con coco | [Fuente](https://en.wikipedia.org/wiki/Nauruan_cuisine) |
| NP | Momos | [Fuente](https://trade.ntb.gov.np/wp-content/uploads/2018/05/Experience_Nepal_Globalizing_Nepalese_Heritage_Cuisine_Recipe_Book.pdf) |
| NL | Stroopwafel | [Fuente](https://www.holland.com/global/tourism/getting-around/interests/regional-products-in-the-netherlands) |
| NZ | Hāngī | [Fuente](https://www.newzealand.com/ca/feature/maori-hangi/) |
| NI | Nacatamal | [Fuente](https://www.visitanicaragua.com/en/atractivos/gastronomia/) |
| NE | Dambou | [Fuente](https://en.wikipedia.org/wiki/Nigerien_cuisine) |
| NG | Arroz jollof nigeriano | [Fuente](https://tournigeria.gov.ng/nigerian-party-jollof-the-king-of-rice/) |
| MK | Tavče gravče | [Fuente](https://tourismmacedonia.gov.mk/wp-content/uploads/2018/09/1.-Skopje-A-WALK-THROUGH-THE-ETERNAL-CITY.pdf) |
| NO | Fårikål | [Fuente](https://www.visitnorway.com/things-to-do/food-and-drink/the-norwegian-cookbook/farikal/) |
| OM | Harees | [Fuente](https://ich.unesco.org/en/RL/harees-dish-know-how-skills-and-practices-01744) |
| PK | Biryani | [Fuente](https://mofa.gov.pk/pakistani-food) |
| PW | Taro de Palaos | [Fuente](https://pristineparadisepalau.com/wp-content/uploads/2018/11/Alii-Palau-English.pdf) |
| PS | Musakhan | [Fuente](https://www.travelpalestine.ps/en/Category/2/Cuisine) |
| PA | Sancocho panameño | [Fuente](https://pt.tourismpanama.com/planeje-sua-viagem/itinerarios/nove-dias-entre-polleras-e-corais-explore-as-provincias-centrais/) |
| PG | Mumu | [Fuente](https://en.wikipedia.org/wiki/Papua_New_Guinean_cuisine) |
| PY | Chipa | [Fuente](https://cultura.gov.py/2025/09/chipa/) |
| PE | Ceviche peruano | [Fuente](https://ich.unesco.org/en/RL/practices-and-meanings-associated-with-the-preparation-and-consumption-of-ceviche-an-expression-of-peruvian-traditional-cuisine-01952) |
| PH | Adobo filipino | [Fuente](https://nnc.gov.ph/mindanao-region/what-makes-an-adobo-dish-an-adobo/) |
| PL | Pierogi | [Fuente](https://www.poland.travel/en/flavours-of-polish-cuisine/) |
| PT | Pastel de nata | [Fuente](https://www.visitportugal.com/en/system/files_force/Sentir_PT_dez19_WEB_0.pdf) |
| QA | Machboos | [Fuente](https://visitqatar.com/intl-en/about-qatar/cuisine) |
| RO | Sarmale | [Fuente](https://romaniatourism.com/romanian-food-wine.html) |
| RU | Echpochmak de Tartaristán | [Fuente](https://visit-tatarstan.com/en/guides/gastronomicheskie-udovolstviya-v-tatarstane/) |
| RW | Isombe | [Fuente](https://en.wikipedia.org/wiki/Rwandan_cuisine) |
| KN | Goat water | [Fuente](https://www.mofa.gov.kn/2026/05/11/saint-kitts-and-nevis-goat-water-featured-at-first-ever-international-day-for-sids-reception-at-united-nations-headquarters-in-new-york/) |
| LC | Plátano verde con pescado salado | [Fuente](https://stlucia.org/en/blog/culinary/green-fig-and-saltfish-the-taste-that-helps-you-understand-saint-lucia/) |
| VC | Fruta del pan con jackfish | [Fuente](https://tourism.gov.vc/tourism/index.php/44-culture-department/culture-administration/179-svg-cultural-overview) |
| WS | Palusami | [Fuente](https://www.samoa.travel/discover/our-food-and-cuisine/samoan-food/) |
| SM | Piadina de San Marino | [Fuente](https://www.visitsanmarino.com/pub1/VisitSM/contenuto/About-San-Marino/Gastronomia.html) |
| ST | Calulu | [Fuente](https://en.wikipedia.org/wiki/Cuisine_of_S%C3%A3o_Tom%C3%A9_and_Pr%C3%ADncipe) |
| SA | Harees | [Fuente](https://ich.unesco.org/en/RL/harees-dish-know-how-skills-and-practices-01744) |
| SN | Ceebu jën | [Fuente](https://ich.unesco.org/es/RL/ceebu-jen-arte-culinario-del-senegal-01748) |
| RS | Ajvar de Leskovac | [Fuente](https://www.serbia.travel/en/green-markets/) |
| SC | Ladob | [Fuente](https://www.seychelles.com/experience/food-drinks) |
| SL | Guiso de hojas de yuca | [Fuente](https://en.wikipedia.org/wiki/Sierra_Leonean_cuisine) |
| SG | Kaya toast | [Fuente](https://www.visitsingapore.com/travel-tips/travelling-to-singapore/itineraries/24-hours-in-singapore/) |
| SK | Bryndzové halušky | [Fuente](https://slovakia.travel/en/slovak-gastronomy) |
| SI | Potica | [Fuente](https://www.slovenia.info/en/stories/fragrant-slovenian-holiday-dishes) |
| SB | Yuca de las Islas Salomón | [Fuente](https://www.fao.org/one-country-one-priority-product/asia-pacific/solomon-islands/en) |
| SO | Canjeero | [Fuente](https://link.springer.com/article/10.1186/s42779-022-00138-3) |
| ZA | Bobotie | [Fuente](https://www.southafrica.net/gl/en/travel/article/iconic-south-african-foods-taste-all-the-flavours-of-the-rainbow-nation) |
| SS | Kisra | [Fuente](https://en.wikipedia.org/wiki/South_Sudanese_cuisine) |
| ES | Paella valenciana | [Fuente](https://www.spain.info/es/receta/paella/) |
| LK | Hoppers (appa) | [Fuente](https://srilanka.travel/food) |
| SD | Kisra | [Fuente](https://en.wikipedia.org/wiki/Sudanese_cuisine) |
| SR | Pom | [Fuente](https://en.wikipedia.org/wiki/Pom_%28dish%29) |
| SE | Albóndigas suecas (köttbullar) | [Fuente](https://visitsweden.com/what-to-do/food-drink/swedish-kitchen/best-swedish-meatballs-and-where-get-them/) |
| CH | Fondue de queso | [Fuente](https://www.myswitzerland.com/en-gb/experiences/food-wine/fondue-experience-switzerland/) |
| SY | Kibbeh | [Fuente](https://ich.unesco.org/doc/src/38275-EN.pdf?t=1509979714) |
| TJ | Oshi palav | [Fuente](https://ich.unesco.org/en/RL/oshi-palav-a-traditional-meal-and-its-social-and-cultural-contexts-in-tajikistan-01191) |
| TZ | Ugali | [Fuente](https://www.ug.tzembassy.go.tz/tanzania/category/people-and-culture) |
| TH | Tomyum Kung | [Fuente](https://www.tourismthailand.org/Articles/must-taste-tomyum-kung-in-thailand) |
| TL | Batar da'un | [Fuente](https://timorleste.tl/eat-drink) |
| TG | Fufu togolés | [Fuente](https://togotourisme.tg/un-patrimoine-historique/) |
| TO | Lu pulu | [Fuente](https://www.tongatourism.travel/discover/people-and-culture/food-and-feasting) |
| TT | Doubles | [Fuente](https://visittrinidad.tt/things-to-do/cuisine/indo-trinidadian-food-in-trinidad-with-mark-wiens/) |
| TN | Cuscús | [Fuente](https://ich.unesco.org/en/RL/knowledge-know-how-and-practices-pertaining-to-the-production-and-consumption-of-couscous-01602?RL=01602&lang=en) |
| TR | Simit | [Fuente](https://goturkiye.com/gastronomy/turkish-cuisine) |
| TM | Chorek | [Fuente](https://turkmenistan.gov.tm/en/post/54809/tamdyr-national-bakery-traditions) |
| TV | Pulaka | [Fuente](https://ichcourier.unesco-ichcap.org/board.es?act=view&b_list=12&bid=A102&list_no=566&mid=a10100000000) |
| UG | Rolex | [Fuente](https://exploreuganda.com/culinary/) |
| UA | Borscht ucraniano | [Fuente](https://ich.unesco.org/en/USL/culture-of-ukrainian-borscht-cooking-01852) |
| AE | Harees | [Fuente](https://ich.unesco.org/en/RL/harees-dish-know-how-skills-and-practices-01744) |
| GB | Fish and chips | [Fuente](https://www.visitbritain.com/es/cosas-que-hacer-en-gran-bretana/gastronomia-tipica-mapa-gastronomico-de-gran-bretana) |
| US | Clam chowder de Massachusetts | [Fuente](https://traveltrade.visittheusa.com/destinations/massachusetts/) |
| UY | Chivito | [Fuente](https://www.gub.uy/ministerio-turismo/comunicacion/noticias/chivito-week-vuelve-renovado-llega-todo-pais) |
| UZ | Palov | [Fuente](https://ich.unesco.org/en/RL/palov-culture-and-tradition-01166) |
| VU | Laplap | [Fuente](https://www.vanuatu.travel/en/about-vanuatu/local-eats) |
| VA | Pizza napolitana (Museos Vaticanos) | [Fuente](https://www.museivaticani.va/content/museivaticani/en/organizza-visita/servizi-per-i-visitatori/ristorazione.html) |
| VE | Arepa venezolana | [Fuente](https://www.mincultura.gob.ve/noticias/la-arepa-y-sus-variantes-en-el-territorio-venezolano/) |
| VN | Phở | [Fuente](https://vietnam.travel/) |
| YE | Saltah | [Fuente](https://embassy-of-yemen.pl/en/home/visit-yemen/tourism-in-yemen/must-try/) |
| ZM | Nshima | [Fuente](https://www.zambiatourism.com/what-to-see-during-your-holidays-in-zambia/) |
| ZW | Sadza | [Fuente](https://zimbabwetourism.net/portfolios/chesvingo-cultural-village/) |

## Alcance de la cobertura y revisión visual

No quedan campos de lugar o alimento sin referencia entre los 195 códigos del catálogo. Esto no acredita 195 cocinas nacionales exclusivas, ni 195 ilustraciones terminadas. En Kiribati, Micronesia, Palau, Islas Salomón y Tuvalu se documentan alimentos concretos, con su contexto local, sin inventar un plato nacional.

En Ciudad del Vaticano, la pizza napolitana se documenta como oferta actual de los Museos Vaticanos. Es una referencia de consumo en ese lugar, no una receta originaria del Vaticano ni evidencia de una gastronomía nacional distinta. Las notas de cada país conservan las limitaciones regionales, las tradiciones compartidas y los contextos históricos pertinentes.

Los lugares propuestos en listas indicativas de UNESCO se distinguen de los bienes inscritos en sus notas; una URL de UNESCO no basta para afirmar inscripción. El atolón de Bikini conserva su contexto de ensayos nucleares y desplazamiento de población. Las referencias arquitectónicas o naturales no autorizan a representar ritos ni a trivializar lugares de memoria.

Cada ilustración debe revisarse frente a la referencia específica antes de cambiar su estado visual. Para sustituir o ampliar una selección: consultar una fuente identificable, registrar URL y alcance, y volver a comprobar la correspondencia entre nombre y dibujo.
