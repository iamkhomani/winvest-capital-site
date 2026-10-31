import type { ArticleContent } from './articles'

export const nl: Record<string, ArticleContent> = {
  smc: {
    path: '/nl/leren/wat-is-smart-money-concepts/',
    title: 'Wat zijn Smart Money Concepts (SMC)? Uitleg voor beginners',
    metaTitle: 'Wat zijn Smart Money Concepts (SMC)? Uitleg voor beginners | Winvest Capital',
    description:
      'Smart Money Concepts (SMC) helder uitgelegd: marktstructuur, liquiditeit, order blocks en fair value gaps, en hoe traders ze gebruiken bij aandelen, crypto en forex.',
    intro:
      'Smart Money Concepts, meestal afgekort tot SMC, is een manier om grafieken te lezen die kijkt naar waar grote partijen zoals banken, fondsen en market makers waarschijnlijk kopen en verkopen. In plaats van achterlopende indicatoren bestuderen SMC-traders de koers zelf: hoe de trend is opgebouwd, waar orders waarschijnlijk klaarliggen en waar de koers zo snel bewoog dat er gaten zijn achtergebleven.',
    sections: [
      {
        h: 'Waar komt het idee vandaan?',
        p: [
          'Grote instellingen handelen in posities die veel te groot zijn om in één keer op één prijs te vullen. Om die omvang te kopen of te verkopen hebben ze veel tegenovergestelde orders nodig. Die vinden ze waar veel kleinere traders hun stop-losses en openstaande orders hebben staan. SMC probeert de sporen die dat op de grafiek achterlaat te lezen.',
          'Veel van de termen zijn populair geworden via traders die de "Inner Circle Trader" (ICT)-stijl onderwijzen. De kernideeën, zoals trendstructuur, vraag en aanbod en liquiditeit, zijn veel ouder en komen uit de klassieke price action-handel.',
        ],
      },
      {
        h: 'De vier bouwstenen van SMC',
        ul: [
          'Marktstructuur: de trend herkennen aan hogere toppen en hogere bodems (opwaartse trend) of lagere toppen en lagere bodems (neerwaartse trend), en zien wanneer dat verandert met een Break of Structure (BOS) of Change of Character (CHoCH).',
          'Liquiditeit: clusters van stop-losses en openstaande orders, meestal boven gelijke toppen, onder gelijke bodems en rond duidelijke steun en weerstand.',
          'Order blocks: de laatste tegengestelde candle vóór een krachtige beweging die de structuur brak; vaak een zone waar de koers reageert als hij terugkomt.',
          'Fair value gaps (FVG): onevenwichtigheden van drie candles waarbij de koers zo snel bewoog dat één kant van de markt nauwelijks werd gevuld.',
        ],
      },
      {
        h: 'Hoe een SMC-trade-idee wordt opgebouwd',
        p: [
          'De meeste SMC-traders werken top-down. Eerst bepalen ze de trend op een hoger tijdsframe, zoals de dag- of 4-uursgrafiek. Daarna wachten ze tot de koers liquiditeit pakt, bijvoorbeeld door een eerdere bodem te sweepen, gevolgd door een structuurverandering op een lager tijdsframe. Tot slot zoeken ze een instap bij een point of interest zoals een order block of fair value gap, met een stop-loss voorbij het gesweepte niveau.',
          'Die combinatie van context, een liquiditeitsmoment en een nauwkeurige instap maakt SMC populair: als het werkt, kan het risico klein zijn ten opzichte van de mogelijke beweging.',
        ],
      },
      {
        h: 'Werkt SMC bij aandelen, crypto en forex?',
        p: [
          'Ja. De concepten beschrijven hoe de koers zich door liquide markten beweegt, dus je kunt ze toepassen op valutaparen, indices, losse aandelen en cryptomunten. Liquiditeit en volatiliteit verschillen per markt, en daarmee ook de niveaus en timing. Grote forex-paren en grote cryptomunten zoals Bitcoin laten vaak de duidelijkste structuur zien, omdat er veel volume in omgaat.',
        ],
      },
      {
        h: 'Veelgemaakte fouten van beginners',
        ul: [
          'Elke candle als order block markeren. Alleen zones die een echte structuurbreuk veroorzaakten tellen.',
          'De trend op het hogere tijdsframe negeren en ertegenin handelen.',
          'Instappen zonder liquiditeitssweep of bevestiging, waardoor SMC gokken wordt.',
          'Risicobeheer overslaan. Geen enkel concept werkt altijd, dus positiegrootte en stop-losses bepalen of je verliesreeksen overleeft.',
        ],
      },
      {
        h: 'Volgende stappen',
        p: [
          'Begin met marktstructuur; alles in SMC bouwt daarop voort. Bestudeer daarna liquiditeit, order blocks en fair value gaps, en oefen met het markeren ervan op historische grafieken voordat je geld riskeert. In de Winvest Capital community bespreken we deze setups dagelijks, gratis.',
        ],
      },
    ],
    faq: [
      ['Is SMC beter dan technische indicatoren?', 'Niet vanzelf. SMC leest de koers direct in plaats van indicatoren die van de koers zijn afgeleid, wat veel traders overzichtelijker vinden. Het vraagt nog steeds oefening, bevestiging en strikt risicobeheer.'],
      ['Is SMC hetzelfde als ICT?', 'Ze overlappen sterk. ICT is een specifieke lesmethode die veel SMC-termen heeft geïntroduceerd; "SMC" is de bredere naam die traders voor deze price action-concepten gebruiken.'],
      ['Kunnen beginners SMC leren?', 'Ja, als je de concepten in volgorde leert: eerst marktstructuur, dan liquiditeit, order blocks en fair value gaps, en oefent op een demo of historische grafieken.'],
    ],
  },
  structure: {
    path: '/nl/leren/marktstructuur-bos-choch/',
    title: 'Marktstructuur in SMC: Break of Structure (BOS) en Change of Character (CHoCH)',
    metaTitle: 'Marktstructuur: BOS en CHoCH uitgelegd | Winvest Capital',
    description:
      'Leer marktstructuur lezen bij SMC-trading: wat swing highs en swing lows zijn en het verschil tussen een Break of Structure (BOS) en een Change of Character (CHoCH).',
    intro:
      'Marktstructuur is het fundament van Smart Money Concepts. Het vertelt je in welke richting de markt trendt, en dus welke trades de wind mee hebben. Twee begrippen staan centraal: de Break of Structure (BOS) en de Change of Character (CHoCH).',
    sections: [
      {
        h: 'Swing highs en swing lows',
        p: [
          'Een swing high is een top met lagere koersen aan beide kanten; een swing low is een bodem met hogere koersen aan beide kanten. Door deze swings te verbinden zie je de trend:',
        ],
        ul: [
          'Opwaartse trend (bullish structuur): hogere toppen (HH) en hogere bodems (HL).',
          'Neerwaartse trend (bearish structuur): lagere toppen (LH) en lagere bodems (LL).',
          'Range: de koers beweegt zijwaarts tussen een ongeveer gelijke top en bodem.',
        ],
      },
      {
        h: 'Break of Structure (BOS): de trend zet door',
        p: [
          'Een Break of Structure ontstaat wanneer de koers een swingpunt breekt in de richting van de bestaande trend. In een opwaartse trend is een BOS een slot boven de vorige hogere top; in een neerwaartse trend een slot onder de vorige lagere bodem. Een BOS bevestigt dat de trend nog intact is.',
          'Veel traders tellen een breuk alleen als de body van een candle voorbij het niveau sluit, niet alleen een lont (wick). Een wick die erdoorheen prikt en weer binnen sluit, is vaak juist een liquiditeitssweep.',
        ],
      },
      {
        h: 'Change of Character (CHoCH): de trend kan draaien',
        p: [
          'Een Change of Character is de eerste breuk tegen de huidige trend in. In een opwaartse trend ontstaat een CHoCH als de koers sluit onder de laatste hogere bodem die tot de laatste hogere top leidde. In een neerwaartse trend is het een slot boven de laatste lagere top.',
          'Een CHoCH is een vroeg waarschuwingssignaal dat de trend kan omkeren, geen garantie. Traders wachten vaak op een terugval na de CHoCH en daarna een BOS in de nieuwe richting voordat ze de omkeer als bevestigd zien.',
        ],
      },
      {
        h: 'Interne en externe structuur',
        p: [
          'Externe (swing) structuur bestaat uit de grote toppen en bodems die duidelijk zichtbaar zijn op je hoofdtijdsframe. Interne structuur zijn de kleinere swings binnen één van die bewegingen. Een CHoCH op interne structuur kan aangeven dat een correctie eindigt; een CHoCH op externe structuur zegt meer over de totale trend.',
        ],
      },
      {
        h: 'Meerdere tijdsframes gebruiken',
        ul: [
          'Hoger tijdsframe (dag of 4 uur): bepaal de totale trend en de belangrijke swingpunten.',
          'Middelste tijdsframe (1 uur): volg correcties en interessante zones.',
          'Lager tijdsframe (15 of 5 minuten): zoek een CHoCH of BOS die een instap bevestigt.',
        ],
      },
      {
        h: 'Praktische tips',
        ul: [
          'Markeer de structuur van links naar rechts op een schone grafiek voordat je trades zoekt.',
          'Wees consequent in wat je als swing en wat je als breuk telt.',
          'Handel in de richting van de structuur op het hogere tijdsframe, tenzij er duidelijk bewijs is van een omkeer.',
        ],
      },
    ],
    faq: [
      ['Wat is het verschil tussen BOS en CHoCH?', 'Een BOS breekt de structuur in de richting van de bestaande trend en bevestigt voortzetting. Een CHoCH is de eerste breuk tegen de trend in en wijst op een mogelijke omkeer.'],
      ['Telt een wick als Break of Structure?', 'De meeste SMC-traders tellen alleen een slot van de candle-body voorbij het niveau. Een wick erdoorheen die weer binnen sluit, zien ze meestal als liquiditeitssweep.'],
      ['Welk tijdsframe is het beste voor marktstructuur?', 'Gebruik een hoger tijdsframe zoals de dag- of 4-uursgrafiek om de trend te bepalen, en een lager tijdsframe voor de instap.'],
    ],
  },
  orderblocks: {
    path: '/nl/leren/order-blocks/',
    title: 'Order blocks uitgelegd: zo vind en gebruik je ze',
    metaTitle: 'Order blocks uitgelegd: bullish en bearish OB in SMC | Winvest Capital',
    description:
      'Wat is een order block in trading? Leer bullish en bearish order blocks herkennen, wanneer een order block geldig is en hoe SMC-traders ze gebruiken voor instap en stop-loss.',
    intro:
      'Een order block is een prijszone waar grote partijen vermoedelijk flinke orders hebben geplaatst vóór een krachtige beweging. Binnen Smart Money Concepts is het een van de meest gebruikte points of interest voor een instap, omdat de koers vaak reageert als hij naar die zone terugkeert.',
    sections: [
      {
        h: 'Definitie',
        ul: [
          'Bullish order block: de laatste bearish (dalende) candle vóór een krachtige stijging die de marktstructuur breekt.',
          'Bearish order block: de laatste bullish (stijgende) candle vóór een krachtige daling die de marktstructuur breekt.',
        ],
        p: ['De zone wordt meestal getekend van de top tot de bodem van de order block-candle. Sommige traders gebruiken alleen de body voor een smallere zone.'],
      },
      {
        h: 'Waarom order blocks kunnen werken',
        p: [
          'Het idee is dat niet alle institutionele orders tijdens de oorspronkelijke beweging zijn gevuld. Als de koers terugkomt in de zone, kunnen de resterende orders worden geraakt en een reactie veroorzaken. Of die verklaring nu precies klopt of niet: order blocks markeren plekken waar de koers eerder krachtig van richting veranderde, en dat maakt ze logische plekken om een trade te zoeken.',
        ],
      },
      {
        h: 'Wanneer is een order block geldig?',
        ul: [
          'Het veroorzaakte een Break of Structure: de beweging vanuit de zone brak een recente swing high of swing low.',
          'Het liet een onevenwichtigheid achter: een fair value gap na het order block laat zien dat de beweging agressief was.',
          'Het is nog niet "gemitigeerd": de koers is sinds het ontstaan nog niet in de zone teruggekomen.',
          'Het pakte liquiditeit: het order block sweepte een eerdere top of bodem vóór de beweging.',
          'Het past bij de trend op het hogere tijdsframe en ligt in een discount-zone (voor longs) of premium-zone (voor shorts).',
        ],
      },
      {
        h: 'Hoe traders order blocks gebruiken',
        p: [
          'Een veelgebruikte aanpak is wachten tot de koers terugloopt in het order block en dan bevestiging zoeken op een lager tijdsframe, zoals een Change of Character. De stop-loss komt net voorbij de andere kant van het order block en het koersdoel is de volgende liquiditeitspool, zoals een eerdere top of bodem.',
          'Sommige traders zetten direct een limietorder bij het order block. Daarmee pak je meer bewegingen, maar ook meer verliezende trades, omdat niet elke zone houdt.',
        ],
      },
      {
        h: 'Breaker blocks en mitigation blocks',
        p: [
          'Als een order block faalt en de koers er dwars doorheen breekt, kan de zone van rol wisselen. Een gefaald bullish order block dat later als weerstand werkt, heet een breaker block. Een mitigation block lijkt daarop maar ontstaat zonder voorafgaande liquiditeitssweep. Beide zijn gevorderde varianten die voortbouwen op het gewone order block.',
        ],
      },
    ],
    faq: [
      ['Is een order block hetzelfde als vraag en aanbod (supply en demand)?', 'Ze zijn nauw verwant. Een order block is een preciezere versie van een supply- of demandzone, meestal bepaald door één candle die tot een structuurbreuk leidde.'],
      ['Gebruik ik de hele candle of alleen de body?', 'Beide komen voor. De hele candle geeft een bredere, veiligere zone; de body een smallere zone met een kleinere stop-loss, maar met meer kans dat je de beweging mist.'],
      ['Houden order blocks altijd?', 'Nee. Veel order blocks falen. Daarom combineren traders ze met structuur, liquiditeit en bevestiging, en gebruiken ze altijd een stop-loss.'],
    ],
  },
  liquidity: {
    path: '/nl/leren/liquiditeit-trading/',
    title: 'Liquiditeit in trading: buy-side, sell-side en liquidity sweeps',
    metaTitle: 'Liquiditeit in SMC: buy-side, sell-side en liquidity sweeps | Winvest Capital',
    description:
      'Wat betekent liquiditeit bij Smart Money Concepts? Ontdek waar buy-side en sell-side liquiditeit ligt, wat een liquidity sweep of stop hunt is en hoe je voorkomt dat jij de liquiditeit bent.',
    intro:
      'Bij Smart Money Concepts verwijst liquiditeit naar plekken op de grafiek waar veel orders klaarliggen, vooral stop-losses en openstaande instaporders. Grote partijen hebben die orders nodig om grote posities te vullen, dus de koers wordt er vaak naartoe getrokken voordat de echte beweging begint.',
    sections: [
      {
        h: 'Buy-side en sell-side liquiditeit',
        ul: [
          'Buy-side liquiditeit ligt boven toppen: stop-losses van shorttraders en buy-stop-orders van breakout-traders. Als die worden geraakt, worden het kooporders.',
          'Sell-side liquiditeit ligt onder bodems: stop-losses van kopers en sell-stop-orders van breakout-traders. Als die worden geraakt, worden het verkooporders.',
        ],
      },
      {
        h: 'Waar liquiditeit zich opbouwt',
        ul: [
          'Gelijke toppen en gelijke bodems (dubbele toppen en bodems), die veel traders als sterke niveaus zien.',
          'De top en bodem van de vorige dag, week en maand.',
          'Trendlijnen die meerdere keren zijn geraakt.',
          'Duidelijke steun en weerstand en de randen van een range.',
          'Toppen en bodems van handelssessies, zoals de range van de Aziatische sessie vóór de opening van Londen.',
        ],
      },
      {
        h: 'Liquidity sweeps en stop hunts',
        p: [
          'Een liquidity sweep ontstaat wanneer de koers kort voorbij een top of bodem gaat, de orders die daar klaarliggen activeert en dan omdraait. Op de grafiek ziet dat er vaak uit als een lange wick door het niveau. Particuliere traders noemen het een stop hunt; binnen SMC zie je het als grote partijen die die liquiditeit gebruiken om orders in de tegenovergestelde richting te vullen.',
          'Een sweep alleen is geen signaal. Het wordt pas betekenisvol als er een structuurverandering in de tegenovergestelde richting op volgt, zoals een Change of Character.',
        ],
      },
      {
        h: 'Inducement',
        p: [
          'Inducement is een kleinere liquiditeitspool, vaak een kleine swing vlak vóór een point of interest, die traders verleidt om te vroeg in te stappen. De koers pakt die inducement vaak eerst en bereikt pas daarna het order block of de fair value gap waar SMC-traders op wachten.',
        ],
      },
      {
        h: 'Zo gebruik je liquiditeit in je trading',
        ul: [
          'Zet je stop-loss niet precies op voor de hand liggende gelijke toppen of bodems; geef hem ruimte voorbij het niveau.',
          'Gebruik liquiditeitspools als koersdoel: zit je long, dan is de volgende buy-side liquiditeit een logische plek om winst te nemen.',
          'Wacht bij een omkeertrade op een sweep plus een structuurverandering, in plaats van de exacte top of bodem te willen pakken.',
        ],
      },
    ],
    faq: [
      ['Wat is een liquidity grab?', 'Een andere naam voor een liquidity sweep: de koers beweegt net voorbij een top of bodem om klaarliggende orders te raken en draait daarna om.'],
      ['Waarom wordt mijn stop-loss steeds geraakt voordat de koers mijn kant op gaat?', 'Waarschijnlijk staat hij waar veel anderen hun stop ook zetten: bij voor de hand liggende toppen en bodems. Stops voorbij deze liquiditeitspools plaatsen, en je positiegrootte daarop afstemmen, kan helpen.'],
      ['Is liquiditeit hetzelfde als volume?', 'Niet in de SMC-betekenis. Volume meet hoeveel er is verhandeld; SMC-liquiditeit gaat over klaarliggende orders op specifieke prijsniveaus.'],
    ],
  },
  fvg: {
    path: '/nl/leren/fair-value-gaps/',
    title: 'Fair value gaps (FVG): wat het is en hoe je ermee tradet',
    metaTitle: 'Fair value gap (FVG) uitgelegd: imbalances in SMC | Winvest Capital',
    description:
      'Een fair value gap (FVG) is een onevenwichtigheid van drie candles. Leer bullish en bearish FVG’s herkennen, waarom de koers er vaak naar terugkeert en hoe SMC-traders ze gebruiken.',
    intro:
      'Een fair value gap, of FVG, is een gebied op de grafiek waar de koers zo snel één kant op bewoog dat er aan de andere kant nauwelijks gehandeld kon worden. Deze onevenwichtigheden werken vaak als een magneet: de koers keert regelmatig terug om het gat geheel of gedeeltelijk te vullen voordat hij verdergaat.',
    sections: [
      {
        h: 'Zo herken je een fair value gap',
        p: ['Een FVG bestaat uit drie opeenvolgende candles:'],
        ul: [
          'Bullish FVG: de bodem van candle 3 ligt boven de top van candle 1. Het gat daartussen is de FVG, ontstaan door een grote stijgende candle 2.',
          'Bearish FVG: de top van candle 3 ligt onder de bodem van candle 1. Het gat daartussen is de FVG, ontstaan door een grote dalende candle 2.',
        ],
      },
      {
        h: 'Waarom de koers terugkeert naar een FVG',
        p: [
          'Tijdens de snelle beweging werden orders vooral aan één kant gevuld, dus de prijsrange binnen het gat is inefficiënt verhandeld. Markten neigen ernaar dat recht te trekken, dus de koers komt vaak terug in die range. Als dat gebeurt, kan het gat als steun (bullish FVG) of weerstand (bearish FVG) werken.',
        ],
      },
      {
        h: 'Traden met fair value gaps',
        ul: [
          'Trade FVG’s in de richting van de trend: bullish gaps in een opwaartse trend, bearish gaps in een neerwaartse trend.',
          'De sterkste FVG’s ontstaan in de beweging die de structuur breekt, vaak direct na een order block.',
          'Veel traders gebruiken het midden van het gat (het 50%-niveau, ook wel consequent encroachment genoemd) als instap.',
          'Zet de stop-loss voorbij het gat of voorbij het bijbehorende order block of swingpunt.',
        ],
      },
      {
        h: 'Gevulde, deels gevulde en omgekeerde gaps',
        p: [
          'Een gat is gevuld als de koers door de hele range heen handelt. Bij een gedeeltelijke vulling bereikt de koers maar een deel van het gat voordat hij omdraait. Sluit de koers door een FVG heen en gebruikt hij het daarna vanaf de andere kant als niveau, dan heet het gat omgekeerd (een inversion FVG). Net als order blocks kunnen gaps falen, dus ze werken het best in combinatie met structuur en liquiditeit.',
        ],
      },
      {
        h: 'FVG versus een gewone koersgap',
        p: [
          'Een gewone gap, vaak bij aandelen, ontstaat als de markt opent op een andere prijs dan waarop hij sloot, waardoor er een lege ruimte tussen twee candles zit. Een fair value gap kan ontstaan tijdens doorlopende handel en wordt bepaald door het patroon van drie candles hierboven. Daarom zie je FVG’s ook in markten die 24/7 open zijn, zoals crypto, en in forex.',
        ],
      },
    ],
    faq: [
      ['Is een fair value gap hetzelfde als een imbalance?', 'Ja, binnen SMC worden beide termen door elkaar gebruikt voor de inefficiëntie van drie candles die hierboven is beschreven.'],
      ['Wordt elke FVG gevuld?', 'Nee. Veel FVG’s worden maar gedeeltelijk gevuld en sommige worden nooit meer bezocht, vooral in sterke trends.'],
      ['Welk tijdsframe werkt het best voor FVG’s?', 'FVG’s komen op elk tijdsframe voor. Gaps op hogere tijdsframes wegen zwaarder; gaps op lagere tijdsframes worden vaak gebruikt om de instap te verfijnen.'],
    ],
  },
  premium: {
    path: '/nl/leren/premium-discount-ote/',
    title: 'Premium- en discountzones en de optimal trade entry (OTE)',
    metaTitle: 'Premium vs discount en optimal trade entry (OTE) | Winvest Capital',
    description:
      'Leer hoe SMC-traders premium- en discountzones en de optimal trade entry (OTE) op basis van Fibonacci gebruiken om laag te kopen en hoog te verkopen binnen een range.',
    intro:
      'Premium en discount is een eenvoudig idee met veel effect: koop binnen een prijsrange in de onderste helft en verkoop in de bovenste helft. Gecombineerd met de optimal trade entry op basis van Fibonacci helpt het SMC-traders om niet achter de koers aan te jagen.',
    sections: [
      {
        h: 'Zo teken je de range',
        p: [
          'Neem een duidelijke swingrange, meestal de laatste impulsbeweging op je hoofdtijdsframe: van een swing low naar een swing high in een opwaartse trend, of van een swing high naar een swing low in een neerwaartse trend. Teken er een Fibonacci-retracement overheen en markeer het 50%-niveau, het evenwicht (equilibrium).',
        ],
        ul: [
          'Premium: het deel van de range boven 50%. Hier is de koers relatief duur, wat verkopen bevoordeelt.',
          'Discount: het deel van de range onder 50%. Hier is de koers relatief goedkoop, wat kopen bevoordeelt.',
        ],
      },
      {
        h: 'Combineren met je marktvisie',
        p: [
          'In een bullish markt zoeken SMC-traders longs in discount, bijvoorbeeld bij een bullish order block of fair value gap onder 50% van de range. In een bearish markt zoeken ze shorts in premium. Kopen in premium of verkopen in discount betekent meestal een slechtere risico-rendementsverhouding.',
        ],
      },
      {
        h: 'De optimal trade entry (OTE)',
        p: [
          'De optimal trade entry is een zone dieper in de terugval, meestal tussen de Fibonacci-niveaus van 62% en 79%, met 70,5% als veelgebruikt referentiepunt. Een instap daar geeft een krappe stop-loss voorbij het swingpunt en een grote mogelijke winst als de trend doorzet.',
        ],
      },
      {
        h: 'Voorbeeld',
        p: [
          'Stel dat de koers stijgt van 100 naar 120 en de structuur breekt. Het evenwicht ligt op 110, dus alles onder 110 is discount. De OTE-zone (62% tot 79% terugval) ligt ongeveer tussen 107,6 en 104,2. Een trader met een bullish visie wacht tot de koers terugloopt in die zone, het liefst in een order block of FVG, en zoekt bevestiging voordat hij koopt, met een stop-loss onder 100.',
        ],
      },
      {
        h: 'Beperkingen',
        ul: [
          'In zeer sterke trends komt de koers soms nooit terug in discount of in de OTE-zone.',
          'De uitkomst hangt af van welke swingpunten je kiest, dus wees consequent.',
          'Premium en discount is context, geen instapsignaal op zich.',
        ],
      },
    ],
    faq: [
      ['Wat is equilibrium in trading?', 'Het 50%-niveau van een prijsrange. Daarboven is premium, daaronder discount.'],
      ['Welke Fibonacci-niveaus horen bij de OTE?', 'De meeste traders gebruiken de zone tussen 62% en 79% terugval, met 70,5% als referentieniveau.'],
      ['Kan ik premium en discount op elke markt gebruiken?', 'Ja. Het werkt op elke grafiek met duidelijke swingpunten, ook bij aandelen, crypto en forex.'],
    ],
  },
  risk: {
    path: '/nl/leren/risicobeheer-lotgrootte/',
    title: 'Risicobeheer en lotgrootte: zo bereken je je positiegrootte',
    metaTitle: 'Lotgrootte en positiegrootte berekenen (forex, crypto) | Winvest Capital',
    description:
      'Stappenplan voor risicobeheer: de 1%-regel, risico-rendementsverhouding en hoe je je lotgrootte bij forex en positiegrootte bij aandelen en crypto berekent, met rekenvoorbeelden.',
    intro:
      'Goede analyse is waardeloos zonder goed risicobeheer. De belangrijkste beslissing bij elke trade is niet waar je instapt, maar hoeveel je riskeert als je ongelijk hebt. Met positiegrootte maak je van die beslissing een concreet getal.',
    sections: [
      {
        h: 'Stap 1: bepaal je risico per trade',
        p: [
          'Veel traders riskeren een vast percentage van hun account per trade, vaak tussen 0,5% en 2%. Met een account van €10.000 en 1% risico accepteer je maximaal €100 verlies per trade. Door een klein percentage te riskeren richt een verliesreeks beperkte schade aan: na tien verliezen op rij van 1% heb je nog ongeveer 90% van je account.',
        ],
      },
      {
        h: 'Stap 2: bepaal je stop-loss op de grafiek',
        p: [
          'Zet de stop-loss waar je trade-idee niet meer klopt, bijvoorbeeld voorbij het order block of de gesweepte bodem, niet op een willekeurige afstand. De afstand tussen instap en stop-loss bepaalt samen met je risicobedrag je positiegrootte.',
        ],
      },
      {
        h: 'Stap 3: bereken je positiegrootte',
        p: ['De algemene formule is: positiegrootte = risicobedrag ÷ (afstand tot stop-loss × waarde per eenheid koersbeweging).'],
        ul: [
          'Aandelen en crypto: positiegrootte = risicobedrag ÷ (instapprijs − stopprijs). Voorbeeld: €100 risico, Bitcoin kopen op 60.000 met een stop op 59.000. Positie = 100 ÷ 1.000 = 0,1 BTC (zonder kosten en valutaomrekening).',
          'Forex: lotgrootte = risicobedrag ÷ (stop-loss in pips × pipwaarde per standaard lot). Bij EUR/USD is één standaard lot (100.000 eenheden) $10 per pip waard. Voorbeeld: $100 risico en een stop van 20 pips. Lotgrootte = 100 ÷ (20 × 10) = 0,5 lot.',
          'Let op: pipwaarden verschillen per valutapaar en hangen af van de valuta van je account. Goud en indices hebben eigen contractgroottes, dus check de specificaties van je broker.',
        ],
      },
      {
        h: 'Stap 4: check de risico-rendementsverhouding',
        p: [
          'Vergelijk de afstand tot je koersdoel met de afstand tot je stop. Met een stop van 20 pips en een doel van 60 pips is de risico-rendementsverhouding 1:3. Bij 1:3 hoef je maar één op de vier keer gelijk te hebben om vóór kosten ongeveer quitte te spelen. Veel SMC-traders mikken op minstens 1:2.',
        ],
      },
      {
        h: 'Veelgemaakte fouten in risicobeheer',
        ul: [
          'De stop-loss verder weg zetten als de koers tegen je in gaat.',
          'Na een verlies groter gaan handelen om het "terug te winnen".',
          'Hoge hefboom gebruiken zonder het werkelijke risicobedrag te berekenen.',
          'Meerdere gecorreleerde trades tegelijk openen, zoals meerdere USD-paren, waardoor het echte risico vermenigvuldigt.',
        ],
      },
      {
        h: 'Gebruik een calculator',
        p: [
          'Vóór elke trade met de hand rekenen is foutgevoelig. Leden van de One Percent Club krijgen de lotgrootte-calculator in Market Whisper AI, die je positiegrootte berekent op basis van je account, risicopercentage en stop-loss.',
        ],
      },
    ],
    faq: [
      ['Wat is de 1%-regel bij trading?', 'Niet meer dan 1% van je account riskeren op één trade, zodat één verlies nooit grote schade doet.'],
      ['Hoeveel is één pip waard?', 'Bij paren met de USD als tweede valuta, zoals EUR/USD, is één standaard lot $10 per pip waard, een mini lot $1 en een micro lot $0,10. Bij andere paren verschilt dat.'],
      ['Wat is een goede risico-rendementsverhouding?', 'Veel traders mikken op minstens 1:2: de mogelijke winst is dan minstens twee keer zo groot als het mogelijke verlies.'],
    ],
  },
}
