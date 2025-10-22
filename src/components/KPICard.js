import React, { memo } from 'react';

const KPICard = memo(({ title, value, subtitle, icon: Icon, color, darkMode }) => (
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
));

export default KPICard;
