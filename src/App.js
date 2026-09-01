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
} from "lucide-react";

export default function App() {
  /* =======================================================
     CONFIG & FIREBASE
  ======================================================= */
  const PRODUCTS_COLLECTION = "products";
  const STORE_PASSWORD = "1234";

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

  const handleRemoveImage = () => {
    setFormData((previous) => ({
      ...previous,
      image: "",
    }));
    showToast("ลบรูปภาพเรียบร้อย");
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
      `ดูรูปและรายละเอียดสินค้าเพิ่มเติมได้ที่:\n` +
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
        showToast("คัดลอกรูปภาพและข้อความแล้ว! กด Ctrl+V ใน LINE ได้เลย");
      } else {
        alert(shareText);
      }
    }
  };

  /* =======================================================
     IMAGE BADGE
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
     BOTTOM BADGE
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
              setSubFilterSize("ทั้งหมด");
              window.history.pushState({}, "", window.location.pathname);
            }}
          >
            <div className="text-[#D4AF37]">
              <svg
                width="44"
                height="44"
                viewBox="0 0 100 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
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
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    isLoggedIn ? "bg-green-500 text-white" : "bg-[#D4AF37] text-[#1B2A3A]"
                  }`}
                >
                  {isLoggedIn ? "โหมดพนักงาน" : "แคตตาล็อกออนไลน์"}
                </span>
              </div>

              <div className="flex flex-col text-xs text-[#D4AF37] mt-0.5 space-y-0.5">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 shrink-0" /> สาขาหาดใหญ่ (ถ.สามสิบเมตร)
                </div>
                <div className="flex items-center gap-1 font-sans">
                  <Phone className="w-3 h-3 shrink-0" /> โทร. 074-244665 , 086-4906582
                </div>
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
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2.5 rounded-lg font-bold"
              >
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
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setSubFilterSize("ทั้งหมด");
                    }}
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
                  setSubFilterSize("ทั้งหมด");
                  window.history.pushState({}, "", window.location.pathname);
                }}
                className="bg-[#1B2A3A] text-[#D4AF37] border border-[#D4AF37] px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm hover:bg-[#111B25] transition"
              >
                <ArrowLeft className="w-4 h-4" /> ย้อนกลับไปหน้าหมวดหมู่
              </button>
              {selectedCategory && (
                <span className="bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full text-xs font-bold">
                  หมวด: {selectedCategory}{" "}
                  {isLoggedIn && `(${categoryPrefixMap[selectedCategory]})`}
                </span>
              )}
            </div>

            {/* ปุ่มค้นหาฟิลเตอร์ย่อยสำหรับหมวดหมู่ "ห้องนอน" */}
            {selectedCategory === "ห้องนอน" && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1 mr-2">
                  <Bed className="w-4 h-4 text-amber-700" /> ค้นหาขนาดเตียง:
                </span>
                {["ทั้งหมด", "3.5 ฟุต", "5 ฟุต", "6 ฟุต"].map((sizeOption) => (
                  <button
                    key={sizeOption}
                    onClick={() => setSubFilterSize(sizeOption)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      subFilterSize === sizeOption
                        ? "bg-[#1B2A3A] text-[#D4AF37] shadow"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-amber-400"
                    }`}
                  >
                    {sizeOption}
                  </button>
                ))}
              </div>
            )}

            {/* ปุ่มค้นหาฟิลเตอร์ย่อยสำหรับหมวดหมู่ "ห้องอาหาร/ห้องครัว" */}
            {selectedCategory === "ห้องอาหาร/ห้องครัว" && (
              <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 mb-4 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1 mr-2">
                  <Utensils className="w-4 h-4 text-amber-700" /> ค้นหาจำนวนที่นั่ง:
                </span>
                {["ทั้งหมด", "2 ที่นั่ง", "4 ที่นั่ง", "6 ที่นั่ง"].map((seatOption) => (
                  <button
                    key={seatOption}
                    onClick={() => setSubFilterSize(seatOption)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      subFilterSize === seatOption
                        ? "bg-[#1B2A3A] text-[#D4AF37] shadow"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-amber-400"
                    }`}
                  >
                    {seatOption}
                  </button>
                ))}
              </div>
            )}

            {/* FILTER BAR */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPromoOnly(!promoOnly)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 ${
                    promoOnly ? "bg-red-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <Flame className="w-3.5 h-3.5" /> 🔥 ลดพิเศษ
                </button>
                <button
                  onClick={() => setStockOnly(!stockOnly)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1 ${
                    stockOnly ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> มีสินค้าพร้อมส่ง
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500 font-bold">ราคา:</span>
                  <input
                    type="number"
                    placeholder="ต่ำสุด"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="สูงสุด"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-16 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs"
                  />
                </div>

                <select
                  value={sortPrice}
                  onChange={(e) => setSortPrice(e.target.value)}
                  className="bg-gray-50 border border-gray-200 text-xs font-bold rounded-lg px-2 py-1.5 outline-none"
                >
                  <option value="none">เรียงลำดับราคา</option>
                  <option value="low">น้อยไปมาก</option>
                  <option value="high">มากไปน้อย</option>
                </select>
              </div>
            </div>

            {/* PRODUCT CARDS LIST */}
            {loading ? (
              <div className="text-center py-12 text-gray-500">กำลังโหลดข้อมูลสินค้า...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
                ไม่พบรายการสินค้าตรงกับเงื่อนไขที่ค้นหา
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => setViewingProduct(product)}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
                  >
                    <div>
                      {/* Product Image Box */}
                      <div className="relative aspect-4/3 bg-gray-100 overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ImageIcon className="w-12 h-12" />
                          </div>
                        )}

                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {renderImageBadge(product.status)}
                        </div>

                        {product.promoPrice && (
                          <div className="absolute top-2 right-2 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md animate-bounce">
                            PROMOTION
                          </div>
                        )}
                      </div>

                      {/* Product Content */}
                      <div className="p-4">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-mono text-xs font-bold text-gray-400">
                            ID: {product.id}
                          </span>
                          {product.size && (
                            <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">
                              {product.size}
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-gray-800 text-base line-clamp-1 group-hover:text-[#D4AF37] transition">
                          {product.name}
                        </h3>

                        {product.location && (
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                            โซน: {product.location}
                          </p>
                        )}

                        <div className="mt-3 flex items-baseline gap-2">
                          {product.promoPrice ? (
                            <>
                              <span className="text-lg font-black text-red-600">
                                ฿{Number(product.promoPrice).toLocaleString()}
                              </span>
                              {product.price && product.price !== product.promoPrice && (
                                <span className="text-xs text-gray-400 line-through">
                                  ฿{Number(product.price).toLocaleString()}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-lg font-black text-[#1B2A3A]">
                              ฿{Number(product.price).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Badge & Share Actions */}
                    <div className="p-4 pt-0">
                      {renderBottomBadge(product.status)}

                      <div className="mt-3 flex items-center justify-between gap-2 border-t pt-3">
                        <button
                          onClick={(e) => handleShare(product, e)}
                          className="flex-1 bg-green-50 hover:bg-green-100 text-green-700 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 border border-green-200 transition"
                        >
                          <Share2 className="w-3.5 h-3.5" /> แชร์ไป LINE
                        </button>

                        {isLoggedIn && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => openEditProduct(product, e)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteProduct(product, e)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setViewingProduct(null)}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white p-2 rounded-full shadow-md text-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-4/3 bg-gray-100 relative">
              {viewingProduct.image ? (
                <img
                  src={viewingProduct.image}
                  alt={viewingProduct.name}
                  className="w-full h-full object-contain bg-black/5"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <ImageIcon className="w-16 h-16" />
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
                  ID: {viewingProduct.id}
                </span>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                  {viewingProduct.category}
                </span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800">{viewingProduct.name}</h2>

              <div className="my-4 flex items-baseline gap-3">
                {viewingProduct.promoPrice ? (
                  <>
                    <span className="text-3xl font-black text-red-600">
                      ฿{Number(viewingProduct.promoPrice).toLocaleString()}
                    </span>
                    {viewingProduct.price && viewingProduct.price !== viewingProduct.promoPrice && (
                      <span className="text-base text-gray-400 line-through">
                        ฿{Number(viewingProduct.price).toLocaleString()}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-3xl font-black text-[#1B2A3A]">
                    ฿{Number(viewingProduct.price).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="space-y-2 border-t border-b border-gray-100 py-4 my-4 text-sm text-gray-600">
                {viewingProduct.size && (
                  <p>
                    <strong>ขนาด:</strong> {viewingProduct.size}
                  </p>
                )}
                {viewingProduct.location && (
                  <p>
                    <strong>โซนที่จัดวาง:</strong> {viewingProduct.location}
                  </p>
                )}
                <p>
                  <strong>สถานะ:</strong> {viewingProduct.status}
                </p>
                {viewingProduct.description && (
                  <p className="whitespace-pre-line pt-2">
                    <strong>รายละเอียดเพิ่มเติม:</strong>
                    <br />
                    {viewingProduct.description}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={(e) => handleShare(viewingProduct, e)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition"
                >
                  <Share2 className="w-5 h-5" /> แชร์รายละเอียดลง LINE
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ADD / EDIT PRODUCT MODAL ==================== */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={closeProductModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-[#1B2A3A] mb-4">
              {editingProduct ? "แก้ไขข้อมูลสินค้า" : "เพิ่มสินค้าใหม่"}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">หมวดหมู่สินค้า</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value;
                    const nextId = editingProduct ? formData.id : generateNextId(cat, products);
                    setFormData({ ...formData, category: cat, id: nextId });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
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
                  <label className="block text-xs font-bold text-gray-600 mb-1">รหัสสินค้า</label>
                  <input
                    type="text"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">ขนาด (ถ้ามี)</label>
                  <input
                    type="text"
                    placeholder="เช่น 5 ฟุต"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">ชื่อสินค้า *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
                />
              </div>

              {/* ส่วนราคาที่แก้ไข required แล้ว */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    ราคาปกติ (บาท)
                  </label>
                  <input
                    type="number"
                    placeholder="ถ้าไม่มี ไม่ต้องกรอก"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required={!formData.promoPrice}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    ราคาลดพิเศษ (บาท)
                  </label>
                  <input
                    type="number"
                    placeholder="ราคาโปรโมชั่น"
                    value={formData.promoPrice}
                    onChange={(e) => setFormData({ ...formData, promoPrice: e.target.value })}
                    required={!formData.price}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">สถานะสินค้า</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
                  >
                    <option value="มีสินค้าพร้อมส่ง">มีสินค้าพร้อมส่ง</option>
                    <option value="สินค้าตัวโชว์หน้าร้าน">สินค้าตัวโชว์หน้าร้าน</option>
                    <option value="สินค้าติดจอง">สินค้าติดจอง</option>
                    <option value="สินค้าหมด">สินค้าหมด</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">โซนวางสินค้า</label>
                  <input
                    type="text"
                    placeholder="เช่น โซน A2"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
                  />
                </div>
              </div>

              {/* ส่วนรูปภาพ พร้อมปุ่มลบรูปภาพ */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">รูปภาพสินค้า</label>
                {formData.image ? (
                  <div className="relative inline-block mb-2">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-md transition"
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
                    className="w-full text-xs text-gray-500 border border-gray-300 rounded-lg p-2"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  รายละเอียดสินค้าเพิ่มเติม
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm outline-none"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md"
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
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="w-12 h-12 bg-amber-100 text-[#D4AF37] rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-[#1B2A3A]">เข้าสู่ระบบพนักงาน</h2>
              <p className="text-xs text-gray-500 mt-1">ป้อนรหัสผ่านเพื่อจัดการข้อมูลสินค้า</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  placeholder="รหัสผ่านพนักงาน"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-center text-sm outline-none focus:border-[#D4AF37]"
                />
                {loginError && (
                  <p className="text-xs text-red-500 font-bold mt-1 text-center">{loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#1B2A3A] hover:bg-[#111B25] text-[#D4AF37] font-bold py-2.5 rounded-lg text-sm shadow-md transition"
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
