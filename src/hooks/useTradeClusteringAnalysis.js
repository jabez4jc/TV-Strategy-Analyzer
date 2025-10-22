import { useCallback } from 'react';

export const useTradeClusteringAnalysis = (
  cachedData,
  clusteringType,
  getFilteredTrades
) => {
  const performTradeClusteringAnalysis = useCallback(() => {
    if (!cachedData || !cachedData.completeTrades) return;

    const trades = getFilteredTrades(cachedData.completeTrades);
    const clusters = {};
    let clusterMetrics = {};

    if (clusteringType === 'outcome') {
      // Cluster by winning vs losing trades
      const winners = trades.filter(t => (parseFloat(t.pnl) || 0) > 0);
      const losers = trades.filter(t => (parseFloat(t.pnl) || 0) <= 0);

      clusters['Winners'] = winners;
      clusters['Losers'] = losers;

      // Calculate metrics for each cluster
      ['Winners', 'Losers'].forEach(clusterName => {
        const clusterTrades = clusters[clusterName];
        const totalPnL = clusterTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
        const avgPnL = totalPnL / clusterTrades.length;
        const avgDuration = clusterTrades.length > 0 ?
          clusterTrades.reduce((sum, t) => {
            try {
              const entry = new Date(t.entryTime);
              const exit = new Date(t.exitTime);
              return sum + (exit - entry);
            } catch {
              return sum;
            }
          }, 0) / clusterTrades.length / 60000 : 0; // convert to minutes

        clusterMetrics[clusterName] = {
          count: clusterTrades.length,
          totalPnL: Math.round(totalPnL),
          avgPnL: Math.round(avgPnL),
          percentage: ((clusterTrades.length / trades.length) * 100).toFixed(1),
          avgDuration: avgDuration.toFixed(2),
          pnlRange: {
            min: Math.min(...clusterTrades.map(t => parseFloat(t.pnl) || 0)),
            max: Math.max(...clusterTrades.map(t => parseFloat(t.pnl) || 0))
          }
        };
      });
    } else if (clusteringType === 'entryPattern') {
      // Cluster by entry time patterns (morning, afternoon, evening)
      const morning = trades.filter(t => {
        try {
          const hour = new Date(t.entryTime).getHours();
          return hour >= 6 && hour < 12;
        } catch { return false; }
      });
      const afternoon = trades.filter(t => {
        try {
          const hour = new Date(t.entryTime).getHours();
          return hour >= 12 && hour < 18;
        } catch { return false; }
      });
      const evening = trades.filter(t => {
        try {
          const hour = new Date(t.entryTime).getHours();
          return hour >= 18 || hour < 6;
        } catch { return false; }
      });

      clusters['Morning (6AM-12PM)'] = morning;
      clusters['Afternoon (12PM-6PM)'] = afternoon;
      clusters['Evening (6PM-6AM)'] = evening;

      Object.keys(clusters).forEach(clusterName => {
        const clusterTrades = clusters[clusterName];
        if (clusterTrades.length === 0) return;

        const totalPnL = clusterTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
        const wins = clusterTrades.filter(t => (parseFloat(t.pnl) || 0) > 0).length;

        clusterMetrics[clusterName] = {
          count: clusterTrades.length,
          totalPnL: Math.round(totalPnL),
          avgPnL: Math.round(totalPnL / clusterTrades.length),
          winRate: ((wins / clusterTrades.length) * 100).toFixed(1),
          percentage: ((clusterTrades.length / trades.length) * 100).toFixed(1),
          bestTrade: Math.max(...clusterTrades.map(t => parseFloat(t.pnl) || 0)),
          worstTrade: Math.min(...clusterTrades.map(t => parseFloat(t.pnl) || 0))
        };
      });
    } else if (clusteringType === 'hourOfDay') {
      // Cluster by hour of day (0-23)
      const hourClusters = {};
      for (let hour = 0; hour < 24; hour++) {
        hourClusters[hour] = [];
      }

      trades.forEach(t => {
        try {
          const hour = new Date(t.entryTime).getHours();
          hourClusters[hour].push(t);
        } catch { }
      });

      Object.keys(hourClusters).forEach(hour => {
        const clusterTrades = hourClusters[hour];
        if (clusterTrades.length === 0) return;

        const hourLabel = `${hour.toString().padStart(2, '0')}:00`;
        clusters[hourLabel] = clusterTrades;

        const totalPnL = clusterTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
        const wins = clusterTrades.filter(t => (parseFloat(t.pnl) || 0) > 0).length;

        clusterMetrics[hourLabel] = {
          count: clusterTrades.length,
          totalPnL: Math.round(totalPnL),
          avgPnL: Math.round(totalPnL / clusterTrades.length),
          winRate: ((wins / clusterTrades.length) * 100).toFixed(1),
          percentage: ((clusterTrades.length / trades.length) * 100).toFixed(1),
          bestTrade: Math.max(...clusterTrades.map(t => parseFloat(t.pnl) || 0)),
          worstTrade: Math.min(...clusterTrades.map(t => parseFloat(t.pnl) || 0))
        };
      });
    } else if (clusteringType === 'dayOfWeek') {
      // Cluster by day of week
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayClusters = {};
      dayNames.forEach(day => { dayClusters[day] = []; });

      trades.forEach(t => {
        try {
          const dayIndex = new Date(t.entryTime).getDay();
          dayClusters[dayNames[dayIndex]].push(t);
        } catch { }
      });

      Object.keys(dayClusters).forEach(dayName => {
        const clusterTrades = dayClusters[dayName];
        if (clusterTrades.length === 0) return;

        clusters[dayName] = clusterTrades;

        const totalPnL = clusterTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
        const wins = clusterTrades.filter(t => (parseFloat(t.pnl) || 0) > 0).length;

        clusterMetrics[dayName] = {
          count: clusterTrades.length,
          totalPnL: Math.round(totalPnL),
          avgPnL: Math.round(totalPnL / clusterTrades.length),
          winRate: ((wins / clusterTrades.length) * 100).toFixed(1),
          percentage: ((clusterTrades.length / trades.length) * 100).toFixed(1),
          bestTrade: Math.max(...clusterTrades.map(t => parseFloat(t.pnl) || 0)),
          worstTrade: Math.min(...clusterTrades.map(t => parseFloat(t.pnl) || 0))
        };
      });
    } else if (clusteringType === 'month') {
      // Cluster by month
      const monthClusters = {};
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

      trades.forEach(t => {
        try {
          const date = new Date(t.entryTime);
          const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
          if (!monthClusters[monthKey]) {
            monthClusters[monthKey] = [];
          }
          monthClusters[monthKey].push(t);
        } catch { }
      });

      Object.keys(monthClusters).forEach(monthKey => {
        const clusterTrades = monthClusters[monthKey];
        if (clusterTrades.length === 0) return;

        clusters[monthKey] = clusterTrades;

        const totalPnL = clusterTrades.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
        const wins = clusterTrades.filter(t => (parseFloat(t.pnl) || 0) > 0).length;

        clusterMetrics[monthKey] = {
          count: clusterTrades.length,
          totalPnL: Math.round(totalPnL),
          avgPnL: Math.round(totalPnL / clusterTrades.length),
          winRate: ((wins / clusterTrades.length) * 100).toFixed(1),
          percentage: ((clusterTrades.length / trades.length) * 100).toFixed(1),
          bestTrade: Math.max(...clusterTrades.map(t => parseFloat(t.pnl) || 0)),
          worstTrade: Math.min(...clusterTrades.map(t => parseFloat(t.pnl) || 0))
        };
      });
    }

    // Build correlation data for visualization
    const correlationData = Object.entries(clusterMetrics).map(([name, metrics]) => ({
      name,
      ...metrics
    }));

    return {
      clusters,
      clusterMetrics,
      correlationData,
      type: clusteringType,
      totalTrades: trades.length
    };
  }, [cachedData, clusteringType, getFilteredTrades]);

  return { performTradeClusteringAnalysis };
};
