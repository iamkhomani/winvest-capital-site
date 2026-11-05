import type { ArticleContent } from './articles'

export const basicsNl: Record<string, ArticleContent> = {
  candles: {
    path: '/nl/leren/candlestick-anatomie/',
    title: 'Candlestick anatomy: zo lees je een candlestick-grafiek',
    metaTitle: 'Candlestick anatomy: candlestick-grafieken lezen | Winvest Capital',
    description:
      'Leer candlestick-grafieken lezen: open, high, low en close, de body en de wicks, bullish en bearish candles, timeframes en wat de vorm van een candle zegt over kopers en verkopers.',
    intro:
      'Bijna elke grafiek die je bij trading ziet, is een candlestick-grafiek. Elke candle vat samen wat de koers in één periode deed: waar die begon, hoe ver die omhoog en omlaag ging en waar die eindigde. Kun je één candle lezen, dan kun je het verhaal van een hele grafiek lezen. Dit is de eerste les, omdat elk later concept, van marktstructuur tot fair value gaps, in candles wordt beschreven.',
    sections: [
      {
        h: 'De vier prijzen in elke candle (OHLC)',
        p: ['Een candle bestaat uit vier prijzen voor de periode die hij beslaat:'],
        ul: [
          'Open: de eerste verhandelde prijs van de periode.',
          'High: de hoogste prijs die in de periode is bereikt.',
          'Low: de laagste prijs die in de periode is bereikt.',
          'Close: de laatste prijs van de periode. De close is de belangrijkste van de vier, omdat die laat zien wie de controle had toen de periode eindigde.',
        ],
      },
      {
        h: 'Body en wicks',
        p: [
          'De body is het dikke deel van de candle, tussen de open en de close. De wicks (ook wel shadows) zijn de dunne lijnen boven en onder de body. De bovenste wick loopt van de body tot de high, de onderste van de body tot de low.',
          'Een lange body betekent dat de koers duidelijk één kant op bewoog en daar bleef. Een lange wick betekent dat de koers ergens kwam, maar daar niet kon blijven: hij werd vóór de close teruggeduwd. Daarom noemen traders een lange wick vaak een afwijzing (rejection) van dat prijsgebied.',
        ],
      },
      {
        h: 'Bullish en bearish candles',
        p: [
          'Ligt de close hoger dan de open, dan is de candle bullish: kopers wonnen de periode. Ligt de close lager dan de open, dan is de candle bearish: verkopers wonnen. De meeste platformen kleuren bullish candles groen of wit en bearish candles rood of zwart, maar kleuren zijn aan te passen. Lees daarom altijd de open en close in plaats van alleen op de kleur te vertrouwen.',
        ],
      },
      {
        h: 'Wat de vorm van een candle je vertelt',
        ul: [
          'Grote body, kleine wicks: sterke, eenzijdige druk. Een reeks hiervan in één richting heet displacement en is een belangrijk ingrediënt in latere lessen.',
          'Kleine body, lange wicks aan beide kanten (een doji of spinning top): besluiteloosheid. Kopers en verkopers waren ongeveer in evenwicht.',
          'Lange onderste wick, close bij de high: verkopers duwden de koers omlaag, maar kopers namen het over. Vaak te zien wanneer de koers een bodem sweept.',
          'Lange bovenste wick, close bij de low: kopers duwden de koers omhoog, maar verkopers namen het over. Vaak te zien wanneer de koers een top sweept.',
        ],
      },
      {
        h: 'Timeframes: één markt, veel candles',
        p: [
          'Elke candle staat voor een vaste periode: één minuut, vijftien minuten, een uur, vier uur, een dag, een week. Dezelfde koersbeweging ziet er op elk timeframe anders uit. Eén sterke dagcandle kan op de 15-minutengrafiek uit tientallen kleine op-en-neer-candles bestaan.',
          'Hogere timeframes tonen het grotere geheel en wegen zwaarder; lagere timeframes tonen de details en worden gebruikt om instappen te timen. Beide combineren heet multi-timeframeanalyse, die je in alle Smart Money Concepts-lessen gebruikt.',
        ],
      },
      {
        h: 'Waarom de close telt: wacht tot de candle klaar is',
        p: [
          'Zolang een candle niet gesloten is, wordt hij nog gevormd. Een candle die halverwege het uur op een sterke uitbraak lijkt, kan eindigen als een lange wick die terug in de range sluit. Veel regels in technische analyse, zoals een Break of Structure, vragen daarom om een candle close voorbij een niveau en niet alleen een wick erdoorheen.',
        ],
      },
    ],
    faq: [
      ['Wat betekenen de wicks van een candle?', 'De wicks tonen de hoogste en laagste prijs in de periode. Een lange wick betekent dat de koers dat niveau bereikte, maar vóór de close werd teruggeduwd.'],
      ['Welk timeframe gebruik je als beginner?', 'Begin met de dag- en 4-uursgrafiek om het grotere geheel te begrijpen. Lagere timeframes bewegen sneller en bevatten meer ruis.'],
      ['Zijn candlepatronen genoeg om op te traden?', 'Nee. Eén candle vertelt wie één periode won. Hij wordt pas bruikbaar in context: waar hij ontstond, in welke trend en op welk niveau.'],
    ],
  },
  orders: {
    path: '/nl/leren/ordertypes/',
    title: 'Ordertypes uitgelegd: market, limit, stop, stop-loss en take-profit',
    metaTitle: 'Ordertypes uitgelegd: market, limit en stop orders | Winvest Capital',
    description:
      'De ordertypes die elke trader nodig heeft: market, limit, stop en stop-limit orders, stop-loss, take-profit en trailing stop, plus bid, ask, spread en slippage, uitgelegd met voorbeelden.',
    intro:
      'Een grafiek lezen is één ding, een trade openen en sluiten is iets anders. Het ordertype dat je kiest bepaalt tegen welke prijs je gevuld kunt worden en of je überhaupt gevuld wordt. In deze les behandelen we de orders die je op elk platform gebruikt, en de kosten en risico’s die erbij horen.',
    sections: [
      {
        h: 'Bid, ask en spread',
        p: [
          'Elke markt heeft op elk moment twee prijzen. De bid is de hoogste prijs die een koper wil betalen; de ask is de laagste prijs waarvoor een verkoper wil verkopen. Je koopt tegen de ask en verkoopt tegen de bid. Het verschil daartussen is de spread: kosten die je bij elke trade betaalt.',
          'Spreads zijn klein in liquide markten zoals EUR/USD of Bitcoin en groter in rustigere markten, buiten de belangrijkste handelsuren en rond groot nieuws.',
        ],
      },
      {
        h: 'Market order: nu gevuld worden',
        p: [
          'Een market order koopt of verkoopt direct tegen de beste beschikbare prijs. Je wordt bijna altijd gevuld, maar je bepaalt de exacte prijs niet. In snelle markten kan de vulling slechter zijn dan de prijs die je op je scherm zag. Dat verschil heet slippage.',
        ],
      },
      {
        h: 'Limit order: een betere prijs, of geen vulling',
        p: [
          'Een limit order zet je op een prijs die beter is dan de huidige: een buy limit onder de huidige prijs, een sell limit erboven. Hij wordt alleen gevuld tegen jouw prijs of beter. Het nadeel is dat de koers jouw niveau misschien nooit bereikt, en dan word je niet gevuld.',
          'Traders die wachten tot de koers terugkeert naar een zone, zoals een order block of fair value gap uit latere lessen, stappen meestal in met limit orders.',
        ],
      },
      {
        h: 'Stop order: instappen als de koers een niveau breekt',
        p: [
          'Een stop order (ook wel stop entry) zet je op een prijs die slechter is dan de huidige: een buy stop boven de huidige prijs, een sell stop eronder. Bereikt de koers het niveau, dan wordt de order een market order. Breakout-traders gebruiken stop orders om pas in te stappen als de koers een beweging bevestigt.',
          'Een stop-limit order werkt hetzelfde, maar wordt bij activering een limit order in plaats van een market order. Dat beschermt je tegen een slechte vulling, maar je wordt mogelijk helemaal niet gevuld als de koers over je limiet springt.',
        ],
      },
      {
        h: 'Stop-loss en take-profit: je uitstap plannen',
        ul: [
          'Stop-loss: een stop order die je positie met verlies sluit als de koers het niveau bereikt waar je idee niet meer klopt. Dit is je belangrijkste order. Zonder stop-loss kan één trade grote schade aanrichten.',
          'Take-profit: een limit order die je positie op je koersdoel sluit.',
          'Trailing stop: een stop-loss die op een vaste afstand met de koers meeschuift als de trade jouw kant op gaat, zodat je een deel van de winst vastzet. Hij schuift nooit terug.',
        ],
      },
      {
        h: 'Gaps en slippage: als je niet op jouw prijs gevuld wordt',
        p: [
          'Een stop-loss wordt gevuld als market order en is dus geen gegarandeerde prijs. Maakt de markt een gap, bijvoorbeeld over het weekend of bij onverwacht nieuws, dan kan je stop flink voorbij het niveau gevuld worden. Sommige brokers bieden tegen betaling gegarandeerde stops. Dit is een van de redenen om je risico per trade klein te houden en voorzichtig te zijn met posities rond groot nieuws.',
        ],
      },
    ],
    faq: [
      ['Wat is het verschil tussen een limit en een stop order?', 'Een limit order wacht op een betere prijs dan de huidige (lager kopen, hoger verkopen). Een stop order activeert op een slechtere prijs dan de huidige (hoger kopen, lager verkopen) en wordt dan als market order gevuld.'],
      ['Waarom werd mijn order op een andere prijs gevuld?', 'Market orders en geactiveerde stop orders worden gevuld tegen de beste beschikbare prijs. In snelle markten of bij gaps kan die afwijken van de prijs op je scherm: dat is slippage.'],
      ['Moet elke trade een stop-loss hebben?', 'Ja. Bepaal vóór je instapt waar je idee niet meer klopt en zet daar je stop-loss. In de volgende lessen zie je hoe de afstand tot je stop je positiegrootte bepaalt.'],
    ],
  },
  lots: {
    path: '/nl/leren/lots-pips-pipwaarde/',
    title: 'Lots, pips en pipwaarde bij forex: wat het is en hoe je het berekent',
    metaTitle: 'Lots, pips en pipwaarde uitgelegd (forex) | Winvest Capital',
    description:
      'Wat een pip is, wat standaard, mini en micro lots zijn en hoe je de pipwaarde van elk valutapaar berekent, inclusief JPY-paren en omrekening naar de valuta van je account.',
    intro:
      'Bij forex meet je positiegrootte in lots en koersbewegingen in pips. Samen bepalen ze hoeveel geld één pip beweging voor jou waard is. Deze les geeft je de eenheden en het rekenwerk; de les over risicobeheer gebruikt ze later om voor elke trade de juiste positiegrootte te berekenen.',
    sections: [
      {
        h: 'Wat is een pip?',
        p: [
          'Een pip is de standaardeenheid van koersbeweging van een valutapaar. Bij de meeste paren is dat de vierde decimaal: 0,0001. Gaat EUR/USD van 1,1000 naar 1,1025, dan is dat 25 pips. Bij paren met de Japanse yen is de pip de tweede decimaal: 0,01. USD/JPY van 150,00 naar 150,40 is 40 pips.',
          'De meeste brokers tonen één extra decimaal, de fractional pip of pipette. 1,10253 betekent 1,1025 plus 3 tienden van een pip. Tel pips en geen pipettes: tien pipettes zijn één pip.',
        ],
      },
      {
        h: 'Wat is een lot?',
        p: ['Een lot is een standaardhoeveelheid van de basisvaluta, de eerste valuta van het paar.'],
        ul: [
          'Standaard lot: 100.000 eenheden (1,00 lot).',
          'Mini lot: 10.000 eenheden (0,10 lot).',
          'Micro lot: 1.000 eenheden (0,01 lot), bij de meeste brokers de kleinste grootte.',
        ],
      },
      {
        h: 'Zo bereken je de pipwaarde',
        p: [
          'Pipwaarde = pipgrootte × aantal eenheden. De uitkomst is in de quotevaluta, de tweede valuta van het paar.',
          'EUR/USD, 1 standaard lot: 0,0001 × 100.000 = $10 per pip. Een mini lot is $1 per pip, een micro lot $0,10.',
          'USD/JPY, 1 standaard lot: 0,01 × 100.000 = ¥1.000 per pip. Bij een koers van 150,00 is dat 1.000 ÷ 150 ≈ $6,67 per pip.',
        ],
      },
      {
        h: 'Omrekenen naar de valuta van je account',
        p: [
          'Staat je account in euro’s, dan moet een pipwaarde in dollars of yen worden omgerekend tegen de actuele wisselkoers. Voorbeeld: $10 per pip bij een EUR/USD-koers van 1,10 is 10 ÷ 1,10 ≈ €9,09 per pip. Omdat wisselkoersen bewegen, verandert de pipwaarde van hetzelfde paar in de loop van de tijd een beetje. Je platform rekent dit voor je om; de lotgrootte-calculator op deze website doet dat ook.',
        ],
      },
      {
        h: 'Goud, indices en crypto',
        p: [
          'Niet elk instrument gebruikt de forex-lot. Goud (XAU/USD), indices en CFD’s op crypto hebben eigen contractgroottes, die per broker verschillen. Eén lot goud is vaak 100 ounce, maar niet overal. Check altijd de contractspecificaties op je platform voordat je een nieuw instrument tradet.',
        ],
      },
    ],
    faq: [
      ['Hoeveel eenheden is 0,01 lot?', '1.000 eenheden van de basisvaluta. 0,10 lot is 10.000 eenheden en 1,00 lot is 100.000 eenheden.'],
      ['Waarom is een pip bij JPY-paren 0,01?', 'Omdat de yen per eenheid veel minder waard is, worden JPY-paren met twee decimalen genoteerd in plaats van vier, en de pip schuift mee.'],
      ['Wat is het verschil tussen een pip en een pipette?', 'Een pipette is een tiende van een pip: de vijfde decimaal bij de meeste paren en de derde decimaal bij JPY-paren.'],
    ],
  },
  leverage: {
    path: '/nl/leren/hefboom-leverage/',
    title: 'Leverage (hefboom) bij trading: wat het is en waarom het je risico per trade niet verandert',
    metaTitle: 'Leverage (hefboom) bij trading uitgelegd | Winvest Capital',
    description:
      'Wat leverage is, hoe je met een kleine inleg een grote positie aanhoudt, de EU-limieten voor particuliere traders en waarom je stop-loss en positiegrootte, niet leverage, je risico bepalen.',
    intro:
      'Met leverage (hefboom) open je een positie die groter is dan het geld dat je ervoor inlegt. Het is een van de meest onbegrepen onderdelen van trading. Zonder plan kan het een account snel leegmaken; goed begrepen is het gewoon een instrument dat bepaalt hoeveel van je account in een trade vastzit.',
    sections: [
      {
        h: 'Wat leverage betekent',
        p: [
          'Leverage is de verhouding tussen de grootte van je positie en de inleg die nodig is om die te openen. Met 1:30 leverage open je met €1.000 eigen geld een positie van €30.000. De broker leent je in feite de rest zolang de positie open staat.',
          'De volledige waarde van de positie heet de notionele waarde. Eén standaard lot EUR/USD (les 3) heeft een notionele waarde van 100.000 euro, veel meer dan de meeste traders storten. Leverage maakt die positiegrootte mogelijk.',
        ],
      },
      {
        h: 'Leverage vergroot winst en verlies ten opzichte van je inleg',
        p: [
          'Winst en verlies worden berekend over de hele positie, niet over de inleg. Met €1.000 voor een positie van €30.000 is een koersbeweging van 1% €300: 30% van het geld dat je inlegde. Een beweging van 1% tegen je in kost net zoveel. Daarom kan hoge leverage in combinatie met een grote positie een account in een paar trades leegmaken.',
        ],
      },
      {
        h: 'Wat leverage niet doet',
        p: [
          'Leverage bepaalt niet hoeveel je verliest als je stop-loss geraakt wordt. Dat bepalen je positiegrootte en de afstand tot je stop. Eén mini lot EUR/USD met een stop van 20 pips riskeert ongeveer $20, of je broker nu 1:30 of 1:500 biedt. Hogere leverage betekent alleen dat er minder van je geld als inleg vastzit.',
          'Het gevaar zit in wat leverage je verleidt te doen: posities openen die veel groter zijn dan je risicoplan toestaat. Bereken je elke trade vanuit je stop-loss, zoals in de les over risicobeheer, dan wordt leverage een instelling op de achtergrond.',
        ],
      },
      {
        h: 'Leveragelimieten voor particuliere traders in de EU',
        p: [
          'In de EU en EER beperken toezichthouders de leverage die brokers particuliere klanten op CFD’s mogen bieden, volgens regels die ESMA in 2018 invoerde:',
        ],
        ul: [
          '1:30 op belangrijke valutaparen (majors).',
          '1:20 op overige valutaparen, goud en belangrijke aandelenindices.',
          '1:10 op overige grondstoffen en overige aandelenindices.',
          '1:5 op individuele aandelen.',
          '1:2 op cryptocurrencies.',
          'Buiten de EU en voor professionele klanten gelden andere regels, en crypto exchanges hanteren eigen limieten voor futures. Check altijd wat voor jouw account geldt.',
        ],
      },
      {
        h: 'Leverage op crypto exchanges',
        p: [
          'Spot trading op een crypto exchange gebruikt geen leverage: je koopt de coin met je eigen geld. Futures en perpetual contracts gebruiken wel leverage, soms heel hoog. Daar is het grootste risico liquidatie: beweegt de koers ver genoeg tegen je in, dan sluit de exchange je positie automatisch en ben je de ingelegde margin kwijt. In de volgende les lees je hoe dat werkt.',
        ],
      },
    ],
    faq: [
      ['Is hogere leverage riskanter?', 'Niet op zichzelf. Je risico per trade komt uit positiegrootte en stopafstand. Hogere leverage maakt het makkelijker om te grote posities te openen, en daar zit het echte gevaar.'],
      ['Welke leverage gebruik je als beginner?', 'Bereken elke trade eerst vanuit je stop-loss en risicopercentage. Met de juiste positiegrootte heb je zelden meer nodig dan een fractie van de beschikbare leverage.'],
      ['Kan ik meer verliezen dan mijn inleg?', 'Bij particuliere CFD-accounts onder EU-toezicht beperkt negative balance protection je verlies tot het geld op je account. Elders geldt die bescherming mogelijk niet.'],
    ],
  },
  margin: {
    path: '/nl/leren/margin/',
    title: 'Margin uitgelegd: benodigde margin, free margin, margin level en margin calls',
    metaTitle: 'Margin bij trading: free margin, margin level, margin call | Winvest Capital',
    description:
      'Zo werkt margin: benodigde margin, equity, free margin, margin level, margin calls en stop-outs, met een rekenvoorbeeld en de 50%-regel voor particuliere traders in de EU.',
    intro:
      'Margin is de andere kant van leverage. Leverage zegt hoe groot een positie je kunt openen; margin is het deel van je geld dat apart wordt gezet zolang de positie open staat. Weten hoe margin wordt berekend helpt je de getallen op je platform te begrijpen en te voorkomen dat posities voor je gesloten worden.',
    sections: [
      {
        h: 'Benodigde margin',
        p: [
          'Benodigde margin = notionele waarde ÷ leverage. Eén mini lot EUR/USD (10.000 euro) openen met 1:30 leverage vraagt 10.000 ÷ 30 ≈ €333 margin. Je kunt dit ook als percentage schrijven: 1:30 leverage betekent een margin-eis van 3,33%, 1:20 betekent 5% en 1:2 betekent 50%.',
          'De margin is geen kostenpost. Het is een deel van je eigen geld dat vastzit zolang de positie open staat en weer vrijkomt als je die sluit.',
        ],
      },
      {
        h: 'Balance, equity, used margin en free margin',
        ul: [
          'Balance: het geld op je account, zonder het resultaat van open posities.',
          'Equity: balance plus of min de lopende winst of het lopende verlies van open posities. Dit is wat je account op dit moment waard is.',
          'Used margin: de totale margin die door alle open posities vastgezet is.',
          'Free margin: equity min used margin. Dit is wat beschikbaar is om nieuwe posities te openen of verliezen op te vangen.',
        ],
      },
      {
        h: 'Margin level',
        p: [
          'Margin level = equity ÷ used margin × 100%. Dit is het getal waar je broker naar kijkt. Zolang het ruim hoog is, gebeurt er niets. Lopen de verliezen op, dan dalen de equity en daarmee het margin level.',
        ],
      },
      {
        h: 'Margin call en stop-out',
        p: [
          'Daalt het margin level tot een bepaalde grens, dan geeft de broker een margin call: een waarschuwing dat je free margin opraakt. Daalt het verder tot het stop-outniveau, dan begint de broker je posities te sluiten, meestal de grootste verliezer eerst, om te voorkomen dat je account negatief wordt.',
          'Voor particuliere CFD-klanten in de EU moeten brokers posities sluiten zodra de equity daalt tot 50% van de benodigde margin. Veel brokers geven de margin call eerder, bijvoorbeeld bij 100%. Op crypto exchanges heet hetzelfde mechanisme liquidatie.',
        ],
      },
      {
        h: 'Een rekenvoorbeeld',
        p: [
          'Account: €2.000. Je koopt 1 standaard lot EUR/USD (100.000 euro) met 1:30 leverage. Benodigde margin: 100.000 ÷ 30 ≈ €3.333. Dat is meer dan je equity, dus het platform opent de trade niet.',
          'Je opent in plaats daarvan 0,30 lot. Benodigde margin ≈ €1.000, free margin ≈ €1.000, margin level 200%. Eén pip is nu ongeveer $3 waard. Na een verlies van 100 pips (in dit voorbeeld ongeveer €270) is de equity ≈ €1.730 en het margin level ≈ 173%. Een verlies van ongeveer 550 pips (ongeveer €1.500) brengt het margin level op 50% en activeert de close-out.',
          'Let op: 100 pips verlies ligt ver voorbij een verstandige stop-loss voor deze positie. Met een stop-loss die je op de grafiek bepaalt en een positie die 1% van je account riskeert, wordt de stop geraakt lang voordat margin een probleem wordt. Dat is het onderwerp van de volgende les.',
        ],
      },
    ],
    faq: [
      ['Is margin een kostenpost?', 'Nee. Margin is een deel van je eigen geld dat vastzit zolang een positie open staat en terugkomt als je die sluit. Kosten zijn de spread, commissie en overnight financiering (swap).'],
      ['Wat is een goed margin level?', 'Er is geen vast getal, maar komt je margin level in de buurt van de margin call-grens van je broker, dan zijn je posities te groot voor je account.'],
      ['Wat is het verschil tussen isolated en cross margin?', 'Op crypto exchanges beperkt isolated margin het mogelijke verlies tot de margin die aan die ene positie is toegewezen. Cross margin gebruikt je hele saldo als margin voor alle posities, zodat één verliezende trade de rest kan opslokken.'],
    ],
  },
}
