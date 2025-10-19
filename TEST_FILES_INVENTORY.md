# Test Files Inventory & Testing Guide

## 📂 TestCSVFiles Folder Contents

All test strategy files are organized in `/TestCSVFiles/` directory with comprehensive trading data.

### Test Files Overview

| # | Strategy Name | Instrument | Trades | P&L | Win Rate | Size | Lines |
|---|---|---|---|---|---|---|---|
| 1 | Fibonacci Retracement | NSE BANKNIFTY1! | 822 | ₹-763,878 | 25.91% | 199 KB | 1,645 |
| 2 | Scalper (BTC) | DELTAIN BTCUSD.P | 4,974 | ₹0.00 | 0.00% | 1.1 MB | 9,949 |
| 3 | Scalper (BANKNIFTY) | NSE BANKNIFTY1! | 2,417 | ₹-2,744,599 | 24.33% | 592 KB | 4,835 |
| 4 | VWAP RSI | NSE BANKNIFTY1! | 6,924 | ₹-8,258,251 | 14.24% | 1.7 MB | 13,849 |

**Total:** 4 files, 15,137 trades, 30,274 lines

### File Details

#### 1️⃣ Fibonacci_Retracement_Strategy_NSE_BANKNIFTY1!_2025-10-19_f3457.csv
- **Trades:** 822 (213 wins / 609 losses)
- **P&L:** ₹-763,878.22
- **Win Rate:** 25.91%
- **Size:** 199 KB
- **Best for:** Medium-dataset testing
- **Characteristics:** Moderate activity, diverse time distribution

#### 2️⃣ Scalper_DELTAIN_BTCUSD.P_2025-10-19_d4ee4.csv
- **Trades:** 4,974 (0 wins / 4,974 losses)
- **P&L:** ₹0.00 (possibly incomplete data)
- **Win Rate:** 0.00%
- **Size:** 1.1 MB
- **Best for:** Large dataset testing, edge case handling
- **Characteristics:** High frequency, large dataset

#### 3️⃣ Scalper_NSE_BANKNIFTY1!_2025-10-19_de943.csv
- **Trades:** 2,417 (588 wins / 1,829 losses)
- **P&L:** ₹-2,744,598.79
- **Win Rate:** 24.33%
- **Size:** 592 KB
- **Best for:** Medium-to-large dataset testing
- **Characteristics:** Scalping strategy, higher loss rate

#### 4️⃣ VWAP_RSI_NSE_BANKNIFTY1!_2025-10-19_a1d1b.csv
- **Trades:** 6,924 (986 wins / 5,938 losses)
- **P&L:** ₹-8,258,250.90
- **Win Rate:** 14.24%
- **Size:** 1.7 MB
- **Best for:** Large dataset testing, performance validation
- **Characteristics:** High volume, low win rate, needs optimization

---

## 🧪 Testing Strategy

### Phase 1: Basic Functionality (File: Fibonacci_Retracement)
✅ Verify CSV parsing works
✅ Confirm data displays in Overview tab
✅ Check all 12 tabs populate
✅ Verify analysis completes without errors

### Phase 2: Medium Dataset (File: Scalper_NSE_BANKNIFTY1)
✅ Test with 2,417 trades (2.9x larger)
✅ Verify heatmap rendering
✅ Check performance metrics
✅ Confirm time-based analysis works

### Phase 3: Large Dataset (File: VWAP_RSI)
✅ Test with 6,924 trades (8.4x larger)
✅ Verify app handles volume
✅ Check memory usage
✅ Confirm all calculations are accurate

### Phase 4: Edge Case (File: Scalper_DELTAIN_BTC)
✅ Handle all-loss scenario
✅ Test with 4,974 trades
✅ Verify error handling
✅ Check UI stability

---

## 🎯 Testing Checklist

### Test 1: Fibonacci Retracement (822 trades)
**File:** `Fibonacci_Retracement_Strategy_NSE_BANKNIFTY1!_2025-10-19_f3457.csv`

- [ ] File uploads successfully
- [ ] Overview shows: 822 trades, -763,878 P&L, 25.91% win rate
- [ ] By Profitability tab has data
- [ ] By Win Rate tab has data
- [ ] By Profit Factor tab has data
- [ ] Day of Week analysis complete
- [ ] Hour Analysis heatmap renders
- [ ] Trade Clustering shows results
- [ ] Weakness Detection identifies issues
- [ ] Enhanced Heatmaps display correctly
- [ ] Segmentation analysis works
- [ ] Exit Optimization calculates
- [ ] Balanced Optimization auto-runs
- [ ] All charts render without errors
- [ ] No console errors

### Test 2: Scalper BANKNIFTY (2,417 trades)
**File:** `Scalper_NSE_BANKNIFTY1!_2025-10-19_de943.csv`

- [ ] File uploads and parses
- [ ] Overview shows: 2,417 trades, -2,744,599 P&L, 24.33% win rate
- [ ] All analysis features work
- [ ] Performance is acceptable (<5 sec)
- [ ] Heatmap renders with high-density data
- [ ] No memory leaks detected

### Test 3: VWAP RSI (6,924 trades)
**File:** `VWAP_RSI_NSE_BANKNIFTY1!_2025-10-19_a1d1b.csv`

- [ ] File uploads successfully
- [ ] Overview shows: 6,924 trades, -8,258,251 P&L, 14.24% win rate
- [ ] Analysis completes (may take 5-10 seconds)
- [ ] All tabs populate with data
- [ ] Charts render correctly
- [ ] App remains responsive
- [ ] No lag or freezing

