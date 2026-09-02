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
  Upload,
  Activity,
  Heart
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
     FAVORITES (ระบบถูกใจสินค้า - บันทึกลง LocalStorage)
  ======================================================= */
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("raja_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem("raja_favorites", JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favorites]);

  const toggleFavorite = (productId, event) => {
    if (event) event.stopPropagation();
    setFavorites((prevFavorites) => {
      const isFav = prevFavorites.includes(productId);
      if (isFav) {
        showToast("ยกเลิกการถูกใจแล้ว");
        return prevFavorites.filter((id) => id !== productId);
      } else {
        showToast("เพิ่มลงในรายการที่ถูกใจเรียบร้อย ❤️");
        return [...prevFavorites, productId];
      }
    });
  };

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

    // 📌 อัปเดตรายละเอียดสถานที่และเบอร์โทรศัพท์ในข้อความแชร์
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
          <div className="bg-amber-500/90 text-slate-950 font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md">
            <Sparkles className="w-3 h-3" /> ตัวโชว์
          </div>
        );
      case "สินค้าติดจอง":
        return (
          <div className="bg-purple-600/90 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md">
            <Bookmark className="w-3 h-3" /> ติดจอง
          </div>
        );
      case "สินค้าหมด":
        return (
          <div className="bg-rose-600/90 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md">
            <AlertCircle className="w-3 h-3" /> หมด
          </div>
        );
      default:
        return (
          <div className="bg-emerald-600/90 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 backdrop-blur-md">
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
      if (showFavoritesOnly && !favorites.includes(product.id)) {
        return false;
      }

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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 font-sans selection:bg-[#D4AF37] selection:text-slate-950">

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[100] animate-bounce">
          <div className="bg-[#161F33] text-[#F3C649] border border-[#D4AF37]/40 px-6 py-3.5 rounded-2xl shadow-2xl font-bold text-xs flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-[#F3C649]" />
            {toast}
          </div>
        </div>
      )}

      {/* LUXURY HEADER */}
      <header className="bg-[#0B0F19]/90 backdrop-blur-md border-b border-amber-500/10 sticky top-0 z-40 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-3.5">
          
          {/* Logo Brand */}
          <div
            className="flex items-center gap-3.5 cursor-pointer group w-full md:w-auto justify-between md:justify-start"
            onClick={() => {
              setSelectedCategory("");
              setSearchTerm("");
              setShowFavoritesOnly(false);
              setSubFilterSize("ทั้งหมด");
              window.history.pushState({}, "", window.location.pathname);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#F3C649] via-[#D4AF37] to-[#997B15] rounded-2xl shadow-lg shadow-[#D4AF37]/20 group-hover:scale-105 transition-all duration-300">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="#0B0F19"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 70 L25 35 L40 55 L50 25 L60 55 L75 35 L85 70 Z" />
                  <circle cx="25" cy="30" r="4" fill="#0B0F19" />
                  <circle cx="50" cy="20" r="4" fill="#0B0F19" />
                  <circle cx="75" cy="30" r="4" fill="#0B0F19" />
                  <path d="M18 78 Q50 83 82 78" strokeWidth="6" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg md:text-xl font-black tracking-tight text-white group-hover:text-[#F3C649] transition">
                    ราชาเฟอร์นิเจอร์
                  </h1>
                  <span
                    className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-sm transition-all ${
                      isLoggedIn
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40"
                        : "bg-gradient-to-r from-[#F3C649]/20 to-[#D4AF37]/10 text-[#F3C649] border-[#D4AF37]/50 shadow-[#D4AF37]/10"
                    }`}
                  >
                    {isLoggedIn ? "พนักงาน" : "แคตตาล็อกออนไลน์"}
                  </span>
                </div>

                {/* 📌 อัปเดตสาขาและเบอร์โทรตามรูปภาพ */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#F3C649] font-medium mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#F3C649]" /> สาขาหาดใหญ่ (ถ.สามสิบเมตร)
                  </span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#F3C649]" /> โทร. 074-244665 , 086-4906582
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar & Actions */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ หรือ รหัสสินค้า..."
                className="w-full bg-[#161F33] text-white placeholder-slate-400 pl-10 pr-4 py-2 rounded-xl text-xs font-medium border border-slate-700/80 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
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

            <button
              onClick={() => {
                setShowFavoritesOnly(!showFavoritesOnly);
                setSelectedCategory("");
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border relative shadow-md ${
                showFavoritesOnly
                  ? "bg-rose-500 text-white border-rose-400 shadow-rose-900/50"
                  : "bg-[#161F33] text-rose-400 border-rose-500/30 hover:bg-rose-950/30"
              }`}
              title="รายการสินค้าที่ถูกใจ"
            >
              <Heart className={`w-4 h-4 ${favorites.length > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
              <span className="hidden sm:inline">ที่ชอบ</span>
              {favorites.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border border-rose-400">
                  {favorites.length}
                </span>
              )}
            </button>

            {isLoggedIn && (
              <button
                onClick={openAddProduct}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-3.5 py-2 rounded-xl font-bold text-xs shadow-lg shadow-emerald-950/40 flex items-center gap-1.5 whitespace-nowrap transition active:scale-95"
              >
                <Plus className="w-4 h-4" /> เพิ่มสินค้า
              </button>
            )}

            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                title="ออกจากระบบ"
                className="bg-[#161F33] hover:bg-rose-950/40 hover:text-rose-400 text-slate-400 border border-slate-700 hover:border-rose-500/30 p-2 rounded-xl transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setShowLoginModal(true);
                  setLoginError("");
                }}
                className="bg-[#161F33] hover:bg-[#1E293B] text-[#F3C649] border border-[#D4AF37]/30 px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 whitespace-nowrap transition active:scale-95 shadow-lg"
              >
                <Lock className="w-3.5 h-3.5" /> พนักงาน
              </button>
            )}
          </div>

        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {supabaseError && (
          <div className="mb-6 bg-rose-950/30 border border-rose-500/30 text-rose-300 rounded-2xl p-4 shadow-sm flex items-center gap-3 backdrop-blur-md">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <div className="text-xs font-medium whitespace-pre-line">{supabaseError}</div>
          </div>
        )}

        {/* ADMIN DASHBOARD UI */}
        {isLoggedIn && (
          <div className="mb-8 bg-[#101726]/90 rounded-3xl border border-slate-700/60 p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-gradient-to-br from-[#F3C649] to-[#997B15] text-slate-950 rounded-xl shadow-md font-bold">
                  <LayoutDashboard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-black text-white text-sm tracking-wide">แผงควบคุมระบบจัดการสินค้า</h2>
                  <p className="text-[10px] text-slate-400">ภาพรวมคลังสินค้าและสถิติโปรโมชั่น</p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Activity className="w-3 h-3 animate-pulse text-emerald-400" />
                Realtime Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#182238] border border-blue-500/30 hover:border-blue-400/60 rounded-2xl p-4 flex items-center justify-between shadow-xl transition">
                <div>
                  <span className="text-[11px] font-extrabold text-blue-300 uppercase tracking-wider block mb-1">
                    สินค้าทั้งหมดในระบบ
                  </span>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-white tracking-tight">{products.length}</p>
                    <span className="text-xs text-slate-400 font-bold">รายการ</span>
                  </div>
                </div>
                <div className="p-3.5 bg-blue-500/20 text-blue-400 rounded-2xl border border-blue-400/40 shadow-inner">
                  <Package className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#1F1E28] border border-amber-500/30 hover:border-[#F3C649]/60 rounded-2xl p-4 flex items-center justify-between shadow-xl transition">
                <div>
                  <span className="text-[11px] font-extrabold text-[#F3C649] uppercase tracking-wider block mb-1">
                    โปรโมชั่นพิเศษ
                  </span>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-[#F3C649] tracking-tight">{promotionCount}</p>
                    <span className="text-xs text-amber-200/60 font-bold">รายการ</span>
                  </div>
                </div>
                <div className="p-3.5 bg-[#F3C649]/20 text-[#F3C649] rounded-2xl border border-[#F3C649]/40 shadow-inner">
                  <Tag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-[#122428] border border-emerald-500/30 hover:border-emerald-400/60 rounded-2xl p-4 flex items-center justify-between shadow-xl transition">
                <div>
                  <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider block mb-1">
                    พร้อมจำหน่าย
                  </span>
                  <div className="flex items-baseline gap-1">
                    <p className="text-3xl font-black text-emerald-400 tracking-tight">{stockCount}</p>
                    <span className="text-xs text-emerald-200/60 font-bold">รายการ</span>
                  </div>
                </div>
                <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-400/40 shadow-inner">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY CARDS GRID */}
        {!selectedCategory && searchTerm === "" && !showFavoritesOnly && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>เลือกหมวดหมู่เฟอร์นิเจอร์</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">คัดสรรเฟอร์นิเจอร์หรูหราคุณภาพเยี่ยม ตอบโจทย์ทุกสไตล์ของบ้านคุณ</p>
              </div>
              <span className="text-xs font-black text-[#F3C649] bg-[#F3C649]/10 border border-[#F3C649]/30 px-3.5 py-1.5 rounded-full shadow-lg">
                {categories.length} หมวดหมู่
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((category) => {
                const Icon = category.icon;
                const count = products.filter((p) => p.category === category.name).length;

                return (
                  <div
                    key={category.name}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setSubFilterSize("ทั้งหมด");
                    }}
                    className="group relative bg-gradient-to-b from-[#141C2E] via-[#101726] to-[#0D121F] border border-slate-800 hover:border-[#D4AF37]/60 rounded-3xl p-5 shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/10 hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/5 rounded-full blur-2xl group-hover:bg-[#D4AF37]/15 transition-all duration-500 pointer-events-none" />

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3.5 bg-[#1C263B] group-hover:bg-gradient-to-br group-hover:from-[#F3C649] group-hover:to-[#997B15] text-[#F3C649] group-hover:text-slate-950 rounded-2xl transition-all duration-300 shadow-md">
                          <Icon className="w-6 h-6" />
                        </div>

                        <div className="flex items-center gap-2">
                          {isLoggedIn && (
                            <span className="text-[10px] font-black font-mono text-[#F3C649] bg-[#F3C649]/10 border border-[#F3C649]/30 px-2 py-0.5 rounded-md">
                              {category.prefix}
                            </span>
                          )}
                          <span className="text-xs font-bold text-slate-300 bg-[#1C263B] border border-slate-700/60 px-3 py-1 rounded-full group-hover:border-[#D4AF37]/40 transition">
                            {count} รายการ
                          </span>
                        </div>
                      </div>

                      <h3 className="text-lg font-black text-white group-hover:text-[#F3C649] transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1 leading-relaxed">
                        {category.desc}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-white transition-colors">
                      <span>เลือกชมสินค้า</span>
                      <div className="p-1.5 rounded-full bg-[#1C263B] border border-slate-700/50 group-hover:bg-[#F3C649] group-hover:text-slate-950 group-hover:border-[#F3C649] transition-all duration-300 transform group-hover:translate-x-1 shadow-md">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRODUCT LIST SECTION */}
        {(selectedCategory || searchTerm !== "" || showFavoritesOnly) && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#131927] p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchTerm("");
                  setShowFavoritesOnly(false);
                  setSubFilterSize("ทั้งหมด");
                  window.history.pushState({}, "", window.location.pathname);
                }}
                className="bg-[#1C263B] hover:bg-[#25334E] text-slate-200 px-3.5 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition w-fit border border-slate-700/60"
              >
                <ArrowLeft className="w-4 h-4 text-[#F3C649]" /> ดูหมวดหมู่ทั้งหมด
              </button>

              <div className="flex items-center gap-2">
                {showFavoritesOnly && (
                  <span className="text-xs font-black text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 fill-rose-500" /> สินค้าที่คุณถูกใจ ({favorites.length})
                  </span>
                )}
                {selectedCategory && (
                  <span className="text-xs font-black text-[#F3C649] bg-[#F3C649]/10 border border-[#F3C649]/30 px-3 py-1.5 rounded-xl">
                    หมวด: {selectedCategory} {isLoggedIn && `(${categoryPrefixMap[selectedCategory]})`}
                  </span>
                )}
                {searchTerm && (
                  <span className="text-xs font-bold text-slate-300 bg-[#1C263B] px-3 py-1.5 rounded-xl border border-slate-700/50">
                    ผลการค้นหา: "{searchTerm}"
                  </span>
                )}
              </div>
            </div>

            {selectedCategory === "ห้องนอน" && (
              <div className="bg-[#131927] border border-amber-500/20 rounded-2xl p-3 flex flex-wrap items-center gap-2 shadow-lg">
                <span className="text-xs font-bold text-[#F3C649] flex items-center gap-1.5 mr-2">
                  <Bed className="w-4 h-4 text-[#F3C649]" /> ขนาดเตียง:
                </span>
                {["ทั้งหมด", "3.5 ฟุต", "5 ฟุต", "6 ฟุต"].map((sizeOption) => (
                  <button
                    key={sizeOption}
                    onClick={() => setSubFilterSize(sizeOption)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      subFilterSize === sizeOption
                        ? "bg-gradient-to-r from-[#F3C649] to-[#997B15] text-slate-950 shadow-md"
                        : "bg-[#1C263B] text-slate-300 border border-slate-700/60 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
            )}

            {selectedCategory === "ห้องอาหาร/ห้องครัว" && (
              <div className="bg-[#131927] border border-amber-500/20 rounded-2xl p-3 flex flex-wrap items-center gap-2 shadow-lg">
                <span className="text-xs font-bold text-[#F3C649] flex items-center gap-1.5 mr-2">
                  <Utensils className="w-4 h-4 text-[#F3C649]" /> จำนวนที่นั่ง:
                </span>
                {["ทั้งหมด", "2 ที่นั่ง", "4 ที่นั่ง", "6 ที่นั่ง"].map((seatOption) => (
                  <button
                    key={seatOption}
                    onClick={() => setSubFilterSize(seatOption)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      subFilterSize === seatOption
                        ? "bg-gradient-to-r from-[#F3C649] to-[#997B15] text-slate-950 shadow-md"
                        : "bg-[#1C263B] text-slate-300 border border-slate-700/60 hover:border-[#D4AF37]/50"
                    }`}
                  >
                    {seatOption}
                  </button>
                ))}
              </div>
            )}

            <div className="bg-[#131927] border border-slate-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setPromoOnly(!promoOnly)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all duration-200 ${
                    promoOnly
                      ? "bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-900/40 border border-rose-400 scale-105"
                      : "bg-[#1E293B] text-rose-300 border border-rose-500/40 hover:bg-rose-950/40 hover:border-rose-400"
                  }`}
                >
                  <Flame className={`w-4 h-4 ${promoOnly ? "text-white" : "text-rose-400"}`} /> 
                  ลดพิเศษ
                </button>

                <button
                  onClick={() => setStockOnly(!stockOnly)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all duration-200 ${
                    stockOnly
                      ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40 border border-emerald-400 scale-105"
                      : "bg-[#1E293B] text-emerald-300 border border-emerald-500/40 hover:bg-emerald-950/40 hover:border-emerald-400"
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${stockOnly ? "text-white" : "text-emerald-400"}`} /> 
                  พร้อมส่ง
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-400 font-bold">ช่วงราคา:</span>
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-16 bg-[#161F33] border border-slate-700 text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-[#D4AF37]"
                  />
                  <span className="text-slate-600">-</span>
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-16 bg-[#161F33] border border-slate-700 text-white rounded-lg px-2 py-1 text-xs outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <select
                  value={sortPrice}
                  onChange={(e) => setSortPrice(e.target.value)}
                  className="bg-[#161F33] border border-slate-700 text-xs font-bold text-slate-200 rounded-xl px-2.5 py-1.5 outline-none focus:border-[#D4AF37]"
                >
                  <option value="none">เรียงลำดับราคา</option>
                  <option value="low">ราคา: น้อย ➔ มาก</option>
                  <option value="high">ราคา: มาก ➔ น้อย</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-20 bg-[#131927] rounded-3xl border border-slate-800 shadow-xl">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#F3C649] border-t-transparent"></div>
                <p className="text-xs text-slate-400 mt-3 font-bold">กำลังโหลดรายการสินค้า...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-[#131927] rounded-3xl border border-dashed border-slate-800">
                <Package className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">
                  {showFavoritesOnly ? "คุณยังไม่ได้กดถูกใจสินค้าชิ้นไหนเลย" : "ไม่พบรายการสินค้าที่คุณค้นหา"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {showFavoritesOnly ? "กดรูปหัวใจ ❤️ บนสินค้าที่คุณชอบเพื่อเก็บไว้ดูทีหลังได้ครับ" : "ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => {
                  const isFav = favorites.includes(product.id);

                  return (
                    <div
                      key={product.id}
                      onClick={() => setViewingProduct(product)}
                      className="group bg-[#131927] rounded-2xl border border-slate-800 hover:border-[#D4AF37]/60 shadow-xl hover:shadow-2xl hover:shadow-[#D4AF37]/10 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden relative"
                    >
                      <div>
                        <div className="relative aspect-4/3 bg-slate-900 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 bg-slate-900">
                              <ImageIcon className="w-10 h-10 mb-1" />
                              <span className="text-[10px]">ไม่มีรูปภาพ</span>
                            </div>
                          )}

                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                            {renderImageBadge(product.status)}
                          </div>

                          <button
                            onClick={(e) => toggleFavorite(product.id, e)}
                            className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-lg ${
                              isFav
                                ? "bg-rose-600 text-white scale-110 shadow-rose-900/50"
                                : "bg-slate-950/60 text-slate-300 hover:text-rose-400 hover:bg-slate-900"
                            }`}
                            title={isFav ? "ยกเลิกการถูกใจ" : "ถูกใจสินค้าตัวนี้"}
                          >
                            <Heart className={`w-4 h-4 ${isFav ? "fill-white" : ""}`} />
                          </button>

                          {product.promoPrice && (
                            <div className="absolute bottom-2.5 right-2.5 bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full shadow-lg tracking-wider uppercase">
                              PROMO
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-mono text-[11px] font-bold text-slate-400">
                              ID: {product.id}
                            </span>
                            {product.size && (
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-bold border border-slate-700/60">
                                {product.size}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-[#F3C649] transition-colors">
                            {product.name}
                          </h3>

                          {product.location && (
                            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#F3C649] shrink-0" />
                              โซน: {product.location}
                            </p>
                          )}

                          <div className="mt-3 flex items-baseline gap-2">
                            {product.promoPrice ? (
                              <>
                                <span className="text-xl font-black text-rose-400">
                                  ฿{Number(product.promoPrice).toLocaleString()}
                                </span>
                                {product.price && product.price !== product.promoPrice && (
                                  <span className="text-xs text-slate-500 line-through">
                                    ฿{Number(product.price).toLocaleString()}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-xl font-black text-white">
                                ฿{Number(product.price).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <div className="border-t border-slate-800/80 pt-3 flex items-center justify-between gap-2">
                          <button
                            onClick={(e) => handleShare(product, e)}
                            className="flex-1 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-500/30 transition"
                          >
                            <Share2 className="w-3.5 h-3.5" /> แชร์ลง LINE
                          </button>

                          {isLoggedIn && (
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={(e) => openEditProduct(product, e)}
                                className="p-2 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-slate-950 border border-amber-500/20 transition-all duration-200"
                                title="แก้ไขสินค้า"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteProduct(product, e)}
                                className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition-all duration-200"
                                title="ลบสินค้า"
                              >
                                <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131927] rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-800">
            
            <button
              onClick={() => setViewingProduct(null)}
              className="absolute top-4 right-4 z-10 bg-slate-900/80 hover:bg-slate-900 text-slate-300 p-2 rounded-full shadow-md backdrop-blur-md transition border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-4/3 bg-slate-950 relative overflow-hidden">
              {viewingProduct.image ? (
                <img
                  src={viewingProduct.image}
                  alt={viewingProduct.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-700">
                  <ImageIcon className="w-16 h-16" />
                </div>
              )}

              <button
                onClick={(e) => toggleFavorite(viewingProduct.id, e)}
                className={`absolute bottom-4 right-4 p-3 rounded-full backdrop-blur-md transition-all duration-300 shadow-xl ${
                  favorites.includes(viewingProduct.id)
                    ? "bg-rose-600 text-white scale-110 shadow-rose-900/60"
                    : "bg-slate-950/80 text-slate-300 hover:text-rose-400"
                }`}
                title="ถูกใจสินค้าตัวนี้"
              >
                <Heart className={`w-5 h-5 ${favorites.includes(viewingProduct.id) ? "fill-white" : ""}`} />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700/60">
                  ID: {viewingProduct.id}
                </span>
                <span className="text-xs font-black text-[#F3C649] bg-[#F3C649]/10 border border-[#F3C649]/30 px-3 py-1 rounded-full">
                  {viewingProduct.category}
                </span>
              </div>

              <h2 className="text-2xl font-black text-white">{viewingProduct.name}</h2>

              <div className="my-4 flex items-baseline gap-3">
                {viewingProduct.promoPrice ? (
                  <>
                    <span className="text-3xl font-black text-rose-400">
                      ฿{Number(viewingProduct.promoPrice).toLocaleString()}
                    </span>
                    {viewingProduct.price && viewingProduct.price !== viewingProduct.promoPrice && (
                      <span className="text-base text-slate-500 line-through">
                        ฿{Number(viewingProduct.price).toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-3xl font-black text-white">
                    ฿{Number(viewingProduct.price).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="space-y-2 border-t border-b border-slate-800 py-4 my-4 text-xs text-slate-300">
                {viewingProduct.size && (
                  <p className="flex justify-between">
                    <span className="font-bold text-slate-500">ขนาด:</span>
                    <span className="font-bold text-white">{viewingProduct.size}</span>
                  </p>
                )}
                {viewingProduct.location && (
                  <p className="flex justify-between">
                    <span className="font-bold text-slate-500">โซนจัดวาง:</span>
                    <span className="font-bold text-white">{viewingProduct.location}</span>
                  </p>
                )}
                <p className="flex justify-between">
                  <span className="font-bold text-slate-500">สถานะ:</span>
                  <span className="font-bold text-white">{viewingProduct.status}</span>
                </p>
                {viewingProduct.description && (
                  <div className="pt-2 border-t border-slate-800">
                    <span className="font-bold text-slate-500 block mb-1">รายละเอียดเพิ่มเติม:</span>
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">{viewingProduct.description}</p>
                  </div>
                )}
              </div>

              <button
                onClick={(e) => handleShare(viewingProduct, e)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition active:scale-98"
              >
                <Share2 className="w-5 h-5" /> แชร์รายละเอียดลง LINE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131927] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#0F1626]">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F3C649]"></span>
                {editingProduct ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่"}
              </h2>
              <button
                type="button"
                onClick={closeProductModal}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-400 mb-1">หมวดหมู่สินค้า *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const nextId = editingProduct ? formData.id : generateNextId(cat, products);
                        setFormData({ ...formData, category: cat, id: nextId });
                      }}
                      className="w-full bg-[#161F33] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#F3C649] transition"
                    >
                      {categories.map((c) => (
                        <option key={c.name} value={c.name} className="bg-[#131927]">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">รหัสสินค้า</label>
                    <input
                      type="text"
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full bg-[#161F33] border border-slate-700/80 rounded-xl px-3 py-2.5 font-mono text-xs text-white outline-none focus:border-[#F3C649] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">ขนาด (ถ้ามี)</label>
                    <input
                      type="text"
                      placeholder="เช่น 5 ฟุต"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full bg-[#161F33] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#F3C649] transition"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-400 mb-1">ชื่อสินค้า *</label>
                    <input
                      type="text"
                      required
                      placeholder="ระบุชื่อสินค้า..."
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#161F33] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#F3C649] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">ราคาปกติ (บาท)</label>
                    <input
                      type="number"
                      placeholder="ถ้าไม่มี ไม่ต้องกรอก"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required={!formData.promoPrice}
                      className="w-full bg-[#161F33] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#F3C649] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">ราคาลดพิเศษ (บาท)</label>
                    <input
                      type="number"
                      placeholder="ราคาโปรโมชั่น"
                      value={formData.promoPrice}
                      onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                      required={!formData.price}
                      className="w-full bg-[#161F33] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#F3C649] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">สถานะสินค้า</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#161F33] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#F3C649] transition"
                    >
                      <option value="มีสินค้าพร้อมส่ง" className="bg-[#131927]">มีสินค้าพร้อมส่ง</option>
                      <option value="สินค้าตัวโชว์หน้าร้าน" className="bg-[#131927]">สินค้าตัวโชว์หน้าร้าน</option>
                      <option value="สินค้าติดจอง" className="bg-[#131927]">สินค้าติดจอง</option>
                      <option value="สินค้าหมด" className="bg-[#131927]">สินค้าหมด</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-400 mb-1">โซนวางสินค้า</label>
                    <input
                      type="text"
                      placeholder="เช่น โซน A2"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-[#161F33] border border-slate-700/80 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-[#F3C649] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 mb-1">รูปภาพสินค้า</label>
                  {formData.image ? (
                    <div className="flex items-center gap-3 mt-1">
                      <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-700 shadow-lg group">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1.5 right-1.5 bg-rose-600/90 hover:bg-rose-600 text-white p-1 rounded-full shadow-md backdrop-blur-sm transition"
                          title="ลบรูปภาพนี้"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400">รูปภาพถูกเตรียมพร้อมบันทึกแล้ว คุณสามารถลบแล้วอัปโหลดใหม่ได้</p>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-slate-700 hover:border-[#F3C649]/60 rounded-2xl p-5 text-center cursor-pointer transition bg-[#161F33]/40 flex flex-col items-center justify-center group">
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#F3C649] transition mb-1.5" />
                      <p className="text-xs font-semibold text-slate-300">คลิกเพื่อเลือกรูปภาพสินค้า</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">รองรับไฟล์ PNG, JPG หรือ WEBP (บีบอัดภาพอัตโนมัติ)</p>
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
                  <label className="block font-bold text-slate-400 mb-1">รายละเอียดเพิ่มเติม</label>
                  <textarea
                    rows="3"
                    placeholder="กรอกรายละเอียดสินค้าเพิ่มเติม..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-[#161F33] border border-slate-700/80 rounded-xl p-3 text-xs text-white outline-none focus:border-[#F3C649] transition resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-800 bg-[#0F1626] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition font-bold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#F3C649] hover:bg-[#D4AF37] text-slate-950 font-black transition shadow-lg shadow-[#F3C649]/20 text-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#131927] rounded-3xl max-w-xs w-full p-6 shadow-2xl relative border border-slate-800">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-gradient-to-br from-[#F3C649] to-[#997B15] text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#F3C649]/20">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-base font-black text-white">เข้าสู่ระบบพนักงาน</h2>
              <p className="text-[11px] text-slate-400 mt-0.5">กรอกรหัสผ่านเพื่อจัดการข้อมูล</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <input
                  type="password"
                  placeholder="รหัสผ่านพนักงาน"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-[#161F33] border border-slate-700 rounded-xl p-2.5 text-center font-mono text-sm text-white outline-none focus:border-[#D4AF37]"
                />
                {loginError && (
                  <p className="text-[11px] text-rose-400 font-bold mt-1 text-center">{loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#F3C649] hover:bg-[#D4AF37] text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-lg shadow-[#F3C649]/20 transition"
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
