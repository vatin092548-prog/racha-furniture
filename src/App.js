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
  Activity,
  RefreshCw
} from "lucide-react";

/* =======================================================
   CATEGORIES & PREFIX MAP
======================================================= */
const categoryPrefixMap = {
  "ห้องนอน": "A",
  "ห้องนั่งเล่น": "T",
  "โซฟา & เก้าอี้พักผ่อน": "S",
  "ห้องอาหาร & ห้องครัว": "E",
  "ห้องสำนักงาน & ผู้บริหาร": "I",
  "สินค้าคอลเลกชันพิเศษ": "P",
  "ห้องทั่วไป & งานตกแต่งประดับบ้าน": "B",
};

const categories = [
  { 
    name: "ห้องนอน", 
    englishName: "Bedroom Collection",
    icon: Bed, 
    prefix: "A", 
    description: "เตียงนอนคุณภาพพรีเมียม, ตู้เสื้อผ้าขนาดใหญ่, ชุดโต๊ะเครื่องแป้ง และอุปกรณ์ห้องนอนครบวงจร",
    tags: ["เตียงนอน", "ตู้เสื้อผ้า built-in", "โต๊ะเครื่องแป้ง"],
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?q=80&w=800&auto=format&fit=crop"
  },
  { 
    name: "ห้องนั่งเล่น", 
    englishName: "Living Room",
    icon: Sofa, 
    prefix: "T", 
    description: "ชุดโซฟารับแขก, โต๊ะกลางหรูหรา, ตู้โชว์ทีวี และชั้นวางของดีไซน์ทันสมัย",
    tags: ["โซฟารับแขก", "โต๊ะกลางลักชัวรี", "ตู้โชว์คอนโซล"],
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop"
  },
  { 
    name: "โซฟา & เก้าอี้พักผ่อน", 
    englishName: "Recliner & Lounge",
    icon: Armchair, 
    prefix: "S", 
    description: "โซฟาปรับนอนระดับพรีเมียม, เก้าอี้อาร์มแชร์ดีไซน์โดดเด่น, เบาะนุ่มสบายเหมาะสำหรับการพักผ่อน",
    tags: ["เก้าอี้อาร์มแชร์", "โซฟาปรับนอน/Recliner", "เบาะนั่งพักผ่อน Cozy Touch"],
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=800&auto=format&fit=crop"
  },
  { 
    name: "ห้องอาหาร & ห้องครัว", 
    englishName: "Dining & Kitchen",
    icon: Utensils, 
    prefix: "E", 
    description: "ชุดโต๊ะอาหารหินอ่อน, เก้าอี้ทานอาหารสไตล์โมเดิร์น, เคาเตอร์บาร์ และตู้เก็บบอร์ดครัว",
    tags: ["ชุดโต๊ะอาหารหินอ่อน", "เก้าอี้ทานอาหารสไตล์โมเดิร์น", "เคาเตอร์บาร์และตู้โชว์"],
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?q=80&w=800&auto=format&fit=crop"
  },
  { 
    name: "ห้องสำนักงาน & ผู้บริหาร", 
    englishName: "Executive & Office",
    icon: Briefcase, 
    prefix: "I", 
    description: "โต๊ะทำงานระดับผู้บริหาร, เก้าอี้เพื่อสุขภาพ (Ergonomic), และตู้เก็บเอกสารสไตล์โฮมออฟฟิศ",
    tags: ["โต๊ะทำงานผู้บริหาร", "เก้าอี้เพื่อสุขภาพ", "ตู้เอกสารหรูหรา"],
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=800&auto=format&fit=crop"
  },
  { 
    name: "สินค้าคอลเลกชันพิเศษ", 
    englishName: "Signature Collection",
    icon: Sparkles, 
    prefix: "P", 
    description: "เฟอร์นิเจอร์และของแต่งบ้านรุ่นลิมิเต็ด ผลิตจากวัสดุพิเศษ และชิ้นงานดีไซน์เอ็กซ์คลูซีฟ",
    tags: ["ชิ้นงานแฮนด์เมดระดับไฮเอนด์", "เฟอร์นิเจอร์สินค้านำเข้า", "ของตกแต่งแนว Luxury Art"],
    isNew: true,
    image: "https://images.unsplash.com/photo-1567016432779-094069958ea5?q=80&w=800&auto=format&fit=crop"
  },
  { 
    name: "ห้องทั่วไป & งานตกแต่งประดับบ้าน", 
    englishName: "Decor & Accent Pieces",
    icon: LayoutGrid, 
    prefix: "B", 
    description: "เรือนกระจกแสดงของสะสม, โคมไฟตั้งพื้น, กระจกแต่งบ้าน, ฉากกั้นห้อง, และของตกแต่งชิ้นเล็กอเนกประสงค์เพื่อเติมเต็มทุกมุมบ้านให้มีชีวิตชีวา",
    tags: ["โคมไฟดีไซน์โมเดิร์นลักชัวรี", "กระจกเงาตั้งพื้น & งานไม้ตกแต่ง", "ตู้โชว์อเนกประสงค์", "รูปภาพงานศิลปะแท้"],
    isFullWidth: true,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?q=80&w=1200&auto=format&fit=crop"
  },
];

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
     FORM & AUTO ID
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
     SUPABASE FETCH & REALTIME
  ======================================================= */
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*");

      if (error) throw error;

      setProducts(data || []);
      setSupabaseError("");
    } catch (error) {
      console.error("❌ Supabase READ ERROR", error);
      setSupabaseError(`ไม่สามารถอ่านข้อมูลจาก Supabase ได้: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("public:products")
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
     URL SYNC & AUTO OPEN FROM PARAMETER (?product=A1)
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

  useEffect(() => {
    if (viewingProduct) {
      const newUrl = `${window.location.pathname}?product=${viewingProduct.id}`;
      window.history.pushState({ productId: viewingProduct.id }, "", newUrl);
    } else if (!selectedCategory && !searchTerm) {
      window.history.pushState({}, "", window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingProduct]);

  useEffect(() => {
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const productIdFromUrl = urlParams.get("product");

      if (productIdFromUrl && products.length > 0) {
        const found = products.find(
          (p) => String(p.id).toLowerCase() === String(productIdFromUrl).toLowerCase()
        );
        setViewingProduct(found || null);
      } else {
        setViewingProduct(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [products]);

  /* =======================================================
     TOAST & LOGIN HANDLERS
  ======================================================= */
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => {
      setToast("");
    }, 3000);
  };

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
     PRODUCT MODAL HANDLERS
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
      showToast("กำลังบีบอัดรูปภาพ...");
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
     SAVE & DELETE PRODUCT
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
      alert("กรุณากรอกราคาสินค้า อย่างน้อย 1 ช่อง");
      return;
    }

    let normalPrice = null;
    let promotionPrice = null;

    if (hasNormalPrice) {
      normalPrice = Number(formData.price);
    }
    if (hasPromoPrice) {
      promotionPrice = Number(formData.promoPrice);
    }
    if (normalPrice === null && promotionPrice !== null) {
      normalPrice = promotionPrice;
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

  const handleDeleteProduct = async (product, event) => {
    if (event) event.stopPropagation();
    if (!isLoggedIn) return;

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
     SHARE & BADGES
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

    const lineShareUrl = `line://msg/text/${encodeURIComponent(shareText)}`;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

    if (isMobile) {
      window.location.href = lineShareUrl;
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        showToast("คัดลอกข้อความสินค้าแล้ว นำไปวางใน LINE ได้เลย");
      } else {
        alert(shareText);
      }
    }
  };

  const renderImageBadge = (status) => {
    switch (status) {
      case "สินค้าตัวโชว์หน้าร้าน":
        return (
          <div className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> ตัวโชว์
          </div>
        );
      case "สินค้าติดจอง":
        return (
          <div className="bg-purple-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow">
            ติดจอง
          </div>
        );
      case "สินค้าหมด":
        return (
          <div className="bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow">
            หมด
          </div>
        );
      default:
        return (
          <div className="bg-emerald-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow flex items-center gap-1">
            <CheckCircle2 className="w-2.5 h-2.5" /> พร้อมส่ง
          </div>
        );
    }
  };

  /* =======================================================
     FILTER PRODUCTS & STATS
  ======================================================= */
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const currentCategoryObj = categories.find((c) => c.name === selectedCategory);
        const categoryPrefix = currentCategoryObj ? currentCategoryObj.prefix : "";

        const categoryMatch = selectedCategory
          ? (product.category === selectedCategory || (categoryPrefix && product.id?.startsWith(categoryPrefix)))
          : true;

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
        } else if ((selectedCategory === "ห้องอาหาร & ห้องครัว" || selectedCategory === "ห้องอาหาร / ห้องครัว") && subFilterSize !== "ทั้งหมด") {
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
    <div className="min-h-screen bg-[#FAF9F6] text-slate-800 font-sans selection:bg-[#E6C687] selection:text-slate-900 pb-20 md:pb-0">

      {/* TOAST */}
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
              setViewingProduct(null);
              window.history.pushState({}, "", window.location.pathname);
            }}
          >
            <div className="flex items-center gap-3">
              <div className="relative group-hover:scale-105 transition-transform duration-300">
                <img 
                  src="/logo.jpg" 
                  alt="ราชาเฟอร์นิเจอร์" 
                  className="w-10 h-10 sm:w-11 sm:h-11 object-cover rounded-xl border border-[#B89446]/40 shadow-md"
                />
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
                className="w-full bg-[#182030] text-slate-100 placeholder-slate-400 pl-9 pr-8 py-2 rounded-xl text-xs font-medium border border-[#2A354A] focus:outline-none focus:border-[#E6C687] transition"
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
                className="bg-gradient-to-r from-[#D4AF37] to-[#B89446] hover:from-[#E6C687] hover:to-[#C5A049] text-slate-950 font-black px-3.5 py-2 rounded-xl text-xs shadow-md flex items-center gap-1.5 whitespace-nowrap transition active:scale-95"
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

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {supabaseError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="text-xs font-medium whitespace-pre-line">{supabaseError}</div>
            </div>
            <button
              onClick={fetchProducts}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3 py-1.5 rounded-xl flex items-center gap-1 shrink-0 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" /> ลองใหม่
            </button>
          </div>
        )}

        {/* ADMIN DASHBOARD UI */}
        {isLoggedIn && (
          <div className="bg-white rounded-3xl border border-amber-900/10 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#F5E7C6] text-[#5C4D28] rounded-2xl font-bold">
                  <LayoutDashboard className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900 text-sm">แผงควบคุมระบบจัดการสินค้า</h2>
                  <p className="text-[11px] text-slate-500">ภาพรวมคลังสินค้า สถิติโปรโมชั่น และจำนวนสินค้าแยกตามหมวดหมู่</p>
                </div>
              </div>
              <span className="text-[11px] text-emerald-700 font-mono bg-emerald-50 border border-emerald-200/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
                Realtime Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
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

              <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
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

              <div className="bg-[#FAF8F5] border border-[#EAE3D2] rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
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

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
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
                      className={`p-2.5 rounded-2xl border transition-all flex flex-col items-center text-center justify-between ${
                        isSelected
                          ? "bg-[#332A15] text-[#E6C687] border-[#332A15] shadow-md scale-105"
                          : "bg-[#FAF8F5] hover:bg-white text-slate-700 border-[#EAE3D2] hover:border-[#B89446]"
                      }`}
                    >
                      <Icon className={`w-4 h-4 mb-1.5 ${isSelected ? "text-[#E6C687]" : "text-[#B89446]"}`} />
                      <span className="text-[11px] font-bold line-clamp-1">{cat.name}</span>
                      <span
                        className={`text-[10px] font-mono font-black mt-1.5 px-2 py-0.5 rounded-full ${
                          isSelected
                            ? "bg-white/10 text-white"
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

        {/* LUXURY CATEGORY SECTION */}
        {!selectedCategory && !searchTerm && (
          <div className="space-y-6">
            
            <div className="flex flex-col md:flex-row items-center justify-between border-b border-slate-200/80 pb-6 gap-4">
              <div className="text-center md:text-left">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#B89446] uppercase block mb-1">
                  BESPOKE LIVING SPACES
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center md:justify-start gap-2">
                  หมวดหมู่เฟอร์นิเจอร์หลัก <span className="text-xs font-normal text-slate-400 font-sans">(Product Categories)</span>
                </h2>
              </div>

              <div className="flex justify-center my-2 md:my-0">
                <img 
                  src="/logo.jpg" 
                  alt="RACHA FURNITURE" 
                  className="h-16 sm:h-20 w-auto object-contain rounded-2xl shadow-lg border border-[#B89446]/20 hover:scale-105 transition-transform duration-300"
                />
              </div>

              <p className="text-xs text-slate-400 flex items-center justify-center md:justify-end gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#B89446]" /> โชว์รูมสาขาหาดใหญ่มีสินค้าแสดงครบทุกหมวด
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    className={`group bg-white rounded-3xl border border-slate-200/70 hover:border-[#B89446]/80 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(184,148,70,0.12)] transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between relative ${
                      category.isFullWidth ? "md:col-span-2 lg:col-span-3 flex-col lg:flex-row" : ""
                    }`}
                  >
                    <div className="p-6 sm:p-7 z-10 bg-white flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-9 h-9 rounded-2xl bg-[#FAF6EE] border border-[#EFE5D3] flex items-center justify-center text-[#B89446] shadow-sm">
                            <Icon className="w-5 h-5" />
                          </div>

                          <div className="flex items-center gap-2">
                            {category.isNew && (
                              <span className="bg-amber-800 text-amber-100 font-bold text-[9px] px-2.5 py-0.5 rounded-full tracking-wider uppercase shadow-sm">
                                NEW IN
                              </span>
                            )}
                            <span className="text-[10px] font-mono font-bold bg-[#FAF6EE] text-[#7A5F26] border border-[#EFE5D3] px-2.5 py-1 rounded-full">
                              {count} รายการ
                            </span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h3 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-[#B89446] transition-colors leading-snug">
                            {category.name}
                          </h3>
                          <span className="text-[11px] font-medium text-slate-400 block mb-2 font-mono">
                            {category.englishName}
                          </span>
                          <p className="text-xs text-slate-500 leading-relaxed font-normal line-clamp-2">
                            {category.description}
                          </p>
                        </div>

                        {category.tags && (
                          <div className="flex flex-wrap gap-1.5 mb-5">
                            {category.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] font-medium bg-[#F7F5F0] text-slate-600 border border-slate-200/60 px-2.5 py-1 rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#B89446] group-hover:text-[#91712E] transition-colors">
                        <span className="flex items-center gap-1.5">
                          เลือกชมสินค้าในหมวดนี้
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>

                    <div className={`relative overflow-hidden ${category.isFullWidth ? "lg:w-1/2 min-h-[220px]" : "h-48 sm:h-52"}`}>
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-white via-white/20 to-transparent h-20 pointer-events-none" />
                      {category.isFullWidth && (
                        <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent w-20 pointer-events-none" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-[#101726] rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 border border-[#252F45] shadow-xl">
              <div className="space-y-1.5 text-center md:text-left">
                <span className="text-[10px] font-bold tracking-widest text-[#E6C687] uppercase">
                  CUSTOM MADE & INTERIOR CONSULTANT
                </span>
                <h3 className="text-lg sm:text-xl font-black">
                  ต้องการเฟอร์นิเจอร์สั่งทำ หรือปรึกษาการจัดวางห้อง?
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  เรามีทีมงานผู้เชี่ยวชาญพร้อมให้คำปรึกษา ออกแบบ 3D และจัดสรรเฟอร์นิเจอร์ให้เหมาะกับพื้นที่บ้านคุณโดยเฉพาะ
                </p>
              </div>

              <a
                href="tel:074244665"
                className="bg-gradient-to-r from-[#E6C687] to-[#B89446] hover:from-[#F0D59E] hover:to-[#C5A049] text-slate-950 font-black px-6 py-3 rounded-2xl text-xs whitespace-nowrap shadow-lg flex items-center gap-2 transition active:scale-95"
              >
                <Phone className="w-4 h-4" /> ติดต่อทีมงานราชาเฟอร์นิเจอร์
              </a>
            </div>

          </div>
        )}

        {/* PRODUCT LIST SECTION */}
        {(selectedCategory || searchTerm !== "") && (
          <div className="space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  setSearchTerm("");
                  setSubFilterSize("ทั้งหมด");
                  setViewingProduct(null);
                  window.history.pushState({}, "", window.location.pathname);
                }}
                className="bg-[#FAF8F5] hover:bg-[#F3EDE2] text-[#4A3E25] border border-[#E6DFD3] px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-bold transition w-fit"
              >
                <ArrowLeft className="w-4 h-4 text-[#B89446]" /> กลับไปดูหมวดหมู่ทั้งหมด
              </button>

              <div className="flex items-center gap-2">
                {selectedCategory && (
                  <span className="text-xs font-bold text-[#6B5528] bg-[#F8F4EC] border border-[#EADFCA] px-3.5 py-1.5 rounded-xl">
                    หมวด: {selectedCategory} {isLoggedIn && `(${categoryPrefixMap[selectedCategory]})`}
                  </span>
                )}
                {searchTerm && (
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3.5 py-1.5 rounded-xl border border-slate-200">
                    ผลการค้นหา: "{searchTerm.trim() || 'ทั้งหมด'}"
                  </span>
                )}
              </div>
            </div>

            {selectedCategory === "ห้องนอน" && (
              <div className="bg-white border border-[#EAE3D2] rounded-2xl p-3.5 flex flex-wrap items-center gap-2 shadow-sm">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-2">
                  <Bed className="w-4 h-4 text-[#B89446]" /> ขนาดเตียง:
                </span>
                {["ทั้งหมด", "3.5 ฟุต", "5 ฟุต", "6 ฟุต"].map((sizeOption) => (
                  <button
                    key={sizeOption}
                    onClick={() => setSubFilterSize(sizeOption)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
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

            {(selectedCategory === "ห้องอาหาร & ห้องครัว" || selectedCategory === "ห้องอาหาร / ห้องครัว") && (
              <div className="bg-white border border-[#EAE3D2] rounded-2xl p-3.5 flex flex-wrap items-center gap-2 shadow-sm">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-2">
                  <Utensils className="w-4 h-4 text-[#B89446]" /> จำนวนที่นั่ง:
                </span>
                {["ทั้งหมด", "2 ที่นั่ง", "4 ที่นั่ง", "6 ที่นั่ง"].map((seatOption) => (
                  <button
                    key={seatOption}
                    onClick={() => setSubFilterSize(seatOption)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
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

            {/* CONTROL BAR */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setPromoOnly(!promoOnly)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
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
                  className="bg-[#FAF8F5] border border-[#E6DFD3] text-xs font-bold text-slate-700 rounded-xl px-3 py-1.5 outline-none focus:border-[#B89446]"
                >
                  <option value="none">เรียงลำดับราคา</option>
                  <option value="low">ราคา: น้อย ➔ มาก</option>
                  <option value="high">ราคา: มาก ➔ น้อย</option>
                </select>
              </div>
            </div>

            {/* PRODUCT CARDS GRID */}
            {loading ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/70">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#B89446] border-t-transparent"></div>
                <p className="text-xs text-slate-500 mt-3 font-medium">กำลังโหลดรายการสินค้า...</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">ไม่พบรายการสินค้าที่คุณค้นหา</p>
                <p className="text-xs text-slate-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองใหม่อีกครั้ง</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filteredProducts.map((product) => {
                  return (
                    <div
                      key={product.id}
                      onClick={() => setViewingProduct(product)}
                      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-[#D4AF37] shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                    >
                      <div>
                        <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                              <ImageIcon className="w-8 h-8 mb-1" />
                              <span className="text-[10px]">ไม่มีรูปภาพ</span>
                            </div>
                          )}

                          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                            {renderImageBadge(product.status)}
                          </div>

                          {product.promoPrice && (
                            <div className="absolute bottom-2.5 right-2.5 bg-rose-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-md shadow-sm">
                              PROMO
                            </div>
                          )}
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span className="font-mono text-[10px] font-bold text-slate-400">
                              ID: {product.id}
                            </span>
                            {product.size && (
                              <span className="text-[10px] bg-[#F8F4EC] text-[#6B5528] px-2 py-0.5 rounded font-bold border border-[#EADFCA]">
                                {product.size}
                              </span>
                            )}
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-[#8C733E] transition-colors">
                            {product.name}
                          </h3>

                          {product.location && (
                            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#B89446] shrink-0" />
                              โซน: {product.location}
                            </p>
                          )}

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
                              <span className="text-xl font-black text-slate-900">
                                ฿{Number(product.price).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 pt-0">
                        <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                          <button
                            onClick={(e) => handleShare(product, e)}
                            className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border border-emerald-200 transition"
                          >
                            <Share2 className="w-3.5 h-3.5" /> แชร์ลง LINE
                          </button>

                          {isLoggedIn && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => openEditProduct(product, e)}
                                className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition"
                                title="แก้ไขสินค้า"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteProduct(product, e)}
                                className="p-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-200">
            
            <button
              onClick={() => {
                setViewingProduct(null);
                window.history.pushState({}, "", window.location.pathname);
              }}
              className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white text-slate-600 p-2 rounded-full shadow-md transition border border-slate-200"
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

            <div className="p-6">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                  ID: {viewingProduct.id}
                </span>
                <span className="text-xs font-bold text-[#6B5528] bg-[#F8F4EC] border border-[#EADFCA] px-3 py-1 rounded-full">
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

              <div className="space-y-2 border-t border-b border-slate-100 py-3.5 my-4 text-xs text-slate-700">
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
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition active:scale-98 text-xs"
              >
                <Share2 className="w-4 h-4" /> แชร์รายละเอียดลง LINE
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-[#FAF8F5]">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B89446]"></span>
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
              <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div className="md:col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">หมวดหมู่สินค้า *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const cat = e.target.value;
                        const nextId = editingProduct ? formData.id : generateNextId(cat, products);
                        setFormData({ ...formData, category: cat, id: nextId });
                      }}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
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
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">ขนาด (ถ้ามี)</label>
                    <input
                      type="text"
                      placeholder="เช่น 5 ฟุต"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
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
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
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
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
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
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-600 mb-1">สถานะสินค้า</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
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
                      className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#B89446] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1">รูปภาพสินค้า</label>
                  {formData.image ? (
                    <div className="flex items-center gap-3 mt-1">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-1 right-1 bg-rose-600 text-white p-1 rounded-full shadow transition"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-500">รูปภาพถูกเตรียมพร้อมบันทึกแล้ว</p>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#E6DFD3] hover:border-[#B89446] rounded-2xl p-4 text-center cursor-pointer transition bg-[#FAF8F5] flex flex-col items-center justify-center group">
                      <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#B89446] transition mb-1" />
                      <p className="text-xs font-bold text-slate-700">คลิกเพื่อเลือกรูปภาพสินค้า</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">รองรับไฟล์ PNG, JPG หรือ WEBP</p>
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
                    className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#B89446] transition resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-100 bg-[#FAF8F5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 transition font-bold text-xs"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B89446] hover:bg-[#A3813B] text-white font-bold transition shadow-sm text-xs"
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
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xs w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-4">
              <div className="w-12 h-12 bg-[#161B26] text-[#E6C687] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-slate-700 shadow-md">
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
                  className="w-full bg-[#FAF8F5] border border-[#E6DFD3] rounded-xl p-2.5 text-center font-mono text-xs text-slate-800 outline-none focus:border-[#B89446]"
                />
                {loginError && (
                  <p className="text-[11px] text-rose-600 font-bold mt-1 text-center">{loginError}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-[#B89446] hover:bg-[#A3813B] text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition"
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
