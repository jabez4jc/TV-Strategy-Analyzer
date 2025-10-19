# TradingView Strategy Analyzer

A comprehensive React-based tool for analyzing TradingView strategy reports to identify optimal trading time slots and maximize profitability.

## 🎯 Overview

The TradingView Strategy Analyzer is a powerful web application that processes CSV files exported from TradingView's strategy tester to provide detailed insights into trading performance across different time periods. It helps traders identify the most profitable time slots for entering and exiting trades, analyze consistency patterns, and optimize their trading schedules.

## ✨ Features

### 📊 Core Analysis Capabilities
- **Time Slot Analysis**: Analyze trading performance in customizable intervals (5, 15, 30, 60 minutes)
- **Multiple Analysis Types**:
  - **Entry Time Analysis**: Identify optimal market entry times
  - **Exit Time Analysis**: Find the best times to close positions
  - **Entry→Exit Combo Analysis**: Discover profitable entry-to-exit time combinations
- **Performance Metrics**: Comprehensive metrics including P&L, win rate, profit factor, and average trade duration
- **Interactive Data Visualization**: Rich charts and graphs for visual analysis

### 📈 Advanced Insights & Visualizations
- **Equity Curve Analysis**: Track portfolio performance progression over time with interactive line charts
- **Day of Week Performance**: Identify optimal trading days with visual bar charts
- **Temporal Analysis**: Comprehensive time-based performance breakdowns
- **Consistency Analysis**: Weekly and monthly performance breakdowns for each time slot
- **Risk Metrics**: Maximum drawdown, consecutive wins/losses tracking with visual indicators
- **Comprehensive Statistics**: Best/worst performing weeks and months
- **Trade Duration Analysis**: Average and median trade holding periods
- **Interactive Charts**: Powered by Recharts library for responsive, interactive data visualization

### 🎛️ Customizable Options
- **Flexible Time Intervals**: 1, 3, 5, 15, 30, or 60-minute analysis windows (includes scalping intervals)
- **Result Filtering**: Show top 10, 15, 25, 50, 100, or all results
- **Intraday Filter**: Option to analyze only same-day trades (entry and exit on same date)
  - **Applies globally to ALL tabs**: Overview, Heatmaps, Segmentation, Clustering, Optimization, etc.
  - **Excludes positional trades**: Multi-day positions are filtered out when enabled
  - **Instant updates**: All analysis re-runs automatically when toggled
  - **Example**: With Fibonacci test data, filters 822 → 689 trades (excludes 133 multi-day positions)
- **Multiple Sorting**: Sort by profitability, win rate, or profit factor

### 🔄 Multi-Strategy Comparison (Phase 1 - ENHANCED)
- **Multiple Strategy Upload**: Load and compare up to 5 CSV files simultaneously
- **Multi-Symbol Warning**: Automatic detection and warning when comparing different instruments (BANKNIFTY vs NIFTY, etc.)
  - Prominent yellow warning banner with detailed explanation
  - Lists all symbols being compared
  - Warns about incomparability due to different volatility and market conditions
- **Side-by-Side Metrics**: Compare key performance indicators across strategies
- **Overlay Equity Curves**: Visualize cumulative P&L progression for all strategies
- **Comprehensive Comparison Table**: Detailed metrics including P&L, win rate, profit factor, Sharpe ratio, and drawdown
- **Risk vs Return Analysis**: Scatter plot analysis of drawdown vs profitability
- **Best Strategy Auto-Detection**: Identify winners by multiple metrics (P&L, Win Rate, Profit Factor, Sharpe Ratio)
- **Performance Rankings**: Automatic ranking of strategies by profit factor
- **Intraday Filter Integration**: All comparisons respect the global intraday filter setting

### 📊 Advanced Segmentation (Phase 4)
- **Multiple Segmentation Types**:
  - **Day of Week**: Performance analysis by trading day
  - **Hour of Day**: Hourly performance breakdown
  - **P&L Direction**: Separate winning vs losing trades
  - **Trade Duration**: Performance by trade holding period
  - **Symbol**: Performance by trading instrument
