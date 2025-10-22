import { useCallback } from 'react';

export const useAnalysis = (
  intradayOnly,
  timeSlotInterval,
  analysisType
) => {
  const performAnalysis = useCallback((completeTrades, fileInfo, dateRange) => {
    try {
      let tradesForAnalysis = completeTrades;
      if (intradayOnly) {
        tradesForAnalysis = completeTrades.filter(trade => {
          const entryDate = new Date(trade.entryTime).toISOString().split('T')[0];
          const exitDate = new Date(trade.exitTime).toISOString().split('T')[0];
          return entryDate === exitDate;
        });

        if (tradesForAnalysis.length === 0) {
          throw new Error('No intraday trades found.');
        }
      }

      const getWeekKey = (dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        const year = date.getFullYear();
        const week = Math.ceil((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
        return `${year}-W${week.toString().padStart(2, '0')}`;
      };

      const getMonthKey = (dateStr) => {
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      };

      const getTimeSlot = (dateTimeStr, intervalMinutes) => {
        if (!dateTimeStr || typeof dateTimeStr !== 'string') {
          return null;
        }
        
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) {
          // Fallback for different date formats
          const parts = dateTimeStr.split(' ');
          if (parts.length >= 2) {
            const timePart = parts[1];
            const timeComponents = timePart.split(':');
            if (timeComponents.length >= 2) {
              const hours = parseInt(timeComponents[0]);
              const minutes = parseInt(timeComponents[1]);
              if (!isNaN(hours) && !isNaN(minutes)) {
                const totalMinutes = hours * 60 + minutes;
                const slotTotalMinutes = Math.floor(totalMinutes / intervalMinutes) * intervalMinutes;
                const slotHours = Math.floor(slotTotalMinutes / 60);
                const slotMinutes = slotTotalMinutes % 60;
                return `${slotHours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
              }
            }
          }
        } else {
          const totalMinutes = date.getHours() * 60 + date.getMinutes();
          const slotTotalMinutes = Math.floor(totalMinutes / intervalMinutes) * intervalMinutes;
          const slotHours = Math.floor(slotTotalMinutes / 60);
          const slotMinutes = slotTotalMinutes % 60;
          return `${slotHours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
        }
        return null;
      };

      let tradesWithSlots;
      
      if (analysisType === 'combo') {
        tradesWithSlots = tradesForAnalysis
          .map(trade => {
            const entrySlot = getTimeSlot(trade.entryTime, timeSlotInterval);
            const exitSlot = getTimeSlot(trade.exitTime, timeSlotInterval);
            return {
              ...trade,
              entryTimeSlot: entrySlot,
              exitTimeSlot: exitSlot,
              timeSlot: entrySlot && exitSlot ? `${entrySlot} → ${exitSlot}` : null
            };
          })
          .filter(trade => trade.timeSlot && !isNaN(trade.pnl));
      } else {
        tradesWithSlots = tradesForAnalysis
          .map(trade => ({
            ...trade,
            analysisTime: analysisType === 'entry' ? trade.entryTime : trade.exitTime,
            timeSlot: getTimeSlot(analysisType === 'entry' ? trade.entryTime : trade.exitTime, timeSlotInterval)
          }))
          .filter(trade => trade.timeSlot && !isNaN(trade.pnl));
      }

      if (tradesWithSlots.length === 0) {
        throw new Error('No valid trades with proper timestamps.');
      }

      const tradesBySlot = {};
      tradesWithSlots.forEach(trade => {
        if (!tradesBySlot[trade.timeSlot]) {
          tradesBySlot[trade.timeSlot] = [];
        }
        tradesBySlot[trade.timeSlot].push(trade);
      });

      const slotPerformance = Object.keys(tradesBySlot).map(slot => {
        const trades = tradesBySlot[slot];
        const pnlValues = trades.map(t => t.pnl);
        
        const totalPnL = pnlValues.reduce((sum, val) => sum + val, 0);
        const avgPnL = pnlValues.length > 0 ? totalPnL / pnlValues.length : 0;
        
        const winningTrades = pnlValues.filter(p => p > 0);
        const losingTrades = pnlValues.filter(p => p < 0);
        
        const winRate = pnlValues.length > 0 ? (winningTrades.length / pnlValues.length) * 100 : 0;
        const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, val) => sum + val, 0) / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? losingTrades.reduce((sum, val) => sum + val, 0) / losingTrades.length : 0;
        
        const profitFactor = (avgLoss !== 0 && losingTrades.length > 0) ? 
          (avgWin * winningTrades.length) / Math.abs(avgLoss * losingTrades.length) : 
          (winningTrades.length > 0 ? 999 : 0);

        const weeklyBreakdown = {};
        trades.forEach(trade => {
          const weekKey = getWeekKey(trade.entryTime);
          if (weekKey) {
            if (!weeklyBreakdown[weekKey]) weeklyBreakdown[weekKey] = [];
            weeklyBreakdown[weekKey].push(trade);
          }
        });

        const weeklyPerformance = Object.keys(weeklyBreakdown).map(week => {
          const weekTrades = weeklyBreakdown[week];
          const weekPnL = weekTrades.reduce((sum, t) => sum + t.pnl, 0);
          const weekWinRate = (weekTrades.filter(t => t.pnl > 0).length / weekTrades.length) * 100;
          return {
            period: week,
            trades: weekTrades.length,
            pnl: Math.round(weekPnL),
            winRate: Math.round(weekWinRate * 100) / 100
          };
        }).sort((a, b) => b.pnl - a.pnl);

        const monthlyBreakdown = {};
        trades.forEach(trade => {
          const monthKey = getMonthKey(trade.entryTime);
          if (monthKey) {
            if (!monthlyBreakdown[monthKey]) monthlyBreakdown[monthKey] = [];
            monthlyBreakdown[monthKey].push(trade);
          }
        });

        const monthlyPerformance = Object.keys(monthlyBreakdown).map(month => {
          const monthTrades = monthlyBreakdown[month];
          const monthPnL = monthTrades.reduce((sum, t) => sum + t.pnl, 0);
          const monthWinRate = (monthTrades.filter(t => t.pnl > 0).length / monthTrades.length) * 100;
          return {
            period: month,
            trades: monthTrades.length,
            pnl: Math.round(monthPnL),
            winRate: Math.round(monthWinRate * 100) / 100
          };
        }).sort((a, b) => b.pnl - a.pnl);
        
        return {
          timeSlot: slot,
          entryTimeSlot: trades[0]?.entryTimeSlot,
          exitTimeSlot: trades[0]?.exitTimeSlot,
          tradeCount: trades.length,
          totalPnL: Math.round(totalPnL),
          avgPnL: Math.round(avgPnL),
          winRate: Math.round(winRate * 100) / 100,
          winningTrades: winningTrades.length,
          losingTrades: losingTrades.length,
          avgWin: Math.round(avgWin),
          avgLoss: Math.round(avgLoss),
          profitFactor: Math.round(profitFactor * 100) / 100,
          weeklyPerformance: weeklyPerformance,
          monthlyPerformance: monthlyPerformance,
          consistency: {
            profitableWeeks: weeklyPerformance.filter(w => w.pnl > 0).length,
            totalWeeks: weeklyPerformance.length,
            profitableMonths: monthlyPerformance.filter(m => m.pnl > 0).length,
            totalMonths: monthlyPerformance.length,
            weeklyConsistency: weeklyPerformance.length > 0 ? (weeklyPerformance.filter(w => w.pnl > 0).length / weeklyPerformance.length) * 100 : 0,
            monthlyConsistency: monthlyPerformance.length > 0 ? (monthlyPerformance.filter(m => m.pnl > 0).length / monthlyPerformance.length) * 100 : 0
          }
        };
      }).filter(slot => slot.tradeCount >= 2);

      const sortedByPnL = [...slotPerformance].sort((a, b) => b.totalPnL - a.totalPnL);
      const highVolumeSlots = slotPerformance.filter(slot => slot.tradeCount >= 5);
      const sortedByWinRate = [...highVolumeSlots].sort((a, b) => b.winRate - a.winRate);
      const sortedByProfitFactor = [...highVolumeSlots].sort((a, b) => b.profitFactor - a.profitFactor);

      const dayOfWeekAnalysis = () => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayData = {};
        
        tradesForAnalysis.forEach(trade => {
          const date = new Date(trade.entryTime);
          const dayName = days[date.getDay()];
          if (!dayData[dayName]) dayData[dayName] = [];
          dayData[dayName].push(trade);
        });

        return days.map(day => {
          const trades = dayData[day] || [];
          const pnlValues = trades.map(t => t.pnl);
          const totalPnL = pnlValues.reduce((sum, val) => sum + val, 0);
          const winRate = trades.length > 0 ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 : 0;
          return {
            day,
            totalPnL: Math.round(totalPnL),
            trades: trades.length,
            winRate: Math.round(winRate * 100) / 100
          };
        }).filter(d => d.trades > 0);
      };

      const hourHeatmapAnalysis = () => {
        const hourData = {};
        
        for (let i = 0; i < 24; i++) {
          hourData[i] = [];
        }
        
        tradesForAnalysis.forEach(trade => {
          const date = new Date(trade.entryTime);
          const hour = date.getHours();
          hourData[hour].push(trade);
        });

        return Object.keys(hourData).map(hour => {
          const trades = hourData[hour];
          const pnlValues = trades.map(t => t.pnl);
          const totalPnL = pnlValues.reduce((sum, val) => sum + val, 0);
          const winRate = trades.length > 0 ? (trades.filter(t => t.pnl > 0).length / trades.length) * 100 : 0;
          return {
            hour: parseInt(hour),
            totalPnL: Math.round(totalPnL),
            trades: trades.length,
            winRate: Math.round(winRate * 100) / 100,
            avgPnL: trades.length > 0 ? Math.round(totalPnL / trades.length) : 0
          };
        }).filter(h => h.trades > 0);
      };

      const getBestWorstTrades = () => {
        const sorted = [...tradesForAnalysis].sort((a, b) => b.pnl - a.pnl);
        return {
          best: sorted.slice(0, 5),
          worst: sorted.slice(-5).reverse()
        };
      };

      const riskRewardAnalysis = () => {
        const avgWin = tradesForAnalysis.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0) / (tradesForAnalysis.filter(t => t.pnl > 0).length || 1);
        const avgLoss = Math.abs(tradesForAnalysis.filter(t => t.pnl <= 0).reduce((sum, t) => sum + t.pnl, 0) / (tradesForAnalysis.filter(t => t.pnl <= 0).length || 1));
        
        return {
          avgWin: Math.round(avgWin),
          avgLoss: Math.round(avgLoss),
          riskRewardRatio: avgLoss > 0 ? Math.round((avgWin / avgLoss) * 100) / 100 : 0
        };
      };

      const equityCurveAnalysis = () => {
        let cumulative = 0;
        return tradesForAnalysis.map((trade, index) => {
          cumulative += trade.pnl;
          return {
            tradeNumber: index + 1,
            equity: Math.round(cumulative),
            pnl: Math.round(trade.pnl)
          };
        });
      };

      const calculateDrawdownMetrics = () => {
        let runningPnL = 0;
        let peak = 0;
        let maxDrawdown = 0;
        let currentDrawdown = 0;
        let consecutiveWins = 0;
        let consecutiveLosses = 0;
        let maxConsecutiveWins = 0;
        let maxConsecutiveLosses = 0;
        
        tradesForAnalysis.forEach(trade => {
          runningPnL += trade.pnl;
          
          if (runningPnL > peak) {
            peak = runningPnL;
            currentDrawdown = 0;
          } else {
            currentDrawdown = peak - runningPnL;
            maxDrawdown = Math.max(maxDrawdown, currentDrawdown);
          }
          
          if (trade.pnl > 0) {
            consecutiveWins++;
            consecutiveLosses = 0;
            maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWins);
          } else {
            consecutiveLosses++;
            consecutiveWins = 0;
            maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
          }
        });
        
        return {
          maxDrawdown: Math.round(maxDrawdown),
          maxConsecutiveWins,
          maxConsecutiveLosses,
          currentDrawdown: Math.round(currentDrawdown)
        };
      };

      const calculateTradeDuration = () => {
        const durations = tradesForAnalysis.map(trade => {
          const entry = new Date(trade.entryTime);
          const exit = new Date(trade.exitTime);
          return Math.round((exit - entry) / (1000 * 60));
        }).filter(d => d > 0);
        
        const avgDuration = durations.length > 0 ? durations.reduce((sum, d) => sum + d, 0) / durations.length : 0;
        const medianDuration = durations.length > 0 ? durations.sort((a, b) => a - b)[Math.floor(durations.length / 2)] : 0;
        
        return { avgDuration: Math.round(avgDuration), medianDuration, durations };
      };

      const calculateSharpeAndSortino = () => {
        const returns = tradesForAnalysis.map(t => t.pnl);
        const riskFreeRate = 0;

        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
        const stdDev = Math.sqrt(variance);

        const downReturns = returns.filter(r => r < riskFreeRate);
        const downVariance = downReturns.reduce((sum, r) => sum + Math.pow(r - riskFreeRate, 2), 0) / returns.length;
        const downStdDev = Math.sqrt(downVariance);

        const sharpeRatio = stdDev !== 0 ? (meanReturn - riskFreeRate) / stdDev : 0;
        const sortinoRatio = downStdDev !== 0 ? (meanReturn - riskFreeRate) / downStdDev : 0;

        return {
          sharpeRatio: Math.round(sharpeRatio * 100) / 100,
          sortinoRatio: Math.round(sortinoRatio * 100) / 100
        };
      };

      const durationProfitabilityAnalysis = () => {
        return tradesForAnalysis.map((trade, index) => {
          const entry = new Date(trade.entryTime);
          const exit = new Date(trade.exitTime);
          const duration = Math.round((exit - entry) / (1000 * 60));
          return {
            duration,
            pnl: trade.pnl,
            tradeId: index
          };
        }).filter(t => t.duration > 0);
      };

      const directionAnalysis = () => {
        const longs = tradesForAnalysis.filter(t => t.tradeNumber && parseInt(t.tradeNumber) % 2 === 0);
        const shorts = tradesForAnalysis.filter(t => t.tradeNumber && parseInt(t.tradeNumber) % 2 === 1);
        
        const calculateStats = (trades) => {
          const pnlValues = trades.map(t => t.pnl);
          return {
            trades: trades.length,
            totalPnL: Math.round(pnlValues.reduce((sum, v) => sum + v, 0)),
            winRate: trades.length > 0 ? Math.round((trades.filter(t => t.pnl > 0).length / trades.length) * 100 * 100) / 100 : 0,
            avgPnL: trades.length > 0 ? Math.round(pnlValues.reduce((sum, v) => sum + v, 0) / trades.length) : 0
          };
        };

        return {
          long: calculateStats(longs),
          short: calculateStats(shorts)
        };
      };

      // PHASE 1: Performance Decay Analysis
      const performanceDecayAnalysis = () => {
        const quarterSize = Math.floor(tradesForAnalysis.length / 4);
        const firstQuarter = tradesForAnalysis.slice(0, quarterSize);
        const lastQuarter = tradesForAnalysis.slice(-quarterSize);

        const analyzeTradeSet = (trades) => {
          const pnlValues = trades.map(t => t.pnl);
          return {
            trades: trades.length,
            totalPnL: Math.round(pnlValues.reduce((sum, v) => sum + v, 0)),
            avgPnL: trades.length > 0 ? Math.round(pnlValues.reduce((sum, v) => sum + v, 0) / trades.length) : 0,
            winRate: trades.length > 0 ? Math.round((trades.filter(t => t.pnl > 0).length / trades.length) * 100 * 100) / 100 : 0
          };
        };

        const first = analyzeTradeSet(firstQuarter);
        const last = analyzeTradeSet(lastQuarter);
        const decay = {
          winRateDecay: Math.round((last.winRate - first.winRate) * 100) / 100,
          avgPnLDecay: last.avgPnL - first.avgPnL,
          trend: last.avgPnL < first.avgPnL ? 'declining' : 'improving'
        };

        return { first, last, decay };
      };

      // PHASE 1: Entry vs Exit Attribution
      const entryExitAttribution = () => {
        const midPrice = (entry, exit) => (entry + exit) / 2;
        
        let entryEdge = 0;
        let exitEdge = 0;
        let count = 0;

        tradesForAnalysis.forEach((trade, idx) => {
          if (idx > 0 && idx < tradesForAnalysis.length - 1) {
            const prevClose = tradesForAnalysis[idx - 1].pnl;
            const nextOpen = tradesForAnalysis[idx + 1].pnl;
            
            if (trade.pnl > 0) {
              entryEdge += Math.min(trade.pnl, Math.abs(Math.max(0, prevClose)));
              exitEdge += Math.max(0, trade.pnl - Math.abs(prevClose));
              count++;
            }
          }
        });

        const avgWin = tradesForAnalysis.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0) / (tradesForAnalysis.filter(t => t.pnl > 0).length || 1);
        
        return {
          entryPercentage: Math.round((entryEdge / (entryEdge + exitEdge || 1)) * 100),
          exitPercentage: Math.round((exitEdge / (entryEdge + exitEdge || 1)) * 100),
          insight: entryEdge > exitEdge ? 'Entry timing is your strength' : 'Exit timing is your strength'
        };
      };

      // PHASE 1: Trade Clustering Analysis
      const tradeClusteringAnalysis = () => {
        let winStreak = 0;
        let maxWinStreak = 0;
        let streakCount = 0;
        let streakLengths = [];

        tradesForAnalysis.forEach((trade, idx) => {
          if (trade.pnl > 0) {
            winStreak++;
          } else {
            if (winStreak > 0) {
              streakLengths.push(winStreak);
              maxWinStreak = Math.max(maxWinStreak, winStreak);
            }
            winStreak = 0;
          }
        });

        if (winStreak > 0) {
          streakLengths.push(winStreak);
          maxWinStreak = Math.max(maxWinStreak, winStreak);
        }

        const avgStreakLength = streakLengths.length > 0 ? Math.round(streakLengths.reduce((a, b) => a + b, 0) / streakLengths.length * 100) / 100 : 0;
        const clusteringStrength = Math.round((maxWinStreak / tradesForAnalysis.length) * 100);

        return {
          maxWinStreak: maxWinStreak,
          avgStreakLength: avgStreakLength,
          clusteringStrength: clusteringStrength,
          assessment: clusteringStrength > 20 ? 'High - Pattern is repeatable' : clusteringStrength > 10 ? 'Medium - Some pattern consistency' : 'Low - Trades are independent',
          totalWinStreaks: streakLengths.length
        };
      };

      // PHASE 1: Kelly Criterion Position Sizing
      const kellyCriterionAnalysis = () => {
        const winCount = tradesForAnalysis.filter(t => t.pnl > 0).length;
        const lossCount = tradesForAnalysis.filter(t => t.pnl <= 0).length;
        const winRate = winCount / tradesForAnalysis.length;
        
        const avgWin = tradesForAnalysis.filter(t => t.pnl > 0).reduce((s, t) => s + t.pnl, 0) / (winCount || 1);
        const avgLoss = Math.abs(tradesForAnalysis.filter(t => t.pnl <= 0).reduce((s, t) => s + t.pnl, 0) / (lossCount || 1));
        
        const winLossRatio = avgWin / (avgLoss || 1);
        
        // Kelly Formula: f = (bp - q) / b
        // b = win/loss ratio, p = win rate, q = loss rate
        const p = winRate;
        const q = 1 - winRate;
        const b = winLossRatio;
        
        let kellyPercentage = ((b * p - q) / b) * 100;
        kellyPercentage = Math.max(0, Math.min(kellyPercentage, 25)); // Cap at 25%

        const conservative = Math.round(kellyPercentage * 0.25 * 100) / 100;
        const moderate = Math.round(kellyPercentage * 0.5 * 100) / 100;
        const aggressive = Math.round(kellyPercentage * 100) / 100;

        return {
          kelly: Math.round(kellyPercentage * 100) / 100,
          conservative: conservative,
          moderate: moderate,
          aggressive: aggressive,
          recommendation: kellyPercentage > 5 ? `Use ${moderate}% per trade (moderate)` : `Risk < ${conservative}% per trade (conservative - low edge)`
        };
      };

      const decayAnalysis = performanceDecayAnalysis();
      const attribution = entryExitAttribution();
      const clustering = tradeClusteringAnalysis();
      const kellyAnalysis = kellyCriterionAnalysis();

      const calculateBestEntryTimes = () => {
        const entrySlots = {};
        tradesForAnalysis.forEach(trade => {
          const slot = getTimeSlot(trade.entryTime, timeSlotInterval);
          if (slot) {
            if (!entrySlots[slot]) entrySlots[slot] = [];
            entrySlots[slot].push(trade);
          }
        });
        
        return Object.keys(entrySlots).map(slot => {
          const trades = entrySlots[slot];
          const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
          const winRate = (trades.filter(t => t.pnl > 0).length / trades.length) * 100;
          return { timeSlot: slot, totalPnL, winRate, tradeCount: trades.length };
        }).filter(s => s.tradeCount >= 5).sort((a, b) => b.totalPnL - a.totalPnL);
      };

      const calculateBestExitTimes = () => {
        const exitSlots = {};
        tradesForAnalysis.forEach(trade => {
          const slot = getTimeSlot(trade.exitTime, timeSlotInterval);
          if (slot) {
            if (!exitSlots[slot]) exitSlots[slot] = [];
            exitSlots[slot].push(trade);
          }
        });
        
        return Object.keys(exitSlots).map(slot => {
          const trades = exitSlots[slot];
          const totalPnL = trades.reduce((sum, t) => sum + t.pnl, 0);
          const winRate = (trades.filter(t => t.pnl > 0).length / trades.length) * 100;
          return { timeSlot: slot, totalPnL, winRate, tradeCount: trades.length };
        }).filter(s => s.tradeCount >= 5).sort((a, b) => b.totalPnL - a.totalPnL);
      };

      const dayOfWeek = dayOfWeekAnalysis();
      const hourHeatmap = hourHeatmapAnalysis();
      const bestWorstTrades = getBestWorstTrades();
      const riskReward = riskRewardAnalysis();
      const equityCurve = equityCurveAnalysis();
      const direction = directionAnalysis();
      const durationProfit = durationProfitabilityAnalysis();
      const sharpeAndSortino = calculateSharpeAndSortino();
      const tradeDuration = calculateTradeDuration();
      const drawdownMetrics = calculateDrawdownMetrics();
      const bestEntryTimes = calculateBestEntryTimes();
      const bestExitTimes = calculateBestExitTimes();

      const totalPnL = tradesForAnalysis.reduce((sum, trade) => sum + trade.pnl, 0);
      const overallWinRate = tradesForAnalysis.length > 0 ? 
        (tradesForAnalysis.filter(trade => trade.pnl > 0).length / tradesForAnalysis.length) * 100 : 0;

      return {
        fileInfo: { ...fileInfo, dateRange: dateRange },
        totalTrades: tradesForAnalysis.length,
        overallPerformance: {
          totalPnL: Math.round(totalPnL),
          winRate: Math.round(overallWinRate * 100) / 100
        },
        byProfitability: sortedByPnL,
        byWinRate: sortedByWinRate,
        byProfitFactor: sortedByProfitFactor,
        dayOfWeek: dayOfWeek,
        hourHeatmap: hourHeatmap,
        bestWorstTrades: bestWorstTrades,
        riskReward: riskReward,
        equityCurve: equityCurve,
        direction: direction,
        durationProfit: durationProfit,
        sharpeAndSortino: sharpeAndSortino,
        comprehensiveInsights: {
          bestEntryTimes: bestEntryTimes.slice(0, 3),
          bestExitTimes: bestExitTimes.slice(0, 3),
          tradeDuration: tradeDuration,
          drawdownMetrics: drawdownMetrics
        }
      };
    } catch (err) {
      throw err;
    }
  }, [intradayOnly, timeSlotInterval, analysisType]);

  return { performAnalysis };
};
