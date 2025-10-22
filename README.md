# TradingView Strategy Analyzer

A comprehensive React-based tool for analyzing TradingView strategy reports to identify optimal trading time slots and maximize profitability.

## 🎯 Overview

The TradingView Strategy Analyzer is a powerful web application that processes CSV files exported from TradingView's strategy tester to provide detailed insights into trading performance across different time periods. It helps traders identify the most profitable time slots for entering and exiting trades, analyze consistency patterns, and optimize their trading schedules.

## ✨ Features

### 📊 Core Analysis Capabilities
- **Time Slot Analysis**: Analyze trading performance in customizable intervals (1, 3, 5, 15, 30, 60 minutes)
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
- **Flexible Time Intervals**: 1, 3, 5, 15, 30, or 60-minute analysis windows
- **Result Filtering**: Show top 10, 15, 25, 50, 100, or all results
- **Intraday Filter**: Option to analyze only same-day trades (entry and exit on same date)

### 🔄 Multi-Strategy Comparison
- **Multiple Strategy Upload**: Load and compare up to 5 CSV files simultaneously
- **Side-by-Side Metrics**: Compare key performance indicators across strategies
- **Overlay Equity Curves**: Visualize cumulative P&L progression for all strategies
- **Comprehensive Comparison Table**: Detailed metrics including P&L, win rate, profit factor, Sharpe ratio, and drawdown
- **Risk vs Return Analysis**: Scatter plot analysis of drawdown vs profitability
- **Best Strategy Auto-Detection**: Identify winners by multiple metrics (P&L, Win Rate, Profit Factor, Sharpe Ratio)

### 📊 Advanced Segmentation
- **Multiple Segmentation Types**: Day of Week, Hour of Day, P&L Direction, Trade Duration, and Symbol.
- **Segment Performance Metrics**: Comprehensive metrics per segment including P&L, win rate, profit factor
- **Visual Comparisons**: Bar charts showing P&L and win rate across segments

### 🔥 Enhanced Time-of-Day Heatmaps
- **Multi-Resolution Support**: 1, 5, 15, 30, 60-minute analysis buckets
- **2D Matrix Visualization**: Day of week × Time of day performance matrix
- **Multiple Metrics**: Display P&L, Win Rate %, or Trade Count
- **Color-Coded Intensity**: Green/red gradient shows profitable/unprofitable periods

### 🎯 Exit & Stop Optimization
- **Manual Optimization**: Test specific stop-loss and take-profit combinations
- **Grid Search (Auto Mode)**: Automatically test 64 combinations (8×8 grid)
- **Best Configuration Detection**: Automatically identifies optimal parameters

### 🔗 Trade Clustering & Correlation
- **5 Clustering Types**: Outcome, Entry Pattern, Hour of Day, Day of Week, and Month.
- **Comprehensive Cluster Metrics**: Trade count, total P&L, average P&L, win rate, best/worst trades
- **Performance Visualization**: Bar charts comparing cluster performance across all types

### ⚠️ Weakness Detection
- **Automatic Weakness Identification**: Detects underperforming periods
- **Configurable Thresholds**: 10% - 80% deviation detection
- **Severity Classification**: Critical, High, Medium levels

### 📋 Data Export & Visualization
- **Interactive Charts**: LineCharts, BarCharts, ScatterCharts for visual analysis
- **PDF/TXT Reports**: Generate comprehensive strategy analysis reports
- **CSV Export**: Export filtered results for further analysis

## 🚀 Getting Started

### Prerequisites
- Modern web browser with JavaScript enabled
- TradingView strategy report in CSV format
- Node.js (v18 or higher) for local development
- Git for version control

### Local Development

1. **Clone Repository**:
   ```bash
   git clone https://github.com/jabez4jc/TV-Strategy-Analyzer.git
   cd TV-Strategy-Analyzer
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
2. **Configure Analysis**: Use the sidebar to configure the analysis parameters.
3. **View Results**: Browse through the different tabs to explore your trading performance.
4. **Explore Details**: Click "Show" on any row to expand and see weekly/monthly performance breakdowns.
5. **Export Data**: Use export buttons to save results as PDF/TXT or CSV.

## 部署 (Deployment)

This application can be easily deployed to [Coolify](https://coolify.io/).

### Build Settings
- **Build Pack**: Nixpacks
- **Is it a static site?**: ✅ (Checked)
- **Is it a SPA (Single Page Application)?**: ✅ Yes, this is a standard Create React App build.
- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Publish Directory**: `build`

## 📁 File Structure

```
TV Strategy Analyzer/
├── public/
│   ├── index.html
│   └── manifest.json
├── src/
│   ├── App.js
│   ├── index.js
│   ├── index.css
│   ├── TradingViewStrategyAnalyzer.js
│   └── workers/
│       └── optimizationWorker.js
├── package.json
├── README.md
└── ...
```

## 📊 CSV File Format Requirements

Your TradingView CSV export should contain the following columns:
- **Trade #**: Unique identifier for each trade
- **Type**: "Entry" or "Exit" to identify trade phases
- **Date/Time**: Timestamp of the trade
- **Net P&L INR**: Profit/Loss in your currency

### Example CSV Structure:
```csv
Trade #,Type,Date/Time,Net P&L INR
1,Entry,2024-01-15 09:30:00,0
1,Exit,2024-01-15 11:45:00,150
2,Entry,2024-01-15 14:20:00,0
2,Exit,2024-01-15 15:30:00,-75
```

## 🔧 Technical Implementation

- **React**: Component-based UI framework
- **Recharts**: Interactive data visualization library
- **Lucide React**: Modern icon library
- **Tailwind CSS**: For styling (via inline styles)

## 🤝 Contributing

This is a single-file React component that can be easily modified or extended. Feel free to fork the repository and submit pull requests.

## 📝 License

This project is not under a specific license. Please ensure you have appropriate rights to use and modify the code according to your needs.
