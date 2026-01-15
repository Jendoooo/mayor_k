'use client';

import { useState, useEffect } from 'react';
import api, { Product, CreateOrderData, ActiveBooking } from '@/app/lib/api';
import toast from 'react-hot-toast';
import { Search, ShoppingCart, Trash2, CreditCard, User, Send, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Cart Item Interface
interface CartItem extends Product {
    cartQuantity: number;
}

export default function BarPOSPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    // Cart State
    const [cart, setCart] = useState<CartItem[]>([]);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [guestName, setGuestName] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Active Bookings (for Room Charge)
    const [activeBookings, setActiveBookings] = useState<ActiveBooking[]>([]);
    const [selectedBooking, setSelectedBooking] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchActiveBookings();
    }, []);

    const fetchActiveBookings = async () => {
        try {
            const res = await api.getActiveBookings();
            // Handle both paginated response {results: [...]} and plain array [...]
            const bookings = Array.isArray(res) ? res : (res as any).results || [];
            setActiveBookings(bookings);
        } catch (error) {
            console.error('Failed to fetch active bookings:', error);
            setActiveBookings([]); // Ensure it's always an array
        }
    };

    // Auto-fill guest name when booking selected
    useEffect(() => {
        if (selectedBooking) {
            const booking = activeBookings.find(b => b.id === selectedBooking);
            if (booking) {
                setGuestName(`${booking.guest_name} (Room ${booking.room_number})`);
            }
        }
    }, [selectedBooking, activeBookings]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await api.getProducts();
            // Only active products with stock > 0
            const sellable = response.results.filter(p => p.is_active && p.quantity > 0);
            setProducts(sellable);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = (product: Product) => {
        setCart(current => {
            const existing = current.find(item => item.id === product.id);
            if (existing) {
                // Check stock limit
                if (existing.cartQuantity >= product.quantity) {
                    toast.error(`Only ${product.quantity} in stock!`);
                    return current;
                }
                return current.map(item =>
                    item.id === product.id
                        ? { ...item, cartQuantity: item.cartQuantity + 1 }
                        : item
                );
            }
            return [...current, { ...product, cartQuantity: 1 }];
        });
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(current => {
            return current.map(item => {
                if (item.id === productId) {
                    const newQty = item.cartQuantity + delta;
                    if (newQty <= 0) return null; // Remove if 0
                    // Check stock
                    if (newQty > item.quantity) {
                        toast.error(`Only ${item.quantity} in stock!`);
                        return item;
                    }
                    return { ...item, cartQuantity: newQty };
                }
                return item;
            }).filter(Boolean) as CartItem[];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(current => current.filter(item => item.id !== productId));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);

        try {
            const orderData: CreateOrderData = {
                guest_name: guestName || 'Walk-in Guest',
                payment_method: paymentMethod,
                booking: paymentMethod === 'ROOM_CHARGE' ? selectedBooking : undefined,
                items_data: cart.map(item => ({
                    product_id: item.id,
                    quantity: item.cartQuantity
                }))
            };

            await api.createOrder(orderData);
            toast.success('Order processed!');
            setCart([]);
            setGuestName('');
            setPaymentMethod('CASH');
            fetchProducts(); // Refresh stock
        } catch (error: any) {
            toast.error(error.message || 'Checkout failed');
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredProducts = products.filter(p =>
        (selectedCategory === 'All' || p.category_name === selectedCategory) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Extract unique categories
    const categories = ['All', ...Array.from(new Set(products.map(p => p.category_name || 'Drinks')))];

    const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.cartQuantity), 0);

    return (
        <div className="flex h-[calc(100vh-2rem)] gap-6 animate-fadeIn pb-2">
            {/* Left: Product Grid */}
            <div className="flex-1 flex flex-col gap-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold font-heading text-white">Bar Point of Sale</h1>
                        <p className="text-slate-400">Select items to add to order</p>
                    </div>
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search drinks..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-white/5'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {filteredProducts.map(product => (
                                <motion.button
                                    key={product.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => addToCart(product)}
                                    className="bg-slate-900 hover:bg-slate-800 border border-white/5 rounded-2xl p-4 text-left group transition-colors flex flex-col h-full"
                                >
                                    <div className="flex-1 mb-2">
                                        <div className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {product.name}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1">{product.quantity} in stock</div>
                                    </div>
                                    <div className="flex justify-between items-end mt-auto">
                                        <div className="font-mono font-bold text-emerald-400">
                                            ₦{parseFloat(product.price).toLocaleString()}
                                        </div>
                                        <div className="bg-white/5 p-1.5 rounded-lg text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                            <Plus size={16} />
                                        </div>
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="w-96 bg-slate-900 border border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                <div className="p-5 border-b border-white/5 bg-slate-950/30">
                    <div className="flex items-center gap-3 text-white font-bold text-lg">
                        <ShoppingCart className="text-blue-500" />
                        Current Order
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.length === 0 ? (
                        <div className="text-center text-slate-500 py-10 flex flex-col items-center gap-3">
                            <ShoppingCart size={48} className="opacity-20" />
                            <p>Cart is empty</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {cart.map(item => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="bg-white/5 rounded-xl p-3 flex gap-3"
                                >
                                    <div className="flex-1">
                                        <div className="font-medium text-white text-sm">{item.name}</div>
                                        <div className="text-emerald-400 text-xs font-mono mt-1">
                                            ₦{parseFloat(item.price).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2 bg-slate-950 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.cartQuantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <div className="text-white font-mono text-sm">
                                            ₦{(parseFloat(item.price) * item.cartQuantity).toLocaleString()}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                <div className="p-5 border-t border-white/5 bg-slate-950/50 space-y-4">
                    {/* Guest Info */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Guest / Room</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            {paymentMethod === 'ROOM_CHARGE' ? (
                                <select
                                    value={selectedBooking}
                                    onChange={(e) => setSelectedBooking(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                                >
                                    <option value="">Select Active Room...</option>
                                    {activeBookings.map(booking => (
                                        <option key={booking.id} value={booking.id}>
                                            Room {booking.room_number} - {booking.guest_name}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    value={guestName}
                                    onChange={(e) => setGuestName(e.target.value)}
                                    placeholder="e.g. John Doe"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                                />
                            )}
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Payment</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['CASH', 'TRANSFER', 'POS', 'ROOM_CHARGE'].map(method => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${paymentMethod === method
                                        ? 'bg-blue-600 border-blue-500 text-white'
                                        : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'
                                        }`}
                                >
                                    {method.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Total & Action */}
                    <div className="pt-2">
                        <div className="flex justify-between items-end mb-4">
                            <div className="text-slate-400 text-sm">Total Amount</div>
                            <div className="text-2xl font-bold text-white font-mono">
                                ₦{cartTotal.toLocaleString()}
                            </div>
                        </div>
                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing || !guestName}
                            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isProcessing ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                            ) : (
                                <>
                                    <Send size={18} />
                                    Process Order
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