### Test 4: Scalper Bitcoin (4,974 trades, all losses)
**File:** `Scalper_DELTAIN_BTCUSD.P_2025-10-19_d4ee4.csv`

- [ ] File uploads despite all-loss scenario
- [ ] Overview handles 0% win rate
- [ ] No division-by-zero errors
- [ ] Edge cases handled gracefully
- [ ] UI remains stable

---

## 📊 Expected Results Summary

### Fibonacci Retracement
```
Total Trades: 822
Total P&L: -₹763,878.22
Win Rate: 25.91% (213 wins, 609 losses)
Profit Factor: 0.66
Status: MODERATE LOSS (needs optimization)
```

### Scalper BANKNIFTY
```
Total Trades: 2,417
Total P&L: -₹2,744,598.79
Win Rate: 24.33% (588 wins, 1,829 losses)
Profit Factor: 0.62
Status: HIGH LOSS (poor performance)
```

### VWAP RSI
```
Total Trades: 6,924
Total P&L: -₹8,258,250.90
Win Rate: 14.24% (986 wins, 5,938 losses)
Profit Factor: 0.35
Status: VERY HIGH LOSS (needs major improvement)
```

### Scalper Bitcoin
```
Total Trades: 4,974
Total P&L: ₹0.00
Win Rate: 0.00% (0 wins, 4,974 losses)
Profit Factor: 0.00
Status: EDGE CASE (all losses, data validation)
```

---

## 🚀 Quick Testing Commands

### Test Each File Manually

1. **Open Application**
   ```
   URL: http://localhost:3000
   ```

2. **Upload Each File in Order**
   ```
   Fibonacci → Scalper_BANKNIFTY → VWAP_RSI → Scalper_Bitcoin
   ```

3. **For Each Upload, Verify**
   - Analysis completes
   - All tabs have data
   - No console errors
   - Performance is acceptable

### Test Performance

Monitor browser while testing large files:
- Open DevTools (F12)
- Monitor Network tab for timing
- Check Console for errors
- Monitor Memory for leaks

---

## 📈 Feature Coverage by Test File

| Feature | Fibonacci | Scalper BNF | VWAP RSI | Scalper BTC |
|---------|-----------|-------------|----------|------------|
| CSV Parsing | ✅ | ✅ | ✅ | ✅ |
| Trade Pairing | ✅ | ✅ | ✅ | ⚠️ |
| Overview Analysis | ✅ | ✅ | ✅ | ⚠️ |
| By Profitability | ✅ | ✅ | ✅ | ⚠️ |
| By Win Rate | ✅ | ✅ | ✅ | ⚠️ |
| Day of Week | ✅ | ✅ | ✅ | ✅ |
| Hour Analysis | ✅ | ✅ | ✅ | ✅ |
| Heatmap Display | ✅ | ✅ | ⚠️* | ✅ |
| Trade Clustering | ✅ | ✅ | ✅ | ⚠️ |
| Weakness Detection | ✅ | ✅ | ✅ | ✅ |
| Exit Optimization | ✅ | ✅ | ✅ | ✅ |
| Balanced Optimization | ✅ | ✅ | ✅ | ✅ |
| Performance | ✅ | ✅ | ⚠️* | ✅ |

*⚠️ = May require optimization for very large datasets

---

## 🧹 Cleanup Actions

### Removed Files
The following test files have been removed from the root directory:
- `sample_trade.csv` (basic test, superseded)
- `Test_Strategy_NSE_SBIN_2025-10-19.csv` (basic test, superseded)

### Reason
These files are replaced by comprehensive test files in the `TestCSVFiles/` folder with better coverage and real trading data.

### What to Keep
All files in `/TestCSVFiles/` should be committed to the repository for continuous testing.

---

## 📝 Testing Instructions for Users

### First Time Testing
1. Open http://localhost:3000
2. Click "Upload File"
3. Navigate to `TestCSVFiles/` folder
4. Select `Fibonacci_Retracement_Strategy_NSE_BANKNIFTY1!_2025-10-19_f3457.csv`
5. Verify results appear
6. Test features in each tab

### Comprehensive Testing
Repeat the above process with each file in TestCSVFiles:
1. Fibonacci Retracement (medium dataset)
2. Scalper BANKNIFTY (medium-large dataset)
3. VWAP RSI (large dataset)
4. Scalper Bitcoin (edge case)

### Expected Timings
- Small dataset (Fibonacci): 2-3 seconds
- Medium dataset (Scalper): 4-5 seconds
- Large dataset (VWAP): 5-10 seconds
- Edge case (Bitcoin): 3-5 seconds

---

## 🎯 Success Criteria

✅ **All Tests Pass If:**
1. Each file uploads without errors
2. Analysis completes for all files
3. All 12 tabs populate with data
4. No console errors appear
5. App remains responsive
6. Performance is acceptable (<10 seconds)
7. Charts render correctly
8. Heatmaps display without visual glitches
9. No memory leaks detected
10. Features work for all file sizes

❌ **Tests Fail If:**
1. File upload fails
2. Analysis never completes
3. Tabs show "No data"
4. Console shows errors
5. App becomes unresponsive
6. Performance is very slow (>30 seconds)
7. Charts don't render
8. Heatmap visually broken
9. Memory continuously increases
10. Features fail for large datasets

---

**Last Updated:** 2025-10-19
**Total Test Files:** 4
**Total Test Trades:** 15,137
**Status:** ✅ READY FOR TESTING
