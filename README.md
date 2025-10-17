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

### 📈 Advanced Insights
- **Consistency Analysis**: Weekly and monthly performance breakdowns for each time slot
- **Risk Metrics**: Maximum drawdown, consecutive wins/losses tracking
- **Comprehensive Statistics**: Best/worst performing weeks and months
- **Trade Duration Analysis**: Average and median trade holding periods

### 🎛️ Customizable Options
- **Flexible Time Intervals**: 5, 15, 30, or 60-minute analysis windows
- **Result Filtering**: Show top 10, 15, 25, 50, 100, or all results
- **Intraday Filter**: Option to analyze only same-day trades
- **Multiple Sorting**: Sort by profitability, win rate, or profit factor

### 📋 Data Export
- **PDF Reports**: Generate comprehensive strategy analysis reports
- **CSV Export**: Export filtered results for further analysis
- **Detailed Breakdown**: Include weekly/monthly performance data

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
4. Coolify auto-detects Docker configuration and deploys
5. Access your deployed application via provided URL

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

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
   - Select analysis type (Entry, Exit, or Combo)
   - Choose time interval (5m, 15m, 30m, 60m)
   - Set number of results to display
   - Toggle intraday-only filter if needed
3. **View Results**: Browse through different tabs (Profitability, Win Rate, Profit Factor)
4. **Explore Details**: Click "Expand" on any row to see weekly/monthly consistency data
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
│   └── TradingViewStrategyAnalyzer.js # Core analyzer component (1,330 lines)
├── Dockerfile                       # Multi-stage Docker build configuration
├── nginx.conf                       # Production web server configuration
├── package.json                     # Dependencies and build scripts
├── .dockerignore                    # Docker build exclusions
├── .gitignore                       # Git exclusions
├── README.md                        # This documentation file
├── DEPLOYMENT.md                    # Coolify deployment guide
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

## 🔮 Future Enhancements

Potential improvements that could be added:
- **Interactive Charts**: Visual representation of performance over time
- **Strategy Comparison**: Compare multiple strategy reports side-by-side
- **Advanced Filters**: Filter by date ranges, trade sizes, or other criteria
- **Automated Reporting**: Schedule regular analysis reports
- **API Integration**: Direct connection to TradingView or broker APIs
- **Machine Learning**: Predictive analysis of optimal trading times

---

**Last Updated**: October 2024  
**Version**: 1.0  
**File Size**: ~66KB (1,330 lines of code)