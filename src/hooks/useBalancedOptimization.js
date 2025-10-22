import { useCallback } from 'react';

export const useBalancedOptimization = (
  cachedData,
  optimizationObjective,
  maxDrawdownTarget,
  minWinRateTarget,
  getFilteredTrades
) => {
  const performBalancedOptimization = useCallback(() => {
    if (!cachedData || !cachedData.completeTrades) return;

    try {
      const trades = getFilteredTrades(cachedData.completeTrades);
      const configurations = [];

      // Generate optimization scenarios with different parameter combinations
      const stopLossRange = [0.5, 1, 1.5, 2, 2.5, 3];
      const takeProfitRange = [1, 2, 3, 4, 5, 6, 8, 10];
      const tradeFilterRange = [30, 40, 50, 60]; // minimum win rate filter %

      stopLossRange.forEach(sl => {
        takeProfitRange.forEach(tp => {
          tradeFilterRange.forEach(minWinRate => {
            let totalPnL = 0;
            let wins = 0;
            let losses = 0;
            let maxDD = 0;
            let runningBalance = 0;
            let peak = 0;

            // Apply configuration to historical trades
            trades.forEach(trade => {
              const pnl = parseFloat(trade.pnl) || 0;
              const entryPrice = parseFloat(trade.entryPrice) || 0;
              let adjustedPnL = pnl;

              if (entryPrice > 0) {
                const takeProfitPrice = entryPrice * (1 + tp / 100);
                const stopLossPrice = entryPrice * (1 - sl / 100);
                const exitPrice = entryPrice + pnl;

                // Apply stop-loss and take-profit limits
                if (exitPrice > takeProfitPrice) {
                  adjustedPnL = takeProfitPrice - entryPrice;
                } else if (exitPrice < stopLossPrice) {
                  adjustedPnL = stopLossPrice - entryPrice;
                }
              }

              totalPnL += adjustedPnL;
              runningBalance += adjustedPnL;

              if (adjustedPnL > 0) wins++;
              else losses++;

              // Track maximum drawdown
              peak = Math.max(peak, runningBalance);
              const dd = peak - runningBalance;
              maxDD = Math.max(maxDD, dd);
            });

            const totalTrades = wins + losses;
            const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
            const profitFactor = losses > 0 ? wins / losses : (wins > 0 ? Infinity : 0);
            const sharpeRatio = totalTrades > 0 ? (totalPnL / totalTrades) / (Math.abs(maxDD) || 1) : 0;
            const returnOnDD = maxDD > 0 ? totalPnL / maxDD : (totalPnL > 0 ? Infinity : 0);

            configurations.push({
              stopLoss: sl,
              takeProfit: tp,
              minWinRate,
              totalPnL: Math.round(totalPnL),
              winRate: Math.round(winRate * 100) / 100,
              profitFactor: Math.round(profitFactor * 100) / 100,
              maxDrawdown: Math.round(maxDD),
              sharpeRatio: Math.round(sharpeRatio * 100) / 100,
              returnOnDD: Math.round(returnOnDD * 100) / 100,
              score: 0 // Will be calculated based on objective
            });
          });
        });
      });

      // Calculate scores based on optimization objective
      configurations.forEach(config => {
        if (optimizationObjective === 'sharpe') {
          // Maximize Sharpe Ratio
          config.score = config.sharpeRatio;
        } else if (optimizationObjective === 'profitfactor') {
          // Maximize Profit Factor while controlling drawdown
          config.score = config.profitFactor * (1 - (config.maxDrawdown / 100));
        } else if (optimizationObjective === 'riskadjusted') {
          // Maximize risk-adjusted returns (Return on DD)
          config.score = config.returnOnDD;
        }
      });

      // Filter configurations that meet minimum criteria
      const qualifyingConfigs = configurations.filter(
        config => config.maxDrawdown <= maxDrawdownTarget && config.winRate >= minWinRateTarget
      );

      // Sort by score
      qualifyingConfigs.sort((a, b) => b.score - a.score);

      // Get top 10 configurations
      const topConfigs = qualifyingConfigs.slice(0, 10);

      // Calculate diversification score (how different are top configs)
      const diversificationMetrics = {
        slRange: Math.max(...topConfigs.map(c => c.stopLoss)) - Math.min(...topConfigs.map(c => c.stopLoss)),
        tpRange: Math.max(...topConfigs.map(c => c.takeProfit)) - Math.min(...topConfigs.map(c => c.takeProfit)),
        avgScore: topConfigs.reduce((sum, c) => sum + c.score, 0) / topConfigs.length,
        qualifyingCount: qualifyingConfigs.length
      };

      return {
        configurations: topConfigs,
        bestConfig: topConfigs[0],
        allConfigurations: configurations,
        qualifyingConfigurations: qualifyingConfigs,
        diversificationMetrics,
        objective: optimizationObjective,
        constraints: {
          maxDrawdown: maxDrawdownTarget,
          minWinRate: minWinRateTarget
        }
      };
    } catch (err) {
      throw err;
    }
  }, [cachedData, optimizationObjective, maxDrawdownTarget, minWinRateTarget, getFilteredTrades]);

  return { performBalancedOptimization };
};