- **Segment Performance Metrics**: Comprehensive metrics per segment including P&L, win rate, profit factor
- **Visual Comparisons**: Bar charts showing P&L and win rate across segments
- **Detailed Tables**: Sortable segment analysis with best/worst indicators
- **Drill-Down Details**: Click segments for individual trade details

### 🔥 Enhanced Time-of-Day Heatmaps (Phase 3 - NEW)
- **Multi-Resolution Support**: 1, 5, 15, 30, 60-minute analysis buckets
- **2D Matrix Visualization**: Day of week × Time of day performance matrix
- **Multiple Metrics**: Display P&L, Win Rate %, or Trade Count
- **Color-Coded Intensity**: Green/red gradient shows profitable/unprofitable periods
- **Interactive Drill-Down**: Hover for detailed statistics (P&L, win rate, trade count)
- **Real-Time Switching**: Instantly toggle between resolutions and metrics

### 🎯 Exit & Stop Optimization (Phase 6 - NEW)
- **Manual Optimization**: Test specific stop-loss and take-profit combinations
- **Grid Search (Auto Mode)**: Automatically test 64 combinations (8×8 grid)
- **Configurable Ranges**:
  - Stop-Loss: 0.5% - 5%
  - Take-Profit: 1% - 10%
- **Monte Carlo Simulation**: Evaluates impact on all historical trades
- **Comprehensive Results**:
  - P&L impact for each configuration
  - Win rate and profit factor improvements
  - Top 10 best configurations ranked by profit factor
- **Best Configuration Detection**: Automatically identifies optimal parameters
- **Before/After Comparison**: Shows current vs optimized performance

### 🔗 Trade Clustering & Correlation (Phase 2 - ENHANCED)
- **5 Clustering Types**:
  - **Outcome**: Winners vs Losers analysis
  - **Entry Pattern**: Morning, Afternoon, Evening sessions
  - **Hour of Day**: 24-hour breakdown (00:00 - 23:00)
  - **Day of Week**: Monday - Sunday performance analysis
  - **Month**: Monthly performance tracking (Jan 2024, Feb 2024, etc.)
- **Comprehensive Cluster Metrics**: Trade count, total P&L, average P&L, win rate, best/worst trades
- **Performance Visualization**: Bar charts comparing cluster performance across all types
- **Pattern Recognition**: Identify common characteristics of winning trades
- **Temporal Insights**: Discover hour-by-hour, day-by-day, and month-by-month patterns
- **Actionable Insights**: Find trading patterns that consistently work at specific times

### ⚠️ Weakness Detection (Phase 5 - HIGH VALUE)
- **Automatic Weakness Identification**: Detects underperforming periods
- **Time-Based Detection**: Hourly weakness analysis (00:00-23:59)
- **Direction Analysis**: Separate analysis for Long vs Short positions
- **Configurable Thresholds**: 10% - 80% deviation detection
- **Severity Classification**: Critical (red), High (orange), Medium (blue) levels
- **Detailed Metrics**:
  - Actual vs Expected P&L comparison
  - Loss amount calculation per weakness
  - Win rate degradation analysis
  - Trade count per weakness period
- **Actionable Recommendations**: Specific periods to avoid or reduce exposure

### ⚙️ Balanced Optimization (Phase 7 - NICE TO HAVE)
- **Multi-Objective Optimization**:
  - Maximize Sharpe Ratio (risk-adjusted returns)
  - Maximize Profit Factor (returns per risk unit)
  - Maximize Risk-Adjusted Returns (Return on Drawdown)
- **Constraint-Based Filtering**:
  - Maximum drawdown limit (5% - 50%)
  - Minimum win rate requirement (20% - 80%)
- **Configuration Search**: 192 parameter combinations tested
- **Smart Ranking**: Top 10 best balanced configurations
- **Diversification Metrics**: Parameter range analysis and stability scoring
- **Best Configuration Highlight**: Clear identification of optimal settings
- **Complete Metrics Table**: All configurations with Sharpe ratio, profit factor, drawdown

