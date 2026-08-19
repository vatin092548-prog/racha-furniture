import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Edit,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Lock,
  LogOut,
  KeyRound,
  Share2,
  Package,
  CheckCircle,
  Tag,
  LayoutDashboard,
  Flame,
  ArrowUpDown,
  MessageCircle,
  Camera
} from 'lucide-react';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter & Sort States
  const [filterPromoOnly, setFilterPromoOnly] = useState(false);
  const [filterInStockOnly, setFilterInStockOnly] = useState(false);
  const [sortByPrice, setSortByPrice] = useState('none');

  // Authentication States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const ADMIN_PIN = '1234';

  // Modal & Detail States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // ข้อมูลสินค้าเริ่มต้น
  const initialProducts = [
    {
      id: 'A1',
      name: 'COACHELL A-Q (ชุดห้องนอน 6 ชิ้น)',
      category: 'ห้องนอน',
      price: 16900,
      promoPrice: 10000,
      size: '5 ฟุต',
      location: '61',
      status: 'สินค้าตัวโชว์',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&auto=format&fit=crop&q=60',
      description: 'ชุดห้องนอน 6 ชิ้น ประกอบด้วย เตียง 5 ฟุต, ตู้เสื้อผ้า 158 ซม., โต๊ะแป้ง, ตู้ข้างเตียง, สตูล, ที่นอนสปริง'
    },
    {
      id: 'P002',
      name: 'โซฟาหนัง L-Shape พรีเมียม',
      category: 'ห้องนั่งเล่น',
      price: 32000,
      promoPrice: '',
      size: '280 x 160 x 90 ซม.',
      location: 'โซน A ชั้น 1',
      status: 'มีสินค้าพร้อมส่ง',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&auto=format&fit=crop&q=60',
      description: 'โซฟาหนังแท้สัมผัส นุ่มสบาย เบาะมีความยืดหยุ่นสูง รองรับสรีระได้ดีเยี่ยม'
    }
  ];

  // โหลดและบันทึกข้อมูลสินค้าใน localStorage
  const [products, setProducts] = useState(() => {
    const savedProducts = localStorage.getItem('racha_products');
    if (savedProducts) {
      try { return JSON.parse(savedProducts); } catch (e) { return initialProducts; }
    }
    return initialProducts;
  });

  useEffect(() => {
    localStorage.setItem('racha_products', JSON.stringify(products));
  }, [products]);

  // ตรวจจับ URL Direct Link (?product=ID)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('product');
    if (productId) {
      const found = products.find(p => p.id === productId);
      if (found) {
        setViewingProduct(found);
      }
    }
  }, [products]);

  // Form States
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'ห้องนอน',
    price: '',
    promoPrice: '',
    size: '',
    location: '',
    status: 'มีสินค้าพร้อมส่ง',
    image: '',
    description: ''
  });

  const categories = [
    { name: 'ห้องนอน', icon: Bed },
    { name: 'ห้องนั่งเล่น', icon: Sofa },
    { name: 'โซฟา & เก้าอี้พักผ่อน', icon: Armchair },
    { name: 'ห้องอาหาร/ห้องครัว', icon: Utensils },
    { name: 'ห้องทำงาน/ห้องเกมมิ่ง', icon: Monitor },
    { name: 'สินค้าพิเศษ', icon: Sparkles },
    { name: 'ของตกแต่ง', icon: Flower2 },
  ];

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleShareProduct = (product, e) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    const displayPrice = product.promoPrice ? `฿${Number(product.promoPrice).toLocaleString()} (จากปกติ ฿${Number(product.price).toLocaleString()})` : `฿${Number(product.price).toLocaleString()}`;
    const shareText = `🪑 ${product.name}\n💰 ราคา: ${displayPrice}\n📍 สาขาหาดใหญ่ (ถ.สามสิบเมตร) - วางหน้าโซน: ${product.location || '-'}\n\nดูรายละเอียดเพิ่มเติม:\n${shareUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      showToast('คัดลอกลิงก์เรียบร้อย! นำไปวางใน LINE ได้เลย');
    } else {
      showToast('ไม่สามารถคัดลอกข้อความได้อัตโนมัติ');
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsLoggedIn(true);
      setIsLoginModalOpen(false);
      setPinInput('');
      setLoginError('');
      showToast('เข้าสู่ระบบผู้ดูแลเรียบร้อยแล้ว');
    } else {
      setLoginError('รหัส PIN ไม่ถูกต้อง');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast('ออกจากระบบเรียบร้อย');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      id: `P00${products.length + 1}`,
      name: '',
      category: selectedCategory || 'ห้องนอน',
      price: '',
      promoPrice: '',
      size: '',
      location: '',
      status: 'มีสินค้าพร้อมส่ง',
      image: '',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (product, e) => {
    if (e) e.stopPropagation();
    setEditingProduct(product);
    setFormData({
      ...product,
      promoPrice: product.promoPrice || ''
    });
  };

  const handleDeleteProduct = (id, e) => {
    if (e) e.stopPropagation();
    if (window.confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) {
      setProducts(products.filter(p => p.id !== id));
      if (editingProduct) setEditingProduct(null);
      showToast('ลบสินค้าเรียบร้อย');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedData = {
      ...formData,
      price: Number(formData.price),
      promoPrice: formData.promoPrice ? Number(formData.promoPrice) : ''
    };

    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? updatedData : p));
      setEditingProduct(null);
      showToast('อัปเดตข้อมูลสินค้าและโปรโมชั่นแล้ว');
    } else {
      setProducts([...products, updatedData]);
      setIsAddModalOpen(false);
      showToast('เพิ่มสินค้าใหม่เรียบร้อยแล้ว');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPromo = filterPromoOnly ? Boolean(product.promoPrice) : true;
    const matchesStock = filterInStockOnly ? product.status !== 'สินค้าหมด' : true;

    return matchesCategory && matchesSearch && matchesPromo && matchesStock;
  }).sort((a, b) => {
    const getEffectivePrice = (p) => p.promoPrice ? Number(p.promoPrice) : Number(p.price);
    if (sortByPrice === 'asc') return getEffectivePrice(a) - getEffectivePrice(b);
    if (sortByPrice === 'desc') return getEffectivePrice(b) - getEffectivePrice(a);
    return 0;
  });

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-gray-800 font-sans pb-10 relative">
      
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1B2A3A] text-[#D4AF37] px-4 py-3 rounded-xl shadow-2xl border border-[#D4AF37] flex items-center gap-2 text-sm font-semibold animate-bounce">
          <Sparkles className="w-5 h-5 text-[#D4AF37]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <header className="bg-[#1B2A3A] text-white shadow-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedCategory(null); setSearchTerm(''); }}>
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
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold tracking-wide text-white">ราชาเฟอร์นิเจอร์</h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isLoggedIn ? 'bg-green-500 text-white' : 'bg-[#D4AF37] text-[#1B2A3A]'
                }`}>
                  {isLoggedIn ? 'ผู้ดูแลระบบ' : 'แคตตาล็อกออนไลน์'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[#D4AF37]">
                <MapPin className="w-3.5 h-3.5" />
                <span className="font-semibold">สาขาหาดใหญ่ (ถ.สามสิบเมตร)</span>
              </div>
            </div>
          </div>

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

            {isLoggedIn && (
              <button 
                onClick={handleOpenAddModal}
                className="flex items-center gap-1.5 bg-[#2E7D32] hover:bg-[#25632A] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all whitespace-nowrap cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มสินค้าใหม่</span>
              </button>
            )}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-md transition-all whitespace-nowrap cursor-pointer"
                title="ออกจากระบบจัดการ"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">ออกจากระบบ</span>
              </button>
            ) : (
              <button
                onClick={() => { setIsLoginModalOpen(true); setLoginError(''); }}
                className="flex items-center gap-1.5 bg-[#D4AF37] hover:bg-[#B5922B] text-[#1B2A3A] font-bold px-3 py-2 rounded-lg text-sm shadow-md transition-all whitespace-nowrap cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                <span>สำหรับเจ้าของร้าน</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">

        {/* Dashboard */}
        {isLoggedIn && (
          <div className="mb-8 bg-white p-5 rounded-2xl border border-amber-200 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="font-bold text-[#1B2A3A] text-lg">ภาพรวมระบบจัดการสินค้า (Admin Dashboard)</h2>
              </div>
              <span className="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-full border border-amber-200">
                📍 สาขาหาดใหญ่ (ถ.สามสิบเมตร)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-semibold mb-1">สินค้าทั้งหมดในร้าน</p>
                  <p className="text-2xl font-black text-blue-900">{products.length} รายการ</p>
                </div>
                <Package className="w-8 h-8 text-blue-400" />
              </div>

              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-red-600 font-semibold mb-1">สินค้าโปรโมชั่น</p>
                  <p className="text-2xl font-black text-red-900">
                    {products.filter(p => p.promoPrice).length} รายการ
                  </p>
                </div>
                <Tag className="w-8 h-8 text-red-400" />
              </div>

              <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs text-green-600 font-semibold mb-1">พร้อมส่ง/ตัวโชว์</p>
                  <p className="text-2xl font-black text-green-900">
                    {products.filter(p => p.status !== 'สินค้าหมด').length} รายการ
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </div>
        )}

        {/* หมวดหมู่สินค้า */}
        {!selectedCategory && !searchTerm && (
          <>
            <div className="mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-bold text-[#1B2A3A] border-b-2 border-[#D4AF37] inline-block pb-1">
                  หมวดหมู่สินค้าเฟอร์นิเจอร์
                </h2>
                <p className="text-xs text-gray-500 mt-1">เลือกหมวดหมู่เพื่อดูสินค้าที่วางหน้าร้าน สาขาหาดใหญ่ (ถ.สามสิบเมตร)</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {categories.map((cat, index) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedCategory(cat.name)}
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border border-amber-100 shadow-sm hover:shadow-md hover:border-[#D4AF37] transition-all group text-left cursor-pointer"
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

        {/* รายการสินค้า */}
        {(selectedCategory || searchTerm) && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <button
                onClick={() => { setSelectedCategory(null); setSearchTerm(''); }}
                className="flex items-center gap-2 bg-white text-[#1B2A3A] border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>ย้อนกลับไปหน้าหมวดหมู่</span>
              </button>

              {selectedCategory && (
                <span className="bg-amber-100 text-[#1B2A3A] font-semibold text-sm px-3 py-1 rounded-full border border-amber-200">
                  หมวด: {selectedCategory}
                </span>
              )}
            </div>

            {/* Quick Filters */}
            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-gray-500 mr-1">ตัวกรองด่วน:</span>
                <button
                  onClick={() => setFilterPromoOnly(!filterPromoOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterPromoOnly 
                      ? 'bg-red-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" />
                  <span>🔥 ลดพิเศษเฉพาะโปร</span>
                </button>

                <button
                  onClick={() => setFilterInStockOnly(!filterInStockOnly)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filterInStockOnly 
                      ? 'bg-green-600 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>📦 พร้อมส่ง/ตัวโชว์</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
                <select
                  value={sortByPrice}
                  onChange={(e) => setSortByPrice(e.target.value)}
                  className="bg-gray-50 border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg p-1.5 outline-none cursor-pointer"
                >
                  <option value="none">เรียงตามมาตรฐาน</option>
                  <option value="asc">ราคา: ต่ำ ➔ สูง</option>
                  <option value="desc">ราคา: สูง ➔ ต่ำ</option>
                </select>
              </div>
            </div>

            {/* สินค้า Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    onClick={() => setViewingProduct(product)}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 relative group cursor-pointer flex flex-col justify-between"
                  >
                    
                    {product.promoPrice && (
                      <div className="absolute top-3 left-3 z-10 bg-red-600 text-white font-bold text-[11px] px-2.5 py-1 rounded-md shadow-md flex items-center gap-1">
                        <Tag className="w-3 h-3" />
                        <span>ลดพิเศษ</span>
                      </div>
                    )}

                    {isLoggedIn && (
                      <div className="absolute top-3 right-3 flex gap-1.5 z-20">
                        <button 
                          onClick={(e) => handleOpenEditModal(product, e)}
                          className="bg-white/90 hover:bg-white text-gray-800 p-2 rounded-full shadow-lg border border-gray-200 transition-all cursor-pointer hover:scale-110"
                          title="แก้ไขสินค้า/โปรโมชั่น"
                        >
                          <Edit className="w-4 h-4 text-[#1B2A3A]" />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteProduct(product.id, e)}
                          className="bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-lg border border-gray-200 transition-all cursor-pointer hover:scale-110"
                          title="ลบสินค้า"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="relative h-56 bg-slate-900/5 p-2 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                        />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      )}

                      <button
                        onClick={(e) => handleShareProduct(product, e)}
                        className="absolute bottom-3 right-3 bg-[#06C755] hover:bg-[#05b34c] text-white px-2.5 py-1.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1 z-10 text-xs font-bold"
                        title="ส่งลิงก์สินค้าให้ลูกค้าใน LINE"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>แชร์</span>
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-gray-800 text-base group-hover:text-[#1D4ED8] transition-colors line-clamp-1">{product.name}</h3>
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-mono px-2 py-0.5 rounded shrink-0">
                          {product.id}
                        </span>
                      </div>

                      <div className="mb-3 flex items-baseline gap-2">
                        {product.promoPrice ? (
                          <>
                            <span className="text-2xl font-black text-red-600">
                              ฿{Number(product.promoPrice).toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-400 line-through font-semibold">
                              ฿{Number(product.price).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span className="text-2xl font-black text-[#1D4ED8]">
                            ฿{Number(product.price).toLocaleString()}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-500 mb-4 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Box className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="truncate">ขนาด: {product.size || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span className="font-semibold text-amber-900 truncate">วางหน้าร้าน: {product.location || '-'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 pt-0">
                      <div className={`text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 border ${
                        product.status === 'สินค้าหมด' 
                          ? 'bg-red-50 text-red-600 border-red-200' 
                          : 'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{product.status}</span>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 font-semibold">ไม่พบข้อมูลสินค้าตรงตามตัวกรองที่เลือก</p>
                <button 
                  onClick={() => { setFilterPromoOnly(false); setFilterInStockOnly(false); setSearchTerm(''); }}
                  className="mt-3 text-xs text-amber-700 font-bold underline cursor-pointer"
                >
                  ล้างตัวกรองทั้งหมด
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal ดูรายละเอียดสินค้า + คำแนะนำการสั่งซื้อ */}
      {viewingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setViewingProduct(null)}
              className="absolute top-3 right-3 bg-white/80 hover:bg-white text-gray-700 p-2 rounded-full z-20 shadow-md cursor-pointer transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="overflow-y-auto">
              <div className="w-full bg-slate-900/5 relative flex items-center justify-center p-3 min-h-[260px] max-h-[420px]">
                {viewingProduct.image ? (
                  <img 
                    src={viewingProduct.image} 
                    alt={viewingProduct.name} 
                    className="w-full h-full max-h-[380px] object-contain rounded-xl shadow-sm" 
                  />
                ) : (
                  <div className="w-full h-48 flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 mb-2 inline-block">
                      {viewingProduct.category}
                    </span>
                    <h2 className="text-2xl font-bold text-gray-800">{viewingProduct.name}</h2>
                  </div>
                  <span className="text-xs font-mono bg-gray-100 text-gray-500 px-2 py-1 rounded shrink-0">
                    {viewingProduct.id}
                  </span>
                </div>

                <div className="mb-4 flex items-baseline gap-3">
                  {viewingProduct.promoPrice ? (
                    <>
                      <span className="text-3xl font-black text-red-600">
                        ฿{Number(viewingProduct.promoPrice).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-400 line-through font-semibold">
                        ปกติ ฿{Number(viewingProduct.price).toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full border border-red-200">
                        โปรโมชั่นพิเศษ
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-black text-[#1D4ED8]">
                      ฿{Number(viewingProduct.price).toLocaleString()}
                    </span>
                  )}
                </div>

                {viewingProduct.description && (
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    {viewingProduct.description}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 text-sm text-gray-600">
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                    <Box className="w-4 h-4 text-gray-400 shrink-0" />
                    <span><strong>ขนาด:</strong> {viewingProduct.size || '-'}</span>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span><strong>สถานะ:</strong> {viewingProduct.status}</span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg flex items-center gap-2 col-span-1 sm:col-span-2 border border-amber-200">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-amber-900"><strong>สถานที่ตั้ง:</strong> สาขาหาดใหญ่ (ถ.สามสิบเมตร) - โซนวาง: {viewingProduct.location || '-'}</span>
                  </div>
                </div>

                {/* 📌 กล่องคำแนะนำวิธีสั่งซื้อ / แจ้งพนักงาน */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 mb-4 text-emerald-900 text-xs leading-relaxed flex items-start gap-3 shadow-sm">
                  <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0 mt-0.5">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-emerald-800 text-sm mb-1">สนใจสั่งซื้อ หรือ สอบถามสินค้านี้?</p>
                    <p className="text-emerald-700">
                      ท่านสามารถ <strong className="text-emerald-900 font-bold">แคปภาพหน้าจอนี้</strong> <Camera className="w-3.5 h-3.5 inline text-emerald-700" /> หรือ <strong className="text-emerald-900 font-bold">กดปุ่มสีเขียวด้านล่าง</strong> เพื่อส่งข้อมูลแจ้งพนักงานใน LINE ได้ทันทีเลยค่ะ
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleShareProduct(viewingProduct)}
                    className="w-full bg-[#06C755] hover:bg-[#05b34c] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all text-base"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>แชร์สินค้าลง LINE เพื่อส่งให้พนักงาน</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Login */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#1B2A3A] text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#1B2A3A]">เข้าสู่ระบบจัดการสินค้า</h3>
              <p className="text-xs text-gray-500 mt-1">สาขาหาดใหญ่ (ถนนสามสิบเมตร)</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <input 
                  type="password" 
                  maxLength={4}
                  placeholder="กรอก PIN (1234)" 
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center text-2xl tracking-[0.5em] font-bold border-2 border-gray-300 rounded-xl py-3 focus:ring-2 focus:ring-[#D4AF37] outline-none"
                  autoFocus
                  required
                />
              </div>

              {loginError && (
                <p className="text-xs text-red-600 font-semibold text-center bg-red-50 py-1.5 rounded-lg border border-red-200">
                  {loginError}
                </p>
              )}

              <button 
                type="submit" 
                className="w-full bg-[#1B2A3A] hover:bg-[#111B25] text-[#D4AF37] font-bold py-3 rounded-xl shadow-md cursor-pointer transition-colors"
              >
                เข้าสู่ระบบ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal เพิ่ม/แก้ไข */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b flex justify-between items-center bg-[#1B2A3A] text-white rounded-t-2xl">
              <div>
                <h3 className="font-bold text-base text-[#D4AF37]">
                  {editingProduct ? 'แก้ไขข้อมูลสินค้า / โปรโมชั่น' : 'เพิ่มสินค้าใหม่'}
                </h3>
                <p className="text-[10px] text-gray-300">สาขาหาดใหญ่ (ถ.สามสิบเมตร)</p>
              </div>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                className="text-gray-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3 text-sm overflow-y-auto flex-1">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">รหัสสินค้า</label>
                <input 
                  type="text" 
                  value={formData.id} 
                  onChange={e => setFormData({...formData, id: e.target.value})}
                  className="w-full border rounded-lg p-2 bg-gray-50" 
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">ชื่อสินค้า</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-2 bg-amber-50/50 p-2.5 rounded-xl border border-amber-200">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ราคาปกติ (บาท)</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#D4AF37] outline-none font-bold text-gray-700 bg-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-red-600 mb-1">ราคาโปรโมชั่น (ถ้ามี)</label>
                  <input 
                    type="number" 
                    placeholder="เว้นว่างถ้าไม่มีโปร"
                    value={formData.promoPrice} 
                    onChange={e => setFormData({...formData, promoPrice: e.target.value})}
                    className="w-full border border-red-300 rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none font-bold text-red-600 bg-white" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">หมวดหมู่</label>
                  <select 
                    value={formData.category} 
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#D4AF37] outline-none"
                  >
                    {categories.map((c, i) => (
                      <option key={i} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">สถานะสินค้า</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#D4AF37] outline-none text-xs font-medium"
                  >
                    <option value="มีสินค้าพร้อมส่ง">มีสินค้าพร้อมส่ง</option>
                    <option value="สินค้าตัวโชว์">สินค้าตัวโชว์</option>
                    <option value="สินค้าหมด">สินค้าหมด</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ขนาดสินค้า</label>
                  <input 
                    type="text" 
                    placeholder="เช่น 5 ฟุต" 
                    value={formData.size} 
                    onChange={e => setFormData({...formData, size: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">จุดวางหน้าร้าน (สาขาหาดใหญ่)</label>
                  <input 
                    type="text" 
                    placeholder="เช่น โซน B ชั้น 2" 
                    value={formData.location} 
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#D4AF37] outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">รายละเอียดสินค้าเพิ่มเติม</label>
                <textarea 
                  rows={2}
                  placeholder="อธิบายวัสดุ หรือจุดเด่นของสินค้า..."
                  value={formData.description || ''} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#D4AF37] outline-none text-xs" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">รูปภาพสินค้า</label>
                {formData.image && (
                  <div className="relative mb-2 h-28 rounded-lg overflow-hidden border border-gray-200">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full text-xs shadow-md cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <label className="flex items-center justify-center gap-2 w-full p-2.5 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#D4AF37] hover:bg-amber-50/50 transition-colors">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-600 font-medium">
                    {formData.image ? 'เปลี่ยนรูปภาพ...' : 'แนบรูปภาพจากเครื่อง'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                  />
                </label>
              </div>

              <div className="pt-3 border-t flex gap-2">
                <button 
                  type="button" 
                  onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                  className="w-1/2 border border-gray-300 text-gray-600 py-2 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 bg-[#1B2A3A] text-[#D4AF37] font-bold py-2 rounded-lg hover:bg-[#111B25] shadow-md cursor-pointer"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
