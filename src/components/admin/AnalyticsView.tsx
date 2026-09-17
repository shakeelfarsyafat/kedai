'use client';

import React, { useState, useEffect } from 'react';
import { AnalyticsSummary } from '@/types/coffee';
import { orderStore } from '@/lib/orderStore';
import { formatRupiah } from '@/lib/utils';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Award,
  Coffee,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setData(orderStore.getAnalytics());

    const unsubscribe = orderStore.subscribe(() => {
      setData(orderStore.getAnalytics());
    });

    return () => unsubscribe();
  }, []);

  if (!mounted || !data) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-500 text-sm">
        Memuat statistik penjualan Brew Bean...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pendapatan */}
        <div className="bg-[#0d171d] border border-[#1c3340] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pendapatan
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-300">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {formatRupiah(data.totalRevenueToday)}
            </div>
            <div className="mt-1 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
              <span>+18.4%</span>
              <span className="text-slate-400 font-normal">vs kemarin</span>
            </div>
          </div>
        </div>

        {/* Total Pesanan */}
        <div className="bg-[#0d171d] border border-[#1c3340] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Pesanan
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-300">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">{data.totalOrdersToday}</div>
            <div className="mt-1 text-[11px] text-slate-400">
              {data.activeOrdersCount} pesanan sedang aktif
            </div>
          </div>
        </div>

        {/* Rata-Rata Transaksi (AOV) */}
        <div className="bg-[#0d171d] border border-[#1c3340] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Rata-Rata Order
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-300">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {formatRupiah(data.averageOrderValue)}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">Nilai keranjang rata-rata</div>
          </div>
        </div>

        {/* Top Performer */}
        <div className="bg-[#0d171d] border border-[#1c3340] rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Menu Terlaris
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-lg font-bold text-cyan-200 line-clamp-1">
              {data.topSellingItems[0]?.name || 'Brew Bean Signature Macchiato'}
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              {data.topSellingItems[0]?.quantitySold || 0} porsi terjual hari ini
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend Area Chart */}
      <div className="bg-[#0d171d] border border-[#1c3340] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <span>Tren Pendapatan & Volume Penjualan</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Distribusi penjualan per 2 jam operasional kedai
            </p>
          </div>
          <div className="px-3 py-1 rounded-xl bg-[#080e12] border border-[#1c3340] text-xs text-cyan-300 font-medium">
            Hari Ini • Live Data
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.hourlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tealRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#007b9e" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#007b9e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#162b37" vertical={false} />
              <XAxis dataKey="hour" stroke="#607b8a" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#607b8a"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `Rp${val / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#080e12',
                  border: '1px solid #1c3340',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [formatRupiah(Number(val)), 'Pendapatan']}
                labelFormatter={(label) => `Pukul ${label}`}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00a2cc"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#tealRevenue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Layout: Top Selling Bar Chart + Category Distribution Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Leaderboard Bar Chart */}
        <div className="bg-[#0d171d] border border-[#1c3340] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Produk Terlaris (Top Selling)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Jumlah porsi yang paling sering dibeli</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.topSellingItems}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#162b37" horizontal={false} />
                <XAxis type="number" stroke="#607b8a" fontSize={11} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  width={120}
                  tickFormatter={(val) => (val.length > 15 ? `${val.substring(0, 14)}..` : val)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080e12',
                    border: '1px solid #1c3340',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any, item: any) => [
                    `${val} porsi (${formatRupiah(item.payload.revenue)})`,
                    'Terjual',
                  ]}
                />
                <Bar dataKey="quantitySold" fill="#007b9e" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="bg-[#0d171d] border border-[#1c3340] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Komposisi Kategori Pesanan</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Persentase kontribusi per kategori menu</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#080e12',
                    border: '1px solid #1c3340',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(val) => <span className="text-slate-300 text-xs">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
