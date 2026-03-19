'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import NeonButton from '@/components/shared/NeonButton';
import { VIBE_TAGS } from '@/lib/design-system';

const TOTAL_STEPS = 4;

const slideVariants = {
    enter: (direction: number) => ({
        x: direction > 0 ? 300 : -300,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
    },
    exit: (direction: number) => ({
        x: direction > 0 ? -300 : 300,
        opacity: 0,
    }),
};

interface Department {
    id: string;
    code: string;
    name: string;
    color: string;
    icon: string;
}

interface Degree {
    id: string;
    code: string;
    name: string;
    department_id: string;
}

interface AvatarPreset {
    id: string;
    url: string;
    label: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const loadSession = useAuthStore((s) => s.loadSession);
    const [step, setStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Step 1: Department & Degree
    const [departments, setDepartments] = useState<Department[]>([]);
    const [degrees, setDegrees] = useState<Degree[]>([]);
    const [selectedDept, setSelectedDept] = useState<string | null>(null);
    const [selectedDegree, setSelectedDegree] = useState<string | null>(null);

    // Step 2: Semester
    const [selectedSemester, setSelectedSemester] = useState<number | null>(null);

    // Step 3: Avatar
    const [avatarPresets, setAvatarPresets] = useState<AvatarPreset[]>([]);
    const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
    const [customAvatarFile, setCustomAvatarFile] = useState<File | null>(null);
    const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Step 4: Vibe Tags & Bio
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [bio, setBio] = useState('');

    // Fetch departments on mount
    useEffect(() => {
        const fetchDepartments = async () => {
            const { data } = await supabase
                .from('departments')
                .select('*')
                .order('code');
            if (data) setDepartments(data);
        };
        fetchDepartments();
    }, []);

    // Fetch degrees when department changes
    useEffect(() => {
        if (!selectedDept) {
            setDegrees([]);
            setSelectedDegree(null);
            return;
        }
        const fetchDegrees = async () => {
            const { data } = await supabase
                .from('degrees')
                .select('*')
                .eq('department_id', selectedDept)
                .order('code');
            if (data) setDegrees(data);
        };
        fetchDegrees();
    }, [selectedDept]);

    // Fetch avatar presets on mount
    useEffect(() => {
        const fetchAvatars = async () => {
            const { data } = await supabase
                .from('avatar_presets')
                .select('*')
                .order('label');
            if (data) setAvatarPresets(data);
        };
        fetchAvatars();
    }, []);

    const goNext = () => {
        if (step >= TOTAL_STEPS - 1) return;
        setDirection(1);
        setStep((s) => s + 1);
        setError('');
    };

    const goBack = () => {
        if (step <= 0) return;
        setDirection(-1);
        setStep((s) => s - 1);
        setError('');
    };

    const toggleTag = (tagId: string) => {
        setSelectedTags((prev) => {
            if (prev.includes(tagId)) return prev.filter((t) => t !== tagId);
            if (prev.length >= 3) return prev;
            return [...prev, tagId];
        });
    };

    const handleCustomAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            setError('Avatar must be under 2MB');
            return;
        }
        setCustomAvatarFile(file);
        setSelectedAvatar(null);
        const reader = new FileReader();
        reader.onload = () => setCustomAvatarPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const uploadCustomAvatar = async (userId: string): Promise<string | null> => {
        if (!customAvatarFile) return null;
        setUploadingAvatar(true);
        try {
            const ext = customAvatarFile.name.split('.').pop() || 'png';
            const path = `${userId}/avatar.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(path, customAvatarFile, { upsert: true });
            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(path);
            return urlData.publicUrl;
        } catch (err) {
            console.error('Avatar upload failed:', err);
            return null;
        } finally {
            setUploadingAvatar(false);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 0: return !!selectedDept && !!selectedDegree;
            case 1: return !!selectedSemester;
            case 2: return !!selectedAvatar || !!customAvatarFile;
            case 3: return selectedTags.length >= 3;
            default: return false;
        }
    };

    const handleComplete = async () => {
        if (selectedTags.length < 3) {
            setError('Pick at least 3 vibe tags');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                setError('Session expired. Please log in again.');
                router.push('/login');
                return;
            }

            const userId = session.user.id;

            // Upload custom avatar if selected
            let avatarUrl = selectedAvatar;
            if (customAvatarFile) {
                const uploaded = await uploadCustomAvatar(userId);
                if (uploaded) avatarUrl = uploaded;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    department_id: selectedDept,
                    degree_id: selectedDegree,
                    semester: selectedSemester,
                    avatar_url: avatarUrl,
                    vibe_tags: selectedTags,
                    bio: bio.trim(),
                    is_onboarded: true,
                })
                .eq('id', userId);

            if (updateError) {
                setError(updateError.message);
                return;
            }

            await loadSession();
            router.push('/feed');
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    const semesterLabels = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

    return (
        <div className="min-h-screen flex flex-col px-6 py-8">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-text-dim font-mono">Step {step + 1}/{TOTAL_STEPS}</span>
                    <span className="text-xs text-text-dim font-mono">{Math.round(((step + 1) / TOTAL_STEPS) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-bg-elevated rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #A855F7, #F97316)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Step Content */}
            <div className="flex-1 relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                    {step === 0 && (
                        <motion.div
                            key="step-0"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="font-heading text-2xl font-bold mb-1">Choose Your Department</h2>
                                <p className="text-text-dim text-sm">Where do you belong at FAST?</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {departments.map((dept) => (
                                    <button
                                        key={dept.id}
                                        onClick={() => {
                                            setSelectedDept(dept.id);
                                            setSelectedDegree(null);
                                        }}
                                        className="card-glass p-4 text-left transition-all duration-200 hover:scale-[1.02]"
                                        style={{
                                            borderColor: selectedDept === dept.id ? dept.color : 'rgba(255,255,255,0.06)',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            boxShadow: selectedDept === dept.id ? `0 0 20px ${dept.color}22` : 'none',
                                        }}
                                    >
                                        <span className="text-2xl mb-2 block">{dept.icon}</span>
                                        <span className="font-bold text-sm" style={{ color: dept.color }}>{dept.code}</span>
                                        <span className="block text-xs text-text-dim mt-0.5 leading-tight">{dept.name}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedDept && degrees.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="space-y-3"
                                >
                                    <h3 className="font-heading text-lg font-semibold">Select Degree</h3>
                                    <div className="space-y-2">
                                        {degrees.map((deg) => (
                                            <button
                                                key={deg.id}
                                                onClick={() => setSelectedDegree(deg.id)}
                                                className="w-full card-glass p-3 text-left transition-all duration-200"
                                                style={{
                                                    borderColor: selectedDegree === deg.id ? '#A855F7' : 'rgba(255,255,255,0.06)',
                                                    borderWidth: '1px',
                                                    borderStyle: 'solid',
                                                }}
                                            >
                                                <span className="font-semibold text-sm">{deg.code}</span>
                                                <span className="text-text-dim text-xs ml-2">{deg.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {step === 1 && (
                        <motion.div
                            key="step-1"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="font-heading text-2xl font-bold mb-1">Pick Your Semester</h2>
                                <p className="text-text-dim text-sm">How far along your journey?</p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {semesters.map((sem, i) => (
                                    <button
                                        key={sem}
                                        onClick={() => setSelectedSemester(sem)}
                                        className="card-glass p-5 text-center transition-all duration-200 hover:scale-[1.02]"
                                        style={{
                                            borderColor: selectedSemester === sem ? '#A855F7' : 'rgba(255,255,255,0.06)',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                            boxShadow: selectedSemester === sem ? '0 0 20px rgba(168,85,247,0.15)' : 'none',
                                        }}
                                    >
                                        <span className="font-heading text-2xl font-bold block" style={{
                                            color: selectedSemester === sem ? '#A855F7' : '#888',
                                        }}>
                                            {semesterLabels[i]}
                                        </span>
                                        <span className="text-xs text-text-dim mt-1 block">Semester</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step-2"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="font-heading text-2xl font-bold mb-1">Choose Your Avatar</h2>
                                <p className="text-text-dim text-sm">Pick a preset or upload your own</p>
                            </div>

                            {/* Upload custom */}
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleCustomAvatar}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="w-full card-glass p-4 flex items-center gap-4 transition-all duration-200"
                                    style={{
                                        borderColor: customAvatarFile ? '#F97316' : 'rgba(255,255,255,0.06)',
                                        borderWidth: '1px',
                                        borderStyle: 'solid',
                                    }}
                                >
                                    {customAvatarPreview ? (
                                        <img
                                            src={customAvatarPreview}
                                            alt="Custom avatar"
                                            className="w-14 h-14 rounded-full object-cover"
                                            style={{ border: '2px solid #F97316' }}
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-bg-elevated flex items-center justify-center">
                                            <svg className="w-6 h-6 text-text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="text-left">
                                        <span className="text-sm font-semibold block">Upload Custom Avatar</span>
                                        <span className="text-xs text-text-dim">Max 2MB, PNG or JPG</span>
                                    </div>
                                </button>
                            </div>

                            {/* Preset avatars */}
                            {avatarPresets.length > 0 && (
                                <div>
                                    <h3 className="text-sm text-text-dim mb-3">Or pick a preset</h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {avatarPresets.map((preset) => (
                                            <button
                                                key={preset.id}
                                                onClick={() => {
                                                    setSelectedAvatar(preset.url);
                                                    setCustomAvatarFile(null);
                                                    setCustomAvatarPreview(null);
                                                }}
                                                className="flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all duration-200"
                                                style={{
                                                    background: selectedAvatar === preset.url ? 'rgba(168,85,247,0.1)' : 'transparent',
                                                    border: selectedAvatar === preset.url ? '1px solid #A855F7' : '1px solid transparent',
                                                }}
                                            >
                                                <img
                                                    src={preset.url}
                                                    alt={preset.label}
                                                    className="w-14 h-14 rounded-full object-cover"
                                                    style={{
                                                        border: selectedAvatar === preset.url ? '2px solid #A855F7' : '2px solid transparent',
                                                    }}
                                                />
                                                <span className="text-[10px] text-text-dim text-center leading-tight">{preset.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step-3"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="font-heading text-2xl font-bold mb-1">Your Vibe</h2>
                                <p className="text-text-dim text-sm">Pick 3 tags that describe you & write a short bio</p>
                            </div>

                            <div>
                                <h3 className="text-sm text-text-secondary mb-3">Vibe Tags <span className="text-text-dim">({selectedTags.length}/3)</span></h3>
                                <div className="flex flex-wrap gap-2">
                                    {VIBE_TAGS.map((tag) => {
                                        const isSelected = selectedTags.includes(tag.id);
                                        const isDisabled = !isSelected && selectedTags.length >= 3;
                                        return (
                                            <button
                                                key={tag.id}
                                                onClick={() => toggleTag(tag.id)}
                                                disabled={isDisabled}
                                                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
                                                style={{
                                                    background: isSelected
                                                        ? 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(249,115,22,0.2))'
                                                        : 'rgba(42,42,42,0.5)',
                                                    border: isSelected
                                                        ? '1px solid #A855F7'
                                                        : '1px solid rgba(255,255,255,0.06)',
                                                    color: isSelected ? '#fff' : '#888',
                                                    opacity: isDisabled ? 0.4 : 1,
                                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                {tag.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm text-text-secondary mb-2">Bio <span className="text-text-dim">(optional)</span></h3>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value.slice(0, 160))}
                                    placeholder="Tell the campus about yourself..."
                                    className="input-dark resize-none"
                                    rows={3}
                                    style={{ borderRadius: '14px' }}
                                />
                                <p className="text-xs text-text-dim text-right mt-1">{bio.length}/160</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Error */}
            {error && (
                <p className="text-red text-xs text-center mb-3">{error}</p>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 mt-6">
                {step > 0 && (
                    <button
                        onClick={goBack}
                        className="btn-ghost px-6"
                        disabled={loading}
                    >
                        Back
                    </button>
                )}
                <div className="flex-1">
                    {step < TOTAL_STEPS - 1 ? (
                        <NeonButton fullWidth onClick={goNext} disabled={!canProceed()}>
                            Next
                        </NeonButton>
                    ) : (
                        <NeonButton fullWidth onClick={handleComplete} disabled={loading || !canProceed()}>
                            {loading || uploadingAvatar ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Finishing up...
                                </span>
                            ) : (
                                "Let's Go!"
                            )}
                        </NeonButton>
                    )}
                </div>
            </div>
        </div>
    );
}
