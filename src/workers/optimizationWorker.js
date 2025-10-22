self.onmessage = (event) => {
  const { trades, stopLossValues, takeProfitValues } = event.data;

  const results = [];

  stopLossValues.forEach(sl => {
    takeProfitValues.forEach(tp => {
      let totalPnL = 0;
      let wins = 0;
      let losses = 0;
      let winPnL = 0;
      let lossPnL = 0;
      const intervals = [5, 15, 30, 60];
      const timeSlotsByInterval = {};
      intervals.forEach(interval => {
        timeSlotsByInterval[interval] = {};
      });

      trades.forEach(trade => {
        const pnl = parseFloat(trade.pnl) || 0;
        const entryPrice = parseFloat(trade.entryPrice) || 0;
        let adjustedPnl = pnl;

        if (entryPrice > 0) {
          const takeProfitPrice = entryPrice * (1 + tp / 100);
          const stopLossPrice = entryPrice * (1 - sl / 100);
          const exitPrice = entryPrice + pnl;

          if (exitPrice > takeProfitPrice) {
            adjustedPnl = takeProfitPrice - entryPrice;
          } else if (exitPrice < stopLossPrice) {
            adjustedPnl = stopLossPrice - entryPrice;
          }
        }
        
        totalPnL += adjustedPnl;
        if (adjustedPnl > 0) {
          wins++;
          winPnL += adjustedPnl;
        } else {
          losses++;
          lossPnL += adjustedPnl;
        }

        intervals.forEach(interval => {
          const date = new Date(trade.entryTime);
          const hour = date.getHours();
          const minute = date.getMinutes();
          const slotStartMinute = Math.floor(minute / interval) * interval;
          const slotStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hour, slotStartMinute);
          const slotEnd = new Date(slotStart.getTime() + interval * 60000);
          
          const timeFormat = { hour: '2-digit', minute: '2-digit', hour12: false };
          const timeSlot = `${slotStart.toLocaleTimeString([], timeFormat)} - ${slotEnd.toLocaleTimeString([], timeFormat)}`;

          if (!timeSlotsByInterval[interval][timeSlot]) {
            timeSlotsByInterval[interval][timeSlot] = {
              trades: 0,
              pnl: 0,
              wins: 0,
            };
          }
          timeSlotsByInterval[interval][timeSlot].trades++;
          timeSlotsByInterval[interval][timeSlot].pnl += adjustedPnl;
          if (adjustedPnl > 0) {
            timeSlotsByInterval[interval][timeSlot].wins++;
          }
        });
      });

      const totalTrades = wins + losses;
      const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
      const profitFactor = lossPnL !== 0 ? winPnL / Math.abs(lossPnL) : (winPnL > 0 ? 1 : 0);

      const processedTimeSlots = {};
      intervals.forEach(interval => {
        processedTimeSlots[interval] = Object.entries(timeSlotsByInterval[interval]).map(([timeSlot, data]) => ({
          timeSlot,
          ...data,
          winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
        })).sort((a, b) => b.pnl - a.pnl);
      });

      results.push({
        stopLoss: sl,
        takeProfit: tp,
        totalPnL: Math.round(totalPnL),
        totalTrades,
        wins,
        losses,
        winRate: Math.round(winRate * 100) / 100,
        profitFactor: Math.round(profitFactor * 100) / 100,
        timeSlots: processedTimeSlots,
      });
    });
  });

  results.sort((a, b) => b.profitFactor - a.profitFactor);

  self.postMessage(results);
};
