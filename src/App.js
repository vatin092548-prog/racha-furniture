import React, { useState, useEffect } from 'react';
import { 
  Bed, Sofa, Utensils, Monitor, Sparkles, Flower2, Search, ArrowLeft, MapPin, Package, Plus, X, Upload 
} from 'lucide-react';

const categories = [
  { id: 'bedroom', name: 'ห้องนอน', icon: Bed },
  { id: 'living', name: 'ห้องนั่งเล่น', icon: Sofa },
  { id: 'sofa', name: 'โซฟา & เก้าอี้พักผ่อน', icon: Sofa },
  { id: 'kitchen', name: 'ห้องอาหาร/ห้องครัว', icon: Utensils },
  { id: 'office', name: 'ห้องทำงาน/ห้องเกมมิ่ง', icon: Monitor },
  { id: 'special', name: 'สินค้าพิเศษ', icon: Sparkles },
  { id: 'decor', name: 'ของตกแต่ง', icon: Flower2 },
];

const initialProducts = [
  {
    id: 'P001',
    categoryId: 'sofa',
    name: 'โซฟาปรับนอน รุ่น Royal Comfort',
    price: 15900,
    size: '180 x 90 x 85 ซม.',
    status: 'มีสินค้าพร้อมส่ง',
    location: 'โซน A ชั้น 1',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80'
  },
  {
    id: 'P002',
    categoryId: 'sofa',
    name: 'เก้าอี้พักผ่อนหนังแท้',
    price: 8900,
    size: '80 x 85 x 100 ซม.',
    status: 'สินค้าหมด (สั่งผลิต 7 วัน)',
    location: 'โซน A ชั้น 1',
    image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1294?w=500&q=80'
  },
  {
    id: 'P003',
    categoryId: 'bedroom',
    name: 'เตียงนอนไม้สัก 6 ฟุต',
    price: 24500,
    size: '200 x 215 x 110 ซม.',
    status: 'มีสินค้าพร้อมส่ง',
    location: 'โซน B ชั้น 2',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80'
  }
];

