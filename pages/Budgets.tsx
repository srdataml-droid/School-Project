
import React, { useState } from 'react';
import { Target, Plus, Save, DollarSign } from 'lucide-react';
import { Budget, CATEGORIES, Category, CATEGORY_COLORS, Expense } from '../types';
import { budgetService } from '../services/budgetService';

interface BudgetsProps {
  userId: string;
  budgets: Budget[];
  expenses: Expense[];
  onUpdate?: () => void;
}

const Budgets: React.FC<BudgetsProps> = ({ userId, budgets, expenses, onUpdate }) => {
  const [editingBudget, setEditingBudget] = useState<{ category: Category; amount: string } | null>(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const getSpentForCategory = (category: Category) => {
    return expenses
      .filter(exp => {
        const d = new Date(exp.date);
        return exp.category === category && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleSaveBudget = async () => {
    if (!editingBudget) return;
    const amountNum = parseFloat(editingBudget.amount);
    if (isNaN(amountNum)) return;

    // Fixed: Removed userId from budget object as per service definition Omit<Budget, 'id' | 'userId'>
    await budgetService.setBudget({
      category: editingBudget.category,
      amount: amountNum
    });
    // Trigger onUpdate to refresh data in parent
    onUpdate?.();
    setEditingBudget(null);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Budgets</h1>
        <p className="text-slate-500">Plan your monthly spending limits.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES.map(category => {
          const budget = budgets.find(b => b.category === category);
          const spent = getSpentForCategory(category);
          const isEditing = editingBudget?.category === category;
          const percentage = budget ? Math.min((spent / budget.amount) * 100, 100) : 0;
          const isOverBudget = budget && spent > budget.amount;

          return (
            <div key={category} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: CATEGORY_COLORS[category] }}
                    >
                      {category[0]}
                    </div>
                    <span className="font-bold text-slate-800">{category}</span>
                  </div>
                  {isOverBudget && (
                    <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-md font-bold uppercase">
                      Over Limit
                    </span>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        autoFocus
                        type="number"
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={editingBudget.amount}
                        onChange={(e) => setEditingBudget({ ...editingBudget, amount: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveBudget()}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveBudget}
                        className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" /> Save
                      </button>
                      <button
                        onClick={() => setEditingBudget(null)}
                        className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-bold text-slate-900">
                        ${spent.toFixed(0)} <span className="text-sm font-normal text-slate-400">/ ${budget?.amount.toFixed(0) || '0'}</span>
                      </div>
                      <span className={`text-xs font-bold ${isOverBudget ? 'text-red-500' : 'text-slate-400'}`}>
                        {percentage.toFixed(0)}%
                      </span>
                    </div>

                    <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`absolute top-0 left-0 h-full transition-all duration-500 ease-out rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-indigo-50'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-400">Remaining</span>
                      <span className={isOverBudget ? 'text-red-500' : 'text-emerald-500'}>
                        {budget ? `$${Math.max(0, budget.amount - spent).toFixed(0)}` : 'N/A'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {!isEditing && (
                <button
                  onClick={() => setEditingBudget({ category, amount: budget?.amount.toString() || '' })}
                  className="p-3 bg-slate-50 border-t border-slate-100 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Target className="w-4 h-4" /> Set Budget
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Budgets;
