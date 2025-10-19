import React, { useState, useCallback } from 'react';
import { Upload, TrendingUp, Clock, BarChart3, Download, AlertCircle, CheckCircle, Calendar, Target, Activity, FileText, Table, Menu, X, Settings, HelpCircle, Moon, Sun, ChevronDown, ChevronRight, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const ModernTradingAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeSlotInterval, setTimeSlotInterval] = useState(5);
  const [resultCount, setResultCount] = useState(15);
  const [analysisType, setAnalysisType] = useState('combo');
  const [intradayOnly, setIntradayOnly] = useState(false);
  const [cachedData, setCachedData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [toasts, setToasts] = useState([]);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [currentPageProfitability, setCurrentPageProfitability] = useState(1);
  const [currentPageWinRate, setCurrentPageWinRate] = useState(1);
  const [currentPageProfitFactor, setCurrentPageProfitFactor] = useState(1);

  // Multi-Strategy Comparison State
  const [strategies, setStrategies] = useState([]);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedStrategies, setSelectedStrategies] = useState([]);
  const [dragOverMulti, setDragOverMulti] = useState(false);
  const [comparisonResults, setComparisonResults] = useState(null);

  // Advanced Segmentation State (Phase 4)
  const [segmentationType, setSegmentationType] = useState('day'); // day, hour, symbol, direction, duration
  const [segmentationResults, setSegmentationResults] = useState(null);
  const [expandedSegment, setExpandedSegment] = useState(null);

  // Enhanced Heatmaps State (Phase 3)
  const [heatmapResolution, setHeatmapResolution] = useState(15); // 1, 5, 15, 30, 60 minutes
  const [heatmapMetric, setHeatmapMetric] = useState('pnl'); // pnl, winrate, trades
  const [heatmapResults, setHeatmapResults] = useState(null);

  // Exit & Stop Optimization State (Phase 6)
  const [stopLossPercent, setStopLossPercent] = useState(1);
  const [takeProfitPercent, setTakeProfitPercent] = useState(2);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [optimizationMode, setOptimizationMode] = useState('manual'); // manual or auto
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Trade Clustering & Correlation State (Phase 2)
  const [clusteringResults, setClusteringResults] = useState(null);
  const [clusteringType, setClusteringType] = useState('outcome'); // outcome, entryPattern, symbol, timeOfDay
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [correlationMetric, setCorrelationMetric] = useState('pnl'); // pnl, winrate, duration

  // Weakness Detection State (Phase 5)
  const [weaknessResults, setWeaknessResults] = useState(null);
  const [weaknessMetric, setWeaknessMetric] = useState('pnl'); // pnl, winrate, drawdown
  const [weaknessThreshold, setWeaknessThreshold] = useState(30); // percentage below average
  const [selectedWeakness, setSelectedWeakness] = useState(null);

  // Balanced Optimization State (Phase 7)
  const [balancedOptimizationResults, setBalancedOptimizationResults] = useState(null);
  const [optimizationObjective, setOptimizationObjective] = useState('sharpe'); // sharpe, profitfactor, riskadjusted
  const [maxDrawdownTarget, setMaxDrawdownTarget] = useState(20); // percentage
  const [minWinRateTarget, setMinWinRateTarget] = useState(40); // percentage
  const [isBalancedOptimizing, setIsBalancedOptimizing] = useState(false);

  // Consolidated Tab View State (Phase 2 - Tab Consolidation)
  const [performanceView, setPerformanceView] = useState('profitability'); // profitability, winrate, profitfactor
  const [timePatternsView, setTimePatternsView] = useState('segmentation'); // segmentation, heatmap
  const [optimizationView, setOptimizationView] = useState('exit'); // exit, balanced
  const [insightsView, setInsightsView] = useState('clustering'); // clustering, weakness

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

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

  // Helper function to apply intraday filter to trades
  const getFilteredTrades = useCallback((trades) => {
    if (!trades) return [];

    if (intradayOnly) {
      return trades.filter(trade => {
        const entryDate = new Date(trade.entryTime).toISOString().split('T')[0];
        const exitDate = new Date(trade.exitTime).toISOString().split('T')[0];
        return entryDate === exitDate;
      });
    }

    return trades;
  }, [intradayOnly]);

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
        throw new Error('No exit trades found.');
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
        throw new Error('No complete trade pairs found.');
      }

      const dateRange = getDateRange(entryTrades);

      setCachedData({ fileInfo, completeTrades, dateRange });
      setIsAnalyzing(true);
      performAnalysis(completeTrades, fileInfo, dateRange);
    } catch (err) {
      addToast(err.message, 'error');
      setIsAnalyzing(false);
    }
  };

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

      setResults({
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
      });

      addToast('Analysis complete!', 'success');
      setIsAnalyzing(false);
    } catch (err) {
      addToast(err.message, 'error');
      setIsAnalyzing(false);
    }
  }, [intradayOnly, timeSlotInterval, analysisType]);

  // Calculate metrics for a single strategy (used in comparison)
  const calculateStrategyMetrics = (trades) => {
    if (trades.length === 0) return null;

    // Ensure pnl values are numbers
    const validTrades = trades.filter(t => {
      const pnl = parseFloat(t.pnl);
      return !isNaN(pnl);
    }).map(t => ({
      ...t,
      pnl: parseFloat(t.pnl)
    }));

    if (validTrades.length === 0) return null;

    const totalPnL = validTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winRate = (validTrades.filter(t => t.pnl > 0).length / validTrades.length) * 100;
    const averagePnL = totalPnL / validTrades.length;

    // Profit Factor
    const grossProfit = validTrades.filter(t => t.pnl > 0).reduce((sum, t) => sum + t.pnl, 0);
    const grossLoss = Math.abs(validTrades.filter(t => t.pnl < 0).reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 1 : 0);

    // Sharpe Ratio (simplified - daily returns)
    const dailyReturns = {};
    validTrades.forEach(trade => {
      try {
        const entryTime = trade.entryTime || trade['Date/Time'];
        if (!entryTime) return;

        const dateObj = new Date(entryTime);
        if (isNaN(dateObj.getTime())) return;

        const date = dateObj.toISOString().split('T')[0];
        if (!dailyReturns[date]) dailyReturns[date] = 0;
        dailyReturns[date] += trade.pnl;
      } catch (e) {
        // Skip trades with invalid dates
      }
    });

    const dailyReturnValues = Object.values(dailyReturns);
    let sharpeRatio = 0;
    if (dailyReturnValues.length > 0) {
      const meanReturn = dailyReturnValues.reduce((a, b) => a + b, 0) / dailyReturnValues.length;
      const variance = dailyReturnValues.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / dailyReturnValues.length;
      const stdDev = Math.sqrt(variance) || 1;
      sharpeRatio = Math.round((meanReturn / stdDev) * 100) / 100;
    }

    // Consecutive wins/losses
    let maxConsecutiveWins = 0;
    let maxConsecutiveLosses = 0;
    let currentWins = 0;
    let currentLosses = 0;

    validTrades.forEach(trade => {
      if (trade.pnl > 0) {
        currentWins++;
        currentLosses = 0;
        maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWins);
      } else if (trade.pnl < 0) {
        currentLosses++;
        currentWins = 0;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLosses);
      } else {
        currentWins = 0;
        currentLosses = 0;
      }
    });

    // Drawdown
    let peak = 0;
    let maxDrawdown = 0;
    let cumulativePnL = 0;

    validTrades.forEach(trade => {
      cumulativePnL += trade.pnl;
      if (cumulativePnL > peak) {
        peak = cumulativePnL;
      }
      const drawdown = peak - cumulativePnL;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    });

    // Trade duration
    let avgTradeDuration = 0;
    const validDurations = [];
    validTrades.forEach(t => {
      try {
        const entryTime = t.entryTime || t['Date/Time'];
        const exitTime = t.exitTime;
        if (!entryTime || !exitTime) return;

        const start = new Date(entryTime).getTime();
        const end = new Date(exitTime).getTime();

        if (isNaN(start) || isNaN(end)) return;

        const duration = (end - start) / (1000 * 60); // in minutes
        if (duration >= 0) {
          validDurations.push(duration);
        }
      } catch (e) {
        // Skip trades with invalid dates
      }
    });

    if (validDurations.length > 0) {
      avgTradeDuration = validDurations.reduce((a, b) => a + b, 0) / validDurations.length;
    }

    return {
      totalTrades: trades.length,
      totalPnL: Math.round(totalPnL),
      winRate: Math.round(winRate * 100) / 100,
      averagePnL: Math.round(averagePnL * 100) / 100,
      profitFactor: Math.round(profitFactor * 100) / 100,
      sharpeRatio: sharpeRatio,
      maxDrawdown: Math.round(maxDrawdown * 100) / 100,
      maxConsecutiveWins: maxConsecutiveWins,
      maxConsecutiveLosses: maxConsecutiveLosses,
      avgTradeDuration: Math.round(avgTradeDuration * 100) / 100
    };
  };

  // Compare multiple strategies
  const compareStrategies = useCallback(async () => {
    if (selectedStrategies.length < 2) {
      addToast('Select at least 2 strategies to compare', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const strategyComparisons = [];

      for (const strategyId of selectedStrategies) {
        const strategy = strategies.find(s => s.id === strategyId);
        if (!strategy) continue;

        // FIX: Apply intraday filter to strategy trades before calculating metrics
        const filteredTrades = getFilteredTrades(strategy.trades);
        const metrics = calculateStrategyMetrics(filteredTrades);
        if (metrics) {
          strategyComparisons.push({
            id: strategyId,
            name: strategy.fileInfo.strategyName,
            symbol: strategy.fileInfo.symbol,
            metrics: metrics
          });
        }
      }

      if (strategyComparisons.length < 2) {
        addToast('Could not analyze selected strategies', 'error');
        return;
      }

      // Determine best strategies by different metrics
      const bestByPnL = strategyComparisons.reduce((prev, current) =>
        (prev.metrics.totalPnL > current.metrics.totalPnL) ? prev : current
      );

      const bestByWinRate = strategyComparisons.reduce((prev, current) =>
        (prev.metrics.winRate > current.metrics.winRate) ? prev : current
      );

      const bestByProfitFactor = strategyComparisons.reduce((prev, current) =>
        (prev.metrics.profitFactor > current.metrics.profitFactor) ? prev : current
      );

      const bestBySharpe = strategyComparisons.reduce((prev, current) =>
        (prev.metrics.sharpeRatio > current.metrics.sharpeRatio) ? prev : current
      );

      // Sort by profit factor for overall ranking
      const ranking = [...strategyComparisons].sort((a, b) => b.metrics.profitFactor - a.metrics.profitFactor);

      // Mark strategies as analyzed
      setStrategies(prev => prev.map(s => ({
        ...s,
        analyzed: selectedStrategies.includes(s.id)
      })));

      // Store comparison results
      setComparisonResults({
        strategies: strategyComparisons,
        bestByPnL,
        bestByWinRate,
        bestByProfitFactor,
        bestBySharpe,
        ranking
      });

      addToast(`Comparison complete: ${strategyComparisons.length} strategies analyzed`, 'success');

    } catch (err) {
      addToast('Error comparing strategies: ' + err.message, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [strategies, selectedStrategies, intradayOnly]);

  // Advanced Segmentation Analysis (Phase 4)
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

    setSegmentationResults({
      segmentationType,
      segments: segmentAnalysis,
      totalSegments: segmentAnalysis.length
    });

    addToast(`Segmentation analysis complete: ${segmentAnalysis.length} segments analyzed`, 'success');
  }, [cachedData, results, segmentationType, getFilteredTrades]);

  // Enhanced Heatmap Analysis (Phase 3)
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

    setHeatmapResults({
      data: heatmapData,
      resolution: heatmapResolution,
      metric: heatmapMetric
    });

    addToast(`Heatmap generated: ${heatmapData.length} time slots analyzed`, 'success');
  }, [cachedData, heatmapResolution, heatmapMetric, getFilteredTrades]);

  // Exit & Stop Optimization (Phase 6)
  const performExitOptimization = useCallback(() => {
    if (!cachedData || !cachedData.completeTrades) return;

    setIsOptimizing(true);

    try {
      const trades = getFilteredTrades(cachedData.completeTrades);
      const results = [];

      // If in auto mode, grid search through combinations
      const stopLossValues = optimizationMode === 'auto'
        ? [0.5, 1, 1.5, 2, 2.5, 3, 4, 5]
        : [stopLossPercent];

      const takeProfitValues = optimizationMode === 'auto'
        ? [1, 2, 3, 4, 5, 6, 8, 10]
        : [takeProfitPercent];

      stopLossValues.forEach(sl => {
        takeProfitValues.forEach(tp => {
          let totalPnL = 0;
          let wins = 0;
          let losses = 0;
          let winPnL = 0;
          let lossPnL = 0;

          trades.forEach(trade => {
            const pnl = parseFloat(trade.pnl) || 0;

            // Simulate with stop loss and take profit
            if (pnl > tp) {
              // Would hit take profit
              totalPnL += tp;
              wins++;
              winPnL += tp;
            } else if (pnl < -sl) {
              // Would hit stop loss
              totalPnL -= sl;
              losses++;
              lossPnL -= sl;
            } else {
              // Trade closes at actual P&L
              totalPnL += pnl;
              if (pnl > 0) {
                wins++;
                winPnL += pnl;
              } else {
                losses++;
                lossPnL += pnl;
              }
            }
          });

          const totalTrades = wins + losses;
          const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
          const profitFactor = lossPnL !== 0 ? winPnL / Math.abs(lossPnL) : (winPnL > 0 ? 1 : 0);

          results.push({
            stopLoss: sl,
            takeProfit: tp,
            totalPnL: Math.round(totalPnL),
            totalTrades,
            wins,
            losses,
            winRate: Math.round(winRate * 100) / 100,
            profitFactor: Math.round(profitFactor * 100) / 100
          });
        });
      });

      // Sort by profit factor for best results
      results.sort((a, b) => b.profitFactor - a.profitFactor);

      setOptimizationResults({
        configurations: results,
        bestConfig: results[0],
        currentConfig: { stopLoss: stopLossPercent, takeProfit: takeProfitPercent },
        isGridSearch: optimizationMode === 'auto'
      });

      addToast(`Optimization complete: ${results.length} configurations evaluated`, 'success');
    } catch (err) {
      addToast('Error optimizing: ' + err.message, 'error');
    } finally {
      setIsOptimizing(false);
    }
  }, [cachedData, stopLossPercent, takeProfitPercent, optimizationMode, getFilteredTrades]);

  // Trade Clustering & Correlation Analysis (Phase 2)
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

    setClusteringResults({
      clusters,
      clusterMetrics,
      correlationData,
      type: clusteringType,
      totalTrades: trades.length
    });

    addToast(`Trade clustering complete: ${Object.keys(clusters).length} clusters identified`, 'success');
  }, [cachedData, clusteringType, getFilteredTrades]);

  // Weakness Detection Analysis (Phase 5)
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

    setWeaknessResults({
      weaknesses,
      totalWeaknesses: weaknesses.length,
      averageMetrics: { avgPnL: Math.round(avgPnL), avgWinRate: avgWinRate.toFixed(1) },
      threshold: weaknessThreshold
    });

    addToast(`Weakness detection complete: ${weaknesses.length} weaknesses identified`, 'success');
  }, [cachedData, weaknessThreshold, getFilteredTrades]);

  // Balanced Optimization Analysis (Phase 7)
  const performBalancedOptimization = useCallback(() => {
    if (!cachedData || !cachedData.completeTrades) return;

    setIsBalancedOptimizing(true);

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
              let adjustedPnL = pnl;

              // Apply stop-loss and take-profit limits
              if (pnl > tp) {
                adjustedPnL = tp;
              } else if (pnl < -sl) {
                adjustedPnL = -sl;
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

      setBalancedOptimizationResults({
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
      });

      addToast(`Optimization complete: ${topConfigs.length} optimal configurations found`, 'success');
    } catch (err) {
      addToast('Error during optimization: ' + err.message, 'error');
    } finally {
      setIsBalancedOptimizing(false);
    }
  }, [cachedData, optimizationObjective, maxDrawdownTarget, minWinRateTarget, getFilteredTrades]);

  const handleFileUpload = useCallback(async (event) => {
    const uploadedFile = event.target.files[0];
    if (!uploadedFile) return;

    if (!uploadedFile.name.endsWith('.csv')) {
      addToast('Please upload a CSV file', 'error');
      return;
    }

    setFile(uploadedFile);

    try {
      const text = await uploadedFile.text();
      await parseAndCacheData(text, uploadedFile.name);
    } catch (err) {
      addToast('Error reading file: ' + err.message, 'error');
    }
  }, []);

  // Multi-file upload handler for strategy comparison
  const handleMultiFileUpload = useCallback(async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    if (uploadedFiles.length === 0) return;

    // Limit to 5 files
    if (uploadedFiles.length > 5) {
      addToast('Maximum 5 strategies can be compared', 'error');
      return;
    }

    // Check all files are CSV
    const invalidFiles = uploadedFiles.filter(f => !f.name.endsWith('.csv'));
    if (invalidFiles.length > 0) {
      addToast('All files must be CSV format', 'error');
      return;
    }

    // Check current count + new files don't exceed 5
    if (strategies.length + uploadedFiles.length > 5) {
      addToast(`Can only add ${5 - strategies.length} more strategies`, 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      for (const uploadedFile of uploadedFiles) {
        const text = await uploadedFile.text();
        const fileInfo = parseFileName(uploadedFile.name);

        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

        // Find indices of key columns
        const tradeNumIndex = headers.findIndex(h => h === 'Trade #');
        const typeIndex = headers.findIndex(h => h === 'Type');
        const dateTimeIndex = headers.findIndex(h => h === 'Date/Time');
        const pnlIndex = headers.findIndex(h => h.includes('Net P&L') || h.includes('P&L'));

        const trades = [];
        const tradePairs = {};
        const allEntryTrades = []; // Track entry trades for date range calculation

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',').map(v => v?.trim().replace(/"/g, ''));

          const tradeNum = values[tradeNumIndex];
          const type = values[typeIndex];
          const dateTime = values[dateTimeIndex];
          const pnl = parseFloat(values[pnlIndex]) || 0;

          if (!tradeNum || !type || !dateTime) continue;

          // Store entry trades for date range calculation
          if (type.toLowerCase().includes('entry')) {
            allEntryTrades.push({ 'Date/Time': dateTime });
          }

          if (!tradePairs[tradeNum]) {
            tradePairs[tradeNum] = {};
          }

          if (type.toLowerCase().includes('entry')) {
            tradePairs[tradeNum].entryTime = dateTime;
          } else if (type.toLowerCase().includes('exit')) {
            tradePairs[tradeNum].exitTime = dateTime;
            tradePairs[tradeNum].pnl = pnl;
          }
        }

        // Create complete trade pairs
        for (const tradeNum in tradePairs) {
          const pair = tradePairs[tradeNum];
          if (pair.entryTime && pair.exitTime) {
            trades.push({
              tradeNumber: tradeNum,
              entryTime: pair.entryTime,
              exitTime: pair.exitTime,
              pnl: pair.pnl || 0
            });
          }
        }

        if (trades.length === 0) {
          addToast(`No valid trades found in ${uploadedFile.name}`, 'error');
          continue;
        }

        // Calculate date range for this strategy
        const dateRange = getDateRange(allEntryTrades);

        // Enhance fileInfo with period and generatedDate
        const enhancedFileInfo = {
          ...fileInfo,
          period: dateRange.start && dateRange.end
            ? `${dateRange.start} to ${dateRange.end}`
            : 'Unknown Period',
          generatedDate: fileInfo.reportDate || 'Unknown Date',
          dateRange: dateRange
        };

        // Create a strategy entry
        const strategyId = Date.now() + Math.random();
        const newStrategy = {
          id: strategyId,
          fileName: uploadedFile.name,
          fileInfo: enhancedFileInfo,
          trades,
          analyzed: false
        };

        setStrategies(prev => [...prev, newStrategy]);
        addToast(`Added strategy: ${enhancedFileInfo.strategyName}`, 'success');
      }
    } catch (err) {
      addToast('Error reading files: ' + err.message, 'error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [strategies.length]);

  // Remove strategy from comparison list
  const removeStrategy = useCallback((strategyId) => {
    setStrategies(prev => prev.filter(s => s.id !== strategyId));
    setSelectedStrategies(prev => prev.filter(id => id !== strategyId));
    addToast('Strategy removed', 'info');
  }, []);

  // Toggle strategy selection
  const toggleStrategySelection = useCallback((strategyId) => {
    setSelectedStrategies(prev => {
      if (prev.includes(strategyId)) {
        return prev.filter(id => id !== strategyId);
      } else if (prev.length < 5) {
        return [...prev, strategyId];
      }
      return prev;
    });
  }, []);

  React.useEffect(() => {
    if (cachedData) {
      performAnalysis(cachedData.completeTrades, cachedData.fileInfo, cachedData.dateRange);
      // Auto-run balanced optimization with default settings
      setTimeout(() => {
        setOptimizationObjective('sharpe');
        setMaxDrawdownTarget(25);
        setMinWinRateTarget(45);
      }, 500);
    }
  }, [cachedData, performAnalysis, timeSlotInterval, analysisType, intradayOnly]);

  React.useEffect(() => {
    // Auto-run balanced optimization when defaults are set
    if (cachedData && !balancedOptimizationResults) {
      const runOptimization = async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        performBalancedOptimization();
      };
      runOptimization();
    }
  }, [cachedData]);

  // FIX: Auto-trigger Weakness Detection when metric changes
  React.useEffect(() => {
    if (cachedData && weaknessResults && activeTab === 'insights' && insightsView === 'weakness') {
      performWeaknessDetection();
    }
  }, [weaknessMetric, weaknessThreshold]);

  // FIX: Auto-trigger Trade Clustering when type changes
  React.useEffect(() => {
    if (cachedData && activeTab === 'insights' && insightsView === 'clustering') {
      performTradeClusteringAnalysis();
    }
  }, [clusteringType]);

  // FIX: Auto-trigger Segmentation when type changes
  React.useEffect(() => {
    if (cachedData && activeTab === 'timepatterns' && timePatternsView === 'segmentation') {
      performSegmentationAnalysis();
    }
  }, [segmentationType]);

  // FIX: Auto-trigger Heatmap when resolution/metric changes
  React.useEffect(() => {
    if (cachedData && activeTab === 'timepatterns' && timePatternsView === 'heatmap') {
      performEnhancedHeatmapAnalysis();
    }
  }, [heatmapResolution, heatmapMetric]);

  const exportToCSV = () => {
    if (!results) return;

    const sheets = {};
    const currentData = activeTab === 'profitability' ? results.byProfitability : 
                       activeTab === 'winrate' ? results.byWinRate : results.byProfitFactor;

    sheets['Summary'] = [
      ['TRADINGVIEW STRATEGY ANALYSIS REPORT'],
      [''],
      ['Strategy', results.fileInfo.strategyName],
      ['Symbol', results.fileInfo.symbol],
      ['Report Date', results.fileInfo.reportDate],
      ['Date Range', `${results.fileInfo.dateRange.start} to ${results.fileInfo.dateRange.end}`],
      [''],
      ['OVERALL PERFORMANCE'],
      ['Total Trades', results.totalTrades],
      ['Total P&L', results.overallPerformance.totalPnL],
      ['Win Rate (%)', results.overallPerformance.winRate],
      [''],
      ['RISK METRICS'],
      ['Sharpe Ratio', results.sharpeAndSortino.sharpeRatio],
      ['Sortino Ratio', results.sharpeAndSortino.sortinoRatio],
      ['Average Win', results.riskReward.avgWin],
      ['Average Loss', results.riskReward.avgLoss],
      ['Risk/Reward Ratio', results.riskReward.riskRewardRatio]
    ];

    sheets['Time Slots'] = [
      ['Time Slot Performance'],
      ['Rank', 'Time Slot', 'Total P&L', 'Trades', 'Win Rate (%)', 'Avg P&L', 'Profit Factor'],
      ...currentData.map((slot, index) => [
        index + 1,
        slot.timeSlot,
        slot.totalPnL,
        slot.tradeCount,
        slot.winRate,
        slot.avgPnL,
        slot.profitFactor
      ])
    ];

    sheets['Day of Week'] = [
      ['Day of Week Performance'],
      ['Day', 'Total P&L', 'Trades', 'Win Rate (%)'],
      ...results.dayOfWeek.map(day => [day.day, day.totalPnL, day.trades, day.winRate])
    ];

    sheets['Hourly'] = [
      ['Hourly Performance'],
      ['Hour', 'Total P&L', 'Trades', 'Win Rate (%)', 'Avg P&L'],
      ...results.hourHeatmap.map(hour => [`${hour.hour}:00`, hour.totalPnL, hour.trades, hour.winRate, hour.avgPnL])
    ];

    let csvContent = '';
    Object.keys(sheets).forEach((sheetName, sheetIndex) => {
      if (sheetIndex > 0) csvContent += '\n\n---\n\n';
      csvContent += `${sheetName}\n`;
      sheets[sheetName].forEach(row => {
        csvContent += row.map(cell => {
          if (cell === null || cell === undefined) return '';
          const cellStr = cell.toString();
          if (cellStr.includes(',') || cellStr.includes('"')) {
            return `"${cellStr.replace(/"/g, '""')}"`;
          }
          return cellStr;
        }).join(',') + '\n';
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${results.fileInfo.strategyName.replace(/\s+/g, '_')}_Analysis_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addToast('CSV exported successfully', 'success');
  };

  const exportToPDF = () => {
    if (!results) return;
    const currentData = activeTab === 'profitability' ? results.byProfitability : 
                       activeTab === 'winrate' ? results.byWinRate : results.byProfitFactor;
    
    let content = `TradingView Strategy Analysis Report
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

TIME SLOT ANALYSIS
==================`;

    content += '\nRank\tTime Slot\tTotal P&L\tTrades\tWin Rate\tAvg P&L\tProfit Factor\n';
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
    addToast('PDF exported successfully', 'success');
  };

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  // Pagination helper
  const getPaginatedData = (allData, currentPage, pageSize) => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return allData.slice(start, end);
  };

  const getTotalPages = (dataLength, pageSize) => {
    return Math.ceil(dataLength / pageSize);
  };

  const Toast = ({ toast }) => {
    const bgColor = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    }[toast.type] || 'bg-blue-500';

    return (
      <div className={`${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in`}>
        {toast.type === 'success' && <CheckCircle size={18} />}
        {toast.type === 'error' && <AlertCircle size={18} />}
        <span className="text-sm">{toast.message}</span>
      </div>
    );
  };

  const KPICard = ({ title, value, subtitle, icon: Icon, color }) => (
    <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          {subtitle && <p className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'} mt-1`}>{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <Icon size={20} className={color} />
        </div>
      </div>
    </div>
  );

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  // CONSOLIDATED NAVIGATION TABS (Reduced from 12 to 7)
  const navTabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'performance', label: 'Performance Analysis', icon: TrendingUp },
    { id: 'analytics', label: 'Advanced Analytics', icon: Activity },
    { id: 'timepatterns', label: 'Time Patterns', icon: Calendar },
    { id: 'optimization', label: 'Optimization', icon: Target },
    { id: 'insights', label: 'Trade Insights', icon: AlertCircle },
    { id: 'comparison', label: 'Strategy Comparison', icon: BarChart3 },
  ];

  return (
    <div className={`min-h-screen ${bgColor} transition-colors duration-300`}>
      {/* Toast Container */}
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} />
        ))}
      </div>

      {/* Header */}
      <header className={`${cardBg} border-b ${borderColor} sticky top-0 z-40 transition-colors duration-300`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Simplifyed TradeAnalytics
              </h1>
              <p className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Strategy Performance Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-100 text-gray-600'} transition-colors`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowHelpModal(true)}
              className={`p-2 rounded-lg hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
              title="Help & Guide"
            >
              <HelpCircle size={20} />
            </button>
            <button className={`p-2 rounded-lg hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}>
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Horizontal Navigation Bar */}
      <nav className={`${cardBg} border-b ${borderColor} sticky top-[70px] z-30`}>
        <div className="px-6 py-3 flex items-center justify-center gap-2 relative">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-lg transition-colors flex-shrink-0 absolute left-6`}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2 whitespace-nowrap overflow-x-auto">
            {navTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium flex-shrink-0 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                      : `${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} ${cardBg} border-r ${borderColor} transition-all duration-300 overflow-hidden sticky top-0 h-screen`}>
          <div className="p-4 space-y-2 overflow-y-auto h-full">
            <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase`}>Configuration</div>

            {/* GLOBAL FILTER - Always Visible */}
            <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-blue-900/30 border-2 border-blue-500' : 'bg-blue-50 border-2 border-blue-400'}`}>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={intradayOnly}
                  onChange={(e) => setIntradayOnly(e.target.checked)}
                  className="w-4 h-4"
                />
                <div>
                  <span className={`text-sm font-semibold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Intraday Only</span>
                  <p className={`text-xs ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5`}>Exclude multi-day trades</p>
                </div>
              </label>
            </div>

            {/* Time-Based Analysis Controls - Only for tabs that use them */}
            {['overview', 'performance', 'analytics'].includes(activeTab) && (
              <>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Analysis Type</p>
                  <select
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value)}
                    className={`w-full px-2 py-1 rounded text-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                  >
                    <option value="combo">Entry→Exit Combo</option>
                    <option value="entry">Entry Time</option>
                    <option value="exit">Exit Time</option>
                  </select>
                </div>

                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Interval (minutes)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 3, 5, 15, 30, 60].map(interval => (
                      <button
                        key={interval}
                        onClick={() => setTimeSlotInterval(interval)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          timeSlotInterval === interval
                            ? 'bg-blue-500 text-white'
                            : `${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`
                        }`}
                      >
                        {interval}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Show Results</p>
                  <select
                    value={resultCount}
                    onChange={(e) => {
                      const newValue = e.target.value === 'all' ? 'all' : parseInt(e.target.value);
                      setResultCount(newValue);
                      setCurrentPageProfitability(1);
                      setCurrentPageWinRate(1);
                      setCurrentPageProfitFactor(1);
                    }}
                    className={`w-full px-2 py-1 rounded text-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                  >
                    <option value={10}>Top 10</option>
                    <option value={15}>Top 15</option>
                    <option value={25}>Top 25</option>
                    <option value={50}>Top 50</option>
                    <option value={100}>Top 100</option>
                    <option value="all">All</option>
                  </select>
                </div>
              </>
            )}

            {/* Performance View Toggle - Only on Performance Analysis tab */}
            {activeTab === 'performance' && results && (
              <>
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase mt-4`}>View Mode</div>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-2">
                    {[
                      { value: 'profitability', label: '💰 By Profitability' },
                      { value: 'winrate', label: '🎯 By Win Rate' },
                      { value: 'profitfactor', label: '⚡ By Profit Factor' }
                    ].map(view => (
                      <button
                        key={view.value}
                        onClick={() => setPerformanceView(view.value)}
                        className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors text-left ${
                          performanceView === view.value
                            ? 'bg-blue-500 text-white'
                            : `${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Time Patterns View Toggle */}
            {activeTab === 'timepatterns' && results && (
              <>
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase mt-4`}>Analysis Type</div>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-2">
                    {[
                      { value: 'segmentation', label: '📊 Segmentation' },
                      { value: 'heatmap', label: '🔥 Heatmap' }
                    ].map(view => (
                      <button
                        key={view.value}
                        onClick={() => setTimePatternsView(view.value)}
                        className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors text-left ${
                          timePatternsView === view.value
                            ? 'bg-blue-500 text-white'
                            : `${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Heatmap Configuration - Only visible when heatmap view is active */}
            {activeTab === 'timepatterns' && timePatternsView === 'heatmap' && results && (
              <>
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase mt-4`}>Heatmap Settings</div>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Time Resolution</p>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 5, 15, 30, 60].map(res => (
                      <button
                        key={res}
                        onClick={() => {
                          setHeatmapResolution(res);
                          setTimeout(() => performEnhancedHeatmapAnalysis(), 0);
                        }}
                        className={`px-1 py-1 rounded text-xs font-medium transition-colors ${
                          heatmapResolution === res
                            ? 'bg-blue-500 text-white'
                            : `${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`
                        }`}
                      >
                        {res}m
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Display Metric</p>
                  {[
                    { value: 'pnl', label: 'P&L' },
                    { value: 'winrate', label: 'Win Rate %' },
                    { value: 'trades', label: 'Trade Count' }
                  ].map(metric => (
                    <label key={metric.value} className="flex items-center gap-2 mb-2 cursor-pointer">
                      <input
                        type="radio"
                        name="heatmapMetric"
                        value={metric.value}
                        checked={heatmapMetric === metric.value}
                        onChange={() => {
                          setHeatmapMetric(metric.value);
                          setTimeout(() => performEnhancedHeatmapAnalysis(), 0);
                        }}
                        className="w-3 h-3"
                      />
                      <span className={`text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{metric.label}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* Segmentation Configuration - Only visible when segmentation view is active */}
            {activeTab === 'timepatterns' && timePatternsView === 'segmentation' && results && (
              <>
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase mt-4`}>Segmentation</div>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Segment By</p>
                  <div className="space-y-2">
                    {[
                      { value: 'day', label: '📅 Day of Week', icon: '📅' },
                      { value: 'hour', label: '🕐 Hour of Day', icon: '🕐' },
                      { value: 'direction', label: '📊 P&L Direction', icon: '📊' },
                      { value: 'duration', label: '⏱️ Trade Duration', icon: '⏱️' }
                    ].map(seg => (
                      <button
                        key={seg.value}
                        onClick={() => setSegmentationType(seg.value)}
                        className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors text-left ${
                          segmentationType === seg.value
                            ? 'bg-blue-500 text-white'
                            : `${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`
                        }`}
                      >
                        {seg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Optimization View Toggle */}
            {activeTab === 'optimization' && results && (
              <>
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase mt-4`}>Optimization Type</div>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-2">
                    {[
                      { value: 'exit', label: '🎯 Exit & Stop' },
                      { value: 'balanced', label: '⚖️ Balanced' }
                    ].map(view => (
                      <button
                        key={view.value}
                        onClick={() => setOptimizationView(view.value)}
                        className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors text-left ${
                          optimizationView === view.value
                            ? 'bg-blue-500 text-white'
                            : `${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Exit Optimization Configuration - Only when exit view active */}
            {activeTab === 'optimization' && optimizationView === 'exit' && results && (
              <>
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase mt-4`}>Exit Settings</div>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Mode</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['manual', 'auto'].map(mode => (
                      <button
                        key={mode}
                        onClick={() => setOptimizationMode(mode)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          optimizationMode === mode
                            ? 'bg-blue-500 text-white'
                            : `${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {optimizationMode === 'manual' && (
                  <>
                    <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Stop Loss %</p>
                      <input
                        type="number"
                        value={stopLossPercent}
                        onChange={(e) => setStopLossPercent(parseFloat(e.target.value))}
                        step="0.5"
                        min="0.5"
                        max="10"
                        className={`w-full px-2 py-1 rounded text-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                      />
                    </div>

                    <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                      <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Take Profit %</p>
                      <input
                        type="number"
                        value={takeProfitPercent}
                        onChange={(e) => setTakeProfitPercent(parseFloat(e.target.value))}
                        step="0.5"
                        min="1"
                        max="20"
                        className={`w-full px-2 py-1 rounded text-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={performExitOptimization}
                  disabled={isOptimizing}
                  className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
                </button>
              </>
            )}

            {/* Trade Insights View Toggle */}
            {activeTab === 'insights' && results && (
              <>
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase mt-4`}>Analysis Type</div>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <div className="space-y-2">
                    {[
                      { value: 'clustering', label: '🔗 Trade Clustering' },
                      { value: 'weakness', label: '⚠️ Weakness Detection' }
                    ].map(view => (
                      <button
                        key={view.value}
                        onClick={() => setInsightsView(view.value)}
                        className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors text-left ${
                          insightsView === view.value
                            ? 'bg-blue-500 text-white'
                            : `${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`
                        }`}
                      >
                        {view.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Clustering Configuration - Only when clustering view active */}
            {activeTab === 'insights' && insightsView === 'clustering' && results && (
              <>
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase mt-4`}>Clustering</div>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Cluster By</p>
                  <div className="space-y-2">
                    {[
                      { value: 'outcome', label: '📊 Outcome (Win/Loss)' },
                      { value: 'entryPattern', label: '🕐 Entry Pattern' },
                      { value: 'hourOfDay', label: '⏰ Hour of Day' },
                      { value: 'dayOfWeek', label: '📅 Day of Week' },
                      { value: 'month', label: '📆 Month' }
                    ].map(cluster => (
                      <button
                        key={cluster.value}
                        onClick={() => setClusteringType(cluster.value)}
                        className={`w-full px-3 py-2 rounded text-xs font-medium transition-colors text-left ${
                          clusteringType === cluster.value
                            ? 'bg-blue-500 text-white'
                            : `${darkMode ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`
                        }`}
                      >
                        {cluster.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Weakness Detection Configuration - Only when weakness view active */}
            {activeTab === 'insights' && insightsView === 'weakness' && results && (
              <>
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase mt-4`}>Weakness Detection</div>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Detection Metric</p>
                  <select
                    value={weaknessMetric}
                    onChange={(e) => setWeaknessMetric(e.target.value)}
                    className={`w-full px-2 py-1 rounded text-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                  >
                    <option value="pnl">P&L Deviation</option>
                    <option value="winrate">Win Rate</option>
                    <option value="drawdown">Drawdown</option>
                  </select>
                </div>

                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    Threshold: {weaknessThreshold}%
                  </p>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    step="5"
                    value={weaknessThreshold}
                    onChange={(e) => setWeaknessThreshold(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={performWeaknessDetection}
                  className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium"
                >
                  Detect Weaknesses
                </button>
              </>
            )}

            {/* Balanced Optimization Configuration - Only when balanced view active */}
            {activeTab === 'optimization' && optimizationView === 'balanced' && results && (
              <>
                <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase mt-4`}>Balanced Settings</div>
                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Objective</p>
                  <select
                    value={optimizationObjective}
                    onChange={(e) => setOptimizationObjective(e.target.value)}
                    className={`w-full px-2 py-1 rounded text-sm ${darkMode ? 'bg-gray-600 text-white' : 'bg-white text-gray-900'}`}
                  >
                    <option value="sharpe">Sharpe Ratio</option>
                    <option value="profitFactor">Profit Factor</option>
                    <option value="riskAdjusted">Risk-Adjusted Returns</option>
                  </select>
                </div>

                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    Max Drawdown: {maxDrawdownTarget}%
                  </p>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={maxDrawdownTarget}
                    onChange={(e) => setMaxDrawdownTarget(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div className={`px-4 py-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <p className={`text-xs font-medium mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                    Min Win Rate: {minWinRateTarget}%
                  </p>
                  <input
                    type="range"
                    min="20"
                    max="80"
                    step="5"
                    value={minWinRateTarget}
                    onChange={(e) => setMinWinRateTarget(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <button
                  onClick={performBalancedOptimization}
                  disabled={isBalancedOptimizing}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {isBalancedOptimizing ? 'Optimizing...' : '🚀 Start Optimization'}
                </button>
              </>
            )}

            <hr className={`my-4 ${borderColor}`} />

            <div className={`text-xs font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'} px-4 py-2 uppercase`}>Export</div>

            <button onClick={exportToCSV} className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex items-center justify-center gap-2">
              <Table size={16} />
              Export CSV
            </button>

            <button onClick={exportToPDF} className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center justify-center gap-2">
              <FileText size={16} />
              Export TXT
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {!results ? (
            <div className={`max-w-2xl mx-auto ${cardBg} rounded-2xl p-12 text-center border ${borderColor}`}>
              <div className={`w-20 h-20 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-100 to-purple-100'} flex items-center justify-center mx-auto mb-6`}>
                <Upload size={40} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
              </div>
              <h2 className={`text-2xl font-bold mb-2 ${textColor}`}>Upload Your Strategy Report</h2>
              <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
                Export a CSV from TradingView strategy tester to analyze your trading performance
              </p>

              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Upload size={20} />
                Choose CSV File
              </label>

              {file && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
                  <p className="text-green-700 dark:text-green-300 font-medium text-sm flex items-center justify-center gap-2">
                    <CheckCircle size={18} />
                    {file.name}
                  </p>
                </div>
              )}
            </div>
          ) : isAnalyzing ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
              <p className={textColor}>Analyzing your trading strategy...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Strategy Info */}
                  <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                    <h2 className={`text-lg font-bold ${textColor} mb-4`}>Strategy Overview</h2>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Strategy</p>
                        <p className="font-semibold text-blue-600">{results.fileInfo.strategyName}</p>
                      </div>
                      <div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Symbol</p>
                        <p className="font-semibold text-green-600">{results.fileInfo.symbol}</p>
                      </div>
                      <div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Period</p>
                        <p className="font-semibold text-purple-600 text-xs">
                          {results.fileInfo.dateRange.start} to {results.fileInfo.dateRange.end}
                        </p>
                      </div>
                      <div>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Generated</p>
                        <p className="font-semibold text-orange-600">{results.fileInfo.reportDate}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <KPICard
                      title="Total Trades"
                      value={results.totalTrades.toLocaleString()}
                      subtitle="Completed trades"
                      icon={BarChart3}
                      color="text-blue-600"
                    />
                    <KPICard
                      title="Overall P&L"
                      value={`₹${results.overallPerformance.totalPnL.toLocaleString()}`}
                      subtitle={results.overallPerformance.totalPnL >= 0 ? 'Profitable' : 'Loss'}
                      icon={TrendingUp}
                      color={results.overallPerformance.totalPnL >= 0 ? 'text-green-500' : `${darkMode ? 'text-red-400' : 'text-red-600'}`}
                    />
                    <KPICard
                      title="Win Rate"
                      value={`${results.overallPerformance.winRate}%`}
                      subtitle="Success ratio"
                      icon={Target}
                      color="text-purple-600"
                    />
                    <KPICard
                      title="Sharpe Ratio"
                      value={results.sharpeAndSortino.sharpeRatio}
                      subtitle="Risk-adjusted returns"
                      icon={Zap}
                      color="text-orange-600"
                    />
                  </div>

                  {/* Comprehensive Insights */}
                  <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                    <h3 className={`text-lg font-bold ${textColor} mb-6`}>Key Insights</h3>
                    <div className="grid grid-cols-3 gap-6">
                      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                        <h4 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-3 text-sm`}>Optimal Entry Times</h4>
                        <div className="space-y-2">
                          {results.comprehensiveInsights.bestEntryTimes.map((slot, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className={`font-mono ${darkMode ? 'text-green-400' : 'text-green-600'}`}>#{idx + 1}: {slot.timeSlot}</span>
                              <span className={`${darkMode ? 'text-green-400' : 'text-green-600'} font-semibold`}>₹{slot.totalPnL.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                        <h4 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-3 text-sm`}>Optimal Exit Times</h4>
                        <div className="space-y-2">
                          {results.comprehensiveInsights.bestExitTimes.map((slot, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className={`font-mono ${darkMode ? 'text-red-400' : 'text-red-600'}`}>#{idx + 1}: {slot.timeSlot}</span>
                              <span className={`${darkMode ? 'text-red-400' : 'text-red-600'} font-semibold`}>₹{slot.totalPnL.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} p-4 rounded-lg`}>
                        <h4 className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-3 text-sm`}>Risk Metrics</h4>
                        <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                          <div className="flex justify-between">
                            <span>Avg Win:</span>
                            <span className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>₹{results.riskReward.avgWin.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Loss:</span>
                            <span className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>₹{results.riskReward.avgLoss.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>R:R Ratio:</span>
                            <span className="font-semibold">{results.riskReward.riskRewardRatio}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Max Drawdown:</span>
                            <span className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'}`}>₹{results.comprehensiveInsights.drawdownMetrics.maxDrawdown.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Heatmap Summary & Recommendations */}
                  {heatmapResults && (
                    <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                      <h3 className={`text-lg font-bold ${textColor} mb-4`}>⏰ Time-Based Trading Insights</h3>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Recommendations based on your trading patterns across different times of day</p>

                      <div className="grid grid-cols-1 gap-4">
                        {(() => {
                          // Group heatmap data by time slot and analyze
                          const timeAnalysis = {};
                          heatmapResults.data.forEach(slot => {
                            const timePart = slot.period.split('-')[1];
                            if (!timeAnalysis[timePart]) {
                              timeAnalysis[timePart] = { pnls: [], winrates: [], trades: 0 };
                            }
                            timeAnalysis[timePart].pnls.push(slot.pnl);
                            timeAnalysis[timePart].winrates.push(slot.winrate);
                            timeAnalysis[timePart].trades += slot.trades;
                          });

                          // Analyze each time slot
                          const recommendations = Object.entries(timeAnalysis)
                            .map(([time, data]) => {
                              const avgPnL = data.pnls.reduce((a, b) => a + b, 0) / data.pnls.length;
                              const avgWinRate = data.winrates.reduce((a, b) => a + b, 0) / data.winrates.length;
                              const isPositive = avgPnL >= 0;
                              const intensity = Math.abs(avgPnL);

                              return { time, avgPnL, avgWinRate, trades: data.trades, intensity, isPositive };
                            })
                            .sort((a, b) => b.intensity - a.intensity);

                          // Get best and worst times
                          const bestTimes = recommendations.filter(r => r.isPositive).slice(0, 2);
                          const worstTimes = recommendations.filter(r => !r.isPositive).slice(0, 2);

                          return (
                            <>
                              {bestTimes.length > 0 && (
                                <div className={`${darkMode ? 'bg-green-900 bg-opacity-20' : 'bg-green-50'} border ${darkMode ? 'border-green-700' : 'border-green-200'} rounded-lg p-4`}>
                                  <h4 className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-700'} mb-3`}>✅ Best Times to Trade</h4>
                                  <div className="space-y-2">
                                    {bestTimes.map((rec, idx) => (
                                      <div key={idx} className={`text-sm p-2 rounded ${darkMode ? 'bg-green-800 bg-opacity-30' : 'bg-green-100'}`}>
                                        <div className="flex justify-between items-center">
                                          <span className="font-semibold">{rec.time}</span>
                                          <div className="flex gap-4">
                                            <span className={`${darkMode ? 'text-green-400' : 'text-green-600'} font-bold`}>₹{rec.avgPnL.toLocaleString()}</span>
                                            <span className={`${darkMode ? 'text-green-400' : 'text-green-600'}`}>{rec.avgWinRate.toFixed(1)}% Win</span>
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{rec.trades} trades</span>
                                          </div>
                                        </div>
                                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>💡 Trade more aggressively during this period - high profit potential</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {worstTimes.length > 0 && (
                                <div className={`${darkMode ? 'bg-red-900 bg-opacity-20' : 'bg-red-50'} border ${darkMode ? 'border-red-700' : 'border-red-200'} rounded-lg p-4`}>
                                  <h4 className={`font-bold ${darkMode ? 'text-red-400' : 'text-red-700'} mb-3`}>⚠️ Times to Avoid or Be Cautious</h4>
                                  <div className="space-y-2">
                                    {worstTimes.map((rec, idx) => (
                                      <div key={idx} className={`text-sm p-2 rounded ${darkMode ? 'bg-red-800 bg-opacity-30' : 'bg-red-100'}`}>
                                        <div className="flex justify-between items-center">
                                          <span className="font-semibold">{rec.time}</span>
                                          <div className="flex gap-4">
                                            <span className={`${darkMode ? 'text-red-400' : 'text-red-600'} font-bold`}>₹{rec.avgPnL.toLocaleString()}</span>
                                            <span className={`${darkMode ? 'text-red-400' : 'text-red-600'}`}>{rec.avgWinRate.toFixed(1)}% Win</span>
                                            <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{rec.trades} trades</span>
                                          </div>
                                        </div>
                                        <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>💡 Either skip trading during this period or reduce position size - high loss frequency</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {recommendations.length > 4 && (
                                <div className={`${darkMode ? 'bg-blue-900 bg-opacity-20' : 'bg-blue-50'} border ${darkMode ? 'border-blue-700' : 'border-blue-200'} rounded-lg p-4`}>
                                  <h4 className={`font-bold ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-2`}>📊 Overall Time-Based Strategy</h4>
                                  <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                                    Focus your trading activity during {bestTimes[0]?.time || 'peak hours'} (your best performing time slot).
                                    Consider using smaller position sizes or skipping trades during {worstTimes[0]?.time || 'low-performance periods'}.
                                    This pattern-based approach can significantly improve your risk-adjusted returns.
                                  </p>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Equity Curve */}
                  <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                    <h3 className={`text-lg font-bold ${textColor} mb-4`}>Equity Curve</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={results.equityCurve}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="tradeNumber" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px'
                          }}
                        />
                        <Line type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* CONSOLIDATED PERFORMANCE ANALYSIS TAB */}
              {activeTab === 'performance' && (
                <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                  <h3 className={`text-lg font-bold ${textColor} mb-4`}>
                    {performanceView === 'profitability' && 'Most Profitable Time Slots'}
                    {performanceView === 'winrate' && 'Highest Win Rate Time Slots'}
                    {performanceView === 'profitfactor' && 'Best Profit Factor Time Slots'}
                  </h3>
                  <div className="overflow-x-auto">
                    {(() => {
                      const allData = performanceView === 'profitability' ? results.byProfitability :
                                     performanceView === 'winrate' ? results.byWinRate : results.byProfitFactor;
                      const displayLimit = resultCount === 'all' ? allData.length : Math.min(resultCount, allData.length);
                      const dataToDisplay = allData.slice(0, displayLimit);
                      const recordsPerPage = 15;
                      const totalPages = Math.ceil(dataToDisplay.length / recordsPerPage);
                      const currentPage = performanceView === 'profitability' ? currentPageProfitability :
                                         performanceView === 'winrate' ? currentPageWinRate : currentPageProfitFactor;
                      const setCurrentPage = performanceView === 'profitability' ? setCurrentPageProfitability :
                                            performanceView === 'winrate' ? setCurrentPageWinRate : setCurrentPageProfitFactor;
                      const currentData = getPaginatedData(dataToDisplay, currentPage, recordsPerPage);

                      return (
                        <>
                          <table className="w-full text-sm">
                            <thead>
                              <tr className={`border-b ${borderColor}`}>
                                <th className={`text-left py-2 px-2 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Details</th>
                                <th className={`text-left py-2 px-2 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Rank</th>
                                {analysisType === 'combo' ? (
                                  <>
                                    <th className={`text-left py-2 px-2 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Entry</th>
                                    <th className={`text-left py-2 px-2 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Exit</th>
                                  </>
                                ) : (
                                  <th className={`text-left py-2 px-2 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Time Slot</th>
                                )}
                                <th className={`text-right py-2 px-2 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Total P&L</th>
                                <th className={`text-right py-2 px-2 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Trades</th>
                                <th className={`text-right py-2 px-2 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Win Rate</th>
                                <th className={`text-right py-2 px-2 font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>Avg P&L</th>
                              </tr>
                            </thead>
                            <tbody>
                              {currentData.map((slot, idx) => {
                                const recordsPerPage = 15;
                                const globalIndex = (currentPage - 1) * recordsPerPage + idx;
                                return (
                                  <React.Fragment key={globalIndex}>
                                    <tr className={`border-b ${borderColor} hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                      <td className="py-2 px-2">
                                        <button
                                          onClick={() => toggleExpanded(globalIndex)}
                                          className="text-blue-600 hover:text-blue-800 text-xs"
                                        >
                                          {expandedRows.has(globalIndex) ? 'Hide' : 'Show'}
                                        </button>
                                      </td>
                                      <td className="py-2 px-2 font-bold">#{globalIndex + 1}</td>
                                      {analysisType === 'combo' ? (
                                        <>
                                          <td className="py-2 px-2 font-mono text-green-600 text-xs">{slot.entryTimeSlot}</td>
                                          <td className="py-2 px-2 font-mono text-red-600 text-xs">{slot.exitTimeSlot}</td>
                                        </>
                                      ) : (
                                        <td className="py-2 px-2 font-mono text-blue-600">{slot.timeSlot}</td>
                                      )}
                                      <td className={`py-2 px-2 text-right font-semibold ${slot.totalPnL >= 0 ? 'text-green-500' : `${darkMode ? 'text-red-400' : 'text-red-600'}`}`}>
                                        ₹{slot.totalPnL.toLocaleString()}
                                      </td>
                                      <td className="py-2 px-2 text-right">{slot.tradeCount}</td>
                                      <td className="py-2 px-2 text-right">{slot.winRate}%</td>
                                      <td className="py-2 px-2 text-right">₹{slot.avgPnL.toLocaleString()}</td>
                                    </tr>
                                    {expandedRows.has(globalIndex) && (
                                      <tr>
                                        <td colSpan={analysisType === 'combo' ? 8 : 7} className={`py-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-b ${borderColor}`}>
                                          <div className="grid grid-cols-2 gap-6 px-4">
                                            <div>
                                              <h5 className="font-semibold text-sm mb-2">Weekly Performance</h5>
                                              <table className="w-full text-xs">
                                                <thead>
                                                  <tr className={`border-b ${borderColor}`}>
                                                    <th className="text-left py-1">Week</th>
                                                    <th className="text-right py-1">P&L</th>
                                                    <th className="text-right py-1">Trades</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {slot.weeklyPerformance?.slice(0, 6).map((week, widx) => (
                                                    <tr key={widx} className={`border-b ${borderColor}`}>
                                                      <td className="py-1 font-mono">{week.period}</td>
                                                      <td className="text-right text-green-600">₹{week.pnl.toLocaleString()}</td>
                                                      <td className="text-right">{week.trades}</td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                            <div>
                                              <h5 className="font-semibold text-sm mb-2">Monthly Performance</h5>
                                              <table className="w-full text-xs">
                                                <thead>
                                                  <tr className={`border-b ${borderColor}`}>
                                                    <th className="text-left py-1">Month</th>
                                                    <th className="text-right py-1">P&L</th>
                                                    <th className="text-right py-1">Trades</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {slot.monthlyPerformance?.slice(0, 6).map((month, midx) => (
                                                    <tr key={midx} className={`border-b ${borderColor}`}>
                                                      <td className="py-1 font-mono">{month.period}</td>
                                                      <td className="text-right text-green-600">₹{month.pnl.toLocaleString()}</td>
                                                      <td className="text-right">{month.trades}</td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </React.Fragment>
                                );
                              })}
                            </tbody>
                          </table>

                          {/* Pagination Controls */}
                          {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-center gap-2">
                              <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  currentPage === 1
                                    ? `${darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`
                                    : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`
                                }`}
                              >
                                ← Previous
                              </button>
                              <div className="flex gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                      currentPage === page
                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                        : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`
                                    }`}
                                  >
                                    {page}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                                  currentPage === totalPages
                                    ? `${darkMode ? 'bg-gray-700 text-gray-500 cursor-not-allowed' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`
                                    : `${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-900 hover:bg-gray-300'}`
                                }`}
                              >
                                Next →
                              </button>
                              <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                Page {currentPage} of {totalPages}
                              </span>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}


              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  {isAnalyzing ? (
                    <div className={`${cardBg} rounded-2xl p-12 text-center border ${borderColor}`}>
                      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Re-analyzing with updated settings...
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                          <h3 className="font-semibold text-blue-600 mb-2">Sharpe Ratio</h3>
                          <p className="text-3xl font-bold">{results.sharpeAndSortino.sharpeRatio}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Risk-adjusted returns</p>
                        </div>
                        <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                          <h3 className="font-semibold text-purple-600 mb-2">Sortino Ratio</h3>
                          <p className="text-3xl font-bold">{results.sharpeAndSortino.sortinoRatio}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>Downside risk-adjusted</p>
                        </div>
                      </div>

                  {/* Day of Week */}
                  <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                    <h3 className={`text-lg font-bold ${textColor} mb-4`}>Day of Week Performance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={results.dayOfWeek}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="day" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px'
                          }}
                        />
                        <Bar dataKey="totalPnL" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Hour Heatmap */}
                  <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                    <h3 className={`text-lg font-bold ${textColor} mb-4`}>Hour-by-Hour Heatmap</h3>
                    <div className="grid grid-cols-6 gap-2">
                      {results.hourHeatmap.map((hourData) => {
                        const maxPnL = Math.max(...results.hourHeatmap.map(h => Math.abs(h.totalPnL)));
                        const intensity = Math.min(Math.abs(hourData.totalPnL) / maxPnL, 1);
                        return (
                          <div key={hourData.hour} className="text-center">
                            <div 
                              className="p-3 rounded-lg text-white font-semibold transition-all hover:scale-105"
                              style={{
                                backgroundColor: hourData.totalPnL >= 0 
                                  ? `rgba(34, 197, 94, ${0.3 + intensity * 0.7})` 
                                  : `rgba(239, 68, 68, ${0.3 + intensity * 0.7})`
                              }}
                            >
                              <div className="text-xs mb-1">{hourData.hour}:00</div>
                              <div className="text-sm font-bold">₹{Math.abs(hourData.totalPnL)}</div>
                              <div className="text-xs">{hourData.winRate}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Direction Analysis */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                      <h3 className={`font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'} mb-3`}>Long Trades</h3>
                      <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        <div className="flex justify-between"><span>Trades:</span><span className="font-bold">{results.direction.long.trades}</span></div>
                        <div className="flex justify-between"><span>P&L:</span><span className={`font-bold ${results.direction.long.totalPnL >= 0 ? `${darkMode ? 'text-green-400' : 'text-green-600'}` : `${darkMode ? 'text-red-400' : 'text-red-600'}`}`}>₹{results.direction.long.totalPnL.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Win Rate:</span><span className="font-bold">{results.direction.long.winRate}%</span></div>
                      </div>
                    </div>
                    <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                      <h3 className={`font-semibold ${darkMode ? 'text-orange-400' : 'text-orange-600'} mb-3`}>Short Trades</h3>
                      <div className={`space-y-2 text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        <div className="flex justify-between"><span>Trades:</span><span className="font-bold">{results.direction.short.trades}</span></div>
                        <div className="flex justify-between"><span>P&L:</span><span className={`font-bold ${results.direction.short.totalPnL >= 0 ? `${darkMode ? 'text-green-400' : 'text-green-600'}` : `${darkMode ? 'text-red-400' : 'text-red-600'}`}`}>₹{results.direction.short.totalPnL.toLocaleString()}</span></div>
                        <div className="flex justify-between"><span>Win Rate:</span><span className="font-bold">{results.direction.short.winRate}%</span></div>
                      </div>
                    </div>
                  </div>

                  {/* Duration vs Profitability */}
                  <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                    <h3 className={`text-lg font-bold ${textColor} mb-4`}>Duration vs Profitability</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                        <XAxis dataKey="duration" name="Duration (min)" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <YAxis dataKey="pnl" name="P&L" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                            border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                            borderRadius: '8px'
                          }}
                        />
                        <Scatter data={results.durationProfit} fill="#8b5cf6" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Best & Worst Trades */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                      <h3 className={`font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} mb-3`}>Top 5 Best Trades</h3>
                      <div className="space-y-2">
                        {results.bestWorstTrades.best.map((trade, idx) => (
                          <div key={idx} className={`flex justify-between p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-green-50'} text-sm`}>
                            <span className={darkMode ? 'text-gray-100' : 'text-gray-900'}>#{trade.tradeNumber}</span>
                            <span className={`${darkMode ? 'text-green-400' : 'text-green-600'} font-bold`}>₹{trade.pnl.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                      <h3 className={`font-semibold ${darkMode ? 'text-red-400' : 'text-red-600'} mb-3`}>Top 5 Worst Trades</h3>
                      <div className="space-y-2">
                        {results.bestWorstTrades.worst.map((trade, idx) => (
                          <div key={idx} className={`flex justify-between p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-red-50'} text-sm`}>
                            <span className={darkMode ? 'text-gray-100' : 'text-gray-900'}>#{trade.tradeNumber}</span>
                            <span className={`${darkMode ? 'text-red-400' : 'text-red-600'} font-bold`}>₹{trade.pnl.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                    </>
                  )}
                </div>
              )}

              {/* Strategy Comparison Tab */}
              {activeTab === 'comparison' && (
                <div className="space-y-6">
                  {strategies.length === 0 ? (
                    <div className={`${cardBg} rounded-2xl p-12 text-center border ${borderColor}`}>
                      <div className={`w-20 h-20 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-100 to-purple-100'} flex items-center justify-center mx-auto mb-6`}>
                        <BarChart3 size={40} className={darkMode ? 'text-blue-400' : 'text-blue-600'} />
                      </div>
                      <h2 className={`text-2xl font-bold mb-2 ${textColor}`}>Upload Multiple Strategies</h2>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
                        Upload up to 5 CSV files to compare strategies side-by-side
                      </p>

                      <input
                        type="file"
                        accept=".csv"
                        multiple
                        onChange={handleMultiFileUpload}
                        className="hidden"
                        id="multi-file-upload"
                      />
                      <label
                        htmlFor="multi-file-upload"
                        className={`inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 rounded-lg cursor-pointer hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl ${
                          dragOverMulti ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                        }`}
                      >
                        <Upload size={20} />
                        Choose CSV Files
                      </label>

                      <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} border-2 border-dashed ${borderColor}`}>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Or drag and drop files here
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Strategies List */}
                      <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className={`text-lg font-bold ${textColor}`}>Loaded Strategies ({strategies.length}/5)</h3>
                          <input
                            type="file"
                            accept=".csv"
                            multiple
                            onChange={handleMultiFileUpload}
                            className="hidden"
                            id="multi-file-upload-add"
                          />
                          {strategies.length < 5 && (
                            <label
                              htmlFor="multi-file-upload-add"
                              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm cursor-pointer flex items-center gap-2"
                            >
                              <Upload size={16} />
                              Add More
                            </label>
                          )}
                        </div>

                        <div className="space-y-3">
                          {strategies.map((strategy, idx) => (
                            <div key={strategy.id} className={`flex items-center justify-between p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border ${borderColor}`}>
                              <div className="flex items-center gap-4 flex-1">
                                <input
                                  type="checkbox"
                                  checked={selectedStrategies.includes(strategy.id)}
                                  onChange={() => toggleStrategySelection(strategy.id)}
                                  className="w-5 h-5 rounded cursor-pointer"
                                />
                                <div className="flex-1">
                                  <p className="font-semibold text-blue-600">{strategy.fileInfo.strategyName}</p>
                                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {strategy.fileInfo.symbol} • {strategy.trades.length} trades
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  strategy.analyzed
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                }`}>
                                  {strategy.analyzed ? '✓ Analyzed' : '⏳ Ready'}
                                </span>
                              </div>
                              <button
                                onClick={() => removeStrategy(strategy.id)}
                                className="ml-4 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                                title="Remove strategy"
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Selected Strategies Summary */}
                      {selectedStrategies.length > 0 && (
                        <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                          <h3 className={`text-lg font-bold ${textColor} mb-4`}>Selected Strategies Summary ({selectedStrategies.length})</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {strategies.filter(s => selectedStrategies.includes(s.id)).map((strategy, idx) => (
                              <div key={strategy.id} className={`p-4 rounded-lg border ${borderColor} ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex-1">
                                    <p className="font-semibold text-blue-600 mb-1">{strategy.fileInfo.strategyName}</p>
                                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                      {strategy.fileInfo.symbol}
                                    </p>
                                  </div>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    idx === 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                    idx === 1 ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                                    idx === 2 ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' :
                                    idx === 3 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  }`}>
                                    #{idx + 1}
                                  </span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex justify-between">
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Trades:</span>
                                    <span className="font-medium">{strategy.trades.length}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Period:</span>
                                    <span className="font-medium text-xs">{strategy.fileInfo.period}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Generated:</span>
                                    <span className="font-medium text-xs">{strategy.fileInfo.generatedDate}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="mt-4 flex justify-center">
                            <button
                              onClick={compareStrategies}
                              disabled={selectedStrategies.length < 2}
                              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                                selectedStrategies.length < 2
                                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                              }`}
                            >
                              {selectedStrategies.length < 2
                                ? `Select at least 2 strategies to compare (${selectedStrategies.length}/2)`
                                : `Compare ${selectedStrategies.length} Strategies`
                              }
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Comparison Results */}
                      {comparisonResults ? (
                        <div className="space-y-6">
                          {/* Multi-Symbol Warning */}
                          {(() => {
                            const uniqueSymbols = [...new Set(strategies.map(s => s.fileInfo.symbol))];
                            return uniqueSymbols.length > 1 ? (
                              <div className={`${darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border-2 rounded-lg p-4`}>
                                <div className="flex items-start gap-3">
                                  <AlertCircle className={darkMode ? 'text-yellow-400' : 'text-yellow-600'} size={24} />
                                  <div>
                                    <h4 className={`font-bold ${darkMode ? 'text-yellow-200' : 'text-yellow-800'} mb-1`}>
                                      ⚠️ Multi-Symbol Comparison Detected
                                    </h4>
                                    <p className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>
                                      You are comparing strategies across different instruments: <strong>{uniqueSymbols.join(', ')}</strong>.
                                      Results may not be directly comparable due to different volatility, market conditions, and trading characteristics.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : null;
                          })()}

                          {/* Best Strategies Overview */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Best by P&L</p>
                              <p className="font-semibold text-blue-600 text-sm">{comparisonResults.bestByPnL.name}</p>
                              <p className={`text-lg font-bold ${comparisonResults.bestByPnL.metrics.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{comparisonResults.bestByPnL.metrics.totalPnL.toLocaleString()}
                              </p>
                            </div>

                            <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Best by Win Rate</p>
                              <p className="font-semibold text-purple-600 text-sm">{comparisonResults.bestByWinRate.name}</p>
                              <p className="text-lg font-bold text-purple-600">{comparisonResults.bestByWinRate.metrics.winRate}%</p>
                            </div>

                            <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Best by Profit Factor</p>
                              <p className="font-semibold text-green-600 text-sm">{comparisonResults.bestByProfitFactor.name}</p>
                              <p className="text-lg font-bold text-green-600">{comparisonResults.bestByProfitFactor.metrics.profitFactor.toFixed(2)}</p>
                            </div>

                            <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                              <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Best by Sharpe Ratio</p>
                              <p className="font-semibold text-orange-600 text-sm">{comparisonResults.bestBySharpe.name}</p>
                              <p className="text-lg font-bold text-orange-600">{comparisonResults.bestBySharpe.metrics.sharpeRatio.toFixed(2)}</p>
                            </div>
                          </div>

                          {/* Equity Curve Comparison */}
                          <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                            <h3 className={`text-lg font-bold ${textColor} mb-4`}>Equity Curve Comparison</h3>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis label={{ value: 'Trade Number', position: 'insideBottomRight', offset: -5 }} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                                <YAxis label={{ value: 'Cumulative P&L (₹)', angle: -90, position: 'insideLeft' }} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '8px'
                                  }}
                                  formatter={(value) => `₹${value.toLocaleString()}`}
                                />
                                <Legend />
                                {comparisonResults.strategies.map((strategy, idx) => {
                                  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];
                                  let cumulativePnL = 0;
                                  const data = strategy.metrics.totalTrades > 0 ?
                                    strategies
                                      .find(s => s.id === strategy.id)
                                      ?.trades.map((trade, tradeIdx) => {
                                        cumulativePnL += trade.pnl;
                                        return {
                                          tradeNumber: tradeIdx + 1,
                                          [strategy.name]: cumulativePnL
                                        };
                                      }) || [] : [];

                                  return (
                                    <Line
                                      key={strategy.id}
                                      type="monotone"
                                      dataKey={strategy.name}
                                      data={data}
                                      stroke={colors[idx % colors.length]}
                                      dot={false}
                                      strokeWidth={2}
                                      isAnimationActive={false}
                                    />
                                  );
                                })}
                              </LineChart>
                            </ResponsiveContainer>
                          </div>

                          {/* P&L Distribution Chart */}
                          <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                            <h3 className={`text-lg font-bold ${textColor} mb-4`}>P&L Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={comparisonResults.strategies.map(s => ({
                                name: s.name,
                                'Total P&L': s.metrics.totalPnL,
                                'Avg P&L': s.metrics.averagePnL
                              }))}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                                <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '8px'
                                  }}
                                  formatter={(value) => `₹${value.toLocaleString()}`}
                                />
                                <Legend />
                                <Bar dataKey="Total P&L" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                <Bar dataKey="Avg P&L" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Risk vs Return Scatter */}
                          <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                            <h3 className={`text-lg font-bold ${textColor} mb-4`}>Risk vs Return Analysis</h3>
                            <ResponsiveContainer width="100%" height={250}>
                              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                                <XAxis
                                  type="number"
                                  dataKey="maxDrawdown"
                                  label={{ value: 'Max Drawdown (₹)', position: 'insideBottomRight', offset: -10 }}
                                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                                />
                                <YAxis
                                  type="number"
                                  dataKey="totalPnL"
                                  label={{ value: 'Total P&L (₹)', angle: -90, position: 'insideLeft' }}
                                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                                />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                                    borderRadius: '8px'
                                  }}
                                  cursor={{ strokeDasharray: '3 3' }}
                                  formatter={(value) => `₹${value.toLocaleString()}`}
                                  labelFormatter={(label) => `Strategy: ${label}`}
                                />
                                <Scatter
                                  name="Strategies"
                                  data={comparisonResults.strategies.map(s => ({
                                    ...s.metrics,
                                    strategiesName: s.name
                                  }))}
                                  fill="#3b82f6"
                                  shape="circle"
                                />
                              </ScatterChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Win Rate Comparison */}
                          <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                            <h3 className={`text-lg font-bold ${textColor} mb-4`}>Win Rate & Profit Factor</h3>
                            <div className="grid grid-cols-2 gap-4">
                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={comparisonResults.strategies.map(s => ({
                                  name: s.name,
                                  'Win Rate': s.metrics.winRate
                                }))}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                                  <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                                      borderRadius: '8px'
                                    }}
                                    formatter={(value) => `${value.toFixed(2)}%`}
                                  />
                                  <Bar dataKey="Win Rate" fill="#10b981" radius={[8, 8, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>

                              <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={comparisonResults.strategies.map(s => ({
                                  name: s.name,
                                  'Profit Factor': s.metrics.profitFactor
                                }))}>
                                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                                  <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                      border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                                      borderRadius: '8px'
                                    }}
                                    formatter={(value) => value.toFixed(2)}
                                  />
                                  <Bar dataKey="Profit Factor" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                          {/* Comprehensive Comparison Table */}
                          <div className={`${cardBg} rounded-lg p-6 border ${borderColor} overflow-x-auto`}>
                            <h3 className={`text-lg font-bold ${textColor} mb-4`}>Detailed Comparison</h3>
                            <table className="w-full text-sm">
                              <thead>
                                <tr className={`border-b ${borderColor}`}>
                                  <th className={`text-left py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Strategy</th>
                                  <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Trades</th>
                                  <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Total P&L</th>
                                  <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Win Rate %</th>
                                  <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Profit Factor</th>
                                  <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Sharpe Ratio</th>
                                  <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Max Drawdown</th>
                                </tr>
                              </thead>
                              <tbody>
                                {comparisonResults.ranking.map((strategy, idx) => (
                                  <tr key={strategy.id} className={`border-b ${borderColor} ${idx === 0 ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30' : ''}`}>
                                    <td className={`py-3 px-2 ${idx === 0 ? 'font-bold text-blue-600' : textColor}`}>
                                      {strategy.name}
                                      {idx === 0 && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">🏆 #1</span>}
                                    </td>
                                    <td className={`py-3 px-2 text-right ${textColor}`}>{strategy.metrics.totalTrades}</td>
                                    <td className={`py-3 px-2 text-right ${strategy.metrics.totalPnL >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}`}>
                                      ₹{strategy.metrics.totalPnL.toLocaleString()}
                                    </td>
                                    <td className={`py-3 px-2 text-right ${textColor}`}>{strategy.metrics.winRate}%</td>
                                    <td className={`py-3 px-2 text-right ${textColor}`}>{strategy.metrics.profitFactor.toFixed(2)}</td>
                                    <td className={`py-3 px-2 text-right ${textColor}`}>{strategy.metrics.sharpeRatio.toFixed(2)}</td>
                                    <td className={`py-3 px-2 text-right ${textColor}`}>₹{strategy.metrics.maxDrawdown.toLocaleString()}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Back Button */}
                          <button
                            onClick={() => setComparisonResults(null)}
                            className={`w-full px-6 py-2 ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} rounded-lg transition-colors font-medium`}
                          >
                            ← Back to Strategies
                          </button>
                        </div>
                      ) : selectedStrategies.length > 1 ? (
                        <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                          <button
                            onClick={compareStrategies}
                            disabled={isAnalyzing}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-500 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold flex items-center justify-center gap-2"
                          >
                            {isAnalyzing ? (
                              <>
                                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Comparing...
                              </>
                            ) : (
                              <>
                                <BarChart3 size={18} />
                                Compare {selectedStrategies.length} Strategies
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <div className={`${cardBg} rounded-lg p-8 text-center border ${borderColor}`}>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Select at least 2 strategies to compare
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Segmentation Tab (Phase 4) */}
              {activeTab === 'timepatterns' && timePatternsView === 'segmentation' && results && (
                <div className="space-y-6">
                  {/* Segmentation Results */}
                  {segmentationResults && segmentationResults.segments.length > 0 ? (
                    <div className="space-y-6">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                          <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Total Segments</p>
                          <p className="text-3xl font-bold text-blue-600">{segmentationResults.totalSegments}</p>
                        </div>
                        <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                          <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Best Segment</p>
                          <p className="text-lg font-bold text-green-600">{segmentationResults.segments[0]?.name}</p>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>PF: {segmentationResults.segments[0]?.profitFactor.toFixed(2)}</p>
                        </div>
                        <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                          <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Best Performance</p>
                          <p className={`text-lg font-bold ${segmentationResults.segments[0]?.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₹{segmentationResults.segments[0]?.totalPnL.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Segment Performance Chart */}
                      <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                        <h3 className={`text-lg font-bold ${textColor} mb-4`}>Segment P&L Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={segmentationResults.segments}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                            <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                                borderRadius: '8px'
                              }}
                              formatter={(value) => `₹${value.toLocaleString()}`}
                            />
                            <Bar dataKey="totalPnL" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                              {segmentationResults.segments.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.totalPnL >= 0 ? '#10b981' : '#ef4444'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Segment Win Rate Comparison */}
                      <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                        <h3 className={`text-lg font-bold ${textColor} mb-4`}>Win Rate by Segment</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={segmentationResults.segments}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                            <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} label={{ value: '%', angle: -90, position: 'insideLeft' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                                borderRadius: '8px'
                              }}
                              formatter={(value) => `${value.toFixed(2)}%`}
                            />
                            <Bar dataKey="winRate" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Detailed Segment Table */}
                      <div className={`${cardBg} rounded-lg p-6 border ${borderColor} overflow-x-auto`}>
                        <h3 className={`text-lg font-bold ${textColor} mb-4`}>Detailed Segment Analysis</h3>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={`border-b ${borderColor}`}>
                              <th className={`text-left py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Segment</th>
                              <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Trades</th>
                              <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Win/Loss</th>
                              <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Total P&L</th>
                              <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Avg P&L</th>
                              <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Win Rate %</th>
                              <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Profit Factor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {segmentationResults.segments.map((segment, idx) => (
                              <tr
                                key={idx}
                                className={`border-b ${borderColor} cursor-pointer hover:${darkMode ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                                onClick={() => setExpandedSegment(expandedSegment === idx ? null : idx)}
                              >
                                <td className={`py-3 px-2 font-medium ${idx === 0 ? 'text-blue-600' : textColor}`}>
                                  {segment.name}
                                  {idx === 0 && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded">🏆 Best</span>}
                                </td>
                                <td className={`py-3 px-2 text-right ${textColor}`}>{segment.totalTrades}</td>
                                <td className={`py-3 px-2 text-right ${textColor}`}>{segment.winTrades}/{segment.lossTrades}</td>
                                <td className={`py-3 px-2 text-right ${segment.totalPnL >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}`}>
                                  ₹{segment.totalPnL.toLocaleString()}
                                </td>
                                <td className={`py-3 px-2 text-right ${textColor}`}>₹{segment.avgPnL.toLocaleString()}</td>
                                <td className={`py-3 px-2 text-right ${textColor}`}>{segment.winRate.toFixed(2)}%</td>
                                <td className={`py-3 px-2 text-right ${textColor}`}>{segment.profitFactor.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className={`${cardBg} rounded-lg p-8 text-center border ${borderColor}`}>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Click a segmentation type above to analyze your trades
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!results && activeTab === 'timepatterns' && timePatternsView === 'segmentation' && (
                <div className={`${cardBg} rounded-2xl p-12 text-center border ${borderColor}`}>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload and analyze a strategy to use segmentation features
                  </p>
                </div>
              )}

              {/* Enhanced Heatmap Tab (Phase 3) */}
              {activeTab === 'timepatterns' && timePatternsView === 'heatmap' && results && (
                <div className="space-y-6">
                  {/* COMPREHENSIVE ANALYSIS SECTION - MOVED TO TOP */}
                  {heatmapResults && heatmapResults.data.length > 0 && (
                    <div style={{ marginBottom: '32px', padding: '20px', borderRadius: '12px', backgroundColor: darkMode ? '#1f2937' : '#f9fafb', border: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📊 Comprehensive Heatmap Analysis & Insights
                      </h3>

                      {(() => {
                        let totalPnL = 0;
                        let totalTrades = 0;
                        let totalWins = 0;
                        let totalLosses = 0;
                        let profitablePeriods = 0;
                        let maxPnL = -Infinity;
                        let minPnL = Infinity;
                        let maxWinRate = 0;
                        let minWinRate = 100;
                        const topPeriods = [];
                        const bottomPeriods = [];

                        heatmapResults.data.forEach(slot => {
                          totalPnL += slot.pnl;
                          totalTrades += slot.trades;
                          const wins = (slot.winrate / 100) * slot.trades;
                          totalWins += wins;
                          totalLosses += slot.trades - wins;
                          if (slot.pnl >= 0) profitablePeriods++;
                          maxPnL = Math.max(maxPnL, slot.pnl);
                          minPnL = Math.min(minPnL, slot.pnl);
                          maxWinRate = Math.max(maxWinRate, slot.winrate);
                          minWinRate = Math.min(minWinRate, slot.winrate);
                          topPeriods.push(slot);
                          bottomPeriods.push(slot);
                        });

                        topPeriods.sort((a, b) => b.pnl - a.pnl);
                        bottomPeriods.sort((a, b) => a.pnl - b.pnl);

                        const avgPnL = heatmapResults.data.length > 0 ? totalPnL / heatmapResults.data.length : 0;
                        const profitablePercentage = heatmapResults.data.length > 0 ? (profitablePeriods / heatmapResults.data.length) * 100 : 0;
                        const overallWinRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
                        const pnlRange = maxPnL - minPnL;
                        const profitFactor = totalLosses > 0 ? totalWins / (totalLosses || 1) : totalWins > 0 ? Infinity : 0;
                        const avgPnLPerTrade = totalTrades > 0 ? totalPnL / totalTrades : 0;

                        // Parse best/worst periods for clear display
                        const parseBestPeriod = (period) => {
                          const parts = period.split('-');
                          const day = parts[0];
                          const time = parts[1];
                          return { day, time, fullPeriod: period };
                        };

                        const bestPeriodInfo = parseBestPeriod(topPeriods[0].period);
                        const worstPeriodInfo = parseBestPeriod(bottomPeriods[0].period);

                        return (
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px' }}>
                            {/* BEST TIME TO TRADE - PROMINENT CALLOUT */}
                            <div style={{ padding: '20px', borderRadius: '10px', backgroundColor: '#10b981', border: '3px solid #059669', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                              <div style={{ color: '#ffffff', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>✅ BEST TIME TO TRADE</p>
                                <p style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>{bestPeriodInfo.day} at {bestPeriodInfo.time}</p>
                                <p style={{ fontSize: '13px', opacity: 0.95 }}>P&L: ₹{topPeriods[0].pnl.toLocaleString()} | Win Rate: {topPeriods[0].winrate.toFixed(1)}% | {topPeriods[0].trades} trades</p>
                                <p style={{ fontSize: '11px', opacity: 0.85, marginTop: '8px' }}>This is your most profitable time slot - concentrate trading activity here</p>
                              </div>
                            </div>

                            {/* WORST TIME TO AVOID - WARNING CALLOUT */}
                            <div style={{ padding: '20px', borderRadius: '10px', backgroundColor: '#ef4444', border: '3px solid #dc2626', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                              <div style={{ color: '#ffffff', textAlign: 'center' }}>
                                <p style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>⚠️ AVOID THIS TIME SLOT</p>
                                <p style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '4px' }}>{worstPeriodInfo.day} at {worstPeriodInfo.time}</p>
                                <p style={{ fontSize: '13px', opacity: 0.95 }}>P&L: ₹{bottomPeriods[0].pnl.toLocaleString()} | Win Rate: {bottomPeriods[0].winrate.toFixed(1)}% | {bottomPeriods[0].trades} trades</p>
                                <p style={{ fontSize: '11px', opacity: 0.85, marginTop: '8px' }}>This time slot consistently underperforms - skip trading or use reduced position sizes</p>
                              </div>
                            </div>
                            {/* SECTION 1: Key Performance Metrics */}
                            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#f0f9ff', border: `1px solid ${darkMode ? '#4b5563' : '#bfdbfe'}` }}>
                              <p style={{ fontSize: '12px', fontWeight: 'bold', color: darkMode ? '#93c5fd' : '#1e40af', marginBottom: '12px', textTransform: 'uppercase' }}>📈 Overall Performance Metrics</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', fontSize: '13px' }}>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px', fontSize: '11px' }}>Total P&L</p>
                                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: totalPnL >= 0 ? '#22c55e' : '#ef4444' }}>₹{totalPnL.toLocaleString()}</p>
                                  <p style={{ fontSize: '10px', color: darkMode ? '#6b7280' : '#999', marginTop: '2px' }}>Across all periods</p>
                                </div>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px', fontSize: '11px' }}>Avg P&L per Trade</p>
                                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: avgPnLPerTrade >= 0 ? '#22c55e' : '#ef4444' }}>₹{avgPnLPerTrade.toLocaleString()}</p>
                                  <p style={{ fontSize: '10px', color: darkMode ? '#6b7280' : '#999', marginTop: '2px' }}>{totalTrades} trades total</p>
                                </div>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px', fontSize: '11px' }}>Win Rate</p>
                                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: overallWinRate > 50 ? '#22c55e' : overallWinRate > 40 ? '#f59e0b' : '#ef4444' }}>{overallWinRate.toFixed(1)}%</p>
                                  <p style={{ fontSize: '10px', color: darkMode ? '#6b7280' : '#999', marginTop: '2px' }}>{Math.round(totalWins)} wins, {Math.round(totalLosses)} losses</p>
                                </div>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px', fontSize: '11px' }}>Profit Factor</p>
                                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: profitFactor >= 2 ? '#22c55e' : profitFactor >= 1.5 ? '#f59e0b' : '#ef4444' }}>{profitFactor > 10 ? '∞' : profitFactor.toFixed(2)}</p>
                                  <p style={{ fontSize: '10px', color: darkMode ? '#6b7280' : '#999', marginTop: '2px' }}>Return per ₹1 loss</p>
                                </div>
                              </div>
                            </div>

                            {/* SECTION 2: Time Slot Performance Distribution */}
                            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#fef2f2', border: `1px solid ${darkMode ? '#4b5563' : '#fecaca'}` }}>
                              <p style={{ fontSize: '12px', fontWeight: 'bold', color: darkMode ? '#fca5a5' : '#7f1d1d', marginBottom: '12px', textTransform: 'uppercase' }}>⏰ Time Period Performance</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', fontSize: '13px' }}>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px', fontSize: '11px' }}>Profitable Time Slots</p>
                                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#22c55e' }}>{profitablePeriods}/{heatmapResults.data.length}</p>
                                  <p style={{ fontSize: '10px', color: darkMode ? '#6b7280' : '#999', marginTop: '2px' }}>{profitablePercentage.toFixed(1)}% success rate</p>
                                </div>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px', fontSize: '11px' }}>P&L Range</p>
                                  <p style={{ fontSize: '14px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>₹{minPnL.toLocaleString()} to ₹{maxPnL.toLocaleString()}</p>
                                  <p style={{ fontSize: '10px', color: darkMode ? '#6b7280' : '#999', marginTop: '2px' }}>Spread: ₹{pnlRange.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px', fontSize: '11px' }}>Avg P&L per Slot</p>
                                  <p style={{ fontSize: '18px', fontWeight: 'bold', color: avgPnL >= 0 ? '#22c55e' : '#ef4444' }}>₹{avgPnL.toLocaleString()}</p>
                                  <p style={{ fontSize: '10px', color: darkMode ? '#6b7280' : '#999', marginTop: '2px' }}>Based on {heatmapResults.data.length} slots</p>
                                </div>
                              </div>
                            </div>

                            {/* SECTION 3: Best Performing Periods */}
                            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#1e3a8a' : '#ecf7ff', border: `1px solid ${darkMode ? '#3730a3' : '#a5d8ff'}` }}>
                              <p style={{ fontSize: '12px', fontWeight: 'bold', color: darkMode ? '#93c5fd' : '#0369a1', marginBottom: '12px', textTransform: 'uppercase' }}>✅ Top 5 Best Performing Periods</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                {topPeriods.slice(0, 5).map((period, idx) => (
                                  <div key={`top-${idx}`} style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#1f2937' : '#f0f9ff', border: `1px solid ${darkMode ? '#374151' : '#bfdbfe'}` }}>
                                    <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#22c55e', marginBottom: '6px' }}>#{idx + 1} - {period.period}</p>
                                    <div style={{ fontSize: '12px', color: darkMode ? '#d1d5db' : '#374151', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                      <div>
                                        <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '10px' }}>P&L</p>
                                        <p style={{ fontWeight: 'bold', color: '#22c55e', fontSize: '14px' }}>₹{period.pnl.toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '10px' }}>Win Rate</p>
                                        <p style={{ fontWeight: 'bold', color: '#22c55e', fontSize: '14px' }}>{period.winrate.toFixed(1)}%</p>
                                      </div>
                                      <div>
                                        <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '10px' }}>Trades</p>
                                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{period.trades}</p>
                                      </div>
                                      <div>
                                        <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '10px' }}>Contribution</p>
                                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{totalPnL > 0 ? ((period.pnl / totalPnL) * 100).toFixed(1) : '0'}%</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* SECTION 4: Worst Performing Periods */}
                            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#5e0e0e' : '#fef2f2', border: `1px solid ${darkMode ? '#8c1f1f' : '#fecaca'}` }}>
                              <p style={{ fontSize: '12px', fontWeight: 'bold', color: darkMode ? '#fca5a5' : '#991b1b', marginBottom: '12px', textTransform: 'uppercase' }}>⚠️ Bottom 5 Worst Performing Periods</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
                                {bottomPeriods.slice(0, 5).map((period, idx) => (
                                  <div key={`bottom-${idx}`} style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#1f2937' : '#fef2f2', border: `1px solid ${darkMode ? '#374151' : '#fecaca'}` }}>
                                    <p style={{ fontSize: '13px', fontWeight: 'bold', color: '#ef4444', marginBottom: '6px' }}>#{idx + 1} - {period.period}</p>
                                    <div style={{ fontSize: '12px', color: darkMode ? '#d1d5db' : '#374151', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                      <div>
                                        <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '10px' }}>P&L</p>
                                        <p style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '14px' }}>₹{period.pnl.toLocaleString()}</p>
                                      </div>
                                      <div>
                                        <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '10px' }}>Win Rate</p>
                                        <p style={{ fontWeight: 'bold', color: '#ef4444', fontSize: '14px' }}>{period.winrate.toFixed(1)}%</p>
                                      </div>
                                      <div>
                                        <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '10px' }}>Trades</p>
                                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{period.trades}</p>
                                      </div>
                                      <div>
                                        <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '10px' }}>Loss Impact</p>
                                        <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{totalPnL > 0 ? Math.abs((period.pnl / totalPnL) * 100).toFixed(1) : '0'}%</p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* SECTION 5: Strategic Recommendations */}
                            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#2d3748' : '#f3f4f6', border: `1px solid ${darkMode ? '#4a5568' : '#d1d5db'}` }}>
                              <p style={{ fontSize: '12px', fontWeight: 'bold', color: darkMode ? '#cbd5e1' : '#374151', marginBottom: '12px', textTransform: 'uppercase' }}>💡 Strategic Recommendations</p>
                              <ul style={{ fontSize: '12px', lineHeight: '1.8', color: darkMode ? '#d1d5db' : '#374151', marginLeft: '0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                {profitablePercentage > 70 && (
                                  <li style={{ padding: '10px', backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe', borderRadius: '4px', border: '1px solid #3b82f6' }}>
                                    <span style={{ fontWeight: 'bold', color: '#0284c7' }}>✅ Concentrate Trading:</span> {profitablePercentage.toFixed(0)}% of your time slots are profitable. Focus 80-90% of trading activity on green zones to maximize returns.
                                  </li>
                                )}
                                {profitablePercentage > 50 && profitablePercentage <= 70 && (
                                  <li style={{ padding: '10px', backgroundColor: darkMode ? '#78350f' : '#fef3c7', borderRadius: '4px', border: '1px solid #f59e0b' }}>
                                    <span style={{ fontWeight: 'bold', color: '#d97706' }}>⚠️ Selective Trading:</span> {profitablePercentage.toFixed(0)}% profitability. Increase position sizes only during high-probability periods and reduce during underperforming slots.
                                  </li>
                                )}
                                {profitablePercentage <= 50 && (
                                  <li style={{ padding: '10px', backgroundColor: darkMode ? '#5e0e0e' : '#fee2e2', borderRadius: '4px', border: '1px solid #ef4444' }}>
                                    <span style={{ fontWeight: 'bold', color: '#dc2626' }}>🔴 Restrict Strategy:</span> Only {profitablePercentage.toFixed(0)}% of periods are profitable. Restrict all trading to best-performing slots only until strategy improves.
                                  </li>
                                )}
                                <li style={{ padding: '10px', backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe', borderRadius: '4px', border: '1px solid #3b82f6' }}>
                                  <span style={{ fontWeight: 'bold', color: '#0284c7' }}>📊 Avoid Red Zones:</span> Skip {worstPeriodInfo.day} at {worstPeriodInfo.time} - loses ₹{Math.abs(bottomPeriods[0].pnl).toLocaleString()}. Reduce position sizes or avoid trading entirely during this window.
                                </li>
                                <li style={{ padding: '10px', backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe', borderRadius: '4px', border: '1px solid #3b82f6' }}>
                                  <span style={{ fontWeight: 'bold', color: '#0284c7' }}>🎯 Optimize Focus:</span> P&L variance (₹{pnlRange.toLocaleString()}) indicates concentrated profits. Identify common factors (volatility, liquidity, news timing) in your green trading periods.
                                </li>
                                <li style={{ padding: '10px', backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe', borderRadius: '4px', border: '1px solid #3b82f6' }}>
                                  <span style={{ fontWeight: 'bold', color: '#0284c7' }}>⏱️ Time Discipline:</span> Schedule trading activity around {bestPeriodInfo.day} at {bestPeriodInfo.time} which generates {((topPeriods[0].pnl / totalPnL) * 100).toFixed(1)}% of all profits for maximum ROI.
                                </li>
                                <li style={{ padding: '10px', backgroundColor: darkMode ? '#1e3a8a' : '#dbeafe', borderRadius: '4px', border: '1px solid #3b82f6' }}>
                                  <span style={{ fontWeight: 'bold', color: '#0284c7' }}>📈 Monitor Performance:</span> Weekly check: if {bestPeriodInfo.day} at {bestPeriodInfo.time} win rate drops below {(topPeriods[0].winrate * 0.8).toFixed(1)}%, review for market condition changes or strategy drift.
                                </li>
                              </ul>
                            </div>

                            {/* SECTION 6: Key Metrics Summary Table */}
                            <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#f9fafb', border: `1px solid ${darkMode ? '#4b5563' : '#e5e7eb'}` }}>
                              <p style={{ fontSize: '12px', fontWeight: 'bold', color: darkMode ? '#9ca3af' : '#374151', marginBottom: '12px', textTransform: 'uppercase' }}>📋 Detailed Metrics Summary</p>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '12px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: darkMode ? '#1f2937' : '#f3f4f6', borderRadius: '4px' }}>
                                  <span style={{ color: darkMode ? '#9ca3af' : '#666' }}>Unique Time Periods</span>
                                  <span style={{ fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{heatmapResults.data.length}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: darkMode ? '#1f2937' : '#f3f4f6', borderRadius: '4px' }}>
                                  <span style={{ color: darkMode ? '#9ca3af' : '#666' }}>Total Trades</span>
                                  <span style={{ fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{totalTrades}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: darkMode ? '#1f2937' : '#f3f4f6', borderRadius: '4px' }}>
                                  <span style={{ color: darkMode ? '#9ca3af' : '#666' }}>Win/Loss Ratio</span>
                                  <span style={{ fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{Math.round(totalWins)}W / {Math.round(totalLosses)}L</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: darkMode ? '#1f2937' : '#f3f4f6', borderRadius: '4px' }}>
                                  <span style={{ color: darkMode ? '#9ca3af' : '#666' }}>Best Period Contribution</span>
                                  <span style={{ fontWeight: 'bold', color: '#22c55e' }}>{((topPeriods[0].pnl / totalPnL) * 100).toFixed(1)}% of total P&L</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: darkMode ? '#1f2937' : '#f3f4f6', borderRadius: '4px' }}>
                                  <span style={{ color: darkMode ? '#9ca3af' : '#666' }}>Worst Period Loss Impact</span>
                                  <span style={{ fontWeight: 'bold', color: '#ef4444' }}>{Math.abs((bottomPeriods[0].pnl / totalPnL) * 100).toFixed(1)}% of total P&L</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: darkMode ? '#1f2937' : '#f3f4f6', borderRadius: '4px' }}>
                                  <span style={{ color: darkMode ? '#9ca3af' : '#666' }}>Win Rate Range</span>
                                  <span style={{ fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{minWinRate.toFixed(1)}% - {maxWinRate.toFixed(1)}%</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Heatmap Grid */}
                  {heatmapResults && heatmapResults.data.length > 0 ? (
                    <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                      <h3 className={`text-lg font-bold ${textColor} mb-2`}>Performance Heatmap ({heatmapMetric === 'pnl' ? '₹ P&L' : heatmapMetric === 'winrate' ? 'Win Rate %' : 'Trade Count'})</h3>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>Resolution: {heatmapResolution} minutes • Hover for details</p>

                      {/* Create organized matrix structure using CSS Grid */}
                      <div className="overflow-x-auto">
                        <div style={{ display: 'grid', gridTemplateColumns: '100px repeat(7, 1fr)', gap: '2px', backgroundColor: darkMode ? '#374151' : '#e5e7eb', padding: '2px', minWidth: '1000px' }}>
                          {/* Header Row */}
                          <div style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '16px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
                            Time
                          </div>
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={`header-${day}`} style={{ backgroundColor: '#3b82f6', color: '#ffffff', padding: '16px', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
                              {day}
                            </div>
                          ))}

                          {/* Data Rows */}
                          {(() => {
                            const timeSlots = {};
                            heatmapResults.data.forEach(slot => {
                              const timePart = slot.period.split('-')[1];
                              if (!timeSlots[timePart]) timeSlots[timePart] = {};
                              const dayPart = slot.period.split('-')[0];
                              timeSlots[timePart][dayPart] = slot;
                            });

                            const sortedTimes = Object.keys(timeSlots).sort();
                            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

                            const allValues = heatmapResults.data.map(s => {
                              if (heatmapMetric === 'pnl') return Math.abs(s.pnl);
                              if (heatmapMetric === 'winrate') return s.winrate;
                              return s.trades;
                            });
                            const minVal = Math.min(...allValues);
                            const maxVal = Math.max(...allValues);
                            const range = maxVal - minVal || 1;

                            return sortedTimes.map(time => [
                              <div key={`time-${time}`} style={{ backgroundColor: darkMode ? '#374151' : '#e5e7eb', color: darkMode ? '#e5e7eb' : '#1f2937', padding: '16px', fontWeight: 'bold', fontSize: '13px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {time}
                              </div>,
                              ...days.map(day => {
                                const slot = timeSlots[time]?.[day];

                                if (!slot) {
                                  return (
                                    <div key={`${time}-${day}`} style={{ backgroundColor: darkMode ? '#1f2937' : '#f9fafb', padding: '24px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px', fontSize: '18px', color: darkMode ? '#6b7280' : '#9ca3af' }}>
                                      -
                                    </div>
                                  );
                                }

                                let displayValue;
                                let cellValue;
                                if (heatmapMetric === 'pnl') {
                                  cellValue = Math.abs(slot.pnl);
                                  displayValue = `₹${slot.pnl.toLocaleString()}`;
                                } else if (heatmapMetric === 'winrate') {
                                  cellValue = slot.winrate;
                                  displayValue = `${slot.winrate.toFixed(1)}%`;
                                } else {
                                  cellValue = slot.trades;
                                  displayValue = `${slot.trades}`;
                                }

                                const normalized = (cellValue - minVal) / range;
                                let bgColor;
                                let textCol;

                                if (heatmapMetric === 'pnl') {
                                  if (slot.pnl >= 0) {
                                    bgColor = `rgba(34, 197, 94, ${0.3 + normalized * 0.7})`;
                                    textCol = normalized > 0.4 ? '#ffffff' : '#000000';
                                  } else {
                                    bgColor = `rgba(239, 68, 68, ${0.3 + normalized * 0.7})`;
                                    textCol = normalized > 0.4 ? '#ffffff' : '#000000';
                                  }
                                } else {
                                  bgColor = `rgba(59, 130, 246, ${0.3 + normalized * 0.7})`;
                                  textCol = normalized > 0.4 ? '#ffffff' : '#000000';
                                }

                                return (
                                  <div
                                    key={`${time}-${day}`}
                                    style={{
                                      backgroundColor: bgColor,
                                      padding: '24px',
                                      textAlign: 'center',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      minHeight: '100px',
                                      cursor: 'pointer',
                                      transition: 'opacity 0.2s'
                                    }}
                                    title={`${slot.period}: P&L ₹${slot.pnl.toLocaleString()} | Win Rate ${slot.winrate}% | Trades: ${slot.trades}`}
                                    onMouseEnter={(e) => e.target.style.opacity = '0.8'}
                                    onMouseLeave={(e) => e.target.style.opacity = '1'}
                                  >
                                    <div style={{ textAlign: 'center' }}>
                                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: textCol }}>
                                        {displayValue}
                                      </div>
                                      <div style={{ fontSize: '12px', marginTop: '8px', color: textCol, opacity: 0.8 }}>
                                        {slot.trades} trade{slot.trades !== 1 ? 's' : ''}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                            ]);
                          })().flat()}
                        </div>
                      </div>

                      {/* Legend */}
                      <div style={{ marginTop: '24px', padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#f3f4f6' }}>
                        <p style={{ fontSize: '12px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937', marginBottom: '12px' }}>Legend:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                          {heatmapMetric === 'pnl' ? (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(34, 197, 94, 1)' }}></div>
                                <span style={{ fontSize: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>Highly Profitable</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(239, 68, 68, 1)' }}></div>
                                <span style={{ fontSize: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>Highly Losing</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(209, 213, 219, 0.5)' }}></div>
                                <span style={{ fontSize: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>No Data</span>
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 1)' }}></div>
                                <span style={{ fontSize: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>High Value</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(59, 130, 246, 0.3)' }}></div>
                                <span style={{ fontSize: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>Low Value</span>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: 'rgba(209, 213, 219, 0.5)' }}></div>
                                <span style={{ fontSize: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>No Data</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className={`${cardBg} rounded-lg p-8 text-center border ${borderColor}`}>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Click a resolution above to generate heatmap
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!results && activeTab === 'timepatterns' && timePatternsView === 'heatmap' && (
                <div className={`${cardBg} rounded-2xl p-12 text-center border ${borderColor}`}>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload and analyze a strategy to use heatmap features
                  </p>
                </div>
              )}

              {/* Exit & Stop Optimization Tab (Phase 6) */}
              {activeTab === 'optimization' && optimizationView === 'exit' && results && (
                <div className="space-y-6">
                  {/* Results */}
                  {optimizationResults ? (
                    <div className="space-y-6">
                      {/* Best Configuration */}
                      {optimizationResults.isGridSearch && (
                        <div className="grid grid-cols-4 gap-4">
                          <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                            <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Best Stop Loss</p>
                            <p className="text-2xl font-bold text-blue-600">{optimizationResults.bestConfig.stopLoss}%</p>
                          </div>
                          <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                            <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Best Take Profit</p>
                            <p className="text-2xl font-bold text-green-600">{optimizationResults.bestConfig.takeProfit}%</p>
                          </div>
                          <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                            <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Best P&L</p>
                            <p className={`text-2xl font-bold ${optimizationResults.bestConfig.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ₹{optimizationResults.bestConfig.totalPnL.toLocaleString()}
                            </p>
                          </div>
                          <div className={`${cardBg} rounded-lg p-4 border ${borderColor}`}>
                            <p className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Best Profit Factor</p>
                            <p className="text-2xl font-bold text-purple-600">{optimizationResults.bestConfig.profitFactor.toFixed(2)}</p>
                          </div>
                        </div>
                      )}

                      {/* Comparison Table */}
                      <div className={`${cardBg} rounded-lg p-6 border ${borderColor} overflow-x-auto`}>
                        <h3 className={`text-lg font-bold ${textColor} mb-4`}>{optimizationMode === 'auto' ? 'Top 10 Configurations' : 'Current Configuration'}</h3>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className={`border-b ${borderColor}`}>
                              <th className={`text-left py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Stop Loss %</th>
                              <th className={`text-left py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Take Profit %</th>
                              <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Win/Loss</th>
                              <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Total P&L</th>
                              <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Win Rate %</th>
                              <th className={`text-right py-2 px-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'} font-semibold`}>Profit Factor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {optimizationResults.configurations.slice(0, optimizationMode === 'auto' ? 10 : 1).map((config, idx) => (
                              <tr
                                key={idx}
                                className={`border-b ${borderColor} ${idx === 0 && optimizationMode === 'auto' ? 'bg-blue-50 dark:bg-blue-900 dark:bg-opacity-30' : ''}`}
                              >
                                <td className={`py-3 px-2 ${idx === 0 && optimizationMode === 'auto' ? 'font-bold text-blue-600' : textColor}`}>
                                  {config.stopLoss}%
                                </td>
                                <td className={`py-3 px-2 ${idx === 0 && optimizationMode === 'auto' ? 'font-bold text-blue-600' : textColor}`}>
                                  {config.takeProfit}%
                                </td>
                                <td className={`py-3 px-2 text-right ${textColor}`}>{config.wins}/{config.losses}</td>
                                <td className={`py-3 px-2 text-right ${config.totalPnL >= 0 ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}`}>
                                  ₹{config.totalPnL.toLocaleString()}
                                </td>
                                <td className={`py-3 px-2 text-right ${textColor}`}>{config.winRate.toFixed(2)}%</td>
                                <td className={`py-3 px-2 text-right ${textColor}`}>{config.profitFactor.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div className={`${cardBg} rounded-lg p-8 text-center border ${borderColor}`}>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Configure stop loss and take profit, then calculate or run grid search
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!results && activeTab === 'optimization' && (
                <div className={`${cardBg} rounded-2xl p-12 text-center border ${borderColor}`}>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload and analyze a strategy to use optimization features
                  </p>
                </div>
              )}

              {/* Trade Clustering Tab (Phase 2) */}
              {activeTab === 'insights' && insightsView === 'clustering' && results && (
                <div className="space-y-6">
                  {/* Clustering Results */}
                  {clusteringResults && (
                    <div className="space-y-6">
                      <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                        <h3 className={`text-lg font-bold ${textColor} mb-4`}>📊 Cluster Analysis Summary</h3>
                        <div className="grid grid-cols-2 gap-4">
                          {clusteringResults.correlationData.map((cluster, idx) => (
                            <div key={idx} style={{ padding: '16px', borderRadius: '8px', backgroundColor: darkMode ? '#374151' : '#f0f9ff', border: `1px solid ${darkMode ? '#4b5563' : '#bfdbfe'}` }}>
                              <p style={{ fontSize: '13px', fontWeight: 'bold', color: darkMode ? '#93c5fd' : '#1e40af', marginBottom: '12px' }}>{cluster.name}</p>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px' }}>Trade Count</p>
                                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{cluster.count}</p>
                                </div>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px' }}>Total P&L</p>
                                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: cluster.totalPnL >= 0 ? '#22c55e' : '#ef4444' }}>₹{cluster.totalPnL.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px' }}>Avg P&L</p>
                                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: cluster.avgPnL >= 0 ? '#22c55e' : '#ef4444' }}>₹{cluster.avgPnL.toLocaleString()}</p>
                                </div>
                                <div>
                                  <p style={{ color: darkMode ? '#9ca3af' : '#666', marginBottom: '4px' }}>Percentage</p>
                                  <p style={{ fontSize: '16px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{cluster.percentage}%</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Cluster Comparison Chart */}
                      <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                        <h3 className={`text-lg font-bold ${textColor} mb-4`}>Cluster Performance Comparison</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={clusteringResults.correlationData}>
                            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                            <XAxis dataKey="name" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                            <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="totalPnL" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!results && activeTab === 'insights' && insightsView === 'clustering' && (
                <div className={`${cardBg} rounded-2xl p-12 text-center border ${borderColor}`}>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload and analyze a strategy to use clustering features
                  </p>
                </div>
              )}

              {/* Weakness Detection Tab (Phase 5) */}
              {activeTab === 'insights' && insightsView === 'weakness' && results && (
                <div className="space-y-6">
                  {/* Weakness Results */}
                  {weaknessResults && (
                    <div className="space-y-6">
                      {/* Summary Stats */}
                      <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                        <h3 className={`text-lg font-bold ${textColor} mb-4`}>⚠️ Weakness Summary</h3>
                        <div className="grid grid-cols-4 gap-4">
                          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#374151' : '#f0f9ff' }}>
                            <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '11px', marginBottom: '4px' }}>Total Weaknesses</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#ef4444' }}>{weaknessResults.totalWeaknesses}</p>
                          </div>
                          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#374151' : '#f0f9ff' }}>
                            <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '11px', marginBottom: '4px' }}>Average P&L</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: weaknessResults.averageMetrics.avgPnL >= 0 ? '#22c55e' : '#ef4444' }}>₹{weaknessResults.averageMetrics.avgPnL.toLocaleString()}</p>
                          </div>
                          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#374151' : '#f0f9ff' }}>
                            <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '11px', marginBottom: '4px' }}>Average Win Rate</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{weaknessResults.averageMetrics.avgWinRate}%</p>
                          </div>
                          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#374151' : '#f0f9ff' }}>
                            <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '11px', marginBottom: '4px' }}>Threshold</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{weaknessResults.threshold}%</p>
                          </div>
                        </div>
                      </div>

                      {/* Weakness List */}
                      {weaknessResults.weaknesses.length > 0 ? (
                        <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                          <h3 className={`text-lg font-bold ${textColor} mb-4`}>Identified Weaknesses</h3>
                          <div className="space-y-4">
                            {weaknessResults.weaknesses.map((weakness, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '16px',
                                  borderRadius: '8px',
                                  backgroundColor: weakness.severity === 'Critical' ? (darkMode ? '#5e0e0e' : '#fee2e2') : weakness.severity === 'High' ? (darkMode ? '#78350f' : '#fef3c7') : (darkMode ? '#374151' : '#f0f9ff'),
                                  border: `2px solid ${weakness.severity === 'Critical' ? '#dc2626' : weakness.severity === 'High' ? '#f59e0b' : '#3b82f6'}`
                                }}
                              >
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '16px' }}>
                                  <div>
                                    <p style={{ fontSize: '12px', fontWeight: 'bold', color: weakness.severity === 'Critical' ? '#dc2626' : weakness.severity === 'High' ? '#d97706' : '#0284c7', marginBottom: '8px', textTransform: 'uppercase' }}>{weakness.severity} - {weakness.type}</p>
                                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937', marginBottom: '4px' }}>{weakness.period}</p>
                                    <p style={{ fontSize: '12px', color: darkMode ? '#d1d5db' : '#374151' }}>{weakness.description}</p>
                                  </div>
                                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                                    <div>
                                      <p style={{ fontSize: '10px', color: darkMode ? '#9ca3af' : '#666' }}>Actual Avg P&L</p>
                                      <p style={{ fontSize: '14px', fontWeight: 'bold', color: weakness.avgPnL >= 0 ? '#22c55e' : '#ef4444' }}>₹{weakness.avgPnL.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p style={{ fontSize: '10px', color: darkMode ? '#9ca3af' : '#666' }}>Expected P&L</p>
                                      <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#3b82f6' }}>₹{weakness.expectedPnL.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p style={{ fontSize: '10px', color: darkMode ? '#9ca3af' : '#666' }}>Loss Amount</p>
                                      <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#ef4444' }}>₹{weakness.lossAmount.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <p style={{ fontSize: '10px', color: darkMode ? '#9ca3af' : '#666' }}>Win Rate</p>
                                      <p style={{ fontSize: '14px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{weakness.winRate}%</p>
                                    </div>
                                    <div>
                                      <p style={{ fontSize: '10px', color: darkMode ? '#9ca3af' : '#666' }}>Trade Count</p>
                                      <p style={{ fontSize: '14px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{weakness.tradeCount}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className={`${cardBg} rounded-lg p-8 text-center border ${borderColor}`}>
                          <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            No significant weaknesses detected with current threshold
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!results && activeTab === 'insights' && insightsView === 'weakness' && (
                <div className={`${cardBg} rounded-2xl p-12 text-center border ${borderColor}`}>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload and analyze a strategy to use weakness detection features
                  </p>
                </div>
              )}

              {/* Balanced Optimization Tab (Phase 7) */}
              {activeTab === 'optimization' && optimizationView === 'balanced' && results && (
                <div className="space-y-6">
                  {/* Auto Optimization Status */}
                  <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#10b981', border: '2px solid #059669' }}>
                    <p style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                      ✅ AUTOMATED OPTIMIZATION RUNNING
                    </p>
                    <p style={{ color: '#ffffff', fontSize: '12px', opacity: 0.9 }}>
                      {isBalancedOptimizing ? 'Analyzing 192 configurations...' : 'Optimization complete! Results below.'}
                    </p>
                  </div>

                  {/* Quick Presets */}
                  <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                    <h3 className={`text-lg font-bold ${textColor} mb-4`}>⚡ Quick Optimization Presets</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <button
                        onClick={() => {
                          setOptimizationObjective('sharpe');
                          setMaxDrawdownTarget(20);
                          setMinWinRateTarget(50);
                          setTimeout(() => performBalancedOptimization(), 100);
                        }}
                        className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        🎯 Conservative (Low Risk)
                      </button>
                      <button
                        onClick={() => {
                          setOptimizationObjective('profitfactor');
                          setMaxDrawdownTarget(30);
                          setMinWinRateTarget(45);
                          setTimeout(() => performBalancedOptimization(), 100);
                        }}
                        className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        ⚖️ Balanced
                      </button>
                      <button
                        onClick={() => {
                          setOptimizationObjective('riskadjusted');
                          setMaxDrawdownTarget(40);
                          setMinWinRateTarget(40);
                          setTimeout(() => performBalancedOptimization(), 100);
                        }}
                        className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        🚀 Aggressive (High Return)
                      </button>
                    </div>
                  </div>

                  {/* Optimization Results */}
                  {balancedOptimizationResults && balancedOptimizationResults.bestConfig && (
                    <div className="space-y-6">
                      {/* Best Configuration */}
                      <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#6d28d9', border: '2px solid #5b21b6' }}>
                        <div style={{ color: '#ffffff', textAlign: 'center' }}>
                          <p style={{ fontSize: '12px', fontWeight: 'bold', opacity: 0.9, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>⭐ BEST BALANCED CONFIGURATION</p>
                          <p style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>SL: {balancedOptimizationResults.bestConfig.stopLoss}% | TP: {balancedOptimizationResults.bestConfig.takeProfit}% | Min WR: {balancedOptimizationResults.bestConfig.minWinRate}%</p>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px', marginTop: '12px', fontSize: '12px' }}>
                            <div>
                              <p style={{ opacity: 0.8 }}>Total P&L</p>
                              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>₹{balancedOptimizationResults.bestConfig.totalPnL.toLocaleString()}</p>
                            </div>
                            <div>
                              <p style={{ opacity: 0.8 }}>Sharpe Ratio</p>
                              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{balancedOptimizationResults.bestConfig.sharpeRatio}</p>
                            </div>
                            <div>
                              <p style={{ opacity: 0.8 }}>Profit Factor</p>
                              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{balancedOptimizationResults.bestConfig.profitFactor}</p>
                            </div>
                            <div>
                              <p style={{ opacity: 0.8 }}>Max Drawdown</p>
                              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>₹{balancedOptimizationResults.bestConfig.maxDrawdown.toLocaleString()}</p>
                            </div>
                            <div>
                              <p style={{ opacity: 0.8 }}>Win Rate</p>
                              <p style={{ fontSize: '14px', fontWeight: 'bold' }}>{balancedOptimizationResults.bestConfig.winRate}%</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Summary Stats */}
                      <div className={`${cardBg} rounded-lg p-6 border ${borderColor}`}>
                        <h3 className={`text-lg font-bold ${textColor} mb-4`}>📊 Optimization Summary</h3>
                        <div className="grid grid-cols-5 gap-4">
                          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#374151' : '#f0f9ff' }}>
                            <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '11px', marginBottom: '4px' }}>Qualifying Configs</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>{balancedOptimizationResults.diversificationMetrics.qualifyingCount}</p>
                          </div>
                          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#374151' : '#f0f9ff' }}>
                            <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '11px', marginBottom: '4px' }}>Avg Score</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{balancedOptimizationResults.diversificationMetrics.avgScore.toFixed(2)}</p>
                          </div>
                          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#374151' : '#f0f9ff' }}>
                            <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '11px', marginBottom: '4px' }}>SL Range</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{balancedOptimizationResults.diversificationMetrics.slRange.toFixed(1)}%</p>
                          </div>
                          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#374151' : '#f0f9ff' }}>
                            <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '11px', marginBottom: '4px' }}>TP Range</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{balancedOptimizationResults.diversificationMetrics.tpRange.toFixed(1)}%</p>
                          </div>
                          <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: darkMode ? '#374151' : '#f0f9ff' }}>
                            <p style={{ color: darkMode ? '#9ca3af' : '#666', fontSize: '11px', marginBottom: '4px' }}>Objective</p>
                            <p style={{ fontSize: '18px', fontWeight: 'bold', color: darkMode ? '#e5e7eb' : '#1f2937', textTransform: 'capitalize' }}>{balancedOptimizationResults.objective}</p>
                          </div>
                        </div>
                      </div>

                      {/* Top 10 Configurations Table */}
                      <div className={`${cardBg} rounded-lg p-6 border ${borderColor} overflow-x-auto`}>
                        <h3 className={`text-lg font-bold ${textColor} mb-4`}>Top 10 Configurations</h3>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr style={{ borderBottom: `2px solid ${darkMode ? '#374151' : '#e5e7eb'}` }}>
                              <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#9ca3af' : '#666', fontWeight: 'bold' }}>Rank</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#9ca3af' : '#666', fontWeight: 'bold' }}>SL%</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#9ca3af' : '#666', fontWeight: 'bold' }}>TP%</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#9ca3af' : '#666', fontWeight: 'bold' }}>Min WR%</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#9ca3af' : '#666', fontWeight: 'bold' }}>Total P&L</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#9ca3af' : '#666', fontWeight: 'bold' }}>Sharpe</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#9ca3af' : '#666', fontWeight: 'bold' }}>Profit Factor</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#9ca3af' : '#666', fontWeight: 'bold' }}>Max DD</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#9ca3af' : '#666', fontWeight: 'bold' }}>Win Rate</th>
                              <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#9ca3af' : '#666', fontWeight: 'bold' }}>Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {balancedOptimizationResults.configurations.map((config, idx) => (
                              <tr
                                key={idx}
                                style={{
                                  backgroundColor: idx === 0 ? (darkMode ? 'rgba(109, 40, 217, 0.2)' : 'rgba(109, 40, 217, 0.1)') : 'transparent',
                                  borderBottom: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                                  padding: '12px'
                                }}
                              >
                                <td style={{ padding: '12px', color: idx === 0 ? '#8b5cf6' : (darkMode ? '#e5e7eb' : '#1f2937'), fontWeight: idx === 0 ? 'bold' : 'normal' }}>{idx + 1}</td>
                                <td style={{ padding: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{config.stopLoss}</td>
                                <td style={{ padding: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{config.takeProfit}</td>
                                <td style={{ padding: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{config.minWinRate}</td>
                                <td style={{ padding: '12px', color: config.totalPnL >= 0 ? '#22c55e' : '#ef4444', fontWeight: 'bold' }}>₹{config.totalPnL.toLocaleString()}</td>
                                <td style={{ padding: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{config.sharpeRatio}</td>
                                <td style={{ padding: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{config.profitFactor}</td>
                                <td style={{ padding: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>₹{config.maxDrawdown.toLocaleString()}</td>
                                <td style={{ padding: '12px', color: darkMode ? '#e5e7eb' : '#1f2937' }}>{config.winRate}%</td>
                                <td style={{ padding: '12px', color: '#8b5cf6', fontWeight: 'bold' }}>{config.score.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {balancedOptimizationResults && !balancedOptimizationResults.bestConfig && (
                    <div className={`${cardBg} rounded-lg p-8 text-center border ${borderColor}`}>
                      <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                        No qualifying configurations found with current constraints.
                      </p>
                      <p className={`${darkMode ? 'text-gray-500' : 'text-gray-500'} text-sm`}>
                        Try reducing the maximum drawdown limit or minimum win rate requirement.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!results && activeTab === 'optimization' && optimizationView === 'balanced' && (
                <div className={`${cardBg} rounded-2xl p-12 text-center border ${borderColor}`}>
                  <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    Upload and analyze a strategy to use balanced optimization features
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className={`${cardBg} rounded-lg shadow-2xl max-w-4xl w-full my-8 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${borderColor}`}>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                📚 How to Use TradingView Strategy Analyzer
              </h2>
              <button
                onClick={() => setShowHelpModal(false)}
                className={`p-2 rounded-lg hover:${darkMode ? 'bg-gray-700' : 'bg-gray-100'} transition-colors`}
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">

              {/* Getting Started */}
              <section>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Upload size={20} />
                  Getting Started
                </h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="mb-3">1. <strong>Upload Your CSV File</strong>: Click the "Choose CSV File" button to select your TradingView strategy export</p>
                  <p className="mb-3">2. <strong>Wait for Analysis</strong>: The application automatically processes your data and performs comprehensive analysis</p>
                  <p>3. <strong>View Results</strong>: Browse through different analysis tabs to explore your trading performance</p>
                </div>
              </section>

              {/* CSV Format */}
              <section>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <FileText size={20} />
                  CSV File Format Requirements
                </h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} space-y-3`}>
                  <p>Your TradingView CSV export should contain the following columns:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li><strong>Trade #</strong>: Unique identifier for each trade</li>
                    <li><strong>Type</strong>: "Entry" or "Exit" to identify trade phases</li>
                    <li><strong>Date/Time</strong>: Timestamp of the trade</li>
                    <li><strong>Net P&L INR</strong>: Profit/Loss in your currency</li>
                  </ul>
                  <p className="text-xs mt-3">Note: Each trade must have both an Entry and Exit record with matching trade numbers</p>
                </div>
              </section>

              {/* Configuration Options */}
              <section>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Settings size={20} />
                  Configuration Options
                </h3>
                <div className={`space-y-3`}>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">📊 Analysis Type</p>
                    <p className="text-sm">Choose how to analyze your trades:</p>
                    <ul className="text-sm list-disc list-inside mt-1">
                      <li><strong>Entry→Exit Combo</strong>: Combines entry and exit times for specific combinations</li>
                      <li><strong>Entry Time</strong>: Analyzes performance by entry time only</li>
                      <li><strong>Exit Time</strong>: Analyzes performance by exit time only</li>
                    </ul>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">⏱️ Interval (minutes)</p>
                    <p className="text-sm">Select time bucket size: <strong>1m, 3m, 5m, 15m, 30m, or 60m</strong> - smaller intervals = more detailed scalping analysis</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">📈 Show Results</p>
                    <p className="text-sm">Filter how many top results to display: Top 10, 15, 25, 50, 100, or All results</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">📅 Intraday Only</p>
                    <p className="text-sm">Check this to include only trades that enter and exit on the same day</p>
                  </div>
                </div>
              </section>

              {/* Navigation Tabs */}
              <section>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <BarChart3 size={20} />
                  Analysis Tabs Explained
                </h3>
                <div className={`space-y-3`}>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">👀 Overview</p>
                    <p className="text-sm">Summary statistics including total trades, overall win rate, and total P&L</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">💰 By Profitability</p>
                    <p className="text-sm">Most profitable time slots ranked by total P&L with weekly/monthly breakdown</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">🎯 By Win Rate</p>
                    <p className="text-sm">Highest win rate time slots with consistency metrics and performance history</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">⚡ By Profit Factor</p>
                    <p className="text-sm">Best profit factor (gross profit/gross loss ratio) time slots with detailed metrics</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">📊 Advanced Analytics</p>
                    <p className="text-sm">Interactive charts, heatmaps, and comprehensive visual analysis of trading performance</p>
                  </div>
                </div>
              </section>

              {/* Expandable Rows */}
              <section>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <ChevronRight size={20} />
                  Expandable Row Details
                </h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="mb-2">Each result row in the Profitability, Win Rate, and Profit Factor tabs has a <strong>"Show"</strong> button:</p>
                  <ul className="list-disc list-inside space-y-2 text-sm mt-3">
                    <li>Click <strong>"Show"</strong> to expand and view weekly/monthly performance breakdown</li>
                    <li>View consistency data: How your trades performed across different weeks and months</li>
                    <li>Click <strong>"Hide"</strong> to collapse the details</li>
                  </ul>
                </div>
              </section>

              {/* Pagination */}
              <section>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Table size={20} />
                  Pagination & Navigation
                </h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <p className="mb-2">Results are displayed <strong>15 records per page</strong>:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm mt-3">
                    <li>Use <strong>Previous/Next</strong> buttons to navigate between pages</li>
                    <li>Click <strong>numbered buttons</strong> to jump to a specific page</li>
                    <li>See current page indicator showing "Page X of Y"</li>
                  </ul>
                </div>
              </section>

              {/* Export Features */}
              <section>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <Download size={20} />
                  Export Your Results
                </h3>
                <div className={`space-y-2`}>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">📄 Export CSV</p>
                    <p className="text-sm">Download analysis results as a spreadsheet for further analysis in Excel or Google Sheets</p>
                  </div>
                  <div className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                    <p className="font-semibold mb-1">📋 Export TXT</p>
                    <p className="text-sm">Download results as plain text format for documentation or sharing</p>
                  </div>
                </div>
              </section>

              {/* Tips & Best Practices */}
              <section>
                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Tips & Best Practices
                </h3>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <ul className="list-disc list-inside space-y-2 text-sm">
                    <li><strong>Start with Profitability:</strong> See which time slots generate the most profit</li>
                    <li><strong>Check Win Rate:</strong> Verify consistency - high win rate = reliable strategy</li>
                    <li><strong>Use Profit Factor:</strong> Identify risk-reward efficiency of different times</li>
                    <li><strong>Review Weekly/Monthly Data:</strong> Click "Show" to see if patterns are consistent</li>
                    <li><strong>Try Different Intervals:</strong> Experiment with 5m, 15m, 30m, 60m to find optimal timeframes</li>
                    <li><strong>Use Filters Wisely:</strong> Show Results filter helps focus on top opportunities</li>
                    <li><strong>Dark Mode:</strong> Click the moon icon for comfortable late-night analysis</li>
                  </ul>
                </div>
              </section>

            </div>

            {/* Modal Footer */}
            <div className={`flex justify-end gap-2 p-6 border-t ${borderColor}`}>
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>

      {/* Footer */}
      <footer className={`${cardBg} border-t ${borderColor} mt-8`}>
        <div className="px-6 py-6 max-w-7xl mx-auto flex items-center justify-between">
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            © 2024 Simplifyed.in. All rights reserved.
          </p>
          <a 
            href="https://simplifyed.in" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`text-sm font-medium transition-colors ${
              darkMode 
                ? 'text-blue-400 hover:text-blue-300' 
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            Visit Simplifyed.in →
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ModernTradingAnalyzer;