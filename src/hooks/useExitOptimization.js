import { useCallback } from 'react';

export const useExitOptimization = (
  cachedData,
  stopLossPercent,
  takeProfitPercent,
  optimizationMode,
  getFilteredTrades
) => {
  const performExitOptimization = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!cachedData || !cachedData.completeTrades) {
        return reject(new Error("No trade data available."));
      }

      const worker = new Worker(new URL('../workers/optimizationWorker.js', import.meta.url));

      worker.onmessage = (event) => {
        const results = event.data;
        resolve({
          configurations: results,
          bestConfig: results[0],
          currentConfig: { stopLoss: stopLossPercent, takeProfit: takeProfitPercent },
          isGridSearch: optimizationMode === 'auto'
        });
        worker.terminate();
      };

      worker.onerror = (error) => {
        reject(error);
        worker.terminate();
      };

      const trades = getFilteredTrades(cachedData.completeTrades);
      const stopLossValues = optimizationMode === 'auto'
        ? [0.5, 1, 1.5, 2, 2.5, 3, 4, 5]
        : [stopLossPercent];
      const takeProfitValues = optimizationMode === 'auto'
        ? [1, 2, 3, 4, 5, 6, 8, 10]
        : [takeProfitPercent];

      worker.postMessage({
        trades,
        stopLossValues,
        takeProfitValues,
      });
    });
  }, [cachedData, stopLossPercent, takeProfitPercent, optimizationMode, getFilteredTrades]);

  return { performExitOptimization };
};