### 📋 Data Export & Visualization
- **Interactive Charts**: LineCharts, BarCharts, ScatterCharts for visual analysis
- **PDF Reports**: Generate comprehensive strategy analysis reports with visual elements
- **CSV Export**: Export filtered results for further analysis
- **Chart Export**: Save visualizations and insights
- **Detailed Breakdown**: Include weekly/monthly performance data with visual trends

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- TradingView strategy report in CSV format
- Node.js (v18 or higher) for local development
- Git for version control

### Quick Deployment (Recommended)

**Deploy directly to Coolify:**
1. Fork or clone this repository
2. Push to your Git provider (GitHub, GitLab, etc.)
3. In Coolify, create new application from Git repository
4. Configure as Nixpacks with static site settings
5. Access your deployed application via provided URL

See [STATIC_DEPLOYMENT.md](STATIC_DEPLOYMENT.md) for detailed deployment instructions.

### Local Development

1. **Clone Repository**:
   ```bash
   git clone https://github.com/yourusername/tradingview-strategy-analyzer.git
   cd tradingview-strategy-analyzer
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start Development Server**:
   ```bash
   npm start
   ```
   Application will open at `http://localhost:3000`

4. **Build for Production**:
   ```bash
   npm run build
   ```

### Using the Application

1. **Upload CSV File**: Click "Choose CSV File" and select your TradingView strategy report
2. **Configure Analysis**:
   - Select analysis type (Entry, Exit, or Entry→Exit Combo)
   - Choose time interval (5m, 15m, 30m, 60m)
   - Set number of results to display (Top 10, 15, 25, 50, 100, or All)
   - Toggle intraday-only filter if needed
3. **View Results**: Browse through 12 specialized analysis tabs:
   - **Overview**: Summary statistics, key metrics, equity curve, and trading insights
   - **By Profitability**: Most profitable time slots with weekly/monthly breakdown
   - **By Win Rate**: Highest win rate time slots with consistency metrics
   - **By Profit Factor**: Best profit factor time slots with performance breakdown
   - **Advanced Analytics**: Comprehensive visual analysis with Sharpe ratio, Sortino ratio, day/week performance
   - **Strategy Comparison**: Compare up to 5 strategies side-by-side with overlay charts
   - **Segmentation**: Analyze performance by day of week, hour of day, direction, duration, symbol
   - **Enhanced Heatmap**: 2D day×time matrix with 5 resolutions and multiple metrics (Phase 3)
   - **Exit Optimization**: Test stop-loss/take-profit combinations with grid search (Phase 6)
   - **Trade Clustering**: Group trades by outcome or entry pattern (Phase 2)
   - **Weakness Detection**: Identify underperforming periods with severity levels (Phase 5)
   - **Balanced Optimization**: Multi-objective parameter optimization with constraints (Phase 7)
4. **Explore Details**: Click "Show" on any row to expand and see:
   - Weekly Performance breakdown (P&L, Win Rate, or Profit Factor)
   - Monthly Performance breakdown (P&L, Win Rate, or Profit Factor)
   - Trading consistency patterns
5. **Export Data**: Use export buttons to save results as PDF or CSV

## 📁 File Structure

```
TV Strategy Analyzer/
├── public/
│   ├── index.html                   # HTML entry point with Tailwind CSS
│   └── manifest.json                # PWA manifest
├── src/
│   ├── App.js                       # Main App component
│   ├── index.js                     # React entry point
│   ├── index.css                    # Global styles and Tailwind utilities
│   └── TradingViewStrategyAnalyzer.js # Core analyzer component (1,934 lines)
├── package.json                     # Dependencies and build scripts
├── package-lock.json                # Dependency lock file
├── .gitignore                       # Git exclusions
├── README.md                        # This documentation file
├── STATIC_DEPLOYMENT.md             # Coolify deployment guide
└── .git/                           # Git repository data
```

