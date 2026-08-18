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
  CheckCircle2,
  Edit,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Share2
} from 'lucide-react';

export default function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: 'ห้องนอน',
    price: '',
    size: '',
    location: '',
    status: 'มีสินค้าพร้อมส่ง',
    image: ''
  });

  // หมวดหมู่
  const categories = [
    { name: 'ห้องนอน', icon: Bed },
    { name: 'ห้องนั่งเล่น', icon: Sofa },
    { name: 'โซฟา & เก้าอี้พักผ่อน', icon: Armchair },
    { name: 'ห้องอาหาร/ห้องครัว', icon: Utensils },
    { name: 'ห้องทำงาน/ห้องเกมมิ่ง', icon: Monitor },
    { name: 'สินค้าพิเศษ', icon: Sparkles },
    { name: 'ของตกแต่ง', icon: Flower2 },
  ];

  // ข้อมูลสินค้า
  const [products, setProducts] = useState([
    {
      id: 'P001',
      name: 'เตียงนอนไม้สัก 6 ฟุต',
      category: 'ห้องนอน',
      price: 24500,
      size: '200 x 215 x 110 ซม.',
      location: 'โซน B ชั้น 2',
      status: 'มีสินค้าพร้อมส่ง',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&auto=format&fit=crop&q=60'
    }
  ]);

  // ฟังก์ชันแปลงไฟล์รูปภาพเป็น Base64
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

  // เปิด Pop-up เพิ่มสินค้า
  const handleOpenAddModal = () => {
    setFormData({
      id: `P00${products.length + 1}`,
      name: '',
      category: selectedCategory || 'ห้องนอน',
      price: '',
      size: '',
      location: '',
      status: 'มีสินค้าพร้อมส่ง',
      image: ''
    });
    setIsAddModalOpen(true);
  };

  // เปิด Pop-up แก้ไขสินค้า
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData(product);
  };

  // ลบสินค้า
  const handleDeleteProduct = (id) => {
    if (window.confirm('คุณต้องการลบสินค้านี้ใช่หรือไม่?')) {
      setProducts(products.filter(p => p.id !== id));
      if (editingProduct) setEditingProduct(null);
    }
  };

  // บันทึกการเพิ่ม/แก้ไข
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, price: Number(formData.price) } : p));
      setEditingProduct(null);
    } else {
      setProducts([...products, { ...formData, price: Number(formData.price) }]);
      setIsAddModalOpen(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory ? product.category === selectedCategory : true;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-gray-800 font-sans pb-10">
      {/* Header Bar */}
      <header className="bg-[#1B2A3A] text-white shadow-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedCategory(null)}>
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

            <button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 bg-[#2E7D32] hover:bg-[#25632A] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>เพิ่มสินค้าใหม่</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
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

        {(selectedCategory || searchTerm) && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => { setSelectedCategory(null); setSearchTerm(''); }}
                className="flex items-center gap-2 bg-white text-[#1B2A3A] border border-gray-300 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
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

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 relative group">
                    
                    {/* Action Buttons บนการ์ด */}
                    <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                      <button 
                        onClick={() => handleOpenEditModal(product)}
                        className="bg-white/90 hover:bg-white text-gray-700 p-2 rounded-full shadow-md transition-all cursor-pointer"
                        title="แก้ไขสินค้า"
                      >
                        <Edit className="w-4 h-4 text-[#1B2A3A]" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-white/90 hover:bg-white text-red-600 p-2 rounded-full shadow-md transition-all cursor-pointer"
                        title="ลบสินค้า"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="relative h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2 pr-12">
                        <h3 className="font-bold text-gray-800 text-lg">{product.name}</h3>
                        <span className="bg-gray-100 text-gray-500 text-[10px] font-mono px-2 py-0.5 rounded">
                          {product.id}
                        </span>
                      </div>

                      <p className="text-2xl font-black text-[#1D4ED8] mb-3">
                        ฿{Number(product.price).toLocaleString()}
                      </p>

                      <div className="space-y-1.5 text-xs text-gray-500 mb-4 border-t border-gray-100 pt-3">
                        <div className="flex items-center gap-2">
                          <Box className="w-3.5 h-3.5 text-gray-400" />
                          <span>ขนาด: {product.size || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span>วางหน้าร้าน: {product.location || '-'}</span>
                        </div>
                      </div>

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
                <p className="text-gray-500">ไม่พบข้อมูลสินค้าที่ค้นหา</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal ป๊อปอัพ เพิ่ม/แก้ไข สินค้า */}
      {(isAddModalOpen || editingProduct) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b flex justify-between items-center bg-[#1B2A3A] text-white rounded-t-2xl">
              <h3 className="font-bold text-base text-[#D4AF37]">
                {editingProduct ? 'แก้ไขข้อมูลสินค้า / เปลี่ยนราคา' : 'เพิ่มสินค้าใหม่'}
              </h3>
              <button 
                onClick={() => { setIsAddModalOpen(false); setEditingProduct(null); }}
                className="text-gray-300 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ราคา (บาท)</label>
                  <input 
                    type="number" 
                    value={formData.price} 
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#D4AF37] outline-none font-bold text-blue-600" 
                    required 
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-2">
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
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">ตำแหน่งวางหน้าร้าน</label>
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
                <label className="block text-xs font-semibold text-gray-600 mb-1">ขนาดสินค้า</label>
                <input 
                  type="text" 
                  placeholder="เช่น 200 x 215 x 110 ซม." 
                  value={formData.size} 
                  onChange={e => setFormData({...formData, size: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-[#D4AF37] outline-none" 
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

              {/* Modal Footer Buttons Fix */}
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
