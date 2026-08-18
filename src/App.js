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
  Plus, 
  ArrowLeft,
  Box,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // ข้อมูลหมวดหมู่
  const categories = [
    { name: 'ห้องนอน', icon: Bed },
    { name: 'ห้องนั่งเล่น', icon: Sofa },
    { name: 'โซฟา & เก้าอี้พักผ่อน', icon: Armchair },
    { name: 'ห้องอาหาร/ห้องครัว', icon: Utensils },
    { name: 'ห้องทำงาน/ห้องเกมมิ่ง', icon: Monitor },
    { name: 'สินค้าพิเศษ', icon: Sparkles },
    { name: 'ของตกแต่ง', icon: Flower2 },
  ];

  // ข้อมูลตัวอย่างสินค้า
  const [products] = useState([
    {
      id: 'P003',
      name: 'เตียงนอนไม้สัก 6 ฟุต',
      category: 'ห้องนอน',
      price: 24500,
      size: '200 x 215 x 110 ซม.',
      location: 'โซน B ชั้น 2',
      status: 'มีสินค้าพร้อมส่ง',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&auto=format&fit=crop&q=60'
    }
  ]);

  // กรองสินค้าตามหมวดหมู่และช่องค้นหา
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-gray-800 font-sans">
      {/* Header Bar - Theme Navy & Gold */}
      <header className="bg-[#1B2A3A] text-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Zone */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-wide text-white">ราชาเฟอร์นิเจอร์</h1>
                <span className="text-[10px] bg-[#D4AF37] text-[#1B2A3A] font-bold px-2 py-0.5 rounded-full">
                  สำหรับพนักงาน
                </span>
              </div>
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
        
        {/* หน้าแรก: เลือกหมวดหมู่ */}
        {!selectedCategory && !searchTerm && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#1B2A3A] border-b-2 border-[#D4AF37] inline-block pb-1">
                ค้นหาตามหมวดหมู่
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat, index) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(cat.name)}
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
          </>
        )}

        {/* หน้าแสดงรายการสินค้า (เมื่อเลือกหมวดหมู่ หรือพิมพ์ค้นหา) */}
        {(selectedCategory || searchTerm) && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSearchTerm('');
                }}
                className="flex items-center gap-2 bg-white text-[#1B2A3A] border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ย้อนกลับไปหน้าหมวดหมู่</span>
              </button>

              {selectedCategory && (
                <span className="bg-amber-100 text-[#1B2A3A] font-semibold text-sm px-3 py-1 rounded-full border border-amber-200">
                  {selectedCategory}
                </span>
              )}
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="relative h-48 bg-gray-100">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-mono px-2 py-0.5 rounded">
                          {product.id}
                        </span>
                      </div>

                      <p className="text-2xl font-black text-[#1D4ED8] mb-3">
                        ฿{product.price.toLocaleString()}
                      </p>

                      <div className="space-y-1.5 text-xs text-gray-500 mb-4 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Box className="w-3.5 h-3.5 text-gray-400" />
                          <span>ขนาด: {product.size}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>วางหน้าร้าน: {product.location}</span>
                        </div>
                      </div>

                      <div className="bg-green-50 text-green-700 text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{product.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500">ไม่พบข้อมูลสินค้าที่ค้นหา</p>
              </div>
            )}
          </div>
        )}

      </main>
    </div>
  );
}