## 📊 CSV File Format Requirements

Your TradingView CSV export should contain the following columns:
- **Trade #**: Unique identifier for each trade
- **Type**: "Entry" or "Exit" to identify trade phases
- **Date/Time**: Timestamp of the trade
- **Net P&L INR**: Profit/Loss in Indian Rupees (or your currency)

### Example CSV Structure:
```csv
Trade #,Type,Date/Time,Net P&L INR
1,Entry,2024-01-15 09:30:00,0
1,Exit,2024-01-15 11:45:00,150
2,Entry,2024-01-15 14:20:00,0
2,Exit,2024-01-15 15:30:00,-75
```

## 🔧 Component Architecture

### Main Component: `TradingViewStrategyAnalyzer`

**State Management:**
- File upload handling and validation
- Real-time analysis processing
- Results caching for performance
- UI state management (tabs, filters, configurations)

**Key Functions:**
- `parseFileName()`: Extracts strategy info from filename
- `parseAndCacheData()`: Processes CSV data and caches results
- `performAnalysis()`: Core analysis engine
- `exportToPDF()` / `exportToCSV()`: Data export functionality

**UI Components:**
- File upload interface with drag-and-drop styling
- Dynamic analysis configuration controls
- Interactive results tables with expandable rows
- Comprehensive strategy insights dashboard

## 📈 Analysis Metrics Explained

### Performance Metrics
- **Total P&L**: Sum of all trade profits/losses
- **Win Rate**: Percentage of profitable trades
- **Average P&L**: Mean profit/loss per trade
- **Profit Factor**: Ratio of gross profit to gross loss

### Risk Metrics
- **Maximum Drawdown**: Largest peak-to-trough decline
- **Current Drawdown**: Current decline from recent peak
- **Consecutive Wins/Losses**: Longest streaks of winning/losing trades

### Consistency Metrics
- **Weekly Consistency**: Percentage of profitable weeks
- **Monthly Consistency**: Percentage of profitable months
- **Temporal Performance**: Period-by-period breakdown

## 🎨 UI/UX Features

### Design Elements
- **Gradient Backgrounds**: Modern blue-to-purple color scheme
- **Responsive Layout**: Works on desktop and mobile devices
- **Interactive Tables**: Expandable rows with detailed breakdowns
- **Real-time Updates**: Instant recalculation when changing parameters

### User Experience
- **Intuitive Controls**: Clear labeling and tooltips
- **Visual Feedback**: Loading states and error handling
- **Data Visualization**: Color-coded performance indicators
- **Export Options**: Multiple format support for data sharing

## 🔍 Technical Implementation

### Core Technologies
- **React**: Component-based UI framework
- **Recharts**: Interactive data visualization library for charts and graphs
- **Lucide React**: Modern icon library
- **CSS-in-JS**: Tailwind-style inline styling
- **JavaScript ES6+**: Modern JavaScript features

### Performance Optimizations
- **Data Caching**: Avoid re-parsing when changing analysis parameters
- **Lazy Calculations**: Compute metrics only when needed
- **Efficient Rendering**: Optimized table rendering for large datasets

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES6+ JavaScript support required
- File API support for CSV processing

## 🤝 Contributing

This is a single-file React component that can be easily modified or extended:

1. **Adding New Metrics**: Extend the analysis functions to include additional trading metrics
2. **UI Enhancements**: Modify the component styling or add new visualization features
3. **Export Formats**: Add support for additional export formats (Excel, JSON, etc.)
4. **Chart Integration**: Add charts and graphs for visual data representation

## 📝 License

This project appears to be a custom trading analysis tool. Please ensure you have appropriate rights to use and modify the code according to your needs.

## 🆘 Support & Issues

For issues or feature requests:
1. Check the error messages displayed in the application
2. Ensure your CSV file follows the required format
3. Verify that your CSV contains both entry and exit trades
4. Make sure trade numbers match between entry and exit records

## 🎉 Recent Updates (v5.0)

