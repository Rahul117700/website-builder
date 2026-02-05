'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
    UserIcon,
    CreditCardIcon,
    BellIcon,
    ShieldCheckIcon,
    KeyIcon,
    ArrowRightOnRectangleIcon,
    CameraIcon,
    GlobeAltIcon,
    CurrencyDollarIcon,
    PencilIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon,
    BanknotesIcon,
    QuestionMarkCircleIcon,
    ArrowTopRightOnSquareIcon,
    BoltIcon,
    EyeIcon,
    EyeSlashIcon,
    ClipboardDocumentIcon,
    CheckIcon,
    SparklesIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import PlansView from '@/components/dashboard/views/PlansView';

export default function SettingsView() {
    const { data: session, update: updateSession } = useSession();
    const [activeTab, setActiveTab] = useState('profile');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Profile State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [company, setCompany] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Razorpay Config State
    const [razorpayKeyId, setRazorpayKeyId] = useState('');
    const [razorpayKeySecret, setRazorpayKeySecret] = useState('');
    const [razorpayWebhookSecret, setRazorpayWebhookSecret] = useState('');
    const [showRazorpaySecret, setShowRazorpaySecret] = useState(false);
    const [hasRazorpayConfig, setHasRazorpayConfig] = useState(false);
    const [savingPayment, setSavingPayment] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    // New Password State
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Delete Account State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || '');
            setEmail(session.user.email || '');
            setProfileImage(session.user.image || '');
            loadPaymentConfig();
        }
    }, [session]);

    const loadPaymentConfig = async () => {
        try {
            const response = await fetch('/api/razorpay-config');
            if (response.ok) {
                const data = await response.json();
                if (data.hasConfig && data.config) {
                    setRazorpayKeyId(data.config.keyId);
                    setHasRazorpayConfig(true);
                }
            }
        } catch (error) {
            console.error('Error loading payment config:', error);
        }
    };

    const handleUpdateProfile = async () => {
        try {
            setSaving(true);
            const response = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, company }),
            });

            if (response.ok) {
                await updateSession({
                    ...session,
                    user: {
                        ...session?.user,
                        name: name
                    }
                });
                setIsEditing(false);
                toast.success('🎉 Profile updated successfully!');
            } else {
                toast.error('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('An error occurred');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size should be less than 5MB');
            return;
        }

        try {
            setUploadingImage(true);
            setUploadProgress(0);

            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 100);

            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/user/profile/image', {
                method: 'POST',
                body: formData,
            });

            clearInterval(progressInterval);
            setUploadProgress(100);

            if (response.ok) {
                const data = await response.json();
                setProfileImage(data.imageUrl);
                await updateSession({
                    ...session,
                    user: {
                        ...session?.user,
                        image: data.imageUrl
                    }
                });
                toast.success('Profile picture updated!');
            } else {
                toast.error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('An error occurred while uploading');
        } finally {
            setTimeout(() => {
                setUploadingImage(false);
                setUploadProgress(0);
            }, 500);
        }
    };

    const handleUpdatePaymentConfig = async () => {
        try {
            setSavingPayment(true);
            const response = await fetch('/api/razorpay-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    keyId: razorpayKeyId,
                    keySecret: razorpayKeySecret || undefined,
                    webhookSecret: razorpayWebhookSecret || undefined
                }),
            });

            if (response.ok) {
                toast.success('💳 Payment configuration saved!');
                setRazorpayKeySecret('');
                setHasRazorpayConfig(true);
            } else {
                toast.error('Failed to save payment configuration');
            }
        } catch (error) {
            console.error('Error saving payment config:', error);
            toast.error('Failed to save payment config');
        } finally {
            setSavingPayment(false);
        }
    };

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopiedField(null), 2000);
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: UserIcon },
        { id: 'payment', label: 'Payment Gateway', icon: BanknotesIcon },
        { id: 'security', label: 'Security', icon: ShieldCheckIcon },
        { id: 'billing', label: 'Billing', icon: CreditCardIcon },
    ];

    return (
        <div className="w-full min-h-screen m-0 p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 overflow-y-auto">
            {/* Decorative Background Elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-pink-200/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative z-10 max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-2"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-200/50">
                            <SparklesIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                                Settings
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                Manage your account preferences and configurations
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Tabs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative"
                >
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide bg-white/60 backdrop-blur-xl p-2 rounded-3xl border border-white/60 shadow-lg shadow-gray-200/50">
                        {tabs.map((tab, index) => (
                            <motion.button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                className={`relative flex items-center gap-2 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'text-white shadow-lg shadow-indigo-200/50 scale-105'
                                    : 'text-gray-600 hover:bg-white/80 hover:text-gray-900'
                                    }`}
                            >
                                <tab.icon className={`w-5 h-5 transition-transform ${activeTab === tab.id ? 'scale-110' : ''}`} />
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl -z-10"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="bg-white/80 backdrop-blur-xl p-8 lg:p-10 rounded-3xl border border-white/60 shadow-xl shadow-gray-200/50 relative overflow-hidden">
                                    {/* Decorative gradient */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/40 to-purple-100/40 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>

                                    <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start">
                                        {/* Avatar Section */}
                                        <div className="flex flex-col items-center gap-4">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleImageUpload}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                            <div
                                                className="relative group/avatar cursor-pointer"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-5xl font-bold text-indigo-600 shadow-xl overflow-hidden ring-4 ring-white">
                                                    {uploadingImage ? (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                                            <span className="text-xs font-bold text-indigo-600">{uploadProgress}%</span>
                                                        </div>
                                                    ) : profileImage ? (
                                                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span>{name.charAt(0).toUpperCase()}</span>
                                                    )}
                                                </div>
                                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 to-purple-600/80 rounded-3xl opacity-0 group-hover/avatar:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                                                    <div className="text-center">
                                                        <CameraIcon className="w-10 h-10 text-white mx-auto mb-2" />
                                                        <span className="text-xs font-bold text-white">Upload Photo</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-500">Click to change photo</span>
                                        </div>

                                        {/* Form Section */}
                                        <div className="flex-1 w-full space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                                                <button
                                                    onClick={() => setIsEditing(!isEditing)}
                                                    className={`p-3 rounded-xl transition-all ${isEditing
                                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                                    <input
                                                        type="text"
                                                        disabled={!isEditing}
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:bg-white text-gray-900 font-medium transition-all disabled:text-gray-900 disabled:cursor-default"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                                    <input
                                                        type="email"
                                                        disabled={true}
                                                        value={email}
                                                        className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent rounded-xl text-gray-900 font-medium cursor-default"
                                                    />
                                                </div>
                                            </div>

                                            {isEditing && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="flex justify-end gap-3 pt-4"
                                                >
                                                    <button
                                                        onClick={() => setIsEditing(false)}
                                                        className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleUpdateProfile}
                                                        disabled={saving}
                                                        className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-indigo-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center gap-2"
                                                    >
                                                        {saving ? (
                                                            <>
                                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                                <span>Saving...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <CheckIcon className="w-5 h-5" />
                                                                <span>Save Changes</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </motion.div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payment Gateway Settings */}
                        {activeTab === 'payment' && (
                            <div className="space-y-6">
                                <div className="bg-white/80 backdrop-blur-xl p-8 lg:p-10 rounded-3xl border border-white/60 shadow-xl shadow-gray-200/50">
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-200/50">
                                                <BanknotesIcon className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-bold text-gray-900">Razorpay Integration</h3>
                                                <p className="text-sm text-gray-500 font-medium mt-1">Configure your payment gateway</p>
                                            </div>
                                        </div>
                                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${hasRazorpayConfig
                                            ? 'bg-emerald-50 border-emerald-200'
                                            : 'bg-gray-50 border-gray-200'
                                            }`}>
                                            <div className={`w-2.5 h-2.5 rounded-full ${hasRazorpayConfig ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}`}></div>
                                            <span className={`text-xs font-bold ${hasRazorpayConfig ? 'text-emerald-700' : 'text-gray-500'}`}>
                                                {hasRazorpayConfig ? 'Connected' : 'Not Configured'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                                API Key ID
                                                <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" title="Found in Razorpay Dashboard > Settings > API Keys" />
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={razorpayKeyId}
                                                    onChange={(e) => setRazorpayKeyId(e.target.value)}
                                                    placeholder="rzp_live_XXXXXXXXXXXX"
                                                    className="w-full px-4 py-3.5 pr-12 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:bg-white text-gray-900 font-mono font-medium transition-all"
                                                />
                                                {razorpayKeyId && (
                                                    <button
                                                        onClick={() => copyToClipboard(razorpayKeyId, 'keyId')}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-all"
                                                    >
                                                        {copiedField === 'keyId' ? (
                                                            <CheckIcon className="w-5 h-5 text-emerald-600" />
                                                        ) : (
                                                            <ClipboardDocumentIcon className="w-5 h-5 text-gray-500" />
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">API Key Secret</label>
                                            <div className="relative">
                                                <input
                                                    type={showRazorpaySecret ? "text" : "password"}
                                                    value={razorpayKeySecret}
                                                    onChange={(e) => setRazorpayKeySecret(e.target.value)}
                                                    placeholder={hasRazorpayConfig ? "••••••••••••••••" : "Enter your secret key"}
                                                    className="w-full px-4 py-3.5 pr-24 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:bg-white text-gray-900 font-mono font-medium transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowRazorpaySecret(!showRazorpaySecret)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded-lg transition-all"
                                                >
                                                    {showRazorpaySecret ? (
                                                        <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                                                    ) : (
                                                        <EyeIcon className="w-5 h-5 text-gray-500" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-semibold text-gray-700">Webhook Secret (Optional)</label>
                                            <input
                                                type="password"
                                                value={razorpayWebhookSecret}
                                                onChange={(e) => setRazorpayWebhookSecret(e.target.value)}
                                                placeholder="whsec_XXXXXXXX"
                                                className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:bg-white text-gray-900 font-mono font-medium transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-8 flex justify-end">
                                        <button
                                            onClick={handleUpdatePaymentConfig}
                                            disabled={savingPayment}
                                            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-emerald-200/50 hover:-translate-y-0.5 transition-all disabled:opacity-70 flex items-center gap-2"
                                        >
                                            {savingPayment ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    <span>Saving Configuration...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <BoltIcon className="h-5 w-5" />
                                                    <span>Save Configuration</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Help Documentation */}
                                <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-white/60 shadow-xl shadow-gray-200/50">
                                    <div className="flex items-center gap-3 mb-6">
                                        <QuestionMarkCircleIcon className="h-6 w-6 text-indigo-600" />
                                        <h4 className="text-xl font-bold text-gray-900">Quick Links</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <a
                                            href="https://dashboard.razorpay.com/app/keys"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-between group hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-indigo-200"
                                        >
                                            <span className="font-semibold text-sm text-gray-700 group-hover:text-indigo-700">Get API Keys</span>
                                            <ArrowTopRightOnSquareIcon className="h-5 w-5 text-indigo-400 group-hover:text-indigo-600" />
                                        </a>
                                        <a
                                            href="https://razorpay.com/docs/payments/dashboard/account-settings/api-keys/"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-between group hover:shadow-lg hover:-translate-y-1 transition-all border-2 border-transparent hover:border-emerald-200"
                                        >
                                            <span className="font-semibold text-sm text-gray-700 group-hover:text-emerald-700">API Documentation</span>
                                            <ArrowTopRightOnSquareIcon className="h-5 w-5 text-emerald-400 group-hover:text-emerald-600" />
                                        </a>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                {/* Danger Zone */}
                                <div className="bg-gradient-to-br from-red-50 to-rose-50 p-8 lg:p-10 rounded-3xl border-2 border-red-100 shadow-xl shadow-red-100/50">
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="h-16 w-16 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-200/50">
                                                <ExclamationTriangleIcon className="h-8 w-8 text-white" />
                                            </div>
                                            <div className="text-center md:text-left">
                                                <p className="text-xl font-bold text-gray-900">Delete Account</p>
                                                <p className="text-gray-600 font-medium mt-1">Permanently remove your account and all data</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="px-8 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-red-200/50 hover:-translate-y-0.5 transition-all whitespace-nowrap"
                                        >
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Billing Tab */}
                        {activeTab === 'billing' && (
                            <div>
                                <PlansView />
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {showDeleteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white w-full max-w-lg rounded-3xl p-10 text-center shadow-2xl"
                        >
                            <div className="h-20 w-20 bg-gradient-to-br from-red-100 to-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-red-100">
                                <ExclamationTriangleIcon className="h-10 w-10 text-red-600" />
                            </div>
                            <h3 className="text-3xl font-bold text-gray-900 mb-4">Delete Account?</h3>
                            <p className="text-gray-600 font-medium leading-relaxed mb-8">
                                This action is <span className="text-red-600 font-bold">permanent and cannot be undone</span>. All your data, including channels, products, and analytics will be permanently deleted.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="flex-1 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:shadow-xl hover:shadow-red-200/50 transition-all"
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
