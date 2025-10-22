import { useCallback } from 'react';

export const useSegmentationAnalysis = (
  cachedData,
  results,
  segmentationType,
  getFilteredTrades
) => {
  const performSegmentationAnalysis = useCallback(() => {
    if (!cachedData || !cachedData.completeTrades) return;

    const trades = getFilteredTrades(cachedData.completeTrades);
    let segments = {};

    switch (segmentationType) {
      case 'day':
        // Segment by day of week
        trades.forEach(trade => {
          const date = new Date(trade.entryTime);
          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
          if (!segments[dayName]) segments[dayName] = [];
          segments[dayName].push(trade);
        });
        break;

      case 'hour':
        // Segment by hour of day
        trades.forEach(trade => {
          const date = new Date(trade.entryTime);
          const hour = `${date.getHours().toString().padStart(2, '0')}:00`;
          if (!segments[hour]) segments[hour] = [];
          segments[hour].push(trade);
        });
        break;

      case 'symbol':
        // Segment by trading symbol (if available in filename)
        const symbol = results?.fileInfo?.symbol || 'Unknown';
        segments[symbol] = trades;
        break;

      case 'direction':
        // Segment by trade direction (profit/loss)
        trades.forEach(trade => {
          const direction = trade.pnl > 0 ? 'Winning Trades' : trade.pnl < 0 ? 'Losing Trades' : 'Breakeven';
          if (!segments[direction]) segments[direction] = [];
          segments[direction].push(trade);
        });
        break;

      case 'duration':
        // Segment by trade duration
        trades.forEach(trade => {
          const start = new Date(trade.entryTime).getTime();
          const end = new Date(trade.exitTime).getTime();
          const durationMinutes = (end - start) / (1000 * 60);

          let durationBucket;
          if (durationMinutes < 5) durationBucket = '< 5 min';
          else if (durationMinutes < 15) durationBucket = '5-15 min';
          else if (durationMinutes < 60) durationBucket = '15-60 min';
          else if (durationMinutes < 240) durationBucket = '1-4 hours';
          else durationBucket = '> 4 hours';

          if (!segments[durationBucket]) segments[durationBucket] = [];
          segments[durationBucket].push(trade);
        });
        break;

      default:
        break;
    }

    // Calculate metrics for each segment
    const segmentAnalysis = Object.entries(segments).map(([segmentName, segmentTrades]) => {
      const totalPnL = segmentTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
      const winCount = segmentTrades.filter(t => (parseFloat(t.pnl) || 0) > 0).length;
      const lossCount = segmentTrades.filter(t => (parseFloat(t.pnl) || 0) < 0).length;
      const winRate = segmentTrades.length > 0 ? (winCount / segmentTrades.length) * 100 : 0;

      const grossProfit = segmentTrades.filter(t => (parseFloat(t.pnl) || 0) > 0).reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
      const grossLoss = Math.abs(segmentTrades.filter(t => (parseFloat(t.pnl) || 0) < 0).reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0));
      const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 1 : 0);

      const avgPnL = segmentTrades.length > 0 ? totalPnL / segmentTrades.length : 0;

      return {
        name: segmentName,
        totalTrades: segmentTrades.length,
        winTrades: winCount,
        lossTrades: lossCount,
        totalPnL: Math.round(totalPnL),
        avgPnL: Math.round(avgPnL * 100) / 100,
        winRate: Math.round(winRate * 100) / 100,
        profitFactor: Math.round(profitFactor * 100) / 100,
        trades: segmentTrades
      };
    });

    // Sort by profit factor
    segmentAnalysis.sort((a, b) => b.profitFactor - a.profitFactor);

    return {
      segmentationType,
      segments: segmentAnalysis,
      totalSegments: segmentAnalysis.length
    };
  }, [cachedData, results, segmentationType, getFilteredTrades]);

  return { performSegmentationAnalysis };
};
