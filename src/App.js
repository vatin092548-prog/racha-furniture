import React, { useState } from 'react';
import { 
  Bed, 
  Sofa, 
  Armchair, 
  Utensils, 
  Monitor, 
  Sparkles, 
  Flower2, 
  Search, 
  Plus 
} from 'lucide-react';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { name: 'ห้องนอน', icon: Bed },
    { name: 'ห้องนั่งเล่น', icon: Sofa },
    { name: 'โซฟา & เก้าอี้พักผ่อน', icon: Armchair },
    { name: 'ห้องอาหาร/ห้องครัว', icon: Utensils },
    { name: 'ห้องทำงาน/ห้องเกมมิ่ง', icon: Monitor },
    { name: 'สินค้าพิเศษ', icon: Sparkles },
    { name: 'ของตกแต่ง', icon: Flower2 },
  ];

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-gray-800 font-sans">
      {/* Header Bar - Navy Theme (#1B2A3A) */}
      <header className="bg-[#1B2A3A] text-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Zone */}
          <div className="flex items-center gap-3">
            {/* Crown Logo Vector */}
            <div className="text-[#D4AF37]">
              <svg width="42" height="42" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 70 L25 35 L40 55 L50 25 L60 55 L75 35 L85 70 Z" fill="none" />
                <circle cx="25" cy="30" r="4" fill="currentColor" />
                <circle cx="50" cy="20" r="4" fill="currentColor" />
                <circle cx="75" cy="30" r="4" fill="currentColor" />
                <path d="M18 78 Q50 83 82 78" strokeWidth="5" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-wide text-white">ราชาเฟอร์นิเจอร์</h1>
              <p className="text-xs text-[#D4AF37] tracking-widest font-semibold uppercase">RACHA FURNITURE</p>
            </div>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="ค้นหาชื่อสินค้า หรือ รหัสสินค้า..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white text-gray-800 pl-4 pr-10 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] text-sm shadow-inner"
              />
              <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
            </div>

            <button className="flex items-center gap-1.5 bg-[#2E7D32] hover:bg-[#25632A] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all whitespace-nowrap">
              <Plus className="w-4 h-4" />
              <span>เพิ่มสินค้าใหม่</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Category Header */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#1B2A3A] border-b-2 border-[#D4AF37] inline-block pb-1">
            ค้นหาตามหมวดหมู่
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, index) => {
            const IconComponent = cat.icon;
            return (
              <button
                key={index}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md hover:border-[#D4AF37] transition-all group text-left"
              >
                <div className="p-3 bg-[#F4E8C1] text-[#1B2A3A] rounded-lg group-hover:bg-[#1B2A3A] group-hover:text-[#D4AF37] transition-colors">
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="font-semibold text-gray-700 group-hover:text-[#1B2A3A]">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
