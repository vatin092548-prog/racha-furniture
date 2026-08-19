import React, { useEffect, useState } from "react";
import { db } from "./firebase";

import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

import {
  Bed,
  Sofa,
  Armchair,
  Utensils,
  Briefcase,
  Sparkles,
  LayoutGrid,
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
  Share2,
  Package,
  Tag,
  LayoutDashboard,
  Flame,
  ArrowUpDown,
  MessageCircle,
  Camera,
  Filter,
  Bookmark,
  AlertCircle,
} from "lucide-react";


/* =========================================================
   APP
========================================================= */

export default function App() {

  /* =======================================================
     CONFIG & FIREBASE
  ======================================================= */

  const PRODUCTS_COLLECTION = "products";
  const STAFF_PHONE = "0822810874";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firebaseError, setFirebaseError] = useState("");


  /* =======================================================
     SEARCH / FILTER
  ======================================================= */

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const [promoOnly, setPromoOnly] = useState(false);
  const [stockOnly, setStockOnly] = useState(false);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [sortPrice, setSortPrice] = useState("none");


  /* =======================================================
     LOGIN
  ======================================================= */

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [phone, setPhone] = useState("");
  const [loginError, setLoginError] = useState("");


  /* =======================================================
     PRODUCT MODAL
  ======================================================= */

  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);


  /* =======================================================
     TOAST
  ======================================================= */

  const [toast, setToast] = useState("");


  /* =======================================================
     CATEGORIES & PREFIX MAP
  ======================================================= */

  const categoryPrefixMap = {
    "ห้องนอน": "A",
    "ห้องนั่งเล่น": "T",
    "โซฟา & เก้าอี้พักผ่อน": "S",
    "ห้องอาหาร/ห้องครัว": "E",
    "ห้องสำนักงาน": "I",
    "สินค้าพิเศษ": "P",
    "ห้องทั่วไป": "B",
  };

  const categories = [
    { name: "ห้องนอน", icon: Bed, prefix: "A" },
    { name: "ห้องนั่งเล่น", icon: Sofa, prefix: "T" },
    { name: "โซฟา & เก้าอี้พักผ่อน", icon: Armchair, prefix: "S" },
    { name: "ห้องอาหาร/ห้องครัว", icon: Utensils, prefix: "E" },
    { name: "ห้องสำนักงาน", icon: Briefcase, prefix: "I" },
    { name: "สินค้าพิเศษ", icon: Sparkles, prefix: "P" },
    { name: "ห้องทั่วไป", icon: LayoutGrid, prefix: "B" },
  ];


  /* =======================================================
     FORM
  ======================================================= */

  const emptyForm = {
    id: "",
    name: "",
    category: "ห้องนอน",
    price: "",
    promoPrice: "",
    size: "",
    location: "",
    status: "มีสินค้าพร้อมส่ง",
    image: "",
    description: "",
  };

  const [formData, setFormData] = useState(emptyForm);


  /* =======================================================
     AUTO GENERATE ID
  ======================================================= */

  const generateNextId = (categoryName, currentProducts) => {
    const prefix = categoryPrefixMap[categoryName] || "A";
    const categoryProducts = currentProducts.filter(p => p.category === categoryName || p.id?.startsWith(prefix));

    let maxNum = 0;
    categoryProducts.forEach(p => {
      const match = p.id?.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    return `${prefix}${maxNum + 1}`;
  };


  /* =======================================================
     FIRESTORE REALTIME
  ======================================================= */

  useEffect(() => {
    setLoading(true);
    setFirebaseError("");

    const productsRef = collection(db, PRODUCTS_COLLECTION);

    const unsubscribe = onSnapshot(
      productsRef,
      (snapshot) => {
        const productList = snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }));
        setProducts(productList);
        setLoading(false);
        setFirebaseError("");
      },
      (error) => {
        console.error("❌ Firestore READ ERROR", error);
        setFirebaseError(`ไม่สามารถอ่านข้อมูลจาก Firebase ได้\n${error.message}`);
        setProducts([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);


  /* =======================================================
     TOAST
  ======================================================= */

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 3000);
  };


  /* =======================================================
     LOGIN / LOGOUT
  ======================================================= */

  const handleLogin = (event) => {
    event.preventDefault();
    if (phone === STAFF_PHONE) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setPhone("");
      setLoginError("");
      showToast("เข้าสู่ระบบพนักงานสำเร็จ");
    } else {
      setLoginError("เบอร์โทรศัพท์ไม่ถูกต้อง");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    showToast("ออกจากระบบเรียบร้อย");
  };


  /* =======================================================
     PRODUCT MODAL CONTROLS
  ======================================================= */

  const openAddProduct = () => {
    setEditingProduct(null);
    const targetCategory = selectedCategory || "ห้องนอน";
    const autoId = generateNextId(targetCategory, products);

    setFormData({
      ...emptyForm,
      id: autoId,
      category: targetCategory,
    });
    setShowProductModal(true);
  };

  const openEditProduct = (product, event) => {
    if (event) event.stopPropagation();
    setEditingProduct(product);
    setFormData({
      id: product.id || "",
      name: product.name || "",
      category: product.category || "ห้องนอน",
      price: product.price ?? "",
      promoPrice: product.promoPrice ?? "",
      size: product.size || "",
      location: product.location || "",
      status: product.status || "มีสินค้าพร้อมส่ง",
      image: product.image || "",
      description: product.description || "",
    });
    setShowProductModal(true);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setEditingProduct(null);
    setFormData(emptyForm);
  };


  /* =======================================================
     IMAGE COMPRESSOR & UPLOAD
  ======================================================= */

  const compressImage = (file, maxWidth = 800, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL("image/jpeg", quality);
          resolve(compressedBase64);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      showToast("กำลังประมวลผลรูปภาพ...");
      const compressedImage = await compressImage(file, 800, 0.7);
      setFormData((previous) => ({
        ...previous,
        image: compressedImage,
      }));
      showToast("อัปโหลดรูปภาพเรียบร้อย");
    } catch (error) {
      console.error("Image Compress Error:", error);
      alert("ไม่สามารถอ่านหรือบีบอัดรูปภาพได้");
    }
  };


  /* =======================================================
     SAVE PRODUCT
  ======================================================= */

  const handleSaveProduct = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      alert("กรุณาเข้าสู่ระบบพนักงานก่อน");
      return;
    }

    if (!formData.name || formData.name.trim() === "") {
      alert("กรุณากรอกชื่อสินค้า");
      return;
    }

    if (formData.price === "" || formData.price === null || formData.price === undefined) {
      alert("กรุณากรอกราคาสินค้า");
      return;
    }

    const normalPrice = Number(formData.price);
    if (Number.isNaN(normalPrice) || normalPrice < 0) {
      alert("ราคาสินค้าไม่ถูกต้อง");
      return;
    }

    let promotionPrice = null;
    if (formData.promoPrice !== "" && formData.promoPrice !== null && formData.promoPrice !== undefined) {
      promotionPrice = Number(formData.promoPrice);
      if (Number.isNaN(promotionPrice) || promotionPrice < 0) {
        alert("ราคาโปรโมชั่นไม่ถูกต้อง");
        return;
      }
      if (promotionPrice > normalPrice) {
        alert("ราคาโปรโมชั่นไม่ควรมากกว่าราคาปกติ");
        return;
      }
    }

    const newProductId = formData.id?.trim() || `P${Date.now()}`;

    const productData = {
      name: formData.name.trim(),
      category: formData.category || "ห้องนอน",
      price: normalPrice,
      promoPrice: promotionPrice,
      size: formData.size?.trim() || "",
      location: formData.location?.trim() || "",
      status: formData.status || "มีสินค้าพร้อมส่ง",
      image: formData.image || "",
      description: formData.description?.trim() || "",
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, PRODUCTS_COLLECTION, newProductId), productData);

      if (editingProduct && editingProduct.id !== newProductId) {
        await deleteDoc(doc(db, PRODUCTS_COLLECTION, editingProduct.id));
      }

      closeProductModal();
      showToast(editingProduct ? "แก้ไขสินค้าสำเร็จ" : "เพิ่มสินค้าสำเร็จ");
    } catch (error) {
      console.error("❌ FIRESTORE SAVE ERROR", error);
      let message = "ไม่สามารถบันทึกสินค้าได้";
      if (error.code === "permission-denied") {
        message = "Firebase ไม่อนุญาตให้เขียนข้อมูล\nกรุณาตรวจสอบ Firestore Rules";
      } else if (error.code === "invalid-argument") {
        message = "ข้อมูลหรือไฟล์รูปภาพที่ส่งไป Firebase ไม่ถูกต้อง";
      } else {
        message = `บันทึกสินค้าไม่สำเร็จ\n\n${error.message}`;
      }
      alert(`❌ ${message}`);
    }
  };


  /* =======================================================
     DELETE PRODUCT
  ======================================================= */

  const handleDeleteProduct = async (product, event) => {
    if (event) event.stopPropagation();
    if (!isLoggedIn) {
      alert("กรุณาเข้าสู่ระบบพนักงานก่อน");
      return;
    }

    if (!window.confirm(`ต้องการลบสินค้า "${product.name}" หรือไม่?`)) return;

    try {
      await deleteDoc(doc(db, PRODUCTS_COLLECTION, product.id));
      showToast("ลบสินค้าเรียบร้อย");
    } catch (error) {
      console.error("❌ DELETE ERROR:", error);
      alert(`ลบสินค้าไม่สำเร็จ\n\n${error.message}`);
    }
  };


  /* =======================================================
     SHARE
  ======================================================= */

  const handleShare = async (product, event) => {
    if (event) event.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    const price = product.promoPrice
      ? `฿${Number(product.promoPrice).toLocaleString()}`
      : `฿${Number(product.price).toLocaleString()}`;

    const text = `🪑 ${product.name}\n💰 ราคา ${price}\n📍 ราชาเฟอร์นิเจอร์ สาขาหาดใหญ่\n📦 สถานะ: ${product.status || 'มีสินค้าพร้อมส่ง'}\n📍 โซนวาง: ${product.location || "-"}\n\nดูรายละเอียดสินค้า:\n${url}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        showToast("คัดลอกข้อมูลสินค้าแล้ว");
      } else {
        alert(text);
      }
    } catch (error) {
      alert(text);
    }
  };


  /* =======================================================
     IMAGE BADGE (ป้ายเด่นบนรูปภาพ)
  ======================================================= */

  const renderImageBadge = (status) => {
    switch (status) {
      case "สินค้าตัวโชว์หน้าร้าน":
        return (
          <div className="bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> สินค้าตัวโชว์
          </div>
        );
      case "สินค้าติดจอง":
        return (
          <div className="bg-purple-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5" /> ติดจองแล้ว
          </div>
        );
      case "สินค้าหมด":
        return (
          <div className="bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" /> สินค้าหมด
          </div>
        );
      default:
        return (
          <div className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> พร้อมขาย
          </div>
        );
    }
  };


  /* =======================================================
     BOTTOM BADGE (ป้ายสถานะด้านล่างแบบปรับสีให้เข้มขึ้น)
  ======================================================= */

  const renderBottomBadge = (status) => {
    switch (status) {
      case "สินค้าตัวโชว์หน้าร้าน":
        return (
          <div className="mt-4 rounded-xl py-2 text-center text-xs font-black border-2 bg-amber-100 text-amber-900 border-amber-300 shadow-sm">
            <Sparkles className="inline w-4 h-4 mr-1 text-amber-700" />
            สินค้าตัวโชว์หน้าร้าน
          </div>
        );
      case "สินค้าติดจอง":
        return (
          <div className="mt-4 rounded-xl py-2 text-center text-xs font-black border-2 bg-purple-100 text-purple-900 border-purple-300 shadow-sm">
            <Bookmark className="inline w-4 h-4 mr-1 text-purple-700" />
            สินค้าติดจอง
          </div>
        );
      case "สินค้าหมด":
        return (
          <div className="mt-4 rounded-xl py-2 text-center text-xs font-black border-2 bg-red-100 text-red-900 border-red-300 shadow-sm">
            <AlertCircle className="inline w-4 h-4 mr-1 text-red-700" />
            สินค้าหมด
          </div>
        );
      default:
        return (
          <div className="mt-4 rounded-xl py-2 text-center text-xs font-black border-2 bg-emerald-100 text-emerald-900 border-emerald-300 shadow-sm">
            <CheckCircle2 className="inline w-4 h-4 mr-1 text-emerald-700" />
            มีสินค้าพร้อมส่ง
          </div>
        );
    }
  };


  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */

  const filteredProducts = products
    .filter((product) => {
      const categoryMatch = selectedCategory ? product.category === selectedCategory : true;
      const search = searchTerm.trim().toLowerCase();
      const name = String(product.name || "").toLowerCase();
      const id = String(product.id || "").toLowerCase();
      const searchMatch = search === "" || name.includes(search) || id.includes(search);
      const promoMatch = promoOnly ? Boolean(product.promoPrice) : true;
      const stockMatch = stockOnly ? product.status !== "สินค้าหมด" : true;

      const actualPrice = Number(product.promoPrice || product.price || 0);

      const minMatch = minPrice === "" || actualPrice >= Number(minPrice);
      const maxMatch = maxPrice === "" || actualPrice <= Number(maxPrice);

      return categoryMatch && searchMatch && promoMatch && stockMatch && minMatch && maxMatch;
    })
    .sort((a, b) => {
      const priceA = Number(a.promoPrice || a.price || 0);
      const priceB = Number(b.promoPrice || b.price || 0);
      if (sortPrice === "low") return priceA - priceB;
      if (sortPrice === "high") return priceB - priceA;
      return 0;
    });

  const promotionCount = products.filter((product) => Boolean(product.promoPrice)).length;
  const stockCount = products.filter((product) => product.status !== "สินค้าหมด").length;


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-gray-800">
      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100]">
          <div className="bg-[#1B2A3A] text-[#D4AF37] border border-[#D4AF37] px-5 py-3 rounded-xl shadow-xl font-bold text-sm">
            {toast}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-[#1B2A3A] text-white px-6 py-4 shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
          <div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => {
              setSelectedCategory("");
              setSearchTerm("");
            }}
          >
            <div className="text-[#D4AF37]">
              <svg width="44" height="44" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 70 L25 35 L40 55 L50 25 L60 55 L75 35 L85 70 Z" />
                <circle cx="25" cy="30" r="4" fill="currentColor" />
                <circle cx="50" cy="20" r="4" fill="currentColor" />
                <circle cx="75" cy="30" r="4" fill="currentColor" />
                <path d="M18 78 Q50 83 82 78" strokeWidth="5" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold">ราชาเฟอร์นิเจอร์</h1>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${isLoggedIn ? "bg-green-500 text-white" : "bg-[#D4AF37] text-[#1B2A3A]"}`}>
                  {isLoggedIn ? "โหมดพนักงาน" : "แคตตาล็อกออนไลน์"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#D4AF37]">
                <MapPin className="w-3 h-3" /> สาขาหาดใหญ่ (ถ.สามสิบเมตร)
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full lg:w-auto">
            <div className="relative w-full lg:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อสินค้า หรือ รหัสสินค้า..."
                className="w-full bg-white text-gray-800 pl-4 pr-10 py-2.5 rounded-lg outline-none text-sm"
              />
              <Search className="absolute right-3 top-3 text-gray-400 w-4 h-4" />
            </div>

            {isLoggedIn && (
              <button
                onClick={openAddProduct}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-1 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" /> เพิ่มสินค้า
              </button>
            )}

            {isLoggedIn ? (
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white px-3 py-2.5 rounded-lg font-bold">
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setLoginError("");
                }}
                className="bg-[#D4AF37] hover:bg-[#B89425] text-[#1B2A3A] px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-1 whitespace-nowrap"
              >
                <Lock className="w-4 h-4" /> สำหรับพนักงาน
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-7xl mx-auto p-5 md:p-6">
        {firebaseError && (
          <div className="mb-6 bg-red-50 border border-red-300 text-red-700 rounded-xl p-4">
            <div className="font-bold">⚠️ Firebase Error</div>
            <div className="text-sm whitespace-pre-line mt-1">{firebaseError}</div>
          </div>
        )}

        {/* DASHBOARD */}
        {isLoggedIn && (
          <div className="mb-8 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <LayoutDashboard className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="font-bold text-[#1B2A3A] text-lg">ภาพรวมระบบจัดการสินค้า</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-bold">สินค้าทั้งหมด</p>
                  <p className="text-2xl font-black text-blue-900">{products.length}</p>
                </div>
                <Package className="text-blue-400" />
              </div>
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex justify-between">
                <div>
                  <p className="text-xs text-red-600 font-bold">โปรโมชั่น</p>
                  <p className="text-2xl font-black text-red-900">{promotionCount}</p>
                </div>
                <Tag className="text-red-400" />
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex justify-between">
                <div>
                  <p className="text-xs text-green-600 font-bold">พร้อมขาย</p>
                  <p className="text-2xl font-black text-green-900">{stockCount}</p>
                </div>
                <CheckCircle2 className="text-green-400" />
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY GRID */}
        {!selectedCategory && searchTerm === "" && (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#1B2A3A] border-b-2 border-[#D4AF37] inline-block pb-1">
                หมวดหมู่สินค้าเฟอร์นิเจอร์
              </h2>
              <p className="text-xs text-gray-500 mt-1">เลือกหมวดหมู่เพื่อดูสินค้า</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className="bg-white border border-amber-100 hover:border-[#D4AF37] hover:shadow-md rounded-xl p-4 flex items-center justify-between text-left transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-[#F4E8C1] text-[#1B2A3A] rounded-lg">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="font-bold">{category.name}</span>
                    </div>

                    {isLoggedIn && (
                      <span className="font-mono font-bold text-lg text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-lg">
                        {category.prefix}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* PRODUCT GRID */}
        {(selectedCategory || searchTerm !== "") && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchTerm("");
                }}
                className="bg-white border border-gray-300 px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold"
              >
                <ArrowLeft className="w-4 h-4" /> ย้อนกลับไปหน้าหมวดหมู่
              </button>
              {selectedCategory && (
                <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full text-xs font-bold">
                  หมวด: {selectedCategory} {isLoggedIn && `(${categoryPrefixMap[selectedCategory]})`}
                </span>
              )}
            </div>

            {/* FILTER BAR */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPromoOnly(!promoOnly)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 ${promoOnly ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  <Flame className="w-3.5 h-3.5" /> 🔥 ลดพิเศษ
                </button>
                <button
                  onClick={() => setStockOnly(!stockOnly)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 ${stockOnly ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600"}`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 📦 พร้อมส่ง
                </button>

                {/* PRICE RANGE */}
                <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                  <Filter className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500 font-bold">ราคา:</span>
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-16 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs text-center outline-none"
                  />
                  <span className="text-xs text-gray-400">-</span>
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-16 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs text-center outline-none"
                  />
                  {(minPrice || maxPrice) && (
                    <button
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                      }}
                      className="text-xs text-red-500 font-bold ml-1 hover:underline"
                    >
                      ล้าง
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4 h-4 text-gray-400" />
                <select
                  value={sortPrice}
                  onChange={(e) => setSortPrice(e.target.value)}
                  className="border border-gray-300 rounded-lg px-2 py-1.5 text-xs"
                >
                  <option value="none">เรียงตามมาตรฐาน</option>
                  <option value="low">ราคาต่ำ → สูง</option>
                  <option value="high">ราคาสูง → ต่ำ</option>
                </select>
              </div>
            </div>

            {loading && (
              <div className="bg-white rounded-xl p-16 text-center">
                <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500 font-bold">กำลังโหลดสินค้าจาก Firebase...</p>
              </div>
            )}

            {!loading && filteredProducts.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setViewingProduct(product)}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl transition cursor-pointer"
                  >
                    <div className="relative h-56 bg-gray-50 flex items-center justify-center p-2">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-12 h-12 text-gray-300" />
                      )}

                      {/* 1. ป้ายสถานะเด่นบนรูปภาพ (มุมซ้ายบน) */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1 items-start">
                        {renderImageBadge(product.status)}
                        {product.promoPrice && (
                          <div className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow">
                            🔥 ลดพิเศษ
                          </div>
                        )}
                      </div>

                      {/* 2. ปุ่มแชร์ลง LINE เดิมกลับมาแล้ว */}
                      <button
                        onClick={(e) => handleShare(product, e)}
                        className="absolute right-3 bottom-3 bg-[#06C755] hover:bg-[#05b34c] text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-md"
                      >
                        <Share2 className="w-3.5 h-3.5" /> แชร์
                      </button>
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between gap-2">
                        <h3 className="font-bold text-gray-800">{product.name}</h3>
                        {isLoggedIn && (
                          <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-mono h-fit">
                            {product.id}
                          </span>
                        )}
                      </div>

                      <div className="mt-2">
                        {product.promoPrice ? (
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-black text-red-600">฿{Number(product.promoPrice).toLocaleString()}</span>
                            <span className="text-xs text-gray-400 line-through">฿{Number(product.price).toLocaleString()}</span>
                          </div>
                        ) : (
                          <span className="text-2xl font-black text-blue-700">฿{Number(product.price || 0).toLocaleString()}</span>
                        )}
                      </div>

                      <div className="border-t mt-3 pt-3 space-y-2 text-xs text-gray-500">
                        <div className="flex gap-2">
                          <Box className="w-4 h-4" /> ขนาด: {product.size || "-"}
                        </div>
                        <div className="flex gap-2">
                          <MapPin className="w-4 h-4 text-amber-600" /> วางหน้าร้าน: {product.location || "-"}
                        </div>
                      </div>

                      {/* 3. ป้ายสถานะด้านล่างปรับสีข้อความและพื้นหลังให้เด่นจัดๆ */}
                      {renderBottomBadge(product.status)}

                      {isLoggedIn && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={(e) => openEditProduct(product, e)}
                            className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Edit className="w-4 h-4" /> แก้ไข
                          </button>
                          <button
                            onClick={(e) => handleDeleteProduct(product, e)}
                            className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> ลบ
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && filteredProducts.length === 0 && (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-16 text-center">
                <Package className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <h3 className="font-bold text-gray-600">ไม่พบสินค้า</h3>
                <p className="text-xs text-gray-400 mt-1">ไม่มีสินค้าตรงกับเงื่อนไขการค้นหาของคุณ</p>
                {isLoggedIn && (
                  <button onClick={openAddProduct} className="mt-5 bg-[#1B2A3A] text-[#D4AF37] px-5 py-2.5 rounded-lg text-sm font-bold">
                    <Plus className="inline w-4 h-4 mr-1" /> เพิ่มสินค้า
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6 relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-full bg-[#1B2A3A] text-[#D4AF37] flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-lg text-[#1B2A3A]">เข้าสู่ระบบพนักงาน</h2>
              <p className="text-xs text-gray-500 mt-1">ราชาเฟอร์นิเจอร์</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-600">เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  maxLength="10"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="กรอกเบอร์โทรศัพท์"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 mt-1 text-center text-lg font-bold outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  required
                />
              </div>
              {loginError && (
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-2 text-xs text-center font-bold">
                  {loginError}
                </div>
              )}
              <button type="submit" className="w-full bg-[#1B2A3A] text-[#D4AF37] py-3 rounded-xl font-bold">
                เข้าสู่ระบบ
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#1B2A3A] text-white px-5 py-4 flex justify-between items-center">
              <div>
                <h2 className="font-bold text-[#D4AF37]">{editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}</h2>
                <p className="text-[10px] text-gray-300">สาขาหาดใหญ่ (ถ.สามสิบเมตร)</p>
              </div>
              <button onClick={closeProductModal} className="text-gray-300 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  รหัสสินค้า (รันให้อัตโนมัติ หรือพิมพ์แก้ไขได้)
                </label>
                <input
                  type="text"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  placeholder="เช่น A1, T2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-mono font-bold text-blue-700 focus:ring-2 focus:ring-[#D4AF37] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น เตียงนอน 5 ฟุต"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">หมวดหมู่</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const newCat = e.target.value;
                    const autoId = editingProduct ? formData.id : generateNextId(newCat, products);
                    setFormData({
                      ...formData,
                      category: newCat,
                      id: autoId,
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                >
                  {categories.map((category) => (
                    <option key={category.name} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">ราคาปกติ (บาท) *</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="16900"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">ราคาโปรโมชั่น</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.promoPrice}
                    onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                    placeholder="ถ้าไม่มีให้เว้นว่าง"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">ขนาด</label>
                  <input
                    type="text"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="เช่น 5 ฟุต"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">สถานะสินค้า</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold"
                  >
                    <option value="มีสินค้าพร้อมส่ง">🟢 มีสินค้าพร้อมส่ง</option>
                    <option value="สินค้าตัวโชว์หน้าร้าน">🟡 สินค้าตัวโชว์หน้าร้าน</option>
                    <option value="สินค้าติดจอง">🟣 สินค้าติดจอง</option>
                    <option value="สินค้าหมด">🔴 สินค้าหมด</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">โซนวางหน้าร้าน</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="เช่น 6 - 1"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">รูปภาพสินค้า</label>
                <div className="flex gap-3 items-center">
                  <label className="flex-1 border border-dashed border-gray-300 rounded-lg p-3 cursor-pointer bg-gray-50 hover:bg-gray-100 flex justify-center items-center gap-2 text-xs font-bold text-gray-600">
                    <Upload className="w-4 h-4" /> เปลี่ยนรูปภาพ
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                  {formData.image && (
                    <img src={formData.image} alt="Preview" className="w-14 h-14 object-cover rounded-lg border" />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="วัสดุ คุณสมบัติพิเศษ ฯลฯ"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeProductModal} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold">
                  ยกเลิก
                </button>
                <button type="submit" className="flex-1 bg-[#1B2A3A] hover:bg-[#111B25] text-[#D4AF37] py-3 rounded-xl font-bold">
                  {editingProduct ? "บันทึกการแก้ไข" : "บันทึกข้อมูล"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
            <button onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 shadow">
              <X className="w-5 h-5" />
            </button>

            <div className="bg-gray-50 min-h-[280px] flex items-center justify-center p-5">
              {viewingProduct.image ? (
                <img src={viewingProduct.image} alt={viewingProduct.name} className="max-h-[400px] max-w-full object-contain" />
              ) : (
                <ImageIcon className="w-16 h-16 text-gray-300" />
              )}
            </div>

            <div className="p-6">
              <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md font-bold">
                {viewingProduct.category}
              </span>

              <div className="flex justify-between gap-3 mt-3">
                <h2 className="text-2xl font-black">{viewingProduct.name}</h2>
                {isLoggedIn && (
                  <span className="text-xs bg-gray-100 h-fit px-2 py-1 rounded font-mono">{viewingProduct.id}</span>
                )}
              </div>

              <div className="mt-3 mb-5">
                {viewingProduct.promoPrice ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-red-600">฿{Number(viewingProduct.promoPrice).toLocaleString()}</span>
                    <span className="text-sm text-gray-400 line-through">฿{Number(viewingProduct.price).toLocaleString()}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-black text-blue-700">฿{Number(viewingProduct.price || 0).toLocaleString()}</span>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <Box className="inline w-4 h-4 mr-2" /> ขนาด: {viewingProduct.size || "-"}
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-sm">
                  <CheckCircle2 className="inline w-4 h-4 mr-2 text-green-600" /> สถานะ: {viewingProduct.status}
                </div>
                <div className="sm:col-span-2 bg-amber-50 rounded-lg p-3 text-sm">
                  <MapPin className="inline w-4 h-4 mr-2 text-amber-600" /> โซนวางหน้าร้าน: {viewingProduct.location || "-"}
                </div>
              </div>

              {viewingProduct.description && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  {viewingProduct.description}
                </div>
              )}

              <div className="mt-5 bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex gap-3">
                  <MessageCircle className="text-green-600 w-5 h-5 shrink-0" />
                  <div>
                    <p className="font-bold text-green-800 text-sm">สนใจสินค้านี้?</p>
                    <p className="text-xs text-green-700 mt-1">
                      แคปหน้าจอสินค้า <Camera className="inline w-3.5 h-3.5 mx-1" /> หรือแชร์ข้อมูลให้พนักงาน
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleShare(viewingProduct)}
                className="w-full mt-4 bg-[#06C755] hover:bg-[#05B34C] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
              >
                <Share2 className="w-5 h-5" /> แชร์ข้อมูลสินค้า
              </button>

              {isLoggedIn && (
                <button
                  onClick={() => {
                    setViewingProduct(null);
                    openEditProduct(viewingProduct);
                  }}
                  className="w-full mt-3 bg-blue-50 text-blue-700 py-3 rounded-xl font-bold"
                >
                  <Edit className="inline w-4 h-4 mr-1" /> แก้ไขสินค้า
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
