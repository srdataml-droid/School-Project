
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProfile, Expense, Budget } from './types';
import { expenseService } from './services/expenseService';
import { budgetService } from './services/budgetService';
import { authService } from './services/authService';

// Layout & Pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Budgets from './pages/Budgets';
import Login from './pages/Login';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authService.getCurrentUser();
          setUser(userData);
        } catch (err) {
          console.error("Auth check failed", err);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const fetchData = async () => {
    if (!user) return;
    try {
      const [expData, budData] = await Promise.all([
        expenseService.getExpenses(),
        budgetService.getBudgets()
      ]);
      setExpenses(expData);
      setBudgets(budData);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
      // Set up polling instead of real-time listeners for custom backend
      const interval = setInterval(fetchData, 30000); 
      return () => clearInterval(interval);
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading FinanceFlow...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {!user ? (
        <Routes>
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      ) : (
        // Fixed: Removed onLogout as Layout component handles logout internally
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard expenses={expenses} budgets={budgets} />} />
            <Route path="/expenses" element={<Expenses userId={user.uid} expenses={expenses} onUpdate={fetchData} />} />
            <Route path="/budgets" element={<Budgets userId={user.uid} budgets={budgets} expenses={expenses} onUpdate={fetchData} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
};

export default App;
