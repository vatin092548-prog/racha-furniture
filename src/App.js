import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

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
  MapPin,
  CheckCircle2,
  Edit,
  Trash2,
  X,
  Image as ImageIcon,
  Lock,
  LogOut,
  Share2,
  Package,
  Tag,
  LayoutDashboard,
  Flame,
  Bookmark,
  AlertCircle,
  Phone,
  ChevronRight,
  SlidersHorizontal,
  Download,
} from "lucide-react";

export default function App() {
  /* =======================================================
     CONFIG & SUPABASE
  ======================================================= */
  const STORE_PASSWORD = "1234";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [supabaseError, setSupabaseError] = useState("");

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
  const [subFilterSize, setSubFilterSize] = useState("ทั้งหมด");

  /* =======================================================
     LOGIN
  ======================================================= */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [passwordInput, setPasswordInput] = useState("");
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
    { name: "ห้องนอน", icon: Bed, prefix: "A", desc: "เตียง, ตู้เสื้อผ้า, โต๊ะแป้ง" },
    { name: "ห้องนั่งเล่น", icon: Sofa, prefix: "T", desc: "ตู้วางทีวี, โต๊ะกลาง, ชั้นวาง" },
    { name: "โซฟา & เก้าอี้พักผ่อน", icon: Armchair, prefix: "S", desc: "โซฟาเข้ามุม, เก้าอี้ปรับนอน" },
    { name: "ห้องอาหาร/ห้องครัว", icon: Utensils, prefix: "E", desc: "ชุดโต๊ะอาหาร, เก้าอี้กินข้าว" },
    { name: "ห้องสำนักงาน", icon: Briefcase, prefix: "I", desc: "โต๊ะทำงาน, เก้าอี้ผู้บริหาร" },
    { name: "สินค้าพิเศษ", icon: Sparkles, prefix: "P", desc: "สินค้าโปรโมชั่น, ตัวโชว์" },
    { name: "ห้องทั่วไป", icon: LayoutGrid, prefix: "B", desc: "เฟอร์นิเจอร์อเนกประสงค์" },
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
     EXPORT BACKUP DATA FUNCTION (FROM SUPABASE)
  ======================================================= */
  const handleExportBackup = async () => {
    try {
      const { data, error } = await supabase.from("products").select("*");
      if (error) throw error;

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "backup_products.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast(`ดาวน์โหลดไฟล์สำรองข้อมูลสำเร็จ (${data.length} รายการ)`);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการดึงข้อมูล: " + err.message);
    }
  };

  /* =======================================================
     AUTO GENERATE ID
  ======================================================= */
  const generateNextId = (categoryName, currentProducts) => {
    const prefix = categoryPrefixMap[categoryName] || "A";
    const categoryProducts = currentProducts.filter(
      (p) => p.category === categoryName || p.id?.startsWith(prefix)
    );

    let maxNum = 0;
    categoryProducts.forEach((p) => {
      const match = p.id?.match(new RegExp(`^${prefix}(\\d+)$`));
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    return `${prefix}${maxNum + 1}`;
  };

  /* =======================================================
     SUPABASE FETCH & REALTIME SUBSCRIPTION
  ======================================================= */
  const fetchProducts = async () => {
    setLoading(true);
    setSupabaseError("");
    const { data, error } = await supabase.from("products").select("*");

    if (error) {
      console.error("❌ Supabase READ ERROR", error);
      setSupabaseError(`ไม่สามารถอ่านข้อมูลจาก Supabase ได้\n${error.message}`);
      setProducts([]);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();

    // Subscribe to Realtime changes
    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => {
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  /* =======================================================
     OPEN PRODUCT AUTOMATICALLY FROM URL PARAMETER (?product=A1)
  ======================================================= */
  useEffect(() => {
    if (products.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const productIdFromUrl = urlParams.get("product");

      if (productIdFromUrl) {
        const foundProduct = products.find(
          (p) => String(p.id).toLowerCase() === String(productIdFromUrl).toLowerCase()
        );
        if (foundProduct) {
          setViewingProduct(foundProduct);
        }
      }
    }
  }, [products]);

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
    if (passwordInput === STORE_PASSWORD) {
      setIsLoggedIn(true);
      setShowLoginModal(false);
      setPasswordInput("");
      setLoginError("");
      showToast("เข้าสู่ระบบพนักงานสำเร็จ");
    } else {
      setLoginError("รหัสผ่านไม่ถูกต้อง");
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
     IMAGE COMPRESSOR & UPLOAD & REMOVE
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
      showToast("กำลังบีบอัดรูปภาพให้เร็วขึ้น...");
      const compressedImage = await compressImage(file, 800, 0.7);
      setFormData((previous) => ({
        ...previous,
        image: compressedImage,
      }));
      showToast("อัปโหลดรูปภาพสำเร็จ");
    } catch (error) {
      console.error("Image Compress Error:", error);
      alert("ไม่สามารถอัปโหลดรูปภาพนี้ได้");
    }
  };

  const handleRemoveImage = () => {
    setFormData((previous) => ({
      ...previous,
      image: "",
    }));
    showToast("ลบรูปภาพเรียบร้อย");
  };

  /* =======================================================
     SAVE PRODUCT (SUPABASE UPSERT)
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

    const hasNormalPrice = formData.price !== "" && formData.price !== null && formData.price !== undefined;
    const hasPromoPrice = formData.promoPrice !== "" && formData.promoPrice !== null && formData.promoPrice !== undefined;

    if (!hasNormalPrice && !hasPromoPrice) {
      alert("กรุณากรอกราคาสินค้า อย่างน้อย 1 ช่อง (ราคาปกติ หรือ ราคาลดพิเศษ)");
      return;
    }

    let normalPrice = null;
    let promotionPrice = null;

    if (hasNormalPrice) {
      normalPrice = Number(formData.price);
      if (Number.isNaN(normalPrice) || normalPrice < 0) {
        alert("ราคาสินค้าไม่ถูกต้อง");
        return;
      }
    }

    if (hasPromoPrice) {
      promotionPrice = Number(formData.promoPrice);
      if (Number.isNaN(promotionPrice) || promotionPrice < 0) {
        alert("ราคาโปรโมชั่นไม่ถูกต้อง");
        return;
      }
    }

    if (normalPrice === null && promotionPrice !== null) {
      normalPrice = promotionPrice;
    }

    if (hasNormalPrice && hasPromoPrice && promotionPrice > normalPrice) {
      alert("ราคาลดพิเศษไม่ควรมากกว่าราคาปกติ");
      return;
    }

    const newProductId = formData.id?.trim() || `P${Date.now()}`;

    const productData = {
      id: newProductId,
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
      // Delete old ID record if the primary key ID was modified while editing
      if (editingProduct && editingProduct.id !== newProductId) {
        await supabase.from("products").delete().eq("id", editingProduct.id);
      }

      const { error } = await supabase.from("products").upsert([productData]);

      if (error) throw error;

      closeProductModal();
      fetchProducts();
      showToast(editingProduct ? "แก้ไขสินค้าสำเร็จ" : "เพิ่มสินค้าสำเร็จ");
    } catch (error) {
      console.error("❌ SUPABASE SAVE ERROR", error);
      alert(`❌ ไม่สามารถบันทึกได้: ${error.message}`);
    }
  };

  /* =======================================================
     DELETE PRODUCT (SUPABASE DELETE)
  ======================================================= */
  const handleDeleteProduct = async (product, event) => {
    if (event) event.stopPropagation();
    if (!isLoggedIn) {
      alert("กรุณาเข้าสู่ระบบพนักงานก่อน");
      return;
    }

    if (!window.confirm(`ต้องการลบสินค้า "${product.name}" หรือไม่?`)) return;

    try {
      const { error } = await supabase.from("products").delete().eq("id", product.id);

      if (error) throw error;

      fetchProducts();
      showToast("ลบสินค้าเรียบร้อย");
    } catch (error) {
      console.error("❌ DELETE ERROR:", error);
      alert(`ลบสินค้าไม่สำเร็จ: ${error.message}`);
    }
  };

  /* =======================================================
     SHARE
  ======================================================= */
  const handleShare = async (product, event) => {
    if (event) event.stopPropagation();

    const baseUrl = window.location.origin + window.location.pathname;
    const productUrl = `${baseUrl}?product=${product.id}`;

    const price = product.promoPrice
      ? `฿${Number(product.promoPrice).toLocaleString()}`
      : `฿${Number(product.price).toLocaleString()}`;

    const shareText =
      `🪑 ${product.name}\n` +
      `💰 ราคา ${price}\n` +
      `📍 ราชาเฟอร์นิเจอร์ สาขาหาดใหญ่\n` +
      `📦 สถานะ: ${product.status || "มีสินค้าพร้อมส่ง"}\n` +
      `📍 โซนวาง: ${product.location || "-"}\n\n` +
      `ดูรูปและรายละเอียดเพิ่มเติม:\n` +
      `${productUrl}`;

    try {
      if (product.image && product.image.startsWith("data:image") && window.ClipboardItem) {
        const response = await fetch(product.image);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      }
    } catch (err) {
      console.log("Clipboard image copy not supported");
    }

    const lineShareUrl = `line://msg/text/${encodeURIComponent(shareText)}`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      window.location.href = lineShareUrl;
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        showToast("คัดลอกรูปภาพและข้อความแล้ว! นำไปวางใน LINE ได้เลย");
      } else {
        alert(shareText);
      }
    }
  };

  /* =======================================================
     BADGES
  ======================================================= */
  const renderImageBadge = (status) => {
    switch (status) {
      case "สินค้าตัวโชว์หน้าร้าน":
        return (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md">
            <Sparkles className="w-3 h-3 animate-spin-slow" /> ตัวโชว์
          </div>
        );
      case "สินค้าติดจอง":
        return (
          <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <Bookmark className="w-3 h-3" /> ติดจอง
          </div>
        );
      case "สินค้าหมด":
        return (
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> หมด
          </div>
        );
      default:
        return (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white font-black text-[11px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> พร้อมส่ง
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

      let subFilterMatch = true;
      if (selectedCategory === "ห้องนอน" && subFilterSize !== "ทั้งหมด") {
        const sizeStr = `${product.size || ""} ${product.name || ""} ${product.description || ""}`;
        if (subFilterSize === "5 ฟุต") {
          subFilterMatch = /5\s*ฟุต/.test(sizeStr) && !/3\.5\s*ฟุต/.test(sizeStr);
        } else if (subFilterSize === "3.5 ฟุต") {
          subFilterMatch = /3\.5\s*ฟุต/.test(sizeStr);
        } else if (subFilterSize === "6 ฟุต") {
          subFilterMatch = /6\s*ฟุต/.test(sizeStr);
        }
      } else if (selectedCategory === "ห้องอาหาร/ห้องครัว" && subFilterSize !== "ทั้งหมด") {
        const sizeStr = `${product.size || ""} ${product.name || ""} ${product.description || ""}`;
        subFilterMatch = sizeStr.includes(subFilterSize);
      }

      return (
        categoryMatch &&
        searchMatch &&
        promoMatch &&
        stockMatch &&
        minMatch &&
        maxMatch &&
        subFilterMatch
      );
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

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-gray-800 font-sans selection:bg-[#D4AF37] selection:text-white">

      {/* 🟡 ปุ่มสำหรับดาวน์โหลด backup_products.json ย้ายข้อมูล */}
      <button
        onClick={handleExportBackup}
        className="fixed top-3 left-3 z-50 bg-[#D4AF37] hover:bg-[#b89528] text-slate-900 font-black text-xs px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2 transition active:scale-95 border border-amber-300"
      >
        <Download className="w-4 h-4" /> กดเพื่อโหลดไฟล์ backup_products.json
      </button>

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-bounce">
          <div className="bg-[#0F172A] text-[#D4AF37] border-2 border-[#D4AF37] px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            {toast}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-[#0F172A] text-white sticky top-0 z-40 border-b border-[#1E293B] shadow-xl pt-10 sm:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group"
            onClick={() => {
              setSelectedCategory("");
              setSearchTerm("");
              setSubFilterSize("ทั้งหมด");
              window.history.pushState({}, "", window.location.pathname);
            }}
          >
            <div className="p-2.5 bg-gradient-to-br from-[#D4AF37] to-[#997B15] rounded-2xl shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-transform duration-300">
              <svg
                width="32"
                height="32"
                viewBox="0 0 100 100"
                fill="none"
                stroke="white"
                strokeWidth="7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M15 70 L25 35 L40 55 L50 25 L60 55 L75 35 L85 70 Z" />
                <circle cx="25" cy="30" r="4" fill="white" />
                <circle cx="50" cy="20" r="4" fill="white" />
                <circle cx="75" cy="30" r="4" fill="white" />
                <path d="M18 78 Q50 83 82 78" strokeWidth="6" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white group-hover:text-[#D4AF37] transition">
                  ราชาเฟอร์นิเจอร์
                </h1>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                    isLoggedIn
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30"
                  }`}
                >
                  {isLoggedIn ? "โหมดพนักงาน" : "แคตตาล็อกหน้าร้าน"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-[#D4AF37]" /> สาขาหาดใหญ่ (ถ.สามสิบเมตร)</span>
                <span className="hidden sm:inline text-slate-600">•</span>
                <span className="hidden sm:flex items-center gap-1"><Phone className="w-3 h-3 text-[#D4AF37]" /> 074-244665</span>
              </div>
            </div>
          </div>

          {/* Search & Actions Bar */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ หรือ รหัสสินค้า..."
                className="w-full bg-[#1E293B] text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-700 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
              />
              <Search className="absolute left-3.5 top-2.5 text-slate-400 w-3.5 h-3.5" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isLoggedIn && (
              <button
                onClick={openAddProduct}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-emerald-900/20 flex items-center gap-1.5 whitespace-nowrap transition active:scale-95"
              >
                <Plus className="w-4 h-4" /> เพิ่มสินค้า
              </button>
            )}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="bg-slate-800 hover:bg-red-600/20 hover:text-red-400 text-slate-400 border border-slate-700 hover:border-red-500/30 p-2 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setLoginError("");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-[#D4AF37] border border-[#D4AF37]/30 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition active:scale-95"
              >
                <Lock className="w-3.5 h-3.5" /> สำหรับพนักงาน
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MAIN BODY */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {supabaseError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 shadow-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="text-xs font-medium whitespace-pre-line">{supabaseError}</div>
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {isLoggedIn && (
          <div className="mb-8 bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-xl">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-slate-800 text-sm">แผงควบคุมระบบจัดการสินค้า</h2>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">เรียลไทม์จาก Supabase</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-500/5 to-indigo-500/10 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">สินค้าทั้งหมด</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">{products.length}</p>
                </div>
                <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-md shadow-blue-500/20">
                  <Package className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-rose-500/5 to-pink-500/10 border border-rose-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">โปรโมชั่นพิเศษ</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">{promotionCount}</p>
                </div>
                <div className="p-3 bg-rose-500 text-white rounded-2xl shadow-md shadow-rose-500/20">
                  <Tag className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-gradient-to-br from-emerald-500/5 to-teal-500/10 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">มีสินค้าพร้อมขาย</p>
                  <p className="text-3xl font-black text-slate-800 mt-1">{stockCount}</p>
                </div>
                <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-md shadow-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY GRID */}
        {!selectedCategory && searchTerm === "" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-lg font-black text-slate-800 tracking-tight">
                  เลือกหมวดหมู่เฟอร์นิเจอร์
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">ค้นหาเฟอร์นิเจอร์คุณภาพเยี่ยมตามหมวดห้องที่คุณต้องการ</p>
              </div>
              <span className="text-xs font-bold text-[#D4AF37] bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                {categories.length} หมวดหมู่
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => {
                const Icon = category.icon;
                const count = products.filter((p) => p.category === category.name).length;

                return (
                  <button
                    key={category.name}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setSubFilterSize("ทั้งหมด");
                    }}
                    className="group relative bg-white border border-slate-200/80 hover:border-[#D4AF37] rounded-2xl p-4 text-left shadow-sm hover:shadow-xl hover:shadow-[#D4AF37]/5 transition-all duration-300 flex items-center justify-between overflow-hidden"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3.5 bg-slate-50 group-hover:bg-[#0F172A] text-slate-700 group-hover:text-[#D4AF37] rounded-2xl transition-colors duration-300 shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-slate-800 group-hover:text-[#0F172A] text-sm">
                            {category.name}
                          </h3>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{category.desc}</p>
                        <span className="inline-block mt-2 text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {count} รายการ
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      {isLoggedIn && (
                        <span className="text-xs font-black font-mono text-[#D4AF37] bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-lg">
                          {category.prefix}
                        </span>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#D4AF37] group-hover:translate-x-1 transition-all mt-1" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* PRODUCT LIST SECTION */}
        {(selectedCategory || searchTerm !== "") && (
          <div className="space-y-4">
            
            {/* Header Control inside Category */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchTerm("");
                  setSubFilterSize("ทั้งหมด");
                  window.history.pushState({}, "", window.location.pathname);
                }}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition w-fit"
              >
                <ArrowLeft className="w-4 h-4" /> ดูหมวดหมู่ทั้งหมด
              </button>

              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <span className="text-xs font-extrabold text-[#0F172A] bg-amber-400/10 border border-amber-400/30 px-3 py-1.5 rounded-xl">
                    หมวด: {selectedCategory} {isLoggedIn && `(${categoryPrefixMap[selectedCategory]})`}
                  </span>
                )}
                {searchTerm && (
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
                    ผลการค้นหา: "{searchTerm}"
                  </span>
                )}
              </div>
            </div>

            {/* Sub Filter for Bedrooms */}
            {selectedCategory === "ห้องนอน" && (
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mr-2">
                  <Bed className="w-4 h-4 text-amber-600" /> ขนาดเตียง:
                </span>
                {["ทั้งหมด", "3.5 ฟุต", "5 ฟุต", "6 ฟุต"].map((sizeOption) => (
                  <button
                    key={sizeOption}
                    onClick={() => setSubFilterSize(sizeOption)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      subFilterSize === sizeOption
                        ? "bg-[#0F172A] text-[#D4AF37] shadow-md"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
            )}

            {/* Sub Filter for Dining Room */}
            {selectedCategory === "ห้องอาหาร/ห้องครัว" && (
              <div className="bg-amber-50/60 border border-amber-200/60 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 mr-2">
                  <Utensils className="w-4 h-4 text-amber-600" /> จำนวนที่นั่ง:
                </span>
                {["ทั้งหมด", "2 ที่นั่ง", "4 ที่นั่ง", "6 ที่นั่ง"].map((seatOption) => (
                  <button
                    key={seatOption}
                    onClick={() => setSubFilterSize(seatOption)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      subFilterSize === seatOption
                        ? "bg-[#0F172A] text-[#D4AF37] shadow-md"
                        : "bg-white text-slate-600 border border-slate-200 hover:border-amber-300"
                    }`}
                  >
                    {seatOption}
                  </button>
                ))}
              </div>
            )}

            {/* BAR FILTER & PRICE SORT */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPromoOnly(!promoOnly)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    promoOnly
                      ? "bg-rose-600 text-white shadow-md shadow-rose-600/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" /> ลดพิเศษ
                </button>
                <button
                  onClick={() => setStockOnly(!stockOnly)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    stockOnly
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> พร้อมส่ง
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-500 font-bold">ช่วงราคา:</span>
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#D4AF37]"
                  />
                  <span className="text-slate-300">-</span>
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <select
                  value={sortPrice}
                  onChange={(e) => setSortPrice(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#D4AF37]"
                >
                  <option value="none">เรียงลำดับราคา</option>
                  <option value="low">ราคา: น้อย ➔ มาก</option>
                  <option value="high">ราคา: มาก ➔ น้อย</option>
                </select>
              </div>
            </div>

            {/* PRODUCT CARDS LIST */}
            {loading ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent"></div>
                <p className="text-xs text-slate-400 mt-2 font-bold">กำลังโหลดรายการสินค้า...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-500">ไม่พบรายการสินค้าที่คุณค้นหา</p>
                <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setViewingProduct(product)}
                    className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#D4AF37]/50 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                  >
                    <div>
                      {/* Image Box */}
                      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 bg-slate-50">
                            <ImageIcon className="w-10 h-10 mb-1" />
                            <span className="text-[10px]">ไม่มีรูปภาพ</span>
                          </div>
                        )}

                        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                          {renderImageBadge(product.status)}
                        </div>

                        {product.promoPrice && (
                          <div className="absolute top-2.5 right-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg tracking-wider uppercase">
                            PROMO
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-mono text-[11px] font-bold text-slate-400">
                            ID: {product.id}
                          </span>
                          {product.size && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                              {product.size}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-[#D4AF37] transition-colors">
                          {product.name}
                        </h3>

                        {product.location && (
                          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                            โซน: {product.location}
                          </p>
                        )}

                        {/* Price */}
                        <div className="mt-3 flex items-baseline gap-2">
                          {product.promoPrice ? (
                            <>
                              <span className="text-xl font-black text-rose-600">
                                ฿{Number(product.promoPrice).toLocaleString()}
                              </span>
                              {product.price && product.price !== product.promoPrice && (
                                <span className="text-xs text-slate-400 line-through">
                                  ฿{Number(product.price).toLocaleString()}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xl font-black text-slate-800">
                              ฿{Number(product.price).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="p-4 pt-0">
                      <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                        <button
                          onClick={(e) => handleShare(product, e)}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200/60 transition"
                        >
                          <Share2 className="w-3.5 h-3.5" /> แชร์ลง LINE
                        </button>

                        {isLoggedIn && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => openEditProduct(product, e)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
                              title="แก้ไข"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteProduct(product, e)}
                              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                              title="ลบ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>

      {/* ==================== VIEW PRODUCT MODAL ==================== */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-100">
            
            <button
              onClick={() => setViewingProduct(null)}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white text-slate-700 p-2 rounded-full shadow-md backdrop-blur-md transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-4/3 bg-slate-100 relative overflow-hidden">
              {viewingProduct.image ? (
                <img
                  src={viewingProduct.image}
                  alt={viewingProduct.name}
                  className="w-full h-full object-contain bg-slate-900/5"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon className="w-16 h-16" />
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-lg">
                  ID: {viewingProduct.id}
                </span>
                <span className="text-xs font-extrabold text-[#0F172A] bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full">
                  {viewingProduct.category}
                </span>
              </div>

              <h2 className="text-2xl font-black text-slate-800">{viewingProduct.name}</h2>

              <div className="my-4 flex items-baseline gap-3">
                {viewingProduct.promoPrice ? (
                  <>
                    <span className="text-3xl font-black text-rose-600">
                      ฿{Number(viewingProduct.promoPrice).toLocaleString()}
                    </span>
                    {viewingProduct.price && viewingProduct.price !== viewingProduct.promoPrice && (
                      <span className="text-base text-slate-400 line-through">
                        ฿{Number(viewingProduct.price).toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-3xl font-black text-slate-800">
                    ฿{Number(viewingProduct.price).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="space-y-2 border-t border-b border-slate-100 py-4 my-4 text-xs text-slate-600">
                {viewingProduct.size && (
                  <p className="flex justify-between">
                    <span className="font-bold text-slate-400">ขนาด:</span>
                    <span className="font-bold text-slate-800">{viewingProduct.size}</span>
                  </p>
                )}
                {viewingProduct.location && (
                  <p className="flex justify-between">
                    <span className="font-bold text-slate-400">โซนจัดวาง:</span>
                    <span className="font-bold text-slate-800">{viewingProduct.location}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="font-bold text-slate-400">สถานะ:</span>
                  <span className="font-bold text-slate-800">{viewingProduct.status}</span>
                </p>
                {viewingProduct.description && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="font-bold text-slate-400 block mb-1">รายละเอียดเพิ่มเติม:</span>
                    <p className="text-slate-700 leading-relaxed whitespace-pre-line">{viewingProduct.description}</p>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => handleShare(viewingProduct, e)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-98"
              >
                <Share2 className="w-5 h-5" /> แชร์รายละเอียดลง LINE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==================== ADD / EDIT PRODUCT MODAL ==================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            
            <button
              onClick={closeProductModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-black text-slate-800 mb-4">
              {editingProduct ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่"}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-3.5">
              
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">หมวดหมู่สินค้า</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    const nextId = editingProduct ? formData.id : generateNextId(cat, products);
                    setFormData({ ...formData, category: cat, id: nextId });
                  }}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-medium outline-none focus:border-[#D4AF37]"
                >
                  {categories.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">รหัสสินค้า</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs font-mono outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ขนาด (ถ้ามี)</label>
                  <input
                    type="text"
                    placeholder="เช่น 5 ฟุต"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ราคาปกติ (บาท)</label>
                  <input
                    type="number"
                    placeholder="ถ้าไม่มี ไม่ต้องกรอก"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required={!formData.promoPrice}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">ราคาลดพิเศษ (บาท)</label>
                  <input
                    type="number"
                    placeholder="ราคาโปรโมชั่น"
                    value={formData.promoPrice}
                    onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                    required={!formData.price}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">สถานะสินค้า</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#D4AF37]"
                  >
                    <option value="มีสินค้าพร้อมส่ง">มีสินค้าพร้อมส่ง</option>
                    <option value="สินค้าตัวโชว์หน้าร้าน">สินค้าตัวโชว์หน้าร้าน</option>
                    <option value="สินค้าติดจอง">สินค้าติดจอง</option>
                    <option value="สินค้าหมด">สินค้าหมด</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">โซนวางสินค้า</label>
                  <input
                    type="text"
                    placeholder="เช่น โซน A2"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Upload & Remove Image */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">รูปภาพสินค้า</label>
                {formData.image ? (
                  <div className="relative inline-block mt-1">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-xl border border-slate-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow-md transition"
                      title="ลบรูปภาพนี้"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-xs text-slate-500 border border-slate-200 rounded-xl p-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">รายละเอียดเพิ่มเติม</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs outline-none focus:border-[#D4AF37]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl font-bold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20"
                >
                  บันทึกสินค้า
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ==================== LOGIN MODAL ==================== */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl relative">
            
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-[#0F172A] text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-slate-900/20">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-slate-800">เข้าสู่ระบบพนักงาน</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">กรอกรหัสผ่านเพื่อจัดการข้อมูล</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="รหัสผ่านพนักงาน"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-center font-mono text-sm outline-none focus:border-[#D4AF37]"
                />
                {loginError && (
                  <p className="text-[11px] text-red-500 font-bold mt-1 text-center">{loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F172A] hover:bg-slate-800 text-[#D4AF37] font-bold py-2.5 rounded-xl text-xs shadow-md transition"
              >
                เข้าสู่ระบบ
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}