### New in Version 5.0 - CRITICAL FIXES & ENHANCEMENTS:
- ✅ **Configuration Reactivity Improvements** (PHASE 1)
  - Fixed Weakness Detection metric trigger - instant updates when changing detection settings
  - Fixed Trade Clustering update delay - no more multiple clicks required
  - Fixed Segmentation update delay - instant refresh on configuration change
  - Fixed Balanced Optimization results display - results now show properly
  - Removed duplicate manual configuration sections - cleaner UI
  - Made sidebar sticky/fixed - configuration stays visible while scrolling
  - Fixed Strategy Comparison intraday filter - now applies correctly to multi-strategy analysis

- ✅ **1-Minute & 3-Minute Interval Support** (PHASE 2)
  - Added ultra-short intervals for scalping strategies
  - 6 total interval options: 1m, 3m, 5m, 15m, 30m, 60m
  - Perfect for high-frequency trading analysis
  - All analysis types support new intervals

- ✅ **Advanced Analytics Loading Indicator** (PHASE 3)
  - Visual feedback when re-analyzing with updated settings
  - Spinner animation with "Re-analyzing..." message
  - Prevents confusion about whether settings are taking effect
  - Applies to Analysis Type, Interval, and other configuration changes

- ✅ **Enhanced Trade Clustering** (PHASE 3)
  - **3 NEW clustering types added** (total now 5):
    - Hour of Day: 24-hour breakdown (00:00 - 23:00)
    - Day of Week: Monday - Sunday analysis
    - Month: Monthly performance tracking
  - Comprehensive metrics for all cluster types
  - Identify hourly trading patterns
  - Discover best/worst trading days
  - Track monthly performance trends

- ✅ **Multi-Symbol Comparison Warning** (PHASE 4)
  - Automatic detection when comparing different instruments
  - Prominent yellow warning banner with detailed explanation
  - Lists all symbols being compared (e.g., "BANKNIFTY, NIFTY")
  - Warns about incomparability due to different volatility/market conditions
  - Helps prevent misleading strategy comparisons

- ✅ **Strategy Comparison UX Improvements** (PHASE 2)
  - Moved to last tab position (makes sense as standalone feature)
  - Symbol option removed from Segmentation (irrelevant for single file)

### Previous Updates (v4.0 - MAJOR UX OVERHAUL):
- ✅ **Tab Consolidation: 12 Tabs → 7 Tabs (42% Reduction)**
  - Consolidated related tabs with dynamic view toggles for cleaner navigation
  - Logical feature grouping reduces cognitive load

- ✅ **Performance Analysis Tab** (3 views in 1):
  - Profitability Analysis (formerly separate tab)
  - Win Rate Analysis (formerly separate tab)
  - Profit Factor Analysis (formerly separate tab)
  - Dynamic view switching with independent pagination per view

- ✅ **Time Patterns Tab** (2 views in 1):
  - Segmentation Analysis
  - Enhanced Heatmap

- ✅ **Optimization Tab** (2 views in 1):
  - Exit & Stop Optimization
  - Balanced Optimization

- ✅ **Trade Insights Tab** (2 views in 1):
  - Trade Clustering & Correlation
  - Weakness Detection

- ✅ **Dynamic Sidebar Controls**:
  - Tab-specific controls appear only when relevant
  - View toggle buttons show for consolidated tabs
  - Intraday Only filter always visible (critical global functionality)
  - Configuration options move to sidebar, main area shows results only

- ✅ **Simplified Navigation**:
  - 7 main tabs: Overview, Performance Analysis, Advanced Analytics, Strategy Comparison, Time Patterns, Optimization, Trade Insights
  - Cleaner header with less clutter
  - All existing functionality preserved

