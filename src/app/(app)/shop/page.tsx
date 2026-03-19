'use client';
/** Shop page — purchase with auraStore.spendAura, real buy flow */
import { useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import NeonButton from '@/components/shared/NeonButton';
import Modal from '@/components/shared/Modal';
import { FAKE_SHOP_ITEMS } from '@/lib/fake-data';
import { useAuraStore } from '@/store/auraStore';
import { useToastStore } from '@/store/toastStore';
import { staggerContainer, staggerItem } from '@/lib/design-system';
import type { ShopItem } from '@/types/aura';

const CATEGORIES = [
    { id: 'all', label: '✨ All' },
    { id: 'frames', label: '🖼️ Frames' },
    { id: 'themes', label: '🎨 Themes' },
    { id: 'functional', label: '⚡ Functional' },
    { id: 'seasonal', label: '🎄 Seasonal' },
];

const rarityColors: Record<string, string> = { common: '#888', uncommon: '#22C55E', rare: '#3B82F6', epic: '#A855F7', legendary: '#FACC15' };

export default function ShopPage() {
    const [category, setCategory] = useState('all');
    const [ownedItems, setOwnedItems] = useState<Set<string>>(new Set(FAKE_SHOP_ITEMS.filter(i => i.isOwned).map(i => i.id)));
    const [confirmItem, setConfirmItem] = useState<ShopItem | null>(null);

    const totalAura = useAuraStore((s) => s.totalAura);
    const spendAura = useAuraStore((s) => s.spendAura);
    const addToast = useToastStore((s) => s.addToast);

    const filtered = category === 'all' ? FAKE_SHOP_ITEMS : FAKE_SHOP_ITEMS.filter(i => i.category === category);

    const handleBuy = (item: ShopItem) => {
        if (ownedItems.has(item.id)) return;
        setConfirmItem(item);
    };

    const confirmPurchase = () => {
        if (!confirmItem) return;
        const success = spendAura(confirmItem.price, `Bought ${confirmItem.name}`);
        if (success) {
            setOwnedItems(new Set([...ownedItems, confirmItem.id]));
            addToast('success', `Purchased ${confirmItem.name}! 🎉`, -confirmItem.price);
        } else {
            addToast('error', 'Not enough aura! Farm more 💜');
        }
        setConfirmItem(null);
    };

    return (
        <ScreenTransition>
            <TopBar title="Aura Shop" showBack backHref="/feed" />

            <div className="px-4 py-2">
                <div className="text-center mb-4">
                    <p className="text-xs text-text-dim">Your Balance</p>
                    <motion.p key={totalAura} initial={{ scale: 1.1 }} animate={{ scale: 1 }}
                        className="font-heading text-2xl font-bold text-purple">✨ {totalAura.toLocaleString()} aura</motion.p>
                </div>

                {/* Categories */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
                    {CATEGORIES.map(c => (
                        <button key={c.id} onClick={() => setCategory(c.id)}
                            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                            style={{ background: category === c.id ? 'rgba(168,85,247,0.15)' : '#1A1A1A', color: category === c.id ? '#A855F7' : '#555', border: `1px solid ${category === c.id ? 'rgba(168,85,247,0.3)' : '#2A2A2A'}` }}>
                            {c.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid grid-cols-2 gap-3">
                    {filtered.map(item => {
                        const owned = ownedItems.has(item.id);
                        return (
                            <motion.div key={item.id} variants={staggerItem}>
                                <motion.div whileTap={{ scale: 0.97 }}
                                    className="rounded-xl p-3 relative" style={{ background: '#1A1A1A', border: owned ? '1px solid #22C55E40' : '1px solid #1F1F1F' }}>
                                    {item.isLimited && (
                                        <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-red/20 text-red">LIMITED</span>
                                    )}
                                    {owned && (
                                        <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-green/20 text-green">OWNED</span>
                                    )}
                                    <div className="text-center mb-2">
                                        <span className="text-4xl block mb-2">{item.icon}</span>
                                        <h4 className="font-semibold text-sm">{item.name}</h4>
                                        <p className="text-[10px] text-text-dim mt-0.5">{item.description}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <span className="text-[10px] font-medium" style={{ color: rarityColors[item.rarity] }}>
                                            {item.rarity.toUpperCase()}
                                        </span>
                                        {!owned && (
                                            <NeonButton size="sm" className="text-[10px] px-3 py-1" onClick={() => handleBuy(item)}>
                                                {item.price} ✨
                                            </NeonButton>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            </div>

            {/* Purchase confirmation modal */}
            <Modal isOpen={!!confirmItem} onClose={() => setConfirmItem(null)} title="Confirm Purchase">
                {confirmItem && (
                    <div className="text-center">
                        <span className="text-5xl block mb-3">{confirmItem.icon}</span>
                        <h3 className="font-heading font-semibold text-lg mb-1">{confirmItem.name}</h3>
                        <p className="text-xs text-text-secondary mb-3">{confirmItem.description}</p>
                        <p className="text-lg font-bold text-purple mb-4">{confirmItem.price} ✨</p>
                        {totalAura < confirmItem.price && (
                            <p className="text-xs text-red mb-3">Not enough aura! You need {confirmItem.price - totalAura} more.</p>
                        )}
                        <div className="flex gap-3">
                            <NeonButton variant="ghost" fullWidth onClick={() => setConfirmItem(null)}>Cancel</NeonButton>
                            <NeonButton fullWidth onClick={confirmPurchase} disabled={totalAura < confirmItem.price}>Buy Now</NeonButton>
                        </div>
                    </div>
                )}
            </Modal>
        </ScreenTransition>
    );
}
