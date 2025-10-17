import React, { useState, useCallback } from 'react';
import { Upload, TrendingUp, Clock, BarChart3, Download, AlertCircle, CheckCircle, Calendar, Target, Activity, FileText, Table } from 'lucide-react';

const TradingViewStrategyAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('profitability');
  const [timeSlotInterval, setTimeSlotInterval] = useState(5);
  const [resultCount, setResultCount] = useState(15);
  const [analysisType, setAnalysisType] = useState('combo');
  const [intradayOnly, setIntradayOnly] = useState(false);
  const [cachedData, setCachedData] = useState(null);

  const parseFileName = (fileName) => {
    const nameWithoutExt = fileName.replace('.csv', '');
    const parts = nameWithoutExt.split('_');
    
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    let dateIndex = -1;
    let reportDate = null;
    
    for (let i = 0; i < parts.length; i++) {
      if (datePattern.test(parts[i])) {
        dateIndex = i;
        reportDate = parts[i];
        break;
      }
    }
    
    if (dateIndex === -1) {
      return { strategyName: 'Unknown Strategy', symbol: 'Unknown Symbol', reportDate: 'Unknown Date' };
    }
    
    const exchangeIndex = dateIndex - 2;
    const symbolIndex = dateIndex - 1;
    
    if (exchangeIndex < 0 || symbolIndex < 0) {
      return { strategyName: 'Unknown Strategy', symbol: 'Unknown Symbol', reportDate: reportDate || 'Unknown Date' };
    }
    
    let strategyParts = parts.slice(0, exchangeIndex);
    let exchange = parts[exchangeIndex];
    let symbol = parts[symbolIndex];
    
    const strategyName = strategyParts
      .join(' ')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
    
    const fullSymbol = `${exchange}_${symbol}`;
    
    return { strategyName: strategyName || 'Unknown Strategy', symbol: fullSymbol, reportDate: reportDate || 'Unknown Date' };
  };

  const getDateRange = (trades) => {
    if (!trades || trades.length === 0) return { start: null, end: null };
    
    const dates = trades
      .map(trade => trade['Date/Time'])
      .filter(dateStr => dateStr)
      .map(dateStr => new Date(dateStr))
      .filter(date => !isNaN(date.getTime()))
      .sort((a, b) => a - b);
    
    if (dates.length === 0) return { start: null, end: null };
    
    return {
      start: dates[0].toISOString().split('T')[0],
      end: dates[dates.length - 1].toISOString().split('T')[0]
    };
  };

  const parseAndCacheData = async (csvText, fileName) => {
    try {
      const lines = csvText.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      
      const data = lines.slice(1)
        .filter(line => line.trim())
        .map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row = {};
          headers.forEach((header, index) => {
            let value = values[index];
            if (value && !isNaN(value) && !isNaN(parseFloat(value))) {
              value = parseFloat(value);
            }
            row[header] = value;
          });
          return row;
        });

      const fileInfo = parseFileName(fileName);
      
      const exitTrades = data.filter(trade => 
        trade.Type && trade.Type.toString().toLowerCase().includes('exit')
      );
      
      const entryTrades = data.filter(trade => 
        trade.Type && trade.Type.toString().toLowerCase().includes('entry')
      );

      if (exitTrades.length === 0) {
        throw new Error('No exit trades found in the data. Please ensure your CSV contains completed trades with "Exit" in the Type column.');
      }

      const tradePairs = {};
      
      [...entryTrades, ...exitTrades].forEach(trade => {
        const tradeNum = trade['Trade #'];
        if (!tradePairs[tradeNum]) {
          tradePairs[tradeNum] = {};
        }
        
        if (trade.Type.toLowerCase().includes('entry')) {
          tradePairs[tradeNum].entry = trade;
        } else {
          tradePairs[tradeNum].exit = trade;
        }
      });

      const completeTrades = Object.values(tradePairs)
        .filter(pair => pair.entry && pair.exit)
        .map(pair => ({
          tradeNumber: pair.entry['Trade #'],
          entryTime: pair.entry['Date/Time'],
          exitTime: pair.exit['Date/Time'],
          pnl: parseFloat(pair.exit['Net P&L INR']) || 0,
        }));

      if (completeTrades.length === 0) {
        throw new Error('No complete trade pairs found. Please ensure your CSV contains both entry and exit trades with matching Trade # values.');
      }

      const dateRange = getDateRange(entryTrades);

      setCachedData({ fileInfo, completeTrades, dateRange });
      setIsAnalyzing(true);
      performAnalysis(completeTrades, fileInfo, dateRange);
    } catch (err) {
      setError('Analysis error: ' + err.message);
      setIsAnalyzing(false);
    }
  };

  const performAnalysis = (completeTrades, fileInfo, dateRange) => {
    try {
      let tradesForAnalysis = completeTrades;
      if (intradayOnly) {
        tradesForAnalysis = completeTrades.filter(trade => {
          const entryDate = new Date(trade.entryTime).toISOString().split('T')[0];
          const exitDate = new Date(trade.exitTime).toISOString().split('T')[0];
          return entryDate === exitDate;
        });

        if (tradesForAnalysis.length === 0) {
          throw new Error('No intraday trades found. Please disable the "Intraday Trades Only" filter to see all trades.');
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
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) {
          const parts = dateTimeStr.split(' ');
          if (parts.length >= 2) {
            const timePart = parts[1];
            const timeComponents = timePart.split(':');
            if (timeComponents.length >= 2) {
              const hours = parseInt(timeComponents[0]);
              const minutes = parseInt(timeComponents[1]);
              const slotMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes;
              return `${hours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
            }
          }
        } else {
          const hours = date.getHours();
          const minutes = date.getMinutes();
          const slotMinutes = Math.floor(minutes / intervalMinutes) * intervalMinutes;
          return `${hours.toString().padStart(2, '0')}:${slotMinutes.toString().padStart(2, '0')}`;
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
        throw new Error('No valid trades with proper timestamp and P&L data found.');
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

      const tradesByWeek = {};
      tradesForAnalysis.forEach(trade => {
        const weekKey = getWeekKey(trade.entryTime);
        if (weekKey) {
          if (!tradesByWeek[weekKey]) tradesByWeek[weekKey] = [];
          tradesByWeek[weekKey].push(trade);
        }
      });

      const weeklyPerformance = Object.keys(tradesByWeek).map(week => {
        const trades = tradesByWeek[week];
        const pnlValues = trades.map(t => t.pnl);
        const totalPnL = pnlValues.reduce((sum, val) => sum + val, 0);
        const winningTrades = pnlValues.filter(p => p > 0);
        const winRate = pnlValues.length > 0 ? (winningTrades.length / pnlValues.length) * 100 : 0;
        
        return {
          period: week,
          tradeCount: trades.length,
          totalPnL: Math.round(totalPnL),
          avgPnL: Math.round(totalPnL / trades.length),
          winRate: Math.round(winRate * 100) / 100,
          winningTrades: winningTrades.length,
          losingTrades: trades.length - winningTrades.length
        };
      }).sort((a, b) => b.totalPnL - a.totalPnL);

      const tradesByMonth = {};
      tradesForAnalysis.forEach(trade => {
        const monthKey = getMonthKey(trade.entryTime);
        if (monthKey) {
          if (!tradesByMonth[monthKey]) tradesByMonth[monthKey] = [];
          tradesByMonth[monthKey].push(trade);
        }
      });

      const monthlyPerformance = Object.keys(tradesByMonth).map(month => {
        const trades = tradesByMonth[month];
        const pnlValues = trades.map(t => t.pnl);
        const totalPnL = pnlValues.reduce((sum, val) => sum + val, 0);
        const winningTrades = pnlValues.filter(p => p > 0);
        const winRate = pnlValues.length > 0 ? (winningTrades.length / pnlValues.length) * 100 : 0;
        
        return {
          period: month,
          tradeCount: trades.length,
          totalPnL: Math.round(totalPnL),
          avgPnL: Math.round(totalPnL / trades.length),
          winRate: Math.round(winRate * 100) / 100,
          winningTrades: winningTrades.length,
          losingTrades: trades.length - winningTrades.length
        };
      }).sort((a, b) => b.totalPnL - a.totalPnL);

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

      const bestEntryTimes = calculateBestEntryTimes();
      const bestExitTimes = calculateBestExitTimes();
      const tradeDuration = calculateTradeDuration();
      const drawdownMetrics = calculateDrawdownMetrics();

      const totalPnL = tradesForAnalysis.reduce((sum, trade) => sum + trade.pnl, 0);
      const overallWinRate = tradesForAnalysis.length > 0 ? 
        (tradesForAnalysis.filter(trade => trade.pnl > 0).length / tradesForAnalysis.length) * 100 : 0;

      setResults({
        fileInfo: { ...fileInfo, dateRange: dateRange },
        totalTrades: tradesForAnalysis.length,
        totalSlots: slotPerformance.length,
        highVolumeSlots: highVolumeSlots.length,
        timeSlotInterval: timeSlotInterval,
        analysisType: analysisType,
        overallPerformance: {
          totalPnL: Math.round(totalPnL),
          winRate: Math.round(overallWinRate * 100) / 100
        },
        comprehensiveInsights: {
          bestEntryTimes: bestEntryTimes.slice(0, 3),
          bestExitTimes: bestExitTimes.slice(0, 3),
          tradeDuration: tradeDuration,
          drawdownMetrics: drawdownMetrics,
          bestWeek: weeklyPerformance[0],
          bestMonth: monthlyPerformance[0],
          worstWeek: weeklyPerformance[weeklyPerformance.length - 1],
          worstMonth: monthlyPerformance[monthlyPerformance.length - 1]
        },
        allByProfitability: sortedByPnL,
        allByWinRate: sortedByWinRate,
        allByProfitFactor: sortedByProfitFactor,
        byProfitability: sortedByPnL.slice(0, resultCount),
        byWinRate: sortedByWinRate.slice(0, resultCount),
        byProfitFactor: sortedByProfitFactor.slice(0, resultCount)
      });

      setIsAnalyzing(false);
    } catch (err) {
      setError('Analysis error: ' + err.message);
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = useCallback(async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(uploadedFile);
    setError(null);

    try {
      const text = await uploadedFile.text();
      await parseAndCacheData(text, uploadedFile.name);
    } catch (err) {
      setError('Error reading file: ' + err.message);
    }
  }, []);

  const handleTimeSlotChange = (newInterval) => {
    setTimeSlotInterval(newInterval);
  };

  const handleAnalysisTypeChange = (newType) => {
    setAnalysisType(newType);
  };

  const handleIntradayToggle = (newValue) => {
    setIntradayOnly(newValue);
  };

  const handleResultCountChange = (newCount) => {
    setResultCount(newCount);
    if (results) {
      setResults({
        ...results,
        byProfitability: results.allByProfitability.slice(0, newCount === 'all' ? results.allByProfitability.length : newCount),
        byWinRate: results.allByWinRate.slice(0, newCount === 'all' ? results.allByWinRate.length : newCount),
        byProfitFactor: results.allByProfitFactor.slice(0, newCount === 'all' ? results.allByProfitFactor.length : newCount)
      });
    }
  };

  React.useEffect(() => {
    if (cachedData) {
      performAnalysis(cachedData.completeTrades, cachedData.fileInfo, cachedData.dateRange);
    }
  }, [timeSlotInterval, analysisType, intradayOnly]);

  const exportToPDF = () => {
    if (!results) return;
    
    const currentData = activeTab === 'profitability' ? results.byProfitability : 
                       activeTab === 'winrate' ? results.byWinRate : results.byProfitFactor;
    
    let content = `
TradingView Strategy Analysis Report
Generated: ${new Date().toLocaleString()}

STRATEGY OVERVIEW
=================
Strategy Name: ${results.fileInfo.strategyName}
Trading Symbol: ${results.fileInfo.symbol}
Report Generated: ${results.fileInfo.reportDate}
Trade Date Range: ${results.fileInfo.dateRange.start} to ${results.fileInfo.dateRange.end}

PERFORMANCE SUMMARY
==================
Total Trades: ${results.totalTrades.toLocaleString()}
Overall P&L: ₹${results.overallPerformance.totalPnL.toLocaleString()}
Overall Win Rate: ${results.overallPerformance.winRate}%
Analysis Interval: ${results.timeSlotInterval} minutes
Time Slots Analyzed: ${results.totalSlots}
`;

    content += `Rank\tTime Slot\tTotal P&L\tTrades\tWin Rate\tAvg P&L\tProfit Factor\n`;
    currentData.forEach((slot, index) => {
      content += `${index + 1}\t${slot.timeSlot}\t₹${slot.totalPnL.toLocaleString()}\t${slot.tradeCount}\t${slot.winRate}%\t₹${slot.avgPnL}\t${slot.profitFactor}\n`;
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${results.fileInfo.strategyName.replace(/\s+/g, '_')}_Analysis_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    if (!results) return;
    
    const currentData = activeTab === 'profitability' ? results.byProfitability : 
                       activeTab === 'winrate' ? results.byWinRate : results.byProfitFactor;
    
    let headers, csvContent;
    
    if (analysisType === 'combo') {
      headers = ['Rank', 'Entry Time', 'Exit Time', 'Total P&L', 'Trades', 'Win Rate %', 'Avg P&L', 'Profit Factor'];
      csvContent = [
        headers.join(','),
        ...currentData.map((slot, index) => [
          index + 1,
          slot.timeSlot?.split(' → ')[0] || '',
          slot.timeSlot?.split(' → ')[1] || '',
          slot.totalPnL,
          slot.tradeCount,
          slot.winRate,
          slot.avgPnL,
          slot.profitFactor
        ].join(','))
      ].join('\n');
    } else {
      headers = ['Rank', 'Time Slot', 'Total P&L', 'Trades', 'Win Rate %', 'Avg P&L', 'Profit Factor'];
      csvContent = [
        headers.join(','),
        ...currentData.map((slot, index) => [
          index + 1,
          slot.timeSlot,
          slot.totalPnL,
          slot.tradeCount,
          slot.winRate,
          slot.avgPnL,
          slot.profitFactor
        ].join(','))
      ].join('\n');
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${results.fileInfo.strategyName.replace(/\s+/g, '_')}_${analysisType}_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );

  const AnalysisTypeSelector = () => (
    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <span className="text-gray-700 font-medium text-sm">Analyze by:</span>
      {[
        { value: 'combo', label: 'Entry→Exit Combo', desc: 'Best entry to exit time combinations' },
        { value: 'entry', label: 'Entry Time', desc: 'Best times to start trades' },
        { value: 'exit', label: 'Exit Time', desc: 'Best times to close trades' }
      ].map(type => (
        <button
          key={type.value}
          onClick={() => handleAnalysisTypeChange(type.value)}
          className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-300 relative group ${
            analysisType === type.value
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          title={type.desc}
        >
          {type.label}
        </button>
      ))}
    </div>
  );

  const TimeSlotSelector = () => (
    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <span className="text-gray-700 font-medium text-sm">Interval:</span>
      {[5, 15, 30, 60].map(interval => (
        <button
          key={interval}
          onClick={() => handleTimeSlotChange(interval)}
          className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-300 ${
            timeSlotInterval === interval
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {interval}m{interval === 60 ? ' (1h)' : ''}
        </button>
      ))}
    </div>
  );

  const ResultCountSelector = () => (
    <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
      <span className="text-gray-700 font-medium text-sm">Show:</span>
      {[10, 15, 25, 50, 100, 'all'].map(count => (
        <button
          key={count}
          onClick={() => handleResultCountChange(count)}
          className={`px-3 py-1.5 rounded-md font-medium text-sm transition-all duration-300 ${
            resultCount === count
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {count === 'all' ? 'All' : `Top ${count}`}
        </button>
      ))}
    </div>
  );

  const EnhancedResultsTable = ({ data, columns }) => {
    const [expandedRows, setExpandedRows] = useState(new Set());

    const toggleExpanded = (index) => {
      const newExpanded = new Set(expandedRows);
      if (newExpanded.has(index)) {
        newExpanded.delete(index);
      } else {
        newExpanded.add(index);
      }
      setExpandedRows(newExpanded);
    };

    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow-lg border border-gray-200">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 uppercase tracking-wide">Details</th>
              {columns.map((col, index) => (
                <th key={index} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 uppercase tracking-wide">{col.header}</th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b border-gray-200 uppercase tracking-wide">Consistency</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <React.Fragment key={index}>
                <tr className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="px-4 py-3 text-sm border-b border-gray-100">
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <div className={`transform transition-transform ${expandedRows.has(index) ? 'rotate-90' : 'rotate-0'}`}>▶</div>
                      <span className="text-xs">Expand</span>
                    </button>
                  </td>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-4 py-3 text-sm border-b border-gray-100">
                      {col.render ? col.render(row, index) : row[col.key]}
                    </td>
                  ))}
                  <td className="px-4 py-3 text-sm border-b border-gray-100">
                    <div className="text-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-gray-600">Weekly:</span>
                        <span className={`font-semibold ${row.consistency?.weeklyConsistency >= 70 ? 'text-green-600' : row.consistency?.weeklyConsistency >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {row.consistency?.weeklyConsistency.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Monthly:</span>
                        <span className={`font-semibold ${row.consistency?.monthlyConsistency >= 70 ? 'text-green-600' : row.consistency?.monthlyConsistency >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {row.consistency?.monthlyConsistency.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </td>
                </tr>
                {expandedRows.has(index) && (
                  <tr>
                    <td colSpan={columns.length + 2} className="px-4 py-4 bg-gray-50 border-b border-gray-100">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">📅 Weekly Performance</h5>
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700">Week</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700">P&L</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700">Trades</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700">Win Rate</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.weeklyPerformance?.length > 0 ? row.weeklyPerformance.slice(0, 6).map((week, weekIndex) => (
                                  <tr key={weekIndex} className="border-t border-gray-100">
                                    <td className="px-3 py-2 font-mono text-blue-600">{week.period}</td>
                                    <td className={`px-3 py-2 font-semibold ${week.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{week.pnl.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-gray-700">{week.trades}</td>
                                    <td className="px-3 py-2 text-gray-700">{week.winRate}%</td>
                                  </tr>
                                )) : <tr><td colSpan={4} className="px-3 py-2 text-gray-500 text-center">No weekly data</td></tr>}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">📊 Monthly Performance</h5>
                          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            <table className="w-full text-xs">
                              <thead className="bg-gray-100">
                                <tr>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700">Month</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700">P&L</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700">Trades</th>
                                  <th className="px-3 py-2 text-left font-medium text-gray-700">Win Rate</th>
                                </tr>
                              </thead>
                              <tbody>
                                {row.monthlyPerformance?.length > 0 ? row.monthlyPerformance.slice(0, 6).map((month, monthIndex) => (
                                  <tr key={monthIndex} className="border-t border-gray-100">
                                    <td className="px-3 py-2 font-mono text-blue-600">{month.period}</td>
                                    <td className={`px-3 py-2 font-semibold ${month.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{month.pnl.toLocaleString()}</td>
                                    <td className="px-3 py-2 text-gray-700">{month.trades}</td>
                                    <td className="px-3 py-2 text-gray-700">{month.winRate}%</td>
                                  </tr>
                                )) : <tr><td colSpan={4} className="px-3 py-2 text-gray-500 text-center">No monthly data</td></tr>}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h6 className="font-semibold text-blue-800 mb-2 text-sm">📈 Consistency Analysis</h6>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                          <div>
                            <span className="text-gray-600 block">Profitable Weeks:</span>
                            <span className="font-semibold text-green-600">{row.consistency?.profitableWeeks} / {row.consistency?.totalWeeks}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 block">Weekly Consistency:</span>
                            <span className={`font-semibold ${row.consistency?.weeklyConsistency >= 70 ? 'text-green-600' : row.consistency?.weeklyConsistency >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {row.consistency?.weeklyConsistency.toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 block">Profitable Months:</span>
                            <span className="font-semibold text-green-600">{row.consistency?.profitableMonths} / {row.consistency?.totalMonths}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 block">Monthly Consistency:</span>
                            <span className={`font-semibold ${row.consistency?.monthlyConsistency >= 70 ? 'text-green-600' : row.consistency?.monthlyConsistency >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {row.consistency?.monthlyConsistency.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const profitabilityColumns = [
    { header: 'Rank', key: 'rank', render: (_, index) => `#${index + 1}` },
    ...(analysisType === 'combo' ? [
      { header: 'Entry Time', key: 'entryTime', render: (row) => <span className="font-mono text-green-600 font-semibold">{row.entryTimeSlot || row.timeSlot?.split(' → ')[0]}</span> },
      { header: 'Exit Time', key: 'exitTime', render: (row) => <span className="font-mono text-red-600 font-semibold">{row.exitTimeSlot || row.timeSlot?.split(' → ')[1]}</span> }
    ] : [
      { header: 'Time Slot', key: 'timeSlot', render: (row) => <span className="font-mono text-blue-600 font-semibold">{row.timeSlot}</span> }
    ]),
    { header: 'Total P&L', key: 'totalPnL', render: (row) => <span className={`font-semibold ${row.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{row.totalPnL.toLocaleString()}</span> },
    { header: 'Trades', key: 'tradeCount' },
    { header: 'Win Rate', key: 'winRate', render: (row) => `${row.winRate}%` },
    { header: 'Avg P&L', key: 'avgPnL', render: (row) => <span className={row.avgPnL >= 0 ? 'text-green-600' : 'text-red-600'}>₹{row.avgPnL}</span> },
    { header: 'Profit Factor', key: 'profitFactor' }
  ];

  const winRateColumns = [
    { header: 'Rank', key: 'rank', render: (_, index) => `#${index + 1}` },
    ...(analysisType === 'combo' ? [
      { header: 'Entry Time', key: 'entryTime', render: (row) => <span className="font-mono text-green-600 font-semibold">{row.entryTimeSlot || row.timeSlot?.split(' → ')[0]}</span> },
      { header: 'Exit Time', key: 'exitTime', render: (row) => <span className="font-mono text-red-600 font-semibold">{row.exitTimeSlot || row.timeSlot?.split(' → ')[1]}</span> }
    ] : [
      { header: 'Time Slot', key: 'timeSlot', render: (row) => <span className="font-mono text-blue-600 font-semibold">{row.timeSlot}</span> }
    ]),
    { header: 'Win Rate', key: 'winRate', render: (row) => <span className="font-semibold text-green-600">{row.winRate}%</span> },
    { header: 'Trades', key: 'tradeCount' },
    { header: 'Total P&L', key: 'totalPnL', render: (row) => <span className={row.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}>₹{row.totalPnL.toLocaleString()}</span> },
    { header: 'Avg P&L', key: 'avgPnL', render: (row) => <span className={row.avgPnL >= 0 ? 'text-green-600' : 'text-red-600'}>₹{row.avgPnL}</span> },
    { header: 'Profit Factor', key: 'profitFactor' }
  ];

  const profitFactorColumns = [
    { header: 'Rank', key: 'rank', render: (_, index) => `#${index + 1}` },
    ...(analysisType === 'combo' ? [
      { header: 'Entry Time', key: 'entryTime', render: (row) => <span className="font-mono text-green-600 font-semibold">{row.entryTimeSlot || row.timeSlot?.split(' → ')[0]}</span> },
      { header: 'Exit Time', key: 'exitTime', render: (row) => <span className="font-mono text-red-600 font-semibold">{row.exitTimeSlot || row.timeSlot?.split(' → ')[1]}</span> }
    ] : [
      { header: 'Time Slot', key: 'timeSlot', render: (row) => <span className="font-mono text-blue-600 font-semibold">{row.timeSlot}</span> }
    ]),
    { header: 'Profit Factor', key: 'profitFactor', render: (row) => <span className="font-semibold text-purple-600">{row.profitFactor}</span> },
    { header: 'Trades', key: 'tradeCount' },
    { header: 'Total P&L', key: 'totalPnL', render: (row) => <span className={row.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}>₹{row.totalPnL.toLocaleString()}</span> },
    { header: 'Win Rate', key: 'winRate', render: (row) => `${row.winRate}%` },
    { header: 'Avg P&L', key: 'avgPnL', render: (row) => <span className={row.avgPnL >= 0 ? 'text-green-600' : 'text-red-600'}>₹{row.avgPnL}</span> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            TradingView Strategy Analyzer
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Upload your TradingView strategy report to analyze the most profitable time slots and optimize your trading schedule
          </p>
        </div>

        <div className="max-w-xl mx-auto mb-8">
          <div className="bg-white rounded-xl shadow-lg border-2 border-dashed border-gray-300 p-6 text-center hover:border-blue-400 transition-colors">
            <Upload className="mx-auto mb-3 text-gray-400" size={40} />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload TradingView Report</h3>
            <p className="text-gray-500 mb-4 text-sm">Upload your CSV file exported from TradingView strategy tester</p>
            
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-lg cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Upload size={18} />
              Choose CSV File
            </label>
            
            {file && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <CheckCircle size={18} />
                  <span className="font-medium text-sm">{file.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="max-w-xl mx-auto mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-3">
              <AlertCircle className="text-red-500" size={18} />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {isAnalyzing && (
          <div className="text-center mb-6">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
            <p className="text-gray-600">Analyzing your trading strategy...</p>
          </div>
        )}

        {results && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200 mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <BarChart3 size={18} />
                Strategy Report
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 font-medium block mb-1">Strategy:</span>
                  <span className="font-semibold text-blue-600">{results.fileInfo.strategyName}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium block mb-1">Symbol:</span>
                  <span className="font-semibold text-green-600">{results.fileInfo.symbol}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium block mb-1">Generated:</span>
                  <span className="font-semibold text-purple-600">{results.fileInfo.reportDate}</span>
                </div>
                <div>
                  <span className="text-gray-600 font-medium block mb-1">Date Range:</span>
                  <span className="font-semibold text-orange-600 text-xs">
                    {results.fileInfo.dateRange.start && results.fileInfo.dateRange.end ? 
                      `${results.fileInfo.dateRange.start} to ${results.fileInfo.dateRange.end}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-1">
                  <BarChart3 className="text-blue-600" size={16} />
                  <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Trades</h3>
                </div>
                <div className="text-xl font-bold text-blue-600">{results.totalTrades.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Exit trades analyzed</div>
              </div>
              
              <div className={`bg-gradient-to-br ${results.overallPerformance.totalPnL >= 0 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'} p-3 rounded-lg border ${results.overallPerformance.totalPnL >= 0 ? 'border-green-200' : 'border-red-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className={results.overallPerformance.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'} size={16} />
                  <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Overall P&L</h3>
                </div>
                <div className={`text-xl font-bold ${results.overallPerformance.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{results.overallPerformance.totalPnL.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Strategy performance</div>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="text-purple-600" size={16} />
                  <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">Win Rate</h3>
                </div>
                <div className="text-xl font-bold text-purple-600">{results.overallPerformance.winRate}%</div>
                <div className="text-xs text-gray-500">All trades</div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-3 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="text-orange-600" size={16} />
                  <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide">{timeSlotInterval}-Min Slots</h3>
                </div>
                <div className="text-xl font-bold text-orange-600">{results.totalSlots}</div>
                <div className="text-xs text-gray-500">≥2 trades each</div>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <AnalysisTypeSelector />
              <TimeSlotSelector />
              <ResultCountSelector />
              <div className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <button
                  onClick={() => handleIntradayToggle(!intradayOnly)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    intradayOnly
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  title="Filter to show only same-day trades"
                >
                  <span>{intradayOnly ? '✓' : '○'}</span>
                  <span>Intraday Trades Only</span>
                </button>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <button 
                onClick={exportToPDF}
                className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-600 text-white px-4 py-2.5 rounded-lg hover:from-red-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
              >
                <FileText size={18} />
                Export PDF
              </button>
              <button 
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2.5 rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
              >
                <Table size={18} />
                Export CSV
              </button>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <TabButton 
                id="profitability" 
                label="By Profitability" 
                icon={TrendingUp} 
                isActive={activeTab === 'profitability'} 
                onClick={setActiveTab} 
              />
              <TabButton 
                id="winrate" 
                label="By Win Rate" 
                icon={BarChart3} 
                isActive={activeTab === 'winrate'} 
                onClick={setActiveTab} 
              />
              <TabButton 
                id="profitfactor" 
                label="By Profit Factor" 
                icon={Clock} 
                isActive={activeTab === 'profitfactor'} 
                onClick={setActiveTab} 
              />
            </div>

            <div className="space-y-4">
              {activeTab === 'profitability' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    🏆 {resultCount === 'all' ? 'All' : `Top ${resultCount}`} Most Profitable {timeSlotInterval}-Minute {
                      analysisType === 'entry' ? 'Entry' : 
                      analysisType === 'exit' ? 'Exit' : 
                      'Entry→Exit Combo'
                    } Time Slots
                  </h2>
                  <div className="text-center mb-3">
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      📊 Click "Expand" to see weekly/monthly consistency for each time slot
                    </span>
                  </div>
                  <EnhancedResultsTable data={results.byProfitability} columns={profitabilityColumns} />
                </div>
              )}

              {activeTab === 'winrate' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    📈 {resultCount === 'all' ? 'All' : `Top ${resultCount}`} by Win Rate ({timeSlotInterval}-min {
                      analysisType === 'entry' ? 'entry' : 
                      analysisType === 'exit' ? 'exit' : 
                      'combo'
                    } slots, ≥5 trades)
                  </h2>
                  <div className="text-center mb-3">
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      📊 Click "Expand" to see weekly/monthly consistency for each time slot
                    </span>
                  </div>
                  <EnhancedResultsTable data={results.byWinRate} columns={winRateColumns} />
                </div>
              )}

              {activeTab === 'profitfactor' && (
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    ⚡ {resultCount === 'all' ? 'All' : `Top ${resultCount}`} by Profit Factor ({timeSlotInterval}-min {
                      analysisType === 'entry' ? 'entry' : 
                      analysisType === 'exit' ? 'exit' : 
                      'combo'
                    } slots, ≥5 trades)
                  </h2>
                  <div className="text-center mb-3">
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      📊 Click "Expand" to see weekly/monthly consistency for each time slot
                    </span>
                  </div>
                  <EnhancedResultsTable data={results.byProfitFactor} columns={profitFactorColumns} />
                </div>
              )}
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-200">
              <h3 className="text-xl font-bold text-gray-800 mb-4">🎯 Comprehensive Strategy Insights</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <h4 className="font-semibold text-purple-600 mb-3 text-sm flex items-center gap-2">📈 Performance Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Overall Result:</span>
                      <span className={`font-bold ${results.overallPerformance.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>₹{results.overallPerformance.totalPnL.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Win Rate:</span>
                      <span className="font-bold text-blue-600">{results.overallPerformance.winRate}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Winning Trades:</span>
                      <span className="font-semibold text-green-600">{Math.round(results.totalTrades * results.overallPerformance.winRate / 100)} / {results.totalTrades}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Avg Duration:</span>
                      <span className="font-bold text-orange-600">{Math.floor(results.comprehensiveInsights.tradeDuration.avgDuration / 60)}h {results.comprehensiveInsights.tradeDuration.avgDuration % 60}m</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Median Duration:</span>
                      <span className="font-semibold text-orange-500">{Math.floor(results.comprehensiveInsights.tradeDuration.medianDuration / 60)}h {results.comprehensiveInsights.tradeDuration.medianDuration % 60}m</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <h4 className="font-semibold text-orange-600 mb-3 text-sm flex items-center gap-2">⚠️ Risk & Drawdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Max Drawdown:</span>
                      <span className="font-bold text-red-600">₹{results.comprehensiveInsights.drawdownMetrics.maxDrawdown.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Current DD:</span>
                      <span className="font-semibold text-red-600">₹{results.comprehensiveInsights.drawdownMetrics.currentDrawdown.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Max Cons. Wins:</span>
                      <span className="font-bold text-green-600">{results.comprehensiveInsights.drawdownMetrics.maxConsecutiveWins}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Max Cons. Losses:</span>
                      <span className="font-bold text-red-600">{results.comprehensiveInsights.drawdownMetrics.maxConsecutiveLosses}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-xs text-gray-600">💡 DD % of Total: {results.overallPerformance.totalPnL !== 0 ? Math.abs((results.comprehensiveInsights.drawdownMetrics.maxDrawdown / Math.abs(results.overallPerformance.totalPnL)) * 100).toFixed(1) : '0'}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <h4 className="font-semibold text-purple-600 mb-3 text-sm flex items-center gap-2">📊 Best & Worst</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Best Week:</span>
                        <span className="font-mono text-purple-700 text-xs">{results.comprehensiveInsights.bestWeek?.period}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">P&L:</span>
                        <span className="text-green-600 font-semibold text-xs">₹{results.comprehensiveInsights.bestWeek?.totalPnL.toLocaleString()}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Best Month:</span>
                        <span className="font-mono text-purple-700 text-xs">{results.comprehensiveInsights.bestMonth?.period}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">P&L:</span>
                        <span className="text-green-600 font-semibold text-xs">₹{results.comprehensiveInsights.bestMonth?.totalPnL.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Worst Week:</span>
                        <span className="font-mono text-purple-700 text-xs">{results.comprehensiveInsights.worstWeek?.period}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">P&L:</span>
                        <span className="text-red-600 font-semibold text-xs">₹{results.comprehensiveInsights.worstWeek?.totalPnL.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-600 mb-3 text-sm flex items-center gap-2">🟢 Optimal Entry Times ({timeSlotInterval}m)</h4>
                  <div className="space-y-2">
                    {results.comprehensiveInsights.bestEntryTimes.map((slot, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-green-100 text-green-800 rounded text-xs flex items-center justify-center font-bold">{index + 1}</span>
                          <span className="font-mono font-bold text-green-700">{slot.timeSlot}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-green-600 font-semibold">₹{slot.totalPnL.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{slot.winRate.toFixed(1)}% • {slot.tradeCount} trades</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <h4 className="font-semibold text-red-600 mb-3 text-sm flex items-center gap-2">🔴 Optimal Exit Times ({timeSlotInterval}m)</h4>
                  <div className="space-y-2">
                    {results.comprehensiveInsights.bestExitTimes.map((slot, index) => (
                      <div key={index} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 bg-red-100 text-red-800 rounded text-xs flex items-center justify-center font-bold">{index + 1}</span>
                          <span className="font-mono font-bold text-red-700">{slot.timeSlot}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-red-600 font-semibold">₹{slot.totalPnL.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">{slot.winRate.toFixed(1)}% • {slot.tradeCount} trades</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                  <h4 className="font-semibold text-indigo-600 mb-2 text-sm flex items-center gap-2">🔍 Current Analysis</h4>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Viewing <strong>{analysisType === 'entry' ? 'Entry Time' : analysisType === 'exit' ? 'Exit Time' : 'Entry→Exit Combo'}</strong> analysis with <strong>{timeSlotInterval}m intervals</strong>.
                    {analysisType === 'entry' && ' Focus on these times for market monitoring.'}
                    {analysisType === 'exit' && ' Understand when profits are typically realized.'}
                    {analysisType === 'combo' && ' Identify complete profitable trading cycles.'}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                  <h4 className="font-semibold text-green-600 mb-2 text-sm flex items-center gap-2">💡 Key Tips</h4>
                  <ul className="text-sm text-gray-700 space-y-1 leading-relaxed">
                    <li>• <strong>Entry:</strong> {results.comprehensiveInsights.bestEntryTimes[0]?.timeSlot}</li>
                    <li>• <strong>Exit:</strong> {results.comprehensiveInsights.bestExitTimes[0]?.timeSlot}</li>
                    <li>• <strong>Duration:</strong> ~{Math.floor(results.comprehensiveInsights.tradeDuration.avgDuration / 60)}h {results.comprehensiveInsights.tradeDuration.avgDuration % 60}m</li>
                    <li>• <strong>Max DD:</strong> ₹{results.comprehensiveInsights.drawdownMetrics.maxDrawdown.toLocaleString()}</li>
                    <li>• <strong>Check details:</strong> Expand rows for consistency</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingViewStrategyAnalyzer;