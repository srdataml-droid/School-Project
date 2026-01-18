
import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell, 
  PieChart as RePieChart, 
  Pie 
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, ArrowRight } from 'lucide-react';
import { Expense, Budget, CATEGORY_COLORS, CATEGORIES } from '../types';
import { Link } from 'react-router-dom';

interface DashboardProps {
  expenses: Expense[];
  budgets: Budget[];
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, budgets }) => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const currentMonthExpenses = expenses.filter(exp => {
    const d = new Date(exp.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalSpent = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  
  // Data for Category breakdown
  const categoryData = CATEGORIES.map(cat => ({
    name: cat,
    value: currentMonthExpenses
      .filter(exp => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0)
  })).filter(d => d.value > 0);

  // Data for Spending vs Budget (Top 5 categories)
  const compareData = budgets
    .map(b => {
      const spent = currentMonthExpenses
        .filter(exp => exp.category === b.category)
        .reduce((sum, exp) => sum + exp.amount, 0);
      return {
        name: b.category,
        Budget: b.amount,
        Spent: spent
      };
    })
    .sort((a, b) => b.Budget - a.Budget)
    .slice(0, 5);

  const formatCurrency = (val: number) => `$${val.toLocaleString()}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500">Welcome back! Here's your monthly overview.</p>
        </div>
        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm inline-flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 px-3">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="text-slate-500 font-medium">Total Spent</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(totalSpent)}</div>
          <div className="mt-2 text-sm text-slate-400">This Month</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
              <Wallet className="w-6 h-6" />
            </div>
            <span className="text-slate-500 font-medium">Monthly Budget</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{formatCurrency(totalBudget)}</div>
          <div className="mt-2 text-sm text-slate-400">Total Allocated</div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-slate-500 font-medium">Remaining</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {formatCurrency(Math.max(0, totalBudget - totalSpent))}
          </div>
          <div className="mt-2 text-sm text-slate-400">Budget Left</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Spending by Category */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Spending Breakdown</h3>
          <div className="h-64">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </RePieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                No data for this month
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: CATEGORY_COLORS[d.name as keyof typeof CATEGORY_COLORS] }} 
                />
                <span className="text-slate-600 truncate">{d.name}</span>
                <span className="ml-auto font-medium">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget vs Actual */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Budget vs Actual</h3>
          <div className="h-64">
             {compareData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={compareData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis hide />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="Budget" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Spent" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 italic">
                Set budgets to see comparison
              </div>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-slate-200" />
              <span className="text-xs text-slate-600 font-medium">Budget</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-indigo-600" />
              <span className="text-xs text-slate-600 font-medium">Spent</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
          <Link to="/expenses" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {expenses.slice(0, 5).map(expense => (
            <div key={expense.id} className="py-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: CATEGORY_COLORS[expense.category] }}
                >
                  {expense.category[0]}
                </div>
                <div>
                  <div className="font-semibold text-slate-800">{expense.description}</div>
                  <div className="text-xs text-slate-500">{new Date(expense.date).toLocaleDateString()} • {expense.category}</div>
                </div>
              </div>
              <div className="font-bold text-slate-900">-{formatCurrency(expense.amount)}</div>
            </div>
          ))}
          {expenses.length === 0 && (
            <div className="py-12 text-center text-slate-400 italic">
              No transactions yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
