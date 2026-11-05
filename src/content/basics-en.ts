import type { ArticleContent } from './articles'

export const basicsEn: Record<string, ArticleContent> = {
  candles: {
    path: '/learn/candlestick-anatomy/',
    title: 'Candlestick anatomy: how to read a candlestick chart',
    metaTitle: 'Candlestick Anatomy: How to Read Candlestick Charts | Winvest Capital',
    description:
      'Learn to read candlestick charts: open, high, low and close, the body and the wicks, bullish and bearish candles, timeframes and what a candle’s shape tells you about buyers and sellers.',
    intro:
      'Almost every chart you will see in trading is a candlestick chart. Each candle summarises what price did during one period: where it started, how far it travelled up and down, and where it ended. Once you can read a single candle, you can read the story of a whole chart. This is the first lesson because every later concept, from market structure to fair value gaps, is described in candles.',
    sections: [
      {
        h: 'The four prices in every candle (OHLC)',
        p: ['A candle is built from four prices for the period it covers:'],
        ul: [
          'Open: the first traded price of the period.',
          'High: the highest price reached during the period.',
          'Low: the lowest price reached during the period.',
          'Close: the last price of the period. The close is the most important of the four, because it shows who was in control when the period ended.',
        ],
      },
      {
        h: 'Body and wicks',
        p: [
          'The body is the thick part of the candle, between the open and the close. The wicks (also called shadows) are the thin lines above and below the body. The upper wick runs from the body up to the high, the lower wick from the body down to the low.',
          'A long body means price moved decisively in one direction and stayed there. A long wick means price went somewhere during the period but could not stay: it was pushed back before the close. That is why traders often describe a long wick as a rejection of that price area.',
        ],
      },
      {
        h: 'Bullish and bearish candles',
        p: [
          'If the close is higher than the open, the candle is bullish: buyers won the period. If the close is lower than the open, the candle is bearish: sellers won. Most platforms colour bullish candles green or white and bearish candles red or black, but colours can be changed, so always read the open and close rather than relying on colour alone.',
        ],
      },
      {
        h: 'What the shape of a candle tells you',
        ul: [
          'Large body, small wicks: strong, one-sided pressure. A series of these in one direction is called displacement and is a key ingredient in later lessons.',
          'Small body, long wicks on both sides (a doji or spinning top): indecision. Buyers and sellers were roughly balanced.',
          'Long lower wick, close near the high: sellers pushed price down but buyers took it back. Often seen when price sweeps a low.',
          'Long upper wick, close near the low: buyers pushed price up but sellers took it back. Often seen when price sweeps a high.',
        ],
      },
      {
        h: 'Timeframes: one market, many candles',
        p: [
          'Every candle represents a fixed period: one minute, fifteen minutes, one hour, four hours, one day, one week. The same price movement looks different on each timeframe. A strong daily candle may consist of dozens of small up-and-down candles on the 15-minute chart.',
          'Higher timeframes show the bigger picture and carry more weight; lower timeframes show the detail and are used to time entries. Combining both is called multi-timeframe analysis, which you will use throughout the Smart Money Concepts lessons.',
        ],
      },
      {
        h: 'Why the close matters: wait for the candle to finish',
        p: [
          'Until a candle closes, it is still forming. A candle that looks like a strong breakout halfway through the hour can end as a long wick that closes back inside the range. Many rules in technical analysis, such as a Break of Structure, therefore require a candle close beyond a level rather than just a wick through it.',
        ],
      },
    ],
    faq: [
      ['What do the wicks on a candle mean?', 'The wicks show the highest and lowest price reached during the period. A long wick means price reached that level but was pushed back before the candle closed.'],
      ['Which timeframe should a beginner use?', 'Start by reading the daily and 4-hour charts to understand the bigger picture. Lower timeframes move faster and contain more noise.'],
      ['Are candle patterns enough to trade on?', 'No. A single candle tells you who won one period. It becomes useful in context: where it formed, in which trend and at which level.'],
    ],
  },
  orders: {
    path: '/learn/order-types/',
    title: 'Order types explained: market, limit, stop, stop loss and take profit',
    metaTitle: 'Order Types Explained: Market, Limit, Stop Orders | Winvest Capital',
    description:
      'The order types every trader needs: market, limit, stop and stop-limit orders, stop loss, take profit and trailing stop, plus bid, ask, spread and slippage, explained with examples.',
    intro:
      'Reading a chart is one thing, getting into and out of a trade is another. The order type you choose decides at what price you can be filled and whether you are filled at all. This lesson covers the orders you will use on every platform, and the costs and risks that come with them.',
    sections: [
      {
        h: 'Bid, ask and spread',
        p: [
          'Every market has two prices at any moment. The bid is the highest price a buyer is willing to pay; the ask is the lowest price a seller is willing to accept. You buy at the ask and sell at the bid. The difference between them is the spread, a cost you pay on every trade.',
          'Spreads are tight in liquid markets such as EUR/USD or Bitcoin and wider in quieter markets, outside main trading hours and around major news.',
        ],
      },
      {
        h: 'Market order: fill now',
        p: [
          'A market order buys or sells immediately at the best available price. You are almost always filled, but you do not control the exact price. In fast markets the fill can be worse than the price you saw on screen. That difference is called slippage.',
        ],
      },
      {
        h: 'Limit order: a better price, or no fill',
        p: [
          'A limit order is placed at a price that is better than the current one: a buy limit below the current price, a sell limit above it. It is only filled at your price or better. The trade-off is that price may never reach your level, in which case you are not filled.',
          'Traders who wait for price to return to a zone, such as an order block or fair value gap in later lessons, usually enter with limit orders.',
        ],
      },
      {
        h: 'Stop order: enter when price breaks a level',
        p: [
          'A stop order (also called a stop entry) is placed at a price that is worse than the current one: a buy stop above the current price, a sell stop below it. When price reaches the level, the order becomes a market order. Breakout traders use stop orders to enter only when price confirms a move.',
          'A stop-limit order works the same way, but becomes a limit order instead of a market order when triggered. It protects you against a bad fill, but may not be filled at all if price jumps past your limit.',
        ],
      },
      {
        h: 'Stop loss and take profit: planning the exit',
        ul: [
          'Stop loss: a stop order that closes your position at a loss if price reaches the level where your idea is wrong. It is your most important order. Without it, a single trade can do serious damage.',
          'Take profit: a limit order that closes your position at your target.',
          'Trailing stop: a stop loss that moves along with price by a fixed distance as the trade goes in your favour, locking in part of the profit. It never moves backwards.',
        ],
      },
      {
        h: 'Gaps and slippage: when orders are not filled at your price',
        p: [
          'A stop loss is filled as a market order, so it is not a guaranteed price. If the market gaps, for example over a weekend or on a surprise news release, your stop can be filled well beyond its level. Some brokers offer guaranteed stops for a fee. This is one reason to keep risk per trade small and to be careful holding positions into major news.',
        ],
      },
    ],
    faq: [
      ['What is the difference between a limit and a stop order?', 'A limit order waits for a better price than the current one (buy lower, sell higher). A stop order triggers at a worse price than the current one (buy higher, sell lower) and then fills as a market order.'],
      ['Why was my order filled at a different price?', 'Market orders and triggered stop orders fill at the best available price. In fast markets or gaps that can differ from the price on screen: this is slippage.'],
      ['Should every trade have a stop loss?', 'Yes. Decide where your idea is invalid before you enter and place the stop loss there. The next lessons show how the stop distance determines your position size.'],
    ],
  },
  lots: {
    path: '/learn/lots-pips-pip-value/',
    title: 'Lots, pips and pip value in forex: what they are and how to calculate them',
    metaTitle: 'Lots, Pips and Pip Value Explained (Forex) | Winvest Capital',
    description:
      'What a pip is, what standard, mini and micro lots are, and how to calculate pip value for any currency pair, including JPY pairs and conversion to your account currency.',
    intro:
      'In forex, position sizes are measured in lots and price movements in pips. Together they decide how much money one pip of movement is worth to you. This lesson gives you the units and the arithmetic; the risk management lesson later uses them to calculate the right position size for every trade.',
    sections: [
      {
        h: 'What is a pip?',
        p: [
          'A pip is the standard unit of price movement for a currency pair. For most pairs it is the fourth decimal place: 0.0001. If EUR/USD moves from 1.1000 to 1.1025, it has moved 25 pips. For pairs with the Japanese yen, the pip is the second decimal place: 0.01. USD/JPY moving from 150.00 to 150.40 is 40 pips.',
          'Most brokers quote one extra decimal, the fractional pip or pipette. 1.10253 means 1.1025 plus 3 tenths of a pip. Make sure you count pips and not pipettes: ten pipettes are one pip.',
        ],
      },
      {
        h: 'What is a lot?',
        p: ['A lot is a standard quantity of the base currency, the first currency in the pair.'],
        ul: [
          'Standard lot: 100,000 units (1.00 lot).',
          'Mini lot: 10,000 units (0.10 lot).',
          'Micro lot: 1,000 units (0.01 lot), the smallest size at most brokers.',
        ],
      },
      {
        h: 'How to calculate pip value',
        p: [
          'Pip value = pip size × number of units. The result is in the quote currency, the second currency in the pair.',
          'EUR/USD, 1 standard lot: 0.0001 × 100,000 = $10 per pip. A mini lot is $1 per pip, a micro lot $0.10.',
          'USD/JPY, 1 standard lot: 0.01 × 100,000 = ¥1,000 per pip. At a rate of 150.00 that is 1,000 ÷ 150 ≈ $6.67 per pip.',
        ],
      },
      {
        h: 'Converting to your account currency',
        p: [
          'If your account is in euros, a pip value in dollars or yen has to be converted at the current exchange rate. Example: $10 per pip with EUR/USD at 1.10 is 10 ÷ 1.10 ≈ €9.09 per pip. Because exchange rates move, pip values for the same pair change slightly over time. Your platform does this conversion for you; the lot size calculator on this website does it as well.',
        ],
      },
      {
        h: 'Gold, indices and crypto',
        p: [
          'Not every instrument uses the forex lot. Gold (XAU/USD), indices and CFDs on crypto have their own contract sizes, which differ per broker. One lot of gold is often 100 ounces, but not everywhere. Always check the contract specifications on your platform before you trade a new instrument.',
        ],
      },
    ],
    faq: [
      ['How many units is 0.01 lot?', '1,000 units of the base currency. 0.10 lot is 10,000 units and 1.00 lot is 100,000 units.'],
      ['Why is a pip on JPY pairs 0.01?', 'Because the yen has a much lower value per unit, JPY pairs are quoted with two decimals instead of four, and the pip moves with it.'],
      ['What is the difference between a pip and a pipette?', 'A pipette is a tenth of a pip: the fifth decimal on most pairs and the third decimal on JPY pairs.'],
    ],
  },
  leverage: {
    path: '/learn/leverage/',
    title: 'Leverage in trading: what it is and why it does not change your risk per trade',
    metaTitle: 'Leverage in Trading Explained (Forex, CFDs, Crypto) | Winvest Capital',
    description:
      'What leverage is, how it lets you control a large position with a small deposit, the EU leverage limits for retail traders and why your stop loss and position size, not leverage, determine your risk.',
    intro:
      'Leverage lets you open a position that is larger than the money you put up for it. It is one of the most misunderstood parts of trading. Used without a plan it can wipe out an account quickly; understood properly, it is simply a tool that decides how much of your account is tied up in a trade.',
    sections: [
      {
        h: 'What leverage means',
        p: [
          'Leverage is the ratio between the size of your position and the deposit required to open it. With 1:30 leverage you can open a position worth €30,000 with €1,000 of your own money. The broker effectively lends you the rest for as long as the position is open.',
          'The full value of the position is called the notional value. One standard lot of EUR/USD (lesson 3) has a notional value of 100,000 euros, which is far more than most traders deposit. Leverage is what makes that position size possible.',
        ],
      },
      {
        h: 'Leverage multiplies gains and losses relative to your deposit',
        p: [
          'Profit and loss are calculated on the full position, not on the deposit. With €1,000 controlling a €30,000 position, a 1% move in price is €300: 30% of the money you put up. A 1% move against you costs the same €300. That is why high leverage combined with a large position can empty an account in a few trades.',
        ],
      },
      {
        h: 'What leverage does not do',
        p: [
          'Leverage does not decide how much you lose if your stop loss is hit. That is decided by your position size and the distance to your stop. One mini lot of EUR/USD with a 20-pip stop risks about $20, whether your broker offers 1:30 or 1:500. Higher leverage only means less of your money is tied up as a deposit.',
          'The danger lies in what leverage tempts you to do: open positions far larger than your risk plan allows. If you size every trade from your stop loss, as shown in the risk management lesson, leverage becomes a background setting.',
        ],
      },
      {
        h: 'Leverage limits for retail traders in the EU',
        p: [
          'In the EU and EEA, regulators limit the leverage that brokers may offer retail clients on CFDs, under rules introduced by ESMA in 2018:',
        ],
        ul: [
          '1:30 on major currency pairs.',
          '1:20 on other currency pairs, gold and major stock indices.',
          '1:10 on other commodities and other stock indices.',
          '1:5 on individual shares.',
          '1:2 on cryptocurrencies.',
          'Rules differ outside the EU and for professional clients, and crypto exchanges apply their own limits to futures. Always check what applies to your account.',
        ],
      },
      {
        h: 'Leverage on crypto exchanges',
        p: [
          'Spot trading on a crypto exchange uses no leverage: you buy the coin with your own money. Futures and perpetual contracts do use leverage, sometimes very high. There the main risk is liquidation: if the price moves against you far enough, the exchange closes your position automatically and the margin you put up is lost. The next lesson explains how that works.',
        ],
      },
    ],
    faq: [
      ['Is higher leverage riskier?', 'Not by itself. Your risk per trade comes from position size and stop distance. Higher leverage makes it easier to open positions that are too large, which is where the real danger lies.'],
      ['What leverage should a beginner use?', 'Size each trade from your stop loss and risk percentage first. With correct position sizing you will rarely need more than a fraction of the available leverage.'],
      ['Can I lose more than my deposit?', 'With EU-regulated retail CFD accounts, negative balance protection limits your loss to the money in your account. Elsewhere this protection may not apply.'],
    ],
  },
  margin: {
    path: '/learn/margin/',
    title: 'Margin explained: required margin, free margin, margin level and margin calls',
    metaTitle: 'Margin in Trading: Free Margin, Margin Level, Margin Call | Winvest Capital',
    description:
      'How margin works: required margin, equity, free margin, margin level, margin calls and stop outs, with a worked example and the 50% margin close-out rule for EU retail traders.',
    intro:
      'Margin is the other side of leverage. Leverage tells you how large a position you can open; margin is the part of your money that is set aside while the position is open. Knowing how margin is calculated helps you understand the numbers on your platform and avoid having positions closed for you.',
    sections: [
      {
        h: 'Required margin',
        p: [
          'Required margin = notional value ÷ leverage. Opening one mini lot of EUR/USD (10,000 euros) at 1:30 leverage requires 10,000 ÷ 30 ≈ €333 of margin. Another way to write this is as a percentage: 1:30 leverage means a margin requirement of 3.33%, 1:20 means 5% and 1:2 means 50%.',
          'The margin is not a fee. It is part of your own money that is locked while the position is open and released when you close it.',
        ],
      },
      {
        h: 'Balance, equity, used margin and free margin',
        ul: [
          'Balance: the money in your account, excluding the result of open positions.',
          'Equity: balance plus or minus the floating profit or loss of open positions. This is what your account is worth right now.',
          'Used margin: the total margin locked by all open positions.',
          'Free margin: equity minus used margin. This is what is available to open new positions or absorb losses.',
        ],
      },
      {
        h: 'Margin level',
        p: [
          'Margin level = equity ÷ used margin × 100%. It is the number your broker watches. As long as it is comfortably high, nothing happens. As losses grow, equity falls and so does the margin level.',
        ],
      },
      {
        h: 'Margin call and stop out',
        p: [
          'When the margin level falls to a certain threshold, the broker issues a margin call: a warning that you are running out of free margin. If it falls further to the stop-out level, the broker starts closing your positions, usually the largest loser first, to protect the account from going negative.',
          'For retail CFD clients in the EU, brokers must close positions once equity falls to 50% of the required margin. Many brokers set the margin call earlier, for example at 100%. On crypto exchanges the same mechanism is called liquidation.',
        ],
      },
      {
        h: 'A worked example',
        p: [
          'Account: €2,000. You buy 1 standard lot of EUR/USD (100,000 euros) at 1:30 leverage. Required margin: 100,000 ÷ 30 ≈ €3,333. That is more than your equity, so the platform will not open the trade.',
          'You open 0.30 lot instead. Required margin ≈ €1,000, free margin ≈ €1,000, margin level 200%. One pip is now worth about $3. After a loss of 100 pips (about €270 in this example), equity is ≈ €1,730 and the margin level ≈ 173%. A loss of roughly 550 pips (about €1,500) would bring the margin level to 50% and trigger the close-out.',
          'Notice that the 100-pip loss is far beyond a sensible stop loss for this position. With a stop loss placed from the chart and a position sized to risk 1% of the account, the stop is hit long before margin becomes a problem. That is the topic of the next lesson.',
        ],
      },
    ],
    faq: [
      ['Is margin a cost?', 'No. Margin is part of your own money that is locked while a position is open and returned when you close it. Costs are the spread, commission and overnight financing (swap).'],
      ['What is a good margin level?', 'There is no fixed number, but if your margin level gets close to your broker’s margin call level, your positions are too large for your account.'],
      ['What is the difference between isolated and cross margin?', 'On crypto exchanges, isolated margin limits the possible loss to the margin assigned to that one position. Cross margin uses your whole account balance as margin for all positions, so one losing trade can drain the rest.'],
    ],
  },
}
