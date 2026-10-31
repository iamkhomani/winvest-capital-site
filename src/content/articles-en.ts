import type { ArticleContent } from './articles'

export const en: Record<string, ArticleContent> = {
  smc: {
    path: '/learn/what-is-smart-money-concepts/',
    title: 'What are Smart Money Concepts (SMC)? A beginner’s guide',
    metaTitle: 'What Are Smart Money Concepts (SMC)? Beginner’s Guide | Winvest Capital',
    description:
      'Smart Money Concepts (SMC) explained in plain English: market structure, liquidity, order blocks and fair value gaps, and how traders use them on stocks, crypto and FX.',
    intro:
      'Smart Money Concepts, usually shortened to SMC, is a way of reading price charts that focuses on where large participants such as banks, funds and market makers are likely to buy and sell. Instead of relying on lagging indicators, SMC traders study price itself: how the trend is structured, where orders are likely resting and where price moved so fast that it left gaps behind.',
    sections: [
      {
        h: 'Where does the idea come from?',
        p: [
          'Large institutions trade positions that are far too big to fill at a single price. To buy or sell that size, they need plenty of opposite orders, which they find where many smaller traders have placed stop losses and pending orders. SMC tries to read the footprints this leaves on a chart.',
          'Much of the terminology was popularised by traders who teach the “Inner Circle Trader” (ICT) style of analysis. The core ideas, such as trend structure, supply and demand and liquidity, are much older and come from classic price action trading.',
        ],
      },
      {
        h: 'The four building blocks of SMC',
        ul: [
          'Market structure: identifying the trend through higher highs and higher lows (uptrend) or lower highs and lower lows (downtrend), and spotting when that changes with a Break of Structure (BOS) or Change of Character (CHoCH).',
          'Liquidity: clusters of stop losses and pending orders, typically above equal highs, below equal lows and around obvious support and resistance.',
          'Order blocks: the last opposite candle before a strong move that broke structure, often used as a zone where price may react when it returns.',
          'Fair value gaps (FVG): three-candle imbalances where price moved so quickly that one side of the market was barely filled.',
        ],
      },
      {
        h: 'How a typical SMC trade idea is built',
        p: [
          'Most SMC traders work top-down. They first define the trend on a higher timeframe such as the daily or 4-hour chart. Then they wait for price to take liquidity, for example by sweeping a previous low, followed by a shift in structure on a lower timeframe. Finally, they look for an entry at a point of interest such as an order block or fair value gap, with a stop loss beyond the swept level.',
          'This combination of context, a liquidity event and a precise entry is what makes SMC popular: when it works, the risk can be small compared with the potential move.',
        ],
      },
      {
        h: 'Does SMC work on stocks, crypto and FX?',
        p: [
          'Yes. The concepts describe how price moves through liquid markets, so they can be applied to forex pairs, indices, individual stocks and cryptocurrencies. Liquidity and volatility differ per market, so levels and timing do too. Major FX pairs and large-cap crypto such as Bitcoin tend to show the cleanest structure because they trade with high volume.',
        ],
      },
      {
        h: 'Common mistakes beginners make',
        ul: [
          'Marking every candle as an order block. Only zones that caused a real break of structure matter.',
          'Ignoring the higher-timeframe trend and trading against it.',
          'Entering without a liquidity sweep or confirmation, which turns SMC into guessing.',
          'Skipping risk management. No concept works every time, so position size and stop losses decide whether you survive losing streaks.',
        ],
      },
      {
        h: 'Next steps',
        p: [
          'Start with market structure; everything else in SMC builds on it. Then study liquidity, order blocks and fair value gaps, and practise marking them on historical charts before risking money. In the Winvest Capital community we discuss these setups daily, for free.',
        ],
      },
    ],
    faq: [
      ['Is SMC better than technical indicators?', 'Not automatically. SMC reads price directly instead of indicators derived from price, which many traders find clearer. It still needs practice, confirmation and strict risk management.'],
      ['Is SMC the same as ICT?', 'They overlap heavily. ICT is a specific teaching style that introduced many SMC terms; “SMC” is the broader name traders use for these price action concepts.'],
      ['Can beginners learn SMC?', 'Yes, if you learn the concepts in order: market structure first, then liquidity, order blocks and fair value gaps, and practise on demo or historical charts.'],
    ],
  },
  structure: {
    path: '/learn/market-structure-bos-choch/',
    title: 'Market structure in SMC: Break of Structure (BOS) and Change of Character (CHoCH)',
    metaTitle: 'Market Structure: BOS vs CHoCH Explained | Winvest Capital',
    description:
      'Learn how to read market structure in SMC trading. What swing highs and lows are, the difference between a Break of Structure (BOS) and a Change of Character (CHoCH), with examples.',
    intro:
      'Market structure is the foundation of Smart Money Concepts. It tells you which direction the market is trending, and therefore which trades have the wind at their back. Two terms are central: the Break of Structure (BOS) and the Change of Character (CHoCH).',
    sections: [
      {
        h: 'Swing highs and swing lows',
        p: [
          'A swing high is a peak with lower prices on both sides; a swing low is a trough with higher prices on both sides. Connecting these swings shows the trend:',
        ],
        ul: [
          'Uptrend (bullish structure): higher highs (HH) and higher lows (HL).',
          'Downtrend (bearish structure): lower highs (LH) and lower lows (LL).',
          'Range: price moves sideways between a roughly equal high and low.',
        ],
      },
      {
        h: 'Break of Structure (BOS): the trend continues',
        p: [
          'A Break of Structure happens when price breaks a swing point in the direction of the existing trend. In an uptrend, a BOS is a close above the previous higher high; in a downtrend, a close below the previous lower low. A BOS confirms that the trend is still intact.',
          'Many traders require a candle body close beyond the level, not just a wick, to count it as a valid break. A wick that pokes through and closes back inside is often a liquidity sweep instead.',
        ],
      },
      {
        h: 'Change of Character (CHoCH): the trend may be turning',
        p: [
          'A Change of Character is the first break against the current trend. In an uptrend, a CHoCH occurs when price closes below the most recent higher low that led to the last higher high. In a downtrend, it is a close above the most recent lower high.',
          'A CHoCH is an early warning that the trend may reverse, not a guarantee. Traders often wait for a pullback after the CHoCH and then a BOS in the new direction before treating the reversal as confirmed.',
        ],
      },
      {
        h: 'Internal and external structure',
        p: [
          'External (or swing) structure is formed by the major highs and lows that are clearly visible on your main timeframe. Internal structure is the smaller swings inside one of those legs. A CHoCH on internal structure can signal that a pullback is ending, while a CHoCH on external structure says more about the overall trend.',
        ],
      },
      {
        h: 'Using multiple timeframes',
        ul: [
          'Higher timeframe (daily or 4-hour): define the overall trend and the key swing points.',
          'Middle timeframe (1-hour): track pullbacks and areas of interest.',
          'Lower timeframe (15-minute or 5-minute): look for a CHoCH or BOS that confirms an entry.',
        ],
      },
      {
        h: 'Practical tips',
        ul: [
          'Mark structure from left to right on a clean chart before looking for trades.',
          'Be consistent about what counts as a swing and what counts as a break.',
          'Trade in the direction of the higher-timeframe structure unless you have clear evidence of a reversal.',
        ],
      },
    ],
    faq: [
      ['What is the difference between BOS and CHoCH?', 'A BOS breaks structure in the direction of the existing trend and confirms continuation. A CHoCH is the first break against the trend and signals a possible reversal.'],
      ['Does a wick count as a Break of Structure?', 'Most SMC traders only count a candle body close beyond the level. A wick through a level that closes back inside is usually treated as a liquidity sweep.'],
      ['Which timeframe is best for market structure?', 'Use a higher timeframe such as the daily or 4-hour to define the trend, and a lower timeframe for entries.'],
    ],
  },
  orderblocks: {
    path: '/learn/order-blocks/',
    title: 'Order blocks explained: how to find and trade them',
    metaTitle: 'Order Blocks Explained: Bullish & Bearish OB in SMC | Winvest Capital',
    description:
      'What is an order block in trading? Learn how to identify bullish and bearish order blocks, what makes an order block valid, and how SMC traders use them for entries and stop losses.',
    intro:
      'An order block is a price zone where large participants are believed to have placed significant orders before a strong move. In Smart Money Concepts it is one of the most used points of interest for entries, because price often reacts when it returns to that zone.',
    sections: [
      {
        h: 'Definition',
        ul: [
          'Bullish order block: the last bearish (down) candle before a strong move up that breaks market structure.',
          'Bearish order block: the last bullish (up) candle before a strong move down that breaks market structure.',
        ],
        p: [
          'The zone is usually drawn from the high to the low of the order block candle. Some traders use only the candle body to get a tighter zone.',
        ],
      },
      {
        h: 'Why order blocks can work',
        p: [
          'The idea is that not all institutional orders were filled during the original move. When price returns to the zone, the remaining orders can be triggered and cause a reaction. Whether or not that explanation is exactly right, order blocks mark areas where price previously changed direction with force, which makes them logical places to look for a trade.',
        ],
      },
      {
        h: 'What makes an order block valid?',
        ul: [
          'It caused a Break of Structure: the move away from the zone broke a recent swing high or low.',
          'It left an imbalance: a fair value gap after the order block shows the move was aggressive.',
          'It is unmitigated: price has not yet returned to the zone since it formed.',
          'It took liquidity: the order block swept a previous high or low before the move.',
          'It aligns with the higher-timeframe trend and sits in a discount zone (for longs) or premium zone (for shorts).',
        ],
      },
      {
        h: 'How traders use order blocks',
        p: [
          'A common approach is to wait for price to retrace into the order block, then look for confirmation on a lower timeframe, such as a Change of Character. The stop loss is placed just beyond the far side of the order block, and the target is the next pool of liquidity, such as a previous high or low.',
          'Some traders place limit orders directly at the order block. This catches more moves but also more losing trades, because not every zone holds.',
        ],
      },
      {
        h: 'Breaker blocks and mitigation blocks',
        p: [
          'When an order block fails and price breaks clean through it, the zone can flip roles. A failed bullish order block that later acts as resistance is called a breaker block. A mitigation block is similar but forms without a liquidity sweep beforehand. Both are more advanced variants that build on the basic order block.',
        ],
      },
    ],
    faq: [
      ['Is an order block the same as supply and demand?', 'They are closely related. An order block is a more precise version of a supply or demand zone, usually defined by a single candle that led to a break of structure.'],
      ['Should I use the full candle or only the body?', 'Both are used. The full candle gives a wider, safer zone; the body gives a tighter zone with a smaller stop loss but more chance of being missed.'],
      ['Do order blocks always hold?', 'No. Many order blocks fail, which is why traders combine them with structure, liquidity and confirmation, and always use a stop loss.'],
    ],
  },
  liquidity: {
    path: '/learn/liquidity-in-trading/',
    title: 'Liquidity in trading: buy-side, sell-side and liquidity sweeps',
    metaTitle: 'Liquidity in SMC: Buy-Side, Sell-Side & Liquidity Sweeps | Winvest Capital',
    description:
      'What does liquidity mean in Smart Money Concepts? Learn where buy-side and sell-side liquidity sits, what a liquidity sweep or stop hunt is, and how to avoid being the liquidity.',
    intro:
      'In Smart Money Concepts, liquidity refers to places on the chart where many orders are waiting, mostly stop losses and pending entry orders. Large participants need those orders to fill big positions, so price is often drawn towards them before it makes its real move.',
    sections: [
      {
        h: 'Buy-side and sell-side liquidity',
        ul: [
          'Buy-side liquidity sits above highs: stop losses of short sellers and buy-stop orders of breakout traders. When triggered, these become buy orders.',
          'Sell-side liquidity sits below lows: stop losses of buyers and sell-stop orders of breakout traders. When triggered, these become sell orders.',
        ],
      },
      {
        h: 'Where liquidity builds up',
        ul: [
          'Equal highs and equal lows (double tops and bottoms), which many traders see as strong levels.',
          'Previous day, week and month highs and lows.',
          'Trendlines that have been touched several times.',
          'Obvious support and resistance and the edges of a trading range.',
          'Session highs and lows, such as the Asian session range before London opens.',
        ],
      },
      {
        h: 'Liquidity sweeps and stop hunts',
        p: [
          'A liquidity sweep happens when price briefly trades beyond a high or low, triggers the orders resting there, and then reverses. On the chart this often looks like a long wick through the level. Retail traders call it a stop hunt; in SMC it is seen as large participants using that liquidity to fill orders in the opposite direction.',
          'A sweep on its own is not a signal. It becomes meaningful when it is followed by a shift in structure, such as a Change of Character, in the opposite direction.',
        ],
      },
      {
        h: 'Inducement',
        p: [
          'Inducement is a smaller pool of liquidity, often a minor swing just before a point of interest, that tempts traders to enter early. Price frequently takes this inducement first and only then reaches the order block or fair value gap that SMC traders are waiting for.',
        ],
      },
      {
        h: 'How to use liquidity in your trading',
        ul: [
          'Avoid placing your stop loss exactly at obvious equal highs or lows; give it room beyond the level.',
          'Use liquidity pools as targets: if you are long, the next buy-side liquidity is a logical take-profit area.',
          'Wait for a sweep plus a structure shift before entering a reversal trade, instead of trying to catch the exact top or bottom.',
        ],
      },
    ],
    faq: [
      ['What is a liquidity grab?', 'Another name for a liquidity sweep: price moves just past a high or low to trigger resting orders and then reverses.'],
      ['Why do my stop losses keep getting hit before price moves my way?', 'They are probably placed where many others place theirs, at obvious highs and lows. Placing stops beyond these liquidity pools, and sizing positions accordingly, can help.'],
      ['Is liquidity the same as volume?', 'Not in the SMC sense. Volume measures how much was traded; SMC liquidity refers to resting orders at specific price levels.'],
    ],
  },
  fvg: {
    path: '/learn/fair-value-gaps/',
    title: 'Fair value gaps (FVG): what they are and how to trade them',
    metaTitle: 'Fair Value Gap (FVG) Explained: Imbalances in SMC | Winvest Capital',
    description:
      'A fair value gap (FVG) is a three-candle price imbalance. Learn how to identify bullish and bearish FVGs, why price often revisits them, and how SMC traders use them as entry zones.',
    intro:
      'A fair value gap, or FVG, is an area on the chart where price moved so quickly in one direction that trading on the other side was barely possible. These imbalances often act as magnets: price frequently returns to fill part or all of the gap before continuing.',
    sections: [
      {
        h: 'How to identify a fair value gap',
        p: ['An FVG is formed by three consecutive candles:'],
        ul: [
          'Bullish FVG: the low of candle 3 is above the high of candle 1. The gap between them is the FVG, created by a large bullish candle 2.',
          'Bearish FVG: the high of candle 3 is below the low of candle 1. The gap between them is the FVG, created by a large bearish candle 2.',
        ],
      },
      {
        h: 'Why price returns to an FVG',
        p: [
          'During the fast move, orders were filled mostly on one side, so the price range inside the gap was traded inefficiently. Markets tend to rebalance, so price often comes back to that range. When it does, the gap can act as support (bullish FVG) or resistance (bearish FVG).',
        ],
      },
      {
        h: 'Trading fair value gaps',
        ul: [
          'Trade FVGs in the direction of the trend: bullish gaps in an uptrend, bearish gaps in a downtrend.',
          'The strongest FVGs appear in the move that breaks structure, often right after an order block.',
          'Many traders use the midpoint of the gap (the 50% level, sometimes called consequent encroachment) as their entry.',
          'Place the stop loss beyond the gap or beyond the related order block or swing point.',
        ],
      },
      {
        h: 'Filled, partially filled and inverted gaps',
        p: [
          'A gap is filled when price trades through the entire range. A partial fill is when price only reaches part of the gap before reversing. If price closes through an FVG and then uses it as a level from the other side, the gap is said to be inverted (an inversion FVG). Like order blocks, gaps can fail, so they work best combined with structure and liquidity.',
        ],
      },
      {
        h: 'FVG versus a regular price gap',
        p: [
          'A regular gap, common in stocks, appears when the market opens at a different price than it closed, leaving empty space between two candles. A fair value gap can form during continuous trading and is defined by the three-candle pattern above, so it also appears in 24/7 markets such as crypto and in forex.',
        ],
      },
    ],
    faq: [
      ['Is a fair value gap the same as an imbalance?', 'Yes, in SMC the terms are used interchangeably for the three-candle inefficiency described above.'],
      ['Does every FVG get filled?', 'No. Many are only partially filled and some are never revisited, especially in strong trends.'],
      ['Which timeframe works best for FVGs?', 'FVGs appear on every timeframe. Higher-timeframe gaps are more significant; lower-timeframe gaps are often used to fine-tune entries.'],
    ],
  },
  premium: {
    path: '/learn/premium-discount-ote/',
    title: 'Premium and discount zones and the optimal trade entry (OTE)',
    metaTitle: 'Premium vs Discount & Optimal Trade Entry (OTE) | Winvest Capital',
    description:
      'Learn how SMC traders use premium and discount zones and the Fibonacci-based optimal trade entry (OTE) to buy low and sell high within a trading range.',
    intro:
      'Premium and discount is a simple idea with a big impact: within any price range, buy in the lower half and sell in the upper half. Combined with the Fibonacci-based optimal trade entry, it helps SMC traders avoid chasing price.',
    sections: [
      {
        h: 'How to draw the range',
        p: [
          'Take a clear swing range, usually the latest impulse leg on your main timeframe: from a swing low to a swing high in an uptrend, or from a swing high to a swing low in a downtrend. Draw a Fibonacci retracement over it and mark the 50% level, the equilibrium.',
        ],
        ul: [
          'Premium: the part of the range above 50%. Prices here are relatively expensive, which favours selling.',
          'Discount: the part of the range below 50%. Prices here are relatively cheap, which favours buying.',
        ],
      },
      {
        h: 'Combining it with your bias',
        p: [
          'In a bullish market, SMC traders look for longs in discount, for example at a bullish order block or fair value gap that sits below 50% of the range. In a bearish market, they look for shorts in premium. Buying in premium or selling in discount usually means a worse risk-to-reward ratio.',
        ],
      },
      {
        h: 'The optimal trade entry (OTE)',
        p: [
          'The optimal trade entry is a zone deeper in the retracement, commonly between the 62% and 79% Fibonacci levels, with 70.5% often used as a reference. An entry there gives a tight stop loss beyond the swing point and a large potential reward if the trend continues.',
        ],
      },
      {
        h: 'Example',
        p: [
          'Say price rallies from 100 to 120 and breaks structure. The equilibrium is 110, so everything below 110 is discount. The OTE zone (62% to 79% retracement) lies roughly between 107.6 and 104.2. A trader with a bullish bias waits for price to pull back into that zone, ideally into an order block or FVG, and looks for confirmation before buying, with a stop loss below 100.',
        ],
      },
      {
        h: 'Limitations',
        ul: [
          'In very strong trends, price may never retrace into discount or the OTE zone.',
          'The result depends on which swing points you choose, so be consistent.',
          'Premium and discount is context, not an entry signal on its own.',
        ],
      },
    ],
    faq: [
      ['What is equilibrium in trading?', 'The 50% level of a price range. Above it is premium, below it is discount.'],
      ['Which Fibonacci levels are used for the OTE?', 'Most traders use the zone between the 62% and 79% retracement, with 70.5% as a reference level.'],
      ['Can I use premium and discount on any market?', 'Yes. It works on any chart with clear swing points, including stocks, crypto and FX.'],
    ],
  },
  risk: {
    path: '/learn/risk-management-lot-size/',
    title: 'Risk management and lot size: how to calculate your position size',
    metaTitle: 'How to Calculate Lot Size & Position Size (Forex, Crypto) | Winvest Capital',
    description:
      'Step-by-step guide to risk management: the 1% rule, risk-to-reward ratio and how to calculate lot size in forex and position size in stocks and crypto, with worked examples.',
    intro:
      'Good analysis is useless without good risk management. The most important decision on every trade is not where you enter, but how much you risk if you are wrong. Position sizing turns that decision into a concrete number.',
    sections: [
      {
        h: 'Step 1: decide your risk per trade',
        p: [
          'Many traders risk a fixed percentage of their account per trade, often between 0.5% and 2%. With an account of €10,000 and 1% risk, you accept a maximum loss of €100 per trade. Risking a small percentage means a losing streak does limited damage: ten losses in a row at 1% still leaves about 90% of the account.',
        ],
      },
      {
        h: 'Step 2: set your stop loss from the chart',
        p: [
          'Place the stop loss where your trade idea is invalid, for example beyond the order block or the swept low, not at an arbitrary distance. The distance between entry and stop loss, combined with your risk amount, determines your position size.',
        ],
      },
      {
        h: 'Step 3: calculate the position size',
        p: ['The general formula is: position size = risk amount ÷ (stop loss distance × value per unit of movement).'],
        ul: [
          'Stocks and crypto: position size = risk amount ÷ (entry price − stop price). Example: €100 risk, buy Bitcoin at 60,000 with a stop at 59,000. Size = 100 ÷ 1,000 = 0.1 BTC (ignoring fees and currency conversion).',
          'Forex: lot size = risk amount ÷ (stop loss in pips × pip value per standard lot). For EUR/USD one standard lot (100,000 units) is worth $10 per pip. Example: $100 risk and a 20-pip stop. Lot size = 100 ÷ (20 × 10) = 0.5 lots.',
          'Remember that pip values differ per pair and depend on your account currency. Gold and indices use their own contract sizes, so check your broker’s specifications.',
        ],
      },
      {
        h: 'Step 4: check the risk-to-reward ratio',
        p: [
          'Compare the distance to your target with the distance to your stop. With a stop of 20 pips and a target of 60 pips, the risk-to-reward ratio is 1:3. At 1:3 you only need to be right one time in four to roughly break even before costs. Many SMC traders aim for at least 1:2.',
        ],
      },
      {
        h: 'Common risk management mistakes',
        ul: [
          'Moving the stop loss further away when price goes against you.',
          'Increasing size after a loss to “win it back”.',
          'Using high leverage without calculating the actual amount at risk.',
          'Opening several correlated trades at once, such as multiple USD pairs, which multiplies the real risk.',
        ],
      },
      {
        h: 'Use a calculator',
        p: [
          'Doing the maths by hand before every trade is error-prone. One Percent Club members get the lot size calculator in Market Whisper AI, which works out the position size from your account, risk percentage and stop loss.',
        ],
      },
    ],
    faq: [
      ['What is the 1% rule in trading?', 'Risking no more than 1% of your account on a single trade, so one loss never does serious damage.'],
      ['How much is one pip worth?', 'For pairs quoted in USD, such as EUR/USD, one standard lot is worth $10 per pip, a mini lot $1 and a micro lot $0.10. Other pairs differ.'],
      ['What is a good risk-to-reward ratio?', 'Many traders aim for at least 1:2, meaning the potential profit is at least twice the potential loss.'],
    ],
  },
}
