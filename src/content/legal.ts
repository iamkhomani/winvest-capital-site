import type { Section } from './articles'

export type LegalDoc = { path: string; title: string; description: string; updated: string; sections: Section[] }
export const LEGAL_UPDATED = { en: '31 October 2026', nl: '31 oktober 2026' }

export const legal: Record<'terms' | 'privacy' | 'refunds', { en: LegalDoc; nl: LegalDoc }> = {
  terms: {
    en: {
      path: '/legal/terms/',
      title: 'Terms and conditions',
      description: 'Terms and conditions for the Winvest Capital community, the One Percent Club and Market Whisper AI.',
      updated: LEGAL_UPDATED.en,
      sections: [
        { h: '1. Who we are', p: ['These terms apply to the website winvestcapital.nl, the Winvest Capital Discord community, the One Percent Club and Market Whisper AI (together: "the services"), offered by Winvest Capital. Our contact details are listed at the bottom of this page.'] },
        { h: '2. Educational purpose only', p: ['All content, analysis, chart markups, projects, messages and Market Whisper AI output are for educational and informational purposes only. Nothing we share is financial, investment, tax or legal advice, or a recommendation to buy or sell any financial instrument or cryptocurrency.', 'Winvest Capital is not a licensed investment firm or financial adviser and does not manage money for members. You are solely responsible for your own trading and investment decisions.'] },
        { h: '3. Risk', p: ['Trading stocks, cryptocurrencies, forex and leveraged products carries a high risk of loss and is not suitable for everyone. You can lose more than you deposit with leveraged products. Past results, examples and reviews do not guarantee future results. Only trade with money you can afford to lose.'] },
        { h: '4. Free community', p: ['Access to the free community is provided through Discord. You must also follow the Discord terms of service and our community rules. We may change, limit or end free access at any time.'] },
        { h: '5. One Percent Club', ul: ['The One Percent Club is a one-time payment that gives access to the One Percent Club channels and features in our Discord, as described on the website at the time of purchase.', 'Payment is processed by Stripe through PayBot. After payment, the One Percent Club role is assigned to your Discord account.', 'Access is personal. Sharing your account or reselling content is not allowed.', '"One-time" means there is no subscription. Access lasts for as long as we operate the One Percent Club; we may change the content and features over time.'] },
        { h: '6. Market Whisper AI', p: ['Market Whisper AI is an automated tool. Its output can be incomplete, outdated or wrong and must always be checked. Features may change or be temporarily unavailable.'] },
        { h: '7. Conduct and removal', p: ['We may remove members who break these terms or the community rules, for example by harassment, spam, sharing paid content or misleading others. If we remove you because of a serious breach, no refund is due.'] },
        { h: '8. Intellectual property', p: ['All content we create, including texts, analyses, videos, designs and the Winvest Capital name and logo, belongs to Winvest Capital. You may use it for your own learning only.'] },
        { h: '9. Liability', p: ['To the extent permitted by law, Winvest Capital is not liable for any trading or investment losses or other damage resulting from the use of the services. Our total liability is limited to the amount you paid us in the 12 months before the event causing the damage. This does not limit any liability that cannot be excluded by law.'] },
        { h: '10. Withdrawal and refunds', p: ['See our refund policy for your right of withdrawal and how refunds work.'] },
        { h: '11. Changes and applicable law', p: ['We may update these terms. The version on this page applies from the date shown. Dutch law applies. Disputes are submitted to the competent court in the Netherlands, without affecting your rights as a consumer under the law of your country of residence.'] },
      ],
    },
    nl: {
      path: '/nl/voorwaarden/',
      title: 'Algemene voorwaarden',
      description: 'Algemene voorwaarden voor de Winvest Capital community, de One Percent Club en Market Whisper AI.',
      updated: LEGAL_UPDATED.nl,
      sections: [
        { h: '1. Wie wij zijn', p: ['Deze voorwaarden gelden voor de website winvestcapital.nl, de Winvest Capital Discord-community, de One Percent Club en Market Whisper AI (samen: "de diensten"), aangeboden door Winvest Capital. Onze contactgegevens staan onderaan deze pagina.'] },
        { h: '2. Uitsluitend educatief', p: ['Alle content, analyses, grafiekmarkeringen, projecten, berichten en output van Market Whisper AI zijn uitsluitend bedoeld voor educatie en informatie. Niets wat wij delen is financieel advies, beleggingsadvies, belastingadvies of juridisch advies, of een aanbeveling om een financieel instrument of cryptomunt te kopen of te verkopen.', 'Winvest Capital is geen vergunninghoudende beleggingsonderneming of financieel adviseur en beheert geen geld voor leden. Je bent zelf volledig verantwoordelijk voor je eigen trading- en beleggingsbeslissingen.'] },
        { h: '3. Risico', p: ['Handelen in aandelen, cryptomunten, forex en producten met hefboom brengt een hoog risico op verlies met zich mee en is niet voor iedereen geschikt. Met hefboomproducten kun je meer verliezen dan je inlegt. Resultaten uit het verleden, voorbeelden en reviews bieden geen garantie voor de toekomst. Handel alleen met geld dat je kunt missen.'] },
        { h: '4. Gratis community', p: ['Toegang tot de gratis community verloopt via Discord. Je moet ook de gebruiksvoorwaarden van Discord en onze communityregels volgen. Wij kunnen gratis toegang op elk moment wijzigen, beperken of beëindigen.'] },
        { h: '5. One Percent Club', ul: ['De One Percent Club is een eenmalige betaling die toegang geeft tot de kanalen en functies van de One Percent Club in onze Discord, zoals op het moment van aankoop op de website beschreven.', 'De betaling wordt verwerkt door Stripe via PayBot. Na betaling krijgt je Discord-account de One Percent Club-rol.', 'Toegang is persoonlijk. Je account delen of content doorverkopen is niet toegestaan.', '"Eenmalig" betekent dat er geen abonnement is. De toegang geldt zolang wij de One Percent Club aanbieden; de inhoud en functies kunnen in de loop van de tijd veranderen.'] },
        { h: '6. Market Whisper AI', p: ['Market Whisper AI is een geautomatiseerde tool. De output kan onvolledig, verouderd of onjuist zijn en moet altijd worden gecontroleerd. Functies kunnen wijzigen of tijdelijk niet beschikbaar zijn.'] },
        { h: '7. Gedrag en verwijdering', p: ['Wij kunnen leden verwijderen die deze voorwaarden of de communityregels overtreden, bijvoorbeeld door intimidatie, spam, het delen van betaalde content of het misleiden van anderen. Bij verwijdering wegens een ernstige overtreding heb je geen recht op terugbetaling.'] },
        { h: '8. Intellectueel eigendom', p: ['Alle content die wij maken, waaronder teksten, analyses, video’s, ontwerpen en de naam en het logo van Winvest Capital, is eigendom van Winvest Capital. Je mag deze alleen gebruiken om zelf van te leren.'] },
        { h: '9. Aansprakelijkheid', p: ['Voor zover de wet dat toestaat, is Winvest Capital niet aansprakelijk voor trading- of beleggingsverliezen of andere schade door het gebruik van de diensten. Onze totale aansprakelijkheid is beperkt tot het bedrag dat je ons hebt betaald in de 12 maanden vóór de gebeurtenis die de schade veroorzaakte. Dit beperkt geen aansprakelijkheid die wettelijk niet kan worden uitgesloten.'] },
        { h: '10. Herroeping en terugbetaling', p: ['Zie ons terugbetalingsbeleid voor je herroepingsrecht en hoe terugbetalingen werken.'] },
        { h: '11. Wijzigingen en toepasselijk recht', p: ['Wij kunnen deze voorwaarden aanpassen. De versie op deze pagina geldt vanaf de vermelde datum. Op deze voorwaarden is Nederlands recht van toepassing. Geschillen worden voorgelegd aan de bevoegde rechter in Nederland, onverminderd je rechten als consument op grond van het recht van je woonland.'] },
      ],
    },
  },
  privacy: {
    en: {
      path: '/legal/privacy/',
      title: 'Privacy policy',
      description: 'How Winvest Capital handles personal data on winvestcapital.nl, in the Discord community and for payments.',
      updated: LEGAL_UPDATED.en,
      sections: [
        { h: '1. Controller', p: ['Winvest Capital is responsible for processing your personal data as described in this policy. Our contact details are listed at the bottom of this page.'] },
        { h: '2. What data we process and why', ul: ['Website visits: when you visit winvestcapital.nl, your IP address and technical data (such as browser type) are processed by our hosting providers GitHub Pages and Cloudflare to deliver and secure the website (legitimate interest).', 'Payments: when you buy the One Percent Club, your name, email address, payment details and Discord account are processed by PayBot and Stripe to handle the payment and assign your role (performance of the contract). We receive the payment details we need for our records, not your full card details.', 'Discord: when you join our community, Discord processes your account data under its own privacy policy. We see your username, profile and messages in our server.', 'Newsletter: if you subscribe, we process your email address to send the newsletter (consent). You can unsubscribe at any time via the link in each email.', 'Contact: if you message us, we use your details to answer your question.'] },
        { h: '3. Third-party widgets', p: ['The live price ticker and economic calendar on this website are loaded from TradingView. When these load, TradingView receives your IP address and may use cookies or similar technology under its own privacy policy. Fonts and all other files are served from our own domain.'] },
        { h: '4. Cookies', p: ['We do not use advertising or tracking cookies ourselves. Our language choice and similar functional settings are not stored in cookies.'] },
        { h: '5. How long we keep data', ul: ['Payment and invoice records: 7 years, because of Dutch tax retention obligations.', 'Community membership data: for as long as you are a member, and removed on request afterwards where possible.', 'Newsletter: until you unsubscribe.'] },
        { h: '6. Sharing and international transfers', p: ['We only share data with the service providers mentioned above (GitHub, Cloudflare, Stripe, PayBot, Discord, TradingView and our newsletter provider). Some of them are based in the United States. Where data is transferred outside the EU, this happens on the basis of the EU-US Data Privacy Framework or standard contractual clauses.'] },
        { h: '7. Your rights', p: ['Under the GDPR you have the right to access, correct or delete your data, to restrict or object to processing, to data portability, and to withdraw consent at any time. Contact us to use these rights. You can also file a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).'] },
        { h: '8. Changes', p: ['We may update this policy. The latest version is always on this page.'] },
      ],
    },
    nl: {
      path: '/nl/privacy/',
      title: 'Privacyverklaring',
      description: 'Hoe Winvest Capital omgaat met persoonsgegevens op winvestcapital.nl, in de Discord-community en bij betalingen.',
      updated: LEGAL_UPDATED.nl,
      sections: [
        { h: '1. Verwerkingsverantwoordelijke', p: ['Winvest Capital is verantwoordelijk voor de verwerking van je persoonsgegevens zoals in deze verklaring beschreven. Onze contactgegevens staan onderaan deze pagina.'] },
        { h: '2. Welke gegevens we verwerken en waarom', ul: ['Websitebezoek: als je winvestcapital.nl bezoekt, worden je IP-adres en technische gegevens (zoals je browsertype) verwerkt door onze hostingpartijen GitHub Pages en Cloudflare om de website te leveren en te beveiligen (gerechtvaardigd belang).', 'Betalingen: als je de One Percent Club koopt, worden je naam, e-mailadres, betaalgegevens en Discord-account verwerkt door PayBot en Stripe om de betaling af te handelen en je rol toe te kennen (uitvoering van de overeenkomst). Wij ontvangen de betaalgegevens die we voor onze administratie nodig hebben, niet je volledige kaartgegevens.', 'Discord: als je lid wordt van onze community, verwerkt Discord je accountgegevens onder zijn eigen privacybeleid. Wij zien je gebruikersnaam, profiel en berichten in onze server.', 'Nieuwsbrief: als je je aanmeldt, verwerken we je e-mailadres om de nieuwsbrief te sturen (toestemming). Je kunt je altijd afmelden via de link in elke e-mail.', 'Contact: als je ons een bericht stuurt, gebruiken we je gegevens om je vraag te beantwoorden.'] },
        { h: '3. Widgets van derden', p: ['De live koersbalk en de economische kalender op deze website worden geladen vanaf TradingView. Daarbij ontvangt TradingView je IP-adres en kan het cookies of vergelijkbare technieken gebruiken onder zijn eigen privacybeleid. Lettertypen en alle andere bestanden worden vanaf ons eigen domein geladen.'] },
        { h: '4. Cookies', p: ['Wij gebruiken zelf geen advertentie- of trackingcookies. Je taalkeuze en vergelijkbare functionele instellingen worden niet in cookies opgeslagen.'] },
        { h: '5. Hoe lang we gegevens bewaren', ul: ['Betaal- en factuurgegevens: 7 jaar, vanwege de fiscale bewaarplicht in Nederland.', 'Gegevens over je lidmaatschap van de community: zolang je lid bent, en daarna op verzoek verwijderd waar mogelijk.', 'Nieuwsbrief: tot je je afmeldt.'] },
        { h: '6. Delen en doorgifte buiten de EU', p: ['We delen gegevens alleen met de hierboven genoemde dienstverleners (GitHub, Cloudflare, Stripe, PayBot, Discord, TradingView en onze nieuwsbriefdienst). Sommige daarvan zijn gevestigd in de Verenigde Staten. Als gegevens buiten de EU worden doorgegeven, gebeurt dat op basis van het EU-VS Data Privacy Framework of standaardcontractbepalingen.'] },
        { h: '7. Je rechten', p: ['Op grond van de AVG heb je het recht om je gegevens in te zien, te laten corrigeren of verwijderen, de verwerking te laten beperken of er bezwaar tegen te maken, je gegevens over te dragen en je toestemming altijd in te trekken. Neem contact met ons op om deze rechten te gebruiken. Je kunt ook een klacht indienen bij de Autoriteit Persoonsgegevens.'] },
        { h: '8. Wijzigingen', p: ['Wij kunnen deze verklaring aanpassen. De meest recente versie staat altijd op deze pagina.'] },
      ],
    },
  },
  refunds: {
    en: {
      path: '/legal/refunds/',
      title: 'Refund policy',
      description: 'Right of withdrawal and refund policy for the Winvest Capital One Percent Club.',
      updated: LEGAL_UPDATED.en,
      sections: [
        { h: 'Free community', p: ['The free community costs nothing, so there is nothing to refund. You can leave the Discord server at any time.'] },
        { h: 'One Percent Club: 14-day right of withdrawal', p: ['If you are a consumer in the EU, you have the right to withdraw from your One Percent Club purchase within 14 days of the payment date without giving a reason. To withdraw, send us a message (see contact details below) with the email address you paid with. We refund the full amount within 14 days using the same payment method, and remove the One Percent Club role.'] },
        { h: 'After 14 days', p: ['After the withdrawal period, the One Percent Club payment is non-refundable, because you have received access to the digital content and services. If something does not work as described, contact us and we will look for a fair solution.'] },
        { h: 'Removal for misconduct', p: ['Members removed because of a serious breach of our terms, such as sharing paid content, are not entitled to a refund after the withdrawal period.'] },
      ],
    },
    nl: {
      path: '/nl/terugbetaling/',
      title: 'Terugbetalingsbeleid',
      description: 'Herroepingsrecht en terugbetalingsbeleid voor de Winvest Capital One Percent Club.',
      updated: LEGAL_UPDATED.nl,
      sections: [
        { h: 'Gratis community', p: ['De gratis community kost niets, dus er valt niets terug te betalen. Je kunt de Discord-server op elk moment verlaten.'] },
        { h: 'One Percent Club: 14 dagen herroepingsrecht', p: ['Als consument in de EU heb je het recht om je aankoop van de One Percent Club binnen 14 dagen na de betaaldatum zonder opgave van reden te herroepen. Stuur ons daarvoor een bericht (zie de contactgegevens hieronder) met het e-mailadres waarmee je hebt betaald. We betalen het volledige bedrag binnen 14 dagen terug via dezelfde betaalmethode en verwijderen de One Percent Club-rol.'] },
        { h: 'Na 14 dagen', p: ['Na de herroepingstermijn wordt de betaling voor de One Percent Club niet terugbetaald, omdat je toegang hebt gekregen tot de digitale content en diensten. Werkt iets niet zoals beschreven, neem dan contact met ons op; we zoeken samen naar een eerlijke oplossing.'] },
        { h: 'Verwijdering wegens wangedrag', p: ['Leden die zijn verwijderd wegens een ernstige overtreding van onze voorwaarden, zoals het delen van betaalde content, hebben na de herroepingstermijn geen recht op terugbetaling.'] },
      ],
    },
  },
}
