import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Trash2, Edit, Search, Package, Layers, Tag, Loader2, DollarSign, Image, X } from 'lucide-react';
import api from '../lib/axios';
import { useToast } from '../context/ToastContext';
import { ConfirmModal } from '../components/ConfirmModal';

interface Product {
  id: string;
  name: string;
  price: number;
  variants: string; // JSON: {"sizes":["S"],"colors":["Red"]}
  stock_quantity: number;
  sku: string;
  images: string;
  description: string;
  created_on: string;
}

const ProductCatalog: React.FC = () => {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState('');
  const [variantsList, setVariantsList] = useState<{ id: string; size: string; color: string; stock: number }[]>([]);

  const addVariantRow = () => {
    setVariantsList(prev => [
      ...prev,
      { id: Math.random().toString(36).substring(2, 9), size: '', color: '', stock: 0 }
    ]);
  };

  const removeVariantRow = (id: string) => {
    setVariantsList(prev => prev.filter(v => v.id !== id));
  };

  const updateVariantRow = (id: string, field: 'size' | 'color' | 'stock', value: any) => {
    setVariantsList(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, [field]: value };
      }
      return v;
    }));
  };

  // Update total stock count when variantsList changes
  useEffect(() => {
    if (variantsList.length > 0) {
      const sum = variantsList.reduce((acc, v) => acc + (v.stock || 0), 0);
      setStockQuantity(sum.toString());
    }
  }, [variantsList]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/ProductCatalog/List');
      setProducts(res.data.Data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Fetch Error', 'Failed to load products from catalog.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setSku('');
    setPrice('');
    setStockQuantity('');
    setDescription('');
    setImages('');
    setVariantsList([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setSku(product.sku || '');
    setPrice(product.price.toString());
    setStockQuantity(product.stock_quantity.toString());
    setDescription(product.description || '');
    setImages(product.images || '');

    // Parse variants JSON
    try {
      if (product.variants) {
        const parsed = JSON.parse(product.variants);
        if (parsed.inventory && Array.isArray(parsed.inventory)) {
          const list = parsed.inventory.map((inv: any) => ({
            id: Math.random().toString(36).substring(2, 9),
            size: inv.size || '',
            color: inv.color || '',
            stock: inv.stock || 0
          }));
          setVariantsList(list);
        } else {
          setVariantsList([]);
        }
      } else {
        setVariantsList([]);
      }
    } catch (e) {
      setVariantsList([]);
    }
    
    setIsModalOpen(true);
  };

  const generateRandomSku = () => {
    if (!name) {
      toast.error('Validation Error', 'Please enter a product name first to generate a SKU.');
      return;
    }
    const prefix = name
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 4)
      .toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setSku(`${prefix || 'PROD'}-${randomNum}`);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error('Validation Error', 'Name and Price are required.');
      return;
    }

    const sizeList = Array.from(new Set(variantsList.map(v => v.size.trim()).filter(Boolean)));
    const colorList = Array.from(new Set(variantsList.map(v => v.color.trim()).filter(Boolean)));

    let finalStockQuantity = parseInt(stockQuantity, 10) || 0;
    let inventory: any[] = [];

    if (variantsList.length > 0) {
      inventory = variantsList.map(v => ({
        size: v.size.trim() || null,
        color: v.color.trim() || null,
        stock: v.stock || 0
      }));
      finalStockQuantity = inventory.reduce((sum, inv) => sum + inv.stock, 0);
    }

    const parsedVariants = {
      sizes: sizeList,
      colors: colorList,
      inventory: inventory
    };

    let finalSku = sku.trim();
    if (!finalSku) {
      const prefix = name
        .replace(/[^a-zA-Z0-9]/g, '')
        .substring(0, 4)
        .toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      finalSku = `${prefix || 'PROD'}-${randomNum}`;
    }

    const payload = {
      name,
      price: parseFloat(price) || 0,
      sku: finalSku,
      stock_quantity: finalStockQuantity,
      description,
      images,
      variants: parsedVariants
    };

    try {
      setIsSaving(true);
      if (editingProduct) {
        // Update Action
        const res = await api.post(`/ProductCatalog/Update/${editingProduct.id}`, payload);
        if (res.data.Success) {
          toast.success('Success', 'Product updated successfully.');
          fetchProducts();
          setIsModalOpen(false);
        } else {
          toast.error('Update Failed', res.data.Message || 'Failed to update product.');
        }
      } else {
        // Create Action
        const res = await api.post('/ProductCatalog/Add', payload);
        if (res.data.Success) {
          toast.success('Success', 'Product added successfully.');
          fetchProducts();
          setIsModalOpen(false);
        } else {
          toast.error('Creation Failed', res.data.Message || 'Failed to add product.');
        }
      }
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error('Error', error.response?.data?.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async () => {
    if (!confirmDeleteId) return;

    try {
      setIsDeleting(true);
      const res = await api.delete(`/ProductCatalog/Delete/${confirmDeleteId}`);
      if (res.data.Success) {
        toast.success('Success', 'Product deleted successfully.');
        setProducts(products.filter(p => p.id !== confirmDeleteId));
      } else {
        toast.error('Delete Failed', res.data.Message || 'Failed to delete product.');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Delete Error', 'An unexpected network error occurred.');
    } finally {
      setIsDeleting(false);
      setConfirmDeleteId(null);
    }
  };

  // Filter products by search query
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-8 min-h-full animate-in fade-in duration-700 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Product Catalog</h1>
          <p className="text-zinc-500 font-medium">Manage your products, live stock, and variants. Your AI automatically queries this catalog in real-time to answer user requests in Instagram DMs.</p>
        </div>
        <button 
          onClick={handleOpenAddModal}
          className="btn-base btn-primary self-start sm:self-auto"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-primary/30 border border-zinc-200 p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#09090B] border border-zinc-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-brand/50 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
          <span>TOTAL PRODUCTS: {products.length}</span>
          <span className="text-zinc-500">|</span>
          <span>OUT OF STOCK: {products.filter(p => p.stock_quantity === 0).length}</span>
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="flex justify-center py-32">
          <Loader2 size={48} className="animate-spin text-brand" />
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProducts.length === 0 ? (
            <div className="card-standard py-24 text-center flex flex-col items-center justify-center border-dashed border-zinc-200 bg-primary/30">
              <div className="w-24 h-24 bg-primary/90 border border-zinc-200 rounded-3xl flex items-center justify-center mb-8 shadow-inner">
                <ShoppingBag size={48} className="text-brand/50" />
              </div>
              <div className="max-w-md">
                <h3 className="text-2xl font-bold text-zinc-100 mb-3">No products found</h3>
                <p className="text-zinc-500 font-medium leading-relaxed mb-10">
                  {searchQuery ? "No products match your search query." : "You haven't added any products to your catalog yet. Click the button above to add your first product."}
                </p>
              </div>
              {!searchQuery && (
                <button onClick={handleOpenAddModal} className="btn-base btn-primary px-10">
                  Add First Product
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {filteredProducts.map((product) => {
                // Parse variants
                let parsedVariants: { sizes: string[]; colors: string[] } = { sizes: [], colors: [] };
                try {
                  if (product.variants) {
                    parsedVariants = JSON.parse(product.variants);
                  }
                } catch (e) {
                  // Fallback
                }

                const outOfStock = product.stock_quantity === 0;
                const lowStock = product.stock_quantity > 0 && product.stock_quantity < 5;

                return (
                  <div 
                    key={product.id} 
                    className="card-standard group flex flex-col justify-between hover:border-brand/30 transition-all duration-500 border-zinc-200"
                  >
                    <div>
                      {/* Product Image Panel */}
                      <div className="relative w-full h-44 bg-[#09090B] rounded-xl mb-4 overflow-hidden border border-zinc-200 flex items-center justify-center">
                        {product.images ? (
                          <img 
                            src={product.images.split(',')[0].trim()} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-zinc-500">
                            <Image size={32} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                          </div>
                        )}
                        
                        {/* Status Stock Badge */}
                        <div className="absolute top-3 right-3">
                          {outOfStock ? (
                            <span className="text-[9px] font-extrabold text-rose-400 bg-rose-950/80 border border-rose-500/30 px-2.5 py-1 rounded-md uppercase tracking-wider">
                              Out of Stock
                            </span>
                          ) : lowStock ? (
                            <span className="text-[9px] font-extrabold text-warning bg-warning/80 border border-amber-500/30 px-2.5 py-1 rounded-md uppercase tracking-wider">
                              Low Stock ({product.stock_quantity})
                            </span>
                          ) : (
                            <span className="text-[9px] font-extrabold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2.5 py-1 rounded-md uppercase tracking-wider">
                              In Stock ({product.stock_quantity})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* SKU and Price */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Package size={10} /> SKU: {product.sku || 'N/A'}
                        </span>
                        <span className="text-base font-extrabold text-zinc-100 flex items-center gap-0.5">
                          <DollarSign size={14} className="text-brand" />
                          {product.price}
                        </span>
                      </div>
                      
                      <h3 className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-brand transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                      
                      {product.description && (
                        <p className="text-xs text-zinc-500 leading-relaxed font-medium line-clamp-2 mb-4">
                          {product.description}
                        </p>
                      )}

                      {/* Variants Display */}
                      {(parsedVariants.sizes.length > 0 || parsedVariants.colors.length > 0) && (
                        <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 mb-4">
                          {parsedVariants.sizes.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sizes:</span>
                              {parsedVariants.sizes.map((s, idx) => (
                                <span key={idx} className="text-[9px] font-bold bg-primary/90 text-zinc-300 border border-zinc-200 px-2 py-0.5 rounded">
                                  {s}
                                </span>
                              ))}
                            </div>
                          )}
                          {parsedVariants.colors.length > 0 && (
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Colors:</span>
                              {parsedVariants.colors.map((c, idx) => (
                                <span key={idx} className="text-[9px] font-bold bg-primary/90 text-zinc-300 border border-zinc-200 px-2 py-0.5 rounded">
                                  {c}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-zinc-200 flex justify-between items-center mt-auto">
                      <div className="flex items-center gap-1 text-[9px] font-bold text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-full">
                        <Tag size={10} /> AI INVENTORY SYNCED
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleOpenEditModal(product)}
                          className="btn-base btn-outline px-2"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => setConfirmDeleteId(product.id)}
                          className="btn-base btn-danger px-2"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#09090B] border border-zinc-200 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto premium-scroll shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <p className="text-xs text-zinc-500 font-medium mt-1">
                  Provide inventory and pricing details to catalog items.
                </p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-zinc-900 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Leather Jacket"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-primary border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-brand/50 transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">SKU (Stock Keeping Unit)</label>
                    <button
                      type="button"
                      onClick={generateRandomSku}
                      className="text-[10px] text-brand hover:text-brand font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Auto-Generate
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. LTHR-JKT-01"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="bg-primary border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-brand/50 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 129.99"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-primary border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-brand/50 transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Stock Quantity {variantsList.length > 0 && '(Sum of variants)'}
                  </label>
                  <input
                    type="number"
                    disabled={variantsList.length > 0}
                    placeholder={variantsList.length > 0 ? "Calculated from variants" : "e.g. 25"}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className={`bg-primary border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-brand/50 transition-all font-medium ${variantsList.length > 0 ? 'opacity-60 cursor-not-allowed bg-primary/50' : ''}`}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the product details (e.g. material, fit, features) for the AI assistant..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-primary border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-brand/50 transition-all font-medium resize-none"
                />
              </div>

              {/* Product Variants Section */}
              <div className="bg-[#09090B]/50 border border-zinc-200 p-5 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-sm font-bold text-zinc-100 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={16} className="text-brand dark:text-brand" />
                      Product Variants
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-medium mt-0.5">Add specific combinations of size, color, and stock quantity.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantRow}
                    className="btn-base btn-outline text-xs"
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>

                {variantsList.length > 0 ? (
                  <div className="space-y-3.5 max-h-72 overflow-y-auto premium-scroll pr-1">
                    {/* Header Row */}
                    <div className="flex items-center gap-3 px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                      <div className="flex-[2] min-w-[100px] pl-1">Size</div>
                      <div className="flex-[2] min-w-[100px] pl-1">Color</div>
                      <div className="w-24 text-center">Stock</div>
                      <div className="w-10 flex-shrink-0"></div>
                    </div>

                    {variantsList.map((v) => (
                      <div key={v.id} className="flex items-center gap-3 bg-primary/50 border border-zinc-200 p-3 rounded-xl transition-all shadow-sm">
                        <div className="flex-[2] min-w-[100px]">
                          <input
                            type="text"
                            placeholder="e.g. S, M, L"
                            value={v.size}
                            onChange={(e) => updateVariantRow(v.id, 'size', e.target.value)}
                            className="w-full bg-[#09090B]/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-brand/50 transition-all font-medium"
                          />
                        </div>
                        <div className="flex-[2] min-w-[100px]">
                          <input
                            type="text"
                            placeholder="e.g. Red, Black"
                            value={v.color}
                            onChange={(e) => updateVariantRow(v.id, 'color', e.target.value)}
                            className="w-full bg-[#09090B]/50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs text-zinc-100 focus:outline-none focus:border-brand/50 transition-all font-medium"
                          />
                        </div>
                        <div className="w-24 flex-shrink-0">
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={v.stock || ''}
                            onChange={(e) => updateVariantRow(v.id, 'stock', parseInt(e.target.value, 10) || 0)}
                            className="w-full bg-[#09090B]/50 border border-zinc-200 rounded-xl px-3 py-2.5 text-xs text-center text-zinc-100 focus:outline-none focus:border-brand/50 transition-all font-medium"
                          />
                        </div>
                        <div className="w-10 flex-shrink-0 flex justify-center">
                          <button
                            type="button"
                            onClick={() => removeVariantRow(v.id)}
                            className="btn-base btn-danger px-2"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed border-zinc-200 rounded-2xl bg-[#09090B]/20">
                    <p className="text-xs text-zinc-500 font-medium">No variants added. This product will have a single global stock quantity.</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Product Image URL</label>
                <input
                  type="text"
                  placeholder="e.g. https://example.com/images/jacket.jpg"
                  value={images}
                  onChange={(e) => setImages(e.target.value)}
                  className="bg-primary border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-brand/50 transition-all font-medium"
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-base btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn-base btn-success px-8"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Product</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={confirmDeleteId !== null}
        title="Delete Product"
        message="Are you sure you want to delete this product? This will remove it from the catalog and the AI assistant will no longer be aware of its price and inventory status."
        confirmText="Delete Product"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteProduct}
        onCancel={() => setConfirmDeleteId(null)}
      />
    </div>
  );
};

export default ProductCatalog;
