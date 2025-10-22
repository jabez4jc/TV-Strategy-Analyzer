import { useCallback } from 'react';

export const useWeaknessDetection = (
  cachedData,
  weaknessThreshold,
  getFilteredTrades
) => {
  const performWeaknessDetection = useCallback(() => {
    if (!cachedData || !cachedData.completeTrades) return;

    const trades = getFilteredTrades(cachedData.completeTrades);
    const weaknesses = [];
    const averageMetrics = {};

    // Calculate average P&L
    const totalPnL = trades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
    const avgPnL = totalPnL / trades.length;
    const avgWinRate = (trades.filter(t => (parseFloat(t.pnl) || 0) > 0).length / trades.length) * 100;

    // Analyze time-based weaknesses
    const hourlyMetrics = {};
    trades.forEach(trade => {
      try {
        const hour = new Date(trade.entryTime).getHours();
        if (!hourlyMetrics[hour]) {
          hourlyMetrics[hour] = { trades: [], pnl: 0, wins: 0 };
        }
        hourlyMetrics[hour].trades.push(trade);
        hourlyMetrics[hour].pnl += parseFloat(trade.pnl) || 0;
        if ((parseFloat(trade.pnl) || 0) > 0) hourlyMetrics[hour].wins++;
      } catch { }
    });

    Object.entries(hourlyMetrics).forEach(([hour, data]) => {
      const hourAvgPnL = data.pnl / data.trades.length;
      const hourWinRate = (data.wins / data.trades.length) * 100;
      const pnlDeviation = ((avgPnL - hourAvgPnL) / Math.abs(avgPnL || 1)) * 100;

      if (pnlDeviation > weaknessThreshold) {
        weaknesses.push({
          type: 'Time Weakness',
          period: `${hour}:00 - ${(hour + 1) % 24}:00`,
          description: `Hour ${hour} underperforms by ${pnlDeviation.toFixed(1)}%`,
          avgPnL: Math.round(hourAvgPnL),
          winRate: hourWinRate.toFixed(1),
          expectedPnL: Math.round(avgPnL),
          lossAmount: Math.round(avgPnL - hourAvgPnL),
          tradeCount: data.trades.length,
          severity: pnlDeviation > 70 ? 'Critical' : pnlDeviation > 50 ? 'High' : 'Medium'
        });
      }
    });

    // Analyze direction-based weaknesses (long vs short if available)
    const directions = {};
    trades.forEach(trade => {
      const direction = trade.position?.toLowerCase() === 'short' ? 'Short' : 'Long';
      if (!directions[direction]) {
        directions[direction] = { trades: [], pnl: 0, wins: 0 };
      }
      directions[direction].trades.push(trade);
      directions[direction].pnl += parseFloat(trade.pnl) || 0;
      if ((parseFloat(trade.pnl) || 0) > 0) directions[direction].wins++;
    });

    Object.entries(directions).forEach(([dir, data]) => {
      if (data.trades.length < trades.length * 0.1) return; // Skip if less than 10% of trades

      const dirAvgPnL = data.pnl / data.trades.length;
      const dirWinRate = (data.wins / data.trades.length) * 100;
      const pnlDeviation = ((avgPnL - dirAvgPnL) / Math.abs(avgPnL || 1)) * 100;

      if (pnlDeviation > weaknessThreshold) {
        weaknesses.push({
          type: 'Direction Weakness',
          period: `${dir} Positions`,
          description: `${dir} trades underperform by ${pnlDeviation.toFixed(1)}%`,
          avgPnL: Math.round(dirAvgPnL),
          winRate: dirWinRate.toFixed(1),
          expectedPnL: Math.round(avgPnL),
          lossAmount: Math.round(avgPnL - dirAvgPnL),
          tradeCount: data.trades.length,
          severity: pnlDeviation > 70 ? 'Critical' : pnlDeviation > 50 ? 'High' : 'Medium'
        });
      }
    });

    // Sort by severity
    const severityOrder = { Critical: 0, High: 1, Medium: 2 };
    weaknesses.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return {
      weaknesses,
      totalWeaknesses: weaknesses.length,
      averageMetrics: { avgPnL: Math.round(avgPnL), avgWinRate: avgWinRate.toFixed(1) },
      threshold: weaknessThreshold
    };
  }, [cachedData, weaknessThreshold, getFilteredTrades]);

  return { performWeaknessDetection };
};
