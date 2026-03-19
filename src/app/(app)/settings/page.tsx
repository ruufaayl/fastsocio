'use client';
/** Settings page — toggles, profile management, and logout */
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Bell, Shield, Palette, Crown, FileText, LogOut, Trash2 } from 'lucide-react';
import TopBar from '@/components/layout/TopBar';
import ScreenTransition from '@/components/layout/ScreenTransition';
import GlassCard from '@/components/shared/GlassCard';
import Modal from '@/components/shared/Modal';
import NeonButton from '@/components/shared/NeonButton';

export default function SettingsPage() {
    const router = useRouter();
    const [notifs, setNotifs] = useState({ aura: true, social: true, content: true, campus: true });
    const [privacy, setPrivacy] = useState({ profilePublic: true, showLocation: false, anonymousBrowsing: false });
    const [showDelete, setShowDelete] = useState(false);

    return (
        <ScreenTransition>
            <TopBar title="Settings" showBack backHref="/profile" />

            <div className="px-4 py-2 space-y-4">
                {/* PRO Banner */}
                <Link href="/pro">
                    <GlassCard className="text-center" style={{ background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(249,115,22,0.1))', border: '1px solid rgba(168,85,247,0.2)' }}>
                        <Crown size={24} className="text-yellow mx-auto mb-2" />
                        <h3 className="font-heading font-semibold">Upgrade to PRO</h3>
                        <p className="text-xs text-text-secondary">Unlimited swipes, exclusive features & more</p>
                    </GlassCard>
                </Link>

                {/* Account */}
                <div>
                    <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2 flex items-center gap-2"><User size={14} /> Account</h3>
                    <div className="rounded-xl overflow-hidden" style={{ background: '#1A1A1A', border: '1px solid #1F1F1F' }}>
                        <SettingRow label="Edit Profile" detail="Name, bio, avatar" />
                        <SettingRow label="University Email" detail="zara@isb.nu.edu.pk" />
                        <SettingRow label="Department" detail="CS — 5th Semester" />
                    </div>
                </div>

                {/* Notifications */}
                <div>
                    <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2 flex items-center gap-2"><Bell size={14} /> Notifications</h3>
                    <div className="rounded-xl overflow-hidden" style={{ background: '#1A1A1A', border: '1px solid #1F1F1F' }}>
                        <ToggleRow label="Aura Alerts" value={notifs.aura} onChange={v => setNotifs(n => ({ ...n, aura: v }))} />
                        <ToggleRow label="Social Alerts" value={notifs.social} onChange={v => setNotifs(n => ({ ...n, social: v }))} />
                        <ToggleRow label="Content Alerts" value={notifs.content} onChange={v => setNotifs(n => ({ ...n, content: v }))} />
                        <ToggleRow label="Campus Alerts" value={notifs.campus} onChange={v => setNotifs(n => ({ ...n, campus: v }))} />
                    </div>
                </div>

                {/* Privacy */}
                <div>
                    <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2 flex items-center gap-2"><Shield size={14} /> Privacy</h3>
                    <div className="rounded-xl overflow-hidden" style={{ background: '#1A1A1A', border: '1px solid #1F1F1F' }}>
                        <ToggleRow label="Public Profile" value={privacy.profilePublic} onChange={v => setPrivacy(p => ({ ...p, profilePublic: v }))} />
                        <ToggleRow label="Show Location" value={privacy.showLocation} onChange={v => setPrivacy(p => ({ ...p, showLocation: v }))} />
                        <ToggleRow label="Anonymous Browsing" value={privacy.anonymousBrowsing} onChange={v => setPrivacy(p => ({ ...p, anonymousBrowsing: v }))} />
                    </div>
                </div>

                {/* Theme */}
                <div>
                    <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2 flex items-center gap-2"><Palette size={14} /> Appearance</h3>
                    <div className="rounded-xl overflow-hidden" style={{ background: '#1A1A1A', border: '1px solid #1F1F1F' }}>
                        <SettingRow label="Theme" detail="Dark (default)" />
                        <SettingRow label="Zen Mode" detail="Hide all aura numbers" />
                    </div>
                </div>

                {/* Legal */}
                <div>
                    <h3 className="text-xs font-semibold text-text-dim uppercase tracking-wider mb-2 flex items-center gap-2"><FileText size={14} /> Legal</h3>
                    <div className="rounded-xl overflow-hidden" style={{ background: '#1A1A1A', border: '1px solid #1F1F1F' }}>
                        <SettingRow label="Terms of Service" />
                        <SettingRow label="Privacy Policy" />
                        <SettingRow label="Community Guidelines" />
                    </div>
                </div>

                {/* Danger zone */}
                <div className="space-y-3 pt-2">
                    <button onClick={() => router.push('/login')}
                        className="w-full py-3 rounded-xl text-sm font-semibold text-red flex items-center justify-center gap-2"
                        style={{ background: '#EF444410', border: '1px solid #EF444430' }}>
                        <LogOut size={16} /> Log Out
                    </button>
                    <button onClick={() => setShowDelete(true)}
                        className="w-full py-3 rounded-xl text-sm font-semibold text-red flex items-center justify-center gap-2"
                        style={{ background: '#EF444410', border: '1px solid #EF444430' }}>
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>
            </div>

            <Modal isOpen={showDelete} onClose={() => setShowDelete(false)} title="Delete Account">
                <p className="text-sm text-text-secondary mb-4">This will permanently delete your account and all your aura. This action cannot be undone.</p>
                <div className="flex gap-3">
                    <NeonButton variant="ghost" fullWidth onClick={() => setShowDelete(false)}>Cancel</NeonButton>
                    <NeonButton variant="danger" fullWidth>Delete Forever</NeonButton>
                </div>
            </Modal>
        </ScreenTransition>
    );
}

function SettingRow({ label, detail }: { label: string; detail?: string }) {
    return (
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1F1F1F' }}>
            <span className="text-sm">{label}</span>
            {detail && <span className="text-xs text-text-dim">{detail}</span>}
        </div>
    );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1F1F1F' }}>
            <span className="text-sm">{label}</span>
            <button onClick={() => onChange(!value)} className="w-10 h-5 rounded-full transition-colors relative"
                style={{ background: value ? '#A855F7' : '#2A2A2A' }}>
                <div className="absolute top-0.5 transition-all w-4 h-4 rounded-full bg-white"
                    style={{ left: value ? 'calc(100% - 18px)' : '2px' }} />
            </button>
        </div>
    );
}
