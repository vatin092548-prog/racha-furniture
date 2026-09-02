import React, { useEffect, useState, useMemo } from "react";
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
  AlertCircle,
  Phone,
  ChevronRight,
  SlidersHorizontal,
  Upload,
  Activity
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
     CATEGORIES & PREFIX MAP & IMAGES
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
    { 
      name: "ห้องนอน", 
      icon: Bed, 
      prefix: "A", 
      description: "เตียง, ตู้เสื้อผ้า, โต๊ะเครื่องแป้ง",
      image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=600&auto=format&fit=crop"
    },
    { 
      name: "ห้องนั่งเล่น", 
      icon: Sofa, 
      prefix: "T", 
      description: "ชุดโซฟา, โต๊ะกลาง, ชั้นวางทีวี",
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop"
    },
    { 
      name: "โซฟา & เก้าอี้พักผ่อน", 
      icon: Armchair, 
      prefix: "S", 
      description: "โต๊ะหน้าทีวี, เก้าอี้พักผ่อน",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=600&auto=format&fit=crop"
    },
    { 
      name: "ห้องอาหาร/ห้องครัว", 
      icon: Utensils, 
      prefix: "E", 
      description: "ชุดโต๊ะอาหาร, เคาน์เตอร์ครัว",
      image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=600&auto=format&fit=crop"
    },
    { 
      name: "ห้องสำนักงาน", 
      icon: Briefcase, 
      prefix: "I", 
      description: "โต๊ะทำงาน, เก้าอี้ผู้บริหาร",
      image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=600&auto=format&fit=crop"
    },
    { 
      name: "สินค้าพิเศษ", 
      icon: Sparkles, 
      prefix: "P", 
      description: "สินค้ารุ่นพิเศษ, ดีไซน์พรีเมียม",
      image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=600&auto=format&fit=crop"
    },
    { 
      name: "ห้องทั่วไป", 
      icon: LayoutGrid, 
      prefix: "B", 
      description: "เฟอร์นิเจอร์อเนกประสงค์",
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=600&auto=format&fit=crop"
    },
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
      `📍 ราชาเฟอร์นิเจอร์ สาขาหาดใหญ่ (ถ.สามสิบเมตร)\n` +
      `📞 โทร. 074-244665 , 086-4906582\n` +
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
          <div className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> ตัวโชว์
          </div>
        );
      case "สินค้าติดจอง":
        return (
          <div className="bg-purple-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md">
            ติดจอง
          </div>
        );
      case "สินค้าหมด":
        return (
          <div className="bg-rose-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md">
            หมด
          </div>
        );
      default:
        return (
          <div className="bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> พร้อมส่ง
          </div>
        );
    }
  };

  /* =======================================================
     FILTER PRODUCTS
  ======================================================= */
  const filteredProducts = useMemo(() => {
    return products
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
  }, [
    products,
    selectedCategory,
    searchTerm,
    promoOnly,
    stockOnly,
    minPrice,
    maxPrice,
    subFilterSize,
    sortPrice,
  ]);

  const promotionCount = useMemo(
    () => products.filter((product) => Boolean(product.promoPrice)).length,
    [products]
  );
  const stockCount = useMemo(
    () => products.filter((product) => product.status !== "สินค้าหมด").length,
    [products]
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-800 font-sans">

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <div className="bg-[#161B26] text-[#E6C687] border border-[#B89446]/40 px-5 py-3 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#E6C687]" />
            {toast}
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="bg-[#0F172A] border-b border-[#2A3447] sticky top-0 z-40 shadow-xl backdrop-blur-md bg-opacity-95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3.5">
          
          <div
            className="flex items-center gap-3.5 cursor-pointer group w-full md:w-auto justify-between md:justify-start"
            onClick={() => {
              setSelectedCategory("");
              setSearchTerm("");
              setSubFilterSize("ทั้งหมด");
              window.history.pushState({}, "", window.location.pathname);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#E6C687] to-[#B89446] rounded-2xl shadow-lg shadow-[#B89446]/20 group-hover:scale-105 transition-transform duration-300">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="#1E1B18"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 70 L25 35 L40 55 L50 25 L60 55 L75 35 L85 70 Z" />
                  <circle cx="25" cy="30" r="4" fill="#1E1B18" />
                  <circle cx="50" cy="20" r="4" fill="#1E1B18" />
                  <circle cx="75" cy="30" r="4" fill="#1E1B18" />
                  <path d="M18 78 Q50 83 82 78" strokeWidth="6" />
                </svg>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-xl font-black tracking-tight text-white group-hover:text-[#E6C687] transition-colors">
                    ราชาเฟอร์นิเจอร์
                  </h1>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-[#1E2638] text-[#E6C687] border-[#3B4760]/60">
                    {isLoggedIn ? "พนักงาน" : "แคตตาล็อกออนไลน์"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-400 font-medium mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#E6C687]" /> สาขาหาดใหญ่ (ถ.สามสิบเมตร)
                  </span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#E6C687]" /> โทร. 074-244665 , 086-4906582
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ หรือ รหัสสินค้า..."
                className="w-full bg-[#182030] text-slate-100 placeholder-slate-400 pl-9 pr-8 py-2 rounded-xl text-xs font-medium border border-[#2A354A] focus:outline-none focus:border-[#E6C687] focus:ring-1 focus:ring-[#E6C687] transition"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400 w-3.5 h-3.5" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")} 
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {isLoggedIn && (
              <button
                onClick={openAddProduct}
                className="bg-gradient-to-r from-[#D4AF37] to-[#B89446] hover:from-[#E6C687] hover:to-[#C5A049] text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs shadow-md shadow-amber-500/10 flex items-center gap-1.5 whitespace-nowrap transition active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" /> เพิ่มสินค้า
              </button>
            )}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="bg-[#182030] hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 border border-[#2A354A] hover:border-rose-800/60 p-2 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setLoginError("");
                }}
                className="bg-[#182030] hover:bg-[#202B40] text-[#E6C687] border border-[#2A354A] hover:border-[#E6C687]/40 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition active:scale-95 shadow-sm"
              >
                <Lock className="w-3.5 h-3.5 text-[#E6C687]" /> พนักงาน
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {supabaseError && (
          <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="text-xs font-medium whitespace-pre-line">{supabaseError}</div>
          </div>
        )}

        {/* ADMIN DASHBOARD UI WITH CATEGORY BREAKDOWN */}
        {isLoggedIn && (
          <div className="mb-8 bg-white rounded-2xl border border-[#EAE3D2] p-5 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#F5EFE6] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#F5E7C6] text-[#5C4D28] rounded-xl font-bold">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-[#362D19] text-sm">แผงควบคุมระบบจัดการสินค้า</h2>
                  <p className="text-[10px] text-slate-500">ภาพรวมคลังสินค้า สถิติโปรโมชั่น และจำนวนสินค้าแยกตามหมวดหมู่</p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-700 font-mono bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
                Realtime Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    สินค้าทั้งหมดในระบบ
                  </span>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black text-slate-800">{products.length}</p>
                    <span className="text-xs text-slate-500 font-medium">รายการ</span>
                  </div>
                </div>
                <div className="p-3 bg-white text-[#B89446] rounded-xl border border-[#EAE3D2]">
                  <Package className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    โปรโมชั่นพิเศษ
                  </span>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black text-rose-600">{promotionCount}</p>
                    <span className="text-xs text-slate-500 font-medium">รายการ</span>
                  </div>
                </div>
                <div className="p-3 bg-white text-rose-500 rounded-xl border border-[#EAE3D2]">
                  <Tag className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                    พร้อมจำหน่าย
                  </span>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl font-black text-emerald-600">{stockCount}</p>
                    <span className="text-xs text-slate-500 font-medium">รายการ</span>
                  </div>
                </div>
                <div className="p-3 bg-white text-emerald-600 rounded-xl border border-[#EAE3D2]">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* จำนวนสินค้าแยกตามแต่ละหมวดหมู่ */}
            <div className="pt-2 border-t border-[#F5EFE6]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#4A3E25] flex items-center gap-1.5">
                  <LayoutGrid className="w-3.5 h-3.5 text-[#B89446]" /> 
                  สรุปจำนวนสินค้าแยกตามหมวดหมู่
                </span>
                <span className="text-[10px] text-slate-400">คลิกที่หมวดหมู่เพื่อกรองสินค้า</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {categories.map((cat) => {
                  const catCount = products.filter(
                    (p) => p.category === cat.name || p.id?.startsWith(cat.prefix)
                  ).length;
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.name;

                  return (
                    <button
                      key={cat.name}
                      onClick={() => {
                        setSelectedCategory(isSelected ? "" : cat.name);
                        setSubFilterSize("ทั้งหมด");
                      }}
                      className={`p-2.5 rounded-xl border transition-all flex flex-col items-center text-center justify-between ${
                        isSelected
                          ? "bg-[#6B5528] text-white border-[#6B5528] shadow-sm scale-105"
                          : "bg-[#FAF8F5] hover:bg-white text-slate-700 border-[#EAE3D2] hover:border-[#B89446]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-amber-200" : "text-[#B89446]"}`} />
                      <span className="text-[11px] font-bold line-clamp-1">{cat.name}</span>
                      <span
                        className={`text-[10px] font-mono font-black mt-1 px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "bg-amber-100/70 text-[#5C4D28]"
                        }`}
                      >
                        {catCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* CATEGORY CARDS GRID */}
        {!selectedCategory && searchTerm === "" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((category) => {
                const Icon = category.icon;
                const count = products.filter(
                  (p) => p.category === category.name || p.id?.startsWith(category.prefix)
                ).length;

                return (
                  <div
                    key={category.name}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setSubFilterSize("ทั้งหมด");
                    }}
                    className="group bg-white rounded-2xl border border-slate-100 hover:border-amber-400 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer overflow-hidden flex relative min-h-[175px]"
                  >
                    <div className="flex-1 p-5 flex flex-col justify-between z-10 bg-gradient-to-r from-white via-white/95 to-transparent pr-2">
                      <div>
                        <div className="w-10 h-10 rounded-xl bg-[#FFF8EE] border border-[#F5E6D3] flex items-center justify-center text-[#B58048] mb-3 group-hover:scale-105 transition-transform duration-300">
                          <Icon className="w-5 h-5" />
                        </div>

                        <h3 className="text-base font-bold text-slate-800 group-hover:text-[#B58048] transition-colors">
                          {category.name}
                        </h3>

                        {category.description && (
                          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 group-hover:text-amber-600 font-medium transition-colors pt-2">
                        <span>เลือกชมสินค้า</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    <div className="w-5/12 relative overflow-hidden flex items-end justify-end">
                      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm text-slate-700 font-medium text-[11px] px-2.5 py-0.5 rounded-full shadow-sm border border-slate-100">
                        {count} รายการ
                      </div>

                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />

                      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/30 to-transparent pointer-events-none" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRODUCT LIST SECTION */}
        {(selectedCategory || searchTerm !== "") && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#EAE3D2] shadow-sm">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchTerm("");
                  setSubFilterSize("ทั้งหมด");
                  window.history.pushState({}, "", window.location.pathname);
                }}
                className="bg-[#FAF8F5] hover:bg-[#F3EDE2] text-[#4A3E25] border border-[#E6DFD3] px-3.5 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold transition w-fit"
              >
                <ArrowLeft className="w-4 h-4 text-[#B89446]" /> ดูหมวดหมู่ทั้งหมด
              </button>

              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <span className="text-xs font-bold text-[#6B5528] bg-[#F8F4EC] border border-[#EADFCA] px-3 py-1 rounded-lg">
                    หมวด: {selectedCategory} {isLoggedIn && `(${categoryPrefixMap[selectedCategory]})`}
                  </span>
                )}
                {searchTerm && (
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                    ผลการค้นหา: "{searchTerm}"
                  </span>
                )}
              </div>
            </div>

            {selectedCategory === "ห้องนอน" && (
              <div className="bg-white border border-[#EAE3D2] rounded-xl p-3 flex flex-wrap items-center gap-2 shadow-sm">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-2">
                  <Bed className="w-4 h-4 text-[#B89446]" /> ขนาดเตียง:
                </span>
                {["ทั้งหมด", "3.5 ฟุต", "5 ฟุต", "6 ฟุต"].map((sizeOption) => (
                  <button
                    key={sizeOption}
                    onClick={() => setSubFilterSize(sizeOption)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      subFilterSize === sizeOption
                        ? "bg-[#6B5528] text-white shadow-sm"
                        : "bg-[#FAF8F5] text-slate-700 border border-[#E6DFD3] hover:bg-[#F3EDE2]"
                    }`}
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
            )}

            {selectedCategory === "ห้องอาหาร/ห้องครัว" && (
              <div className="bg-white border border-[#EAE3D2] rounded-xl p-3 flex flex-wrap items-center gap-2 shadow-sm">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-2">
                  <Utensils className="w-4 h-4 text-[#B89446]" /> จำนวนที่นั่ง:
                </span>
                {["ทั้งหมด", "2 ที่นั่ง", "4 ที่นั่ง", "6 ที่นั่ง"].map((seatOption) => (
                  <button
                    key={seatOption}
                    onClick={() => setSubFilterSize(seatOption)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      subFilterSize === seatOption
                        ? "bg-[#6B5528] text-white shadow-sm"
                        : "bg-[#FAF8F5] text-slate-700 border border-[#E6DFD3] hover:bg-[#F3EDE2]"
                    }`}
                  >
                    {seatOption}
                  </button>
                ))}
              </div>
            )}

            <div className="bg-white border border-[#EAE3D2] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPromoOnly(!promoOnly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    promoOnly
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" /> 
                  ลดพิเศษ
                </button>

                <button
                  onClick={() => setStockOnly(!stockOnly)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    stockOnly
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> 
                  พร้อมส่ง
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-600 font-bold">ราคา:</span>
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-16 bg-[#FAF8F5] border border-[#E6DFD3] text-slate-800 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#B89446]"
                  />
                  <span className="text-slate-400">-</span>
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-16 bg-[#FAF8F5] border border-[#E6DFD3] text-slate-800 rounded-lg px-2 py-1 text-xs outline-none focus:border-[#B89446]"
                  />
                </div>

                <select
                  value={sortPrice}
                  onChange={(e) => setSortPrice(e.target.value)}
                  className="bg-[#FAF8F5] border border-[#E6DFD3] text-xs font-bold text-slate-700 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#B89446]"
                >
                  <option value="none">เรียงลำดับราคา</option>
                  <option value="low">ราคา: น้อย ➔ มาก</option>
                  <option value="high">ราคา: มาก ➔ น้อย</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#EAE3D2]">
                <div className="inline-block animate-spin rounded-full h-7 w-7 border-3 border-[#B89446] border-t-transparent"></div>
                <p className="text-xs text-slate-500 mt-2 font-medium">กำลังโหลดรายการสินค้า...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-[#EAE3D2]">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">ไม่พบรายการสินค้าที่คุณค้นหา</p>
                <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => {
                  return (
                    <div
                      key={product.id}
                      onClick={() => setViewingProduct(product)}
                      className="group bg-white rounded-xl border border-[#EAE3D2] hover:border-[#D4AF37] shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between overflow-hidden"
                    >
                      <div>
                        <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                              <ImageIcon className="w-8 h-8 mb-1" />
                              <span className="text-[10px]">ไม่มีรูปภาพ</span>
                            </div>
                          )}

                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {renderImageBadge(product.status)}
                          </div>

                          {product.promoPrice && (
                            <div className="absolute bottom-2 right-2 bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm">
                              PROMO
                            </div>
                          )}
                        </div>

                        <div className="p-3.5">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-mono text-[10px] font-bold text-slate-400">
                              ID: {product.id}
                            </span>
                            {product.size && (
                              <span className="text-[10px] bg-[#F8F4EC] text-[#6B5528] px-2 py-0.5 rounded font-bold border border-[#EADFCA]">
                                {product.size}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-[#8C733E] transition-colors">
                            {product.name}
                          </h3>

                          {product.location && (
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#B89446] shrink-0" />
                              โซน: {product.location}
                            </p>
                          )}

                          <div className="mt-2.5 flex items-baseline gap-2">
                            {product.promoPrice ? (
                              <>
                                <span className="text-lg font-black text-rose-600">
                                  ฿{Number(product.promoPrice).toLocaleString()}
                                </span>
                                {product.price && product.price !== product.promoPrice && (
                                  <span className="text-xs text-slate-400 line-through">
                                    ฿{Number(product.price).toLocaleString()}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-lg font-black text-slate-900">
                                ฿{Number(product.price).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-3.5 pt-0">
                        <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between gap-2">
                          <button
                            onClick={(e) => handleShare(product, e)}
                            className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200 transition"
                          >
                            <Share2 className="w-3.5 h-3.5" /> แชร์ลง LINE
                          </button>

                          {isLoggedIn && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => openEditProduct(product, e)}
                                className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                                title="แก้ไขสินค้า"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteProduct(product, e)}
                                className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
                                title="ลบสินค้า"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

      </main>

      {/* VIEW PRODUCT MODAL */}
      {viewingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl relative border border-[#EAE3D2]">
            
            <button
              onClick={() => setViewingProduct(null)}
              className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white text-slate-600 p-1.5 rounded-full shadow-md transition border border-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="aspect-4/3 bg-slate-50 relative overflow-hidden">
              {viewingProduct.image ? (
                <img
                  src={viewingProduct.image}
                  alt={viewingProduct.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                  <ImageIcon className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="p-5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  ID: {viewingProduct.id}
                </span>
                <span className="text-xs font-bold text-[#6B5528] bg-[#F8F4EC] border border-[#EADFCA] px-2.5 py-0.5 rounded-full">
                  {viewingProduct.category}
                </span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{viewingProduct.name}</h2>

              <div className="my-3 flex items-baseline gap-2.5">
                {viewingProduct.promoPrice ? (
                  <>
                    <span className="text-2xl font-black text-rose-600">
                      ฿{Number(viewingProduct.promoPrice).toLocaleString()}
                    </span>
                    {viewingProduct.price && viewingProduct.price !== viewingProduct.promoPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        ฿{Number(viewingProduct.price).toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-2xl font-black text-slate-900">
                    ฿{Number(viewingProduct.price).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="space-y-2 border-t border-b border-slate-100 py-3 my-3 text-xs text-slate-700">
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
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{viewingProduct.description}</p>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => handleShare(viewingProduct, e)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition active:scale-98 text-xs"
              >
                <Share2 className="w-4 h-4" /> แชร์รายละเอียดลง LINE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAE3D2] rounded-2xl w-full max-w-xl overflow-hidden shadow-xl flex flex-col max-h-[90vh]">
            
            <div className="px-5 py-3.5 border-b border-slate-100 flex justify-between items-center bg-[#FAF8F5]">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#B89446]"></span>
                {editingProduct ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่"}
              </h2>
              <button
                type="button"
                onClick={closeProductModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-5 overflow-y-auto space-y-3.5 text-xs text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">หมวดหมู่สินค้า *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const nextId = editingProduct ? formData.id : generateNextId(cat, products);
                        setFormData({ ...formData, category: cat, id: nextId });
                      }}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    >
                      {categories.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">รหัสสินค้า</label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-lg px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">ขนาด (ถ้ามี)</label>
                    <input
                      type="text"
                      placeholder="เช่น 5 ฟุต"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">ชื่อสินค้า *</label>
                    <input
                      type="text"
                      required
                      placeholder="ระบุชื่อสินค้า..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">ราคาปกติ (บาท)</label>
                    <input
                      type="number"
                      placeholder="ถ้าไม่มี ไม่ต้องกรอก"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required={!formData.promoPrice}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">ราคาลดพิเศษ (บาท)</label>
                    <input
                      type="number"
                      placeholder="ราคาโปรโมชั่น"
                      value={formData.promoPrice}
                      onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                      required={!formData.price}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">สถานะสินค้า</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    >
                      <option value="มีสินค้าพร้อมส่ง">มีสินค้าพร้อมส่ง</option>
                      <option value="สินค้าตัวโชว์หน้าร้าน">สินค้าตัวโชว์หน้าร้าน</option>
                      <option value="สินค้าติดจอง">สินค้าติดจอง</option>
                      <option value="สินค้าหมด">สินค้าหมด</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">โซนวางสินค้า</label>
                    <input
                      type="text"
                      placeholder="เช่น โซน A2"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">รูปภาพสินค้า</label>
                  {formData.image ? (
                    <div className="flex items-center gap-3 mt-1">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow transition"
                          title="ลบรูปภาพนี้"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">รูปภาพถูกเตรียมพร้อมบันทึกแล้ว คุณสามารถลบแล้วอัปโหลดใหม่ได้</p>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#E6DFD3] hover:border-[#B89446] rounded-xl p-4 text-center cursor-pointer transition bg-[#FAF8F5] flex flex-col items-center justify-center group">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#B89446] transition mb-1" />
                      <p className="text-xs font-bold text-slate-700">คลิกเพื่อเลือกรูปภาพสินค้า</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">รองรับไฟล์ PNG, JPG หรือ WEBP (บีบอัดภาพอัตโนมัติ)</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    rows="3"
                    placeholder="กรอกรายละเอียดสินค้าเพิ่มเติม..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-lg p-2.5 text-xs text-slate-800 outline-none focus:border-[#B89446] transition resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-slate-100 bg-[#FAF8F5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200/60 transition font-bold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#B89446] hover:bg-[#A3813B] text-white font-bold transition shadow-sm text-xs"
                >
                  บันทึกสินค้า
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-xl relative border border-[#EAE3D2]">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-10 h-10 bg-[#161B26] text-[#E6C687] rounded-xl flex items-center justify-center mx-auto mb-2 border border-slate-700">
                <Lock className="w-5 h-5 text-[#E6C687]" />
              </div>
              <h2 className="text-sm font-bold text-slate-800">เข้าสู่ระบบพนักงาน</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">กรอกรหัสผ่านเพื่อจัดการข้อมูล</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="รหัสผ่านพนักงาน"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-lg p-2 text-center font-mono text-xs text-slate-800 outline-none focus:border-[#B89446]"
                />
                {loginError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 text-center">{loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#B89446] hover:bg-[#A3813B] text-white font-bold py-2 rounded-lg text-xs shadow-sm transition"
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