export default function App() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('racha_products');
    return saved ? JSON.parse(saved) : initialProducts;
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    categoryId: 'bedroom',
    price: '',
    size: '',
    location: '',
    status: 'มีสินค้าพร้อมส่ง',
    image: ''
  });

  useEffect(() => {
    localStorage.setItem('racha_products', JSON.stringify(products));
  }, [products]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (searchQuery) return matchesSearch;
    return selectedCategory ? product.categoryId === selectedCategory.id : true;
  });

  // ฟังก์ชั่นแปลงไฟล์รูปภาพในเครื่องเป็น Base64 Data URL
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const newProduct = {
      ...formData,
      id: formData.id || `P${String(products.length + 1).padStart(3, '0')}`,
      price: Number(formData.price),
      image: formData.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80'
    };

    setProducts([newProduct, ...products]);
    setIsModalOpen(false);
    setFormData({
      id: '', name: '', categoryId: 'bedroom', price: '', size: '', location: '', status: 'มีสินค้าพร้อมส่ง', image: ''
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 sm:p-6 sticky top-0 z-10 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 className="text-2xl font-bold tracking-wide">ราชาเฟอร์นิเจอร์</h1>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="sm:hidden bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shadow"
            >
              <Plus size={16} /> เพิ่มสินค้า
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="ค้นหาชื่อสินค้า หรือ รหัสสินค้า..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-gray-800 text-sm bg-white shadow-inner focus:outline-none"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>

            <button 
              onClick={() => setIsModalOpen(true)}
              className="hidden sm:flex bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm items-center gap-1.5 shadow whitespace-nowrap transition-all"
            >
              <Plus size={18} /> เพิ่มสินค้าใหม่
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 flex-1 w-full">
        {!selectedCategory && !searchQuery && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">ค้นหาตามหมวดหมู่</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat)}
                    className="flex items-center gap-4 p-4 bg-white border-2 border-blue-500/80 rounded-2xl hover:bg-blue-50 hover:shadow-md transition-all text-left shadow-sm"
                  >
                    <div className="p-3 bg-gray-100 rounded-xl text-gray-600">
                      <IconComponent size={26} />
                    </div>
                    <span className="text-blue-600 font-bold text-lg">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {(selectedCategory || searchQuery) && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => { setSelectedCategory(null); setSearchQuery(''); }}
                className="flex items-center gap-2 text-blue-600 font-semibold text-base hover:underline bg-white px-4 py-2 rounded-xl border border-blue-200 shadow-sm"
              >
                <ArrowLeft size={20} /> ย้อนกลับไปหน้าหมวดหมู่
              </button>
              <span className="text-sm text-gray-600 font-medium bg-gray-200 px-3 py-1 rounded-lg">
                {searchQuery ? `ผลการค้นหา "${searchQuery}"` : selectedCategory?.name}
              </span>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <img src={product.image} alt={product.name} className="w-full h-52 object-cover" />
                      <div className="p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-gray-800 text-base leading-snug">{product.name}</h3>
                          <span className="text-xs bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded">
                            {product.id}
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600 mt-1">
                          ฿{product.price.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500 space-y-1.5 mt-2 border-t border-gray-100 pt-3">
                          <p className="flex items-center gap-1.5">
                            <Package size={15} className="text-gray-400" />
                            <span><b>ขนาด:</b> {product.size || '-'}</span>
                          </p>
                          <p className="flex items-center gap-1.5">
                            <MapPin size={15} className="text-gray-400" />
                            <span><b>วางหน้าร้าน:</b> {product.location || '-'}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 pt-0">
                      <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full w-full text-center ${
                        product.status.includes('พร้อมส่ง') 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        ● {product.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 text-gray-400 text-lg">
                ไม่พบสินค้าที่ต้องการ
              </div>
            )}
          </div>
        )}
      </main>

      {/* POPUP ฟอร์มเพิ่มสินค้าสำหรับคุณแม่ */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h3 className="text-xl font-bold text-gray-800">เพิ่มสินค้าใหม่</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">หมวดหมู่สินค้า</label>
                <select 
                  value={formData.categoryId}
                  onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 focus:bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">รหัสสินค้า (ถ้ามี)</label>
                  <input 
                    type="text" 
                    placeholder="เช่น P004" 
                    value={formData.id}
                    onChange={(e) => setFormData({...formData, id: e.target.value})}
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">ราคาสินค้า (บาท) *</label>
                  <input 
                    type="number" 
                    placeholder="เช่น 12000" 
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full p-2.5 border rounded-xl text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ชื่อสินค้า *</label>
                <input 
                  type="text" 
                  placeholder="เช่น โซฟาผ้า 3 ที่นั่ง" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ขนาดสินค้า</label>
                <input 
                  type="text" 
                  placeholder="เช่น 150 x 80 x 90 ซม." 
                  value={formData.size}
                  onChange={(e) => setFormData({...formData, size: e.target.value})}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ตำแหน่งวางหน้าร้าน</label>
                <input 
                  type="text" 
                  placeholder="เช่น โซน A ชั้น 1" 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full p-2.5 border rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">สถานะสินค้า</label>
                <select 
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full p-2.5 border rounded-xl text-sm bg-gray-50 focus:bg-white"
                >
                  <option value="มีสินค้าพร้อมส่ง">มีสินค้าพร้อมส่ง</option>
                  <option value="สินค้าหมด (สั่งผลิต 7 วัน)">สินค้าหมด (สั่งผลิต 7 วัน)</option>
                  <option value="สินค้าสั่งผลิตพิเศษ">สินค้าสั่งผลิตพิเศษ</option>
                </select>
              </div>

              {/* ปรับเป็นช่องแนบรูปภาพจากคอม/มือถือ */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">รูปภาพสินค้า</label>
                <div className="border-2 border-dashed border-gray-300 rounded-2xl p-4 text-center hover:bg-gray-50 transition-colors relative cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {formData.image ? (
                    <img src={formData.image} alt="Preview" className="h-32 mx-auto object-cover rounded-xl" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-500">
                      <Upload size={28} className="text-blue-500" />
                      <span className="text-xs font-semibold">กดเพื่อเลือกรูปในเครื่อง หรือถ่ายรูป</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm"
                >
                  ยกเลิก
                </button>
                <button 
                  type="submit" 
                  className="w-1/2 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl text-sm shadow"
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}