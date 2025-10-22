import { useCallback } from 'react';

export const useHeatmapAnalysis = (
  cachedData,
  heatmapResolution,
  heatmapMetric,
  getFilteredTrades
) => {
  const performEnhancedHeatmapAnalysis = useCallback(() => {
    if (!cachedData || !cachedData.completeTrades) return;

    const trades = getFilteredTrades(cachedData.completeTrades);
    const matrix = {};

    trades.forEach(trade => {
      try {
        const date = new Date(trade.entryTime);
        const day = date.getDay();
        const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day];

        let timeSlot;
        if (heatmapResolution === 1) {
          timeSlot = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
        } else {
          const minutes = Math.floor(date.getMinutes() / heatmapResolution) * heatmapResolution;
          timeSlot = `${date.getHours().toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        }

        const key = `${dayName}-${timeSlot}`;
        if (!matrix[key]) matrix[key] = [];
        matrix[key].push(trade);
      } catch (e) {
        // Skip invalid trades
      }
    });

    const heatmapData = Object.entries(matrix).map(([key, segmentTrades]) => {
      const totalPnL = segmentTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
      const winCount = segmentTrades.filter(t => (parseFloat(t.pnl) || 0) > 0).length;
      const winRate = (winCount / segmentTrades.length) * 100;

      return {
        period: key,
        pnl: Math.round(totalPnL),
        winrate: Math.round(winRate * 100) / 100,
        trades: segmentTrades.length,
        intensity: Math.abs(totalPnL)
      };
    });

    return {
      data: heatmapData,
      resolution: heatmapResolution,
      metric: heatmapMetric
    };
  }, [cachedData, heatmapResolution, heatmapMetric, getFilteredTrades]);

  return { performEnhancedHeatmapAnalysis };
};