### Previous Updates (v3.1):
- ✅ **CRITICAL FIX: Intraday Only Filter Now Works Globally**
  - Fixed major bug where Intraday Only filter only applied to Overview tab
  - All 7 navigation tabs now respect the filter setting consistently
  - Centralized filter logic with `getFilteredTrades()` helper function
  - **Impact**: When enabled, excludes multi-day positions from ALL analysis:
    - Enhanced Heatmaps now show only same-day trades
    - Segmentation analysis filters correctly
    - Trade Clustering respects filter
    - Weakness Detection uses filtered data
    - Exit Optimization applies filter
    - Balanced Optimization uses filtered trades
  - **User Experience**: Check "Intraday Only" → All tabs instantly filter to same-day trades
  - **Validation**: Tested with real data (822 trades: 83.8% intraday, 16.2% positional)

### Previous Updates (v2.1):
- ✅ **Horizontal Navigation Bar**: Navigation moved to top of page for better layout
- ✅ **Expandable Row Details**: Added Show/Hide buttons on all analysis tables
- ✅ **Weekly/Monthly Performance Metrics**:
  - By Profitability: Weekly and Monthly P&L breakdown
  - By Win Rate: Weekly and Monthly Win Rate breakdown
  - By Profit Factor: Weekly and Monthly Profit Factor breakdown
- ✅ **Dynamic Pagination**: 15 records per page with full pagination controls
- ✅ **Smart Filtering**: Show Results filter (10, 15, 25, 50, 100, All) now works dynamically
- ✅ **Performance Improvements**: Instant filter updates without recalculation
- ✅ **Improved UI Layout**: Center-aligned navigation with collapsible sidebar menu

### Previous Updates (v2.0):
- ✅ **Interactive Charts**: Comprehensive data visualization with Recharts
- ✅ **Equity Curve Analysis**: Track portfolio performance over time
- ✅ **Day of Week Analysis**: Visual analysis of trading performance by weekday
- ✅ **Enhanced Visualizations**: LineCharts, BarCharts, ScatterCharts
- ✅ **Improved Data Processing**: More robust analysis capabilities
- ✅ **Rich Visual Insights**: Interactive charts for all analysis types

## 🧪 Testing & Validation

### Test Files Available
The application includes comprehensive test files in the `TestCSVFiles/` folder with real trading data:

| File | Trades | P&L | Win Rate | Size | Use Case |
|------|--------|-----|----------|------|----------|
| Fibonacci Retracement | 822 | -763K | 25.91% | 199 KB | **Initial testing** |
| Scalper BANKNIFTY | 2,417 | -2.7M | 24.33% | 592 KB | Medium dataset |
| VWAP RSI | 6,924 | -8.2M | 14.24% | 1.7 MB | Large dataset |
| Scalper Bitcoin | 4,974 | 0 | 0% | 1.1 MB | Edge case testing |

**Total:** 15,137 trades across 4 files

### Quick Testing Guide
1. Open http://localhost:3000
2. Click "Upload File"
3. Select a CSV file from `TestCSVFiles/` folder
4. Verify results appear in all tabs
5. Test features (heatmaps, optimization, analysis)

### Testing Documentation
- **FEATURE_TESTING_GUIDE.md** - Complete step-by-step testing instructions
- **TEST_FILES_INVENTORY.md** - Detailed file analysis and metrics
- **TEST_VALIDATION_REPORT.md** - Comprehensive validation results

---

## 🔮 Future Enhancements

Potential improvements that could be added:
- **Advanced Chart Types**: Candlestick charts, correlation matrices
- **Advanced Filters**: Filter by date ranges, trade sizes, or other criteria
- **Automated Reporting**: Schedule regular analysis reports
- **API Integration**: Direct connection to TradingView or broker APIs
- **Machine Learning**: Predictive analysis of optimal trading times
- **Real-time Data**: Live trading performance monitoring

---

**Last Updated**: October 2025
**Version**: 3.0 with All 7 Analysis Phases Complete
**File Size**: ~176KB (4,863 lines of code)
**Test Coverage**: 4 comprehensive test files (15,137 trades)
**Core Dependencies**:
- React for UI framework
- Recharts for interactive data visualization
- Lucide React for modern icons
- Tailwind CSS for styling