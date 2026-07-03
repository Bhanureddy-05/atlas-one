import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Trash2, Plus, ArrowUpRight, ArrowDownRight, PiggyBank, Calendar } from 'lucide-react'
import api from '@/lib/api'
import toast from 'react-hot-toast'

export default function FinancePage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [transType, setTransType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  const fetchLogs = async () => {
    try {
      const res = await api.get('/finance/')
      setLogs(res.data)
      setLoading(false)
    } catch (e) {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid positive amount')
      return
    }

    const payload = {
      date,
      transaction_type: transType,
      amount: parseFloat(amount),
      category: category.trim(),
      description: description.trim() || null
    }

    try {
      await api.post('/finance/', payload)
      toast.success('💰 Finance log recorded! +5 XP')
      setAmount('')
      setCategory('')
      setDescription('')
      fetchLogs()
    } catch (err) {
      toast.error('Failed to log transaction')
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/finance/${id}`)
      toast.success('Transaction entry deleted')
      fetchLogs()
    } catch (e) {
      toast.error('Failed to delete transaction')
    }
  }

  // Calculate Aggregations
  const totalIncome = logs.filter(l => l.transaction_type === 'income').reduce((acc, curr) => acc + curr.amount, 0)
  const totalExpense = logs.filter(l => l.transaction_type === 'expense').reduce((acc, curr) => acc + curr.amount, 0)
  const totalSavings = logs.filter(l => l.transaction_type === 'savings').reduce((acc, curr) => acc + curr.amount, 0)
  const netBalance = totalIncome - totalExpense

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">💰 Finance Tracker</h1>
        <p style={{ color: '#64748b', fontSize: 14, marginTop: 4 }}>
          Log and balance your expenses, income, monthly savings, and budget targets.
        </p>
      </div>

      {/* Aggregate Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="glass-card" style={{ padding: 20, borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Total Income</span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>${totalIncome.toFixed(2)}</div>
        </div>

        <div className="glass-card" style={{ padding: 20, borderTop: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Total Expenses</span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
              <ArrowDownRight size={16} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>${totalExpense.toFixed(2)}</div>
        </div>

        <div className="glass-card" style={{ padding: 20, borderTop: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Total Savings</span>
            <div style={{ padding: 6, borderRadius: 8, background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
              <PiggyBank size={16} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>${totalSavings.toFixed(2)}</div>
        </div>

        <div className="glass-card" style={{ padding: 20, borderTop: `4px solid ${netBalance >= 0 ? '#06b6d4' : '#ef4444'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>Net Balance</span>
            <div style={{ padding: 6, borderRadius: 8, background: netBalance >= 0 ? 'rgba(6, 182, 212, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: netBalance >= 0 ? '#06b6d4' : '#ef4444' }}>
              <DollarSign size={16} />
            </div>
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#f1f5f9' }}>${netBalance.toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24, alignItems: 'start' }}>
        {/* Left: Transaction Form */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 20 }}>Log Transaction</h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Type</label>
                <select
                  className="input-field"
                  style={{ background: '#1a1a2e', height: 42 }}
                  value={transType}
                  onChange={e => setTransType(e.target.value)}
                >
                  <option value="expense">Expense 💸</option>
                  <option value="income">Income 📈</option>
                  <option value="savings">Savings 🐷</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input-field"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  required
                />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Category</label>
                <input
                  placeholder="e.g. Rent, Grocery, Salary"
                  className="input-field"
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6, display: 'block' }}>Description (Optional)</label>
              <input
                placeholder="Additional notes..."
                className="input-field"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" style={{ justifySelf: 'start', gap: 6 }}>
              <Plus size={15} /> Add Record
            </button>
          </form>
        </div>

        {/* Right: History List */}
        <div className="glass-card" style={{ padding: 24, maxHeight: 500, overflowY: 'auto' }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: '#f1f5f9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Calendar size={18} color="#818cf8" /> Transaction History
          </h3>

          {loading ? (
            <div style={{ display: 'grid', gap: 8 }}>
              <div className="skeleton" style={{ height: 40 }} />
              <div className="skeleton" style={{ height: 40 }} />
            </div>
          ) : logs.length > 0 ? (
            <div style={{ display: 'grid', gap: 10 }}>
              {logs.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '12px 16px', borderRadius: 10, background: 'rgba(255,255,255,0.01)',
                    border: '1px solid rgba(255,255,255,0.05)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      padding: 6, borderRadius: 8,
                      background: item.transaction_type === 'income' ? 'rgba(16, 185, 129, 0.15)' :
                                  item.transaction_type === 'savings' ? 'rgba(99, 102, 241, 0.15)' :
                                  'rgba(239, 68, 68, 0.15)',
                      color: item.transaction_type === 'income' ? '#10b981' :
                             item.transaction_type === 'savings' ? '#818cf8' :
                             '#f87171'
                    }}>
                      {item.transaction_type === 'income' ? <ArrowUpRight size={15} /> :
                       item.transaction_type === 'savings' ? <PiggyBank size={15} /> :
                       <ArrowDownRight size={15} />}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{item.category}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>
                        {item.date} {item.description && `• ${item.description}`}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{
                      fontSize: 14, fontWeight: 700,
                      color: item.transaction_type === 'income' ? '#34d399' :
                             item.transaction_type === 'savings' ? '#818cf8' :
                             '#f87171'
                    }}>
                      {item.transaction_type === 'income' ? '+' : '-'}${item.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDelete(item.id)}
                      style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', padding: 4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 13 }}>
              No transactions logged yet. Add your income and expenses to balance budget.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
