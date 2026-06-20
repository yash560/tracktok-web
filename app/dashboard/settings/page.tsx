'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Moon,
  Sun,
  Bell,
  Shield,
  Globe,
  CreditCard,
  ChevronRight,
  Database,
  Users,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Mail,
  X,
  Search,
} from 'lucide-react';
import axios from 'axios';
import {
  NotificationModal,
  ConfirmModal,
  NotificationState,
  ConfirmState,
  initialNotification,
  initialConfirm,
} from '@/components/NotificationModal';
import { useCurrency } from '@/components/CurrencyContext';

interface Contact {
  _id: string;
  name: string;
  phone: string | null;
  email: string | null;
  transactions: {
    count: number;
    totalAmount: number;
    splitGroups: string[];
  };
}

interface ContactFormData {
  name: string;
  phone: string;
  email: string;
}

function ContactModal({
  isOpen,
  onClose,
  onSave,
  contact,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ContactFormData) => void;
  contact: Contact | null;
  saving: boolean;
}) {
  const [form, setForm] = useState<ContactFormData>({ name: '', phone: '', email: '' });

  useEffect(() => {
    if (contact) {
      setForm({ name: contact.name, phone: contact.phone || '', email: contact.email || '' });
    } else {
      setForm({ name: '', phone: '', email: '' });
    }
  }, [contact, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">{contact ? 'Edit Contact' : 'Add Contact'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Contact name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Phone number"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              placeholder="Email address"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.name.trim()}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : contact ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}

const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  { code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  { code: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', flag: '🇯🇵' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
];

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const { currency, setCurrency } = useCurrency();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactsLoading, setContactsLoading] = useState(true);
  const [contactSearch, setContactSearch] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(initialNotification);
  const [confirm, setConfirm] = useState<ConfirmState>(initialConfirm);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const fetchContacts = useCallback(async () => {
    try {
      setContactsLoading(true);
      const res = await axios.get('/api/user-contacts');
      setContacts(res.data.contacts || []);
    } catch {
      setContacts([]);
    } finally {
      setContactsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSaveContact = async (data: ContactFormData) => {
    setSaving(true);
    try {
      if (editingContact) {
        await axios.patch(`/api/user-contacts/${editingContact._id}`, data);
        setNotification({ isOpen: true, type: 'success', title: 'Contact Updated', message: `${data.name} updated successfully.` });
      } else {
        await axios.post('/api/user-contacts', data);
        setNotification({ isOpen: true, type: 'success', title: 'Contact Added', message: `${data.name} added successfully.` });
      }
      setContactModalOpen(false);
      setEditingContact(null);
      fetchContacts();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to save contact';
      setNotification({ isOpen: true, type: 'error', title: 'Error', message: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = (contact: Contact) => {
    setConfirm({
      isOpen: true,
      title: 'Delete Contact',
      message: `Are you sure you want to delete "${contact.name}"? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/user-contacts/${contact._id}`);
          setNotification({ isOpen: true, type: 'success', title: 'Contact Deleted', message: `${contact.name} deleted.` });
          fetchContacts();
        } catch {
          setNotification({ isOpen: true, type: 'error', title: 'Error', message: 'Failed to delete contact.' });
        }
      },
    });
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.phone?.includes(contactSearch) ||
    c.email?.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const settingsSections = [
    {
      title: 'Appearance',
      items: [
        {
          id: 'theme',
          name: 'Dark Mode',
          description: 'Adjust the visual appearance of the app',
          icon: isDarkMode ? Moon : Sun,
          action: (
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isDarkMode ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      items: [
        {
          id: 'push',
          name: 'Push Notifications',
          description: 'Receive alerts for large transactions',
          icon: Bell,
          action: (
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications ? 'bg-primary' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          ),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          id: 'currency',
          name: 'Default Currency',
          description: `${CURRENCIES.find((c) => c.code === currency)?.flag || ''} ${currency} (${CURRENCIES.find((c) => c.code === currency)?.symbol || '₹'})`,
          icon: CreditCard,
          action: (
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.flag} {c.code} ({c.symbol})</option>
              ))}
            </select>
          ),
        },
        {
          id: 'language',
          name: 'Language',
          description: 'English',
          icon: Globe,
          action: <ChevronRight className="w-5 h-5 text-gray-400" />,
        },
      ],
    },
    {
      title: 'Data Management',
      items: [
        {
          id: 'export',
          name: 'Export Data',
          description: 'Download your financial history as CSV',
          icon: Database,
          action: <button className="text-primary font-semibold text-sm hover:underline">Export</button>,
        },
      ],
    },
  ];

  return (
    <div className="px-4 sm:px-6 md:px-12 max-w-3xl mx-auto space-y-6 sm:space-y-8 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Personalize your TrackTok experience</p>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {settingsSections.map((section) => (
          <div key={section.title} className="space-y-3 sm:space-y-4">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-400 px-4 sm:px-6">
              {section.title}
            </h3>
            <div className="card p-0 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-dark-bg/20 transition">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0">
                        <Icon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-600 dark:text-gray-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm sm:text-base font-semibold">{item.name}</p>
                        <p className="text-xs text-gray-500 truncate">{item.description}</p>
                      </div>
                    </div>
                    <div className="self-end sm:self-center flex-shrink-0">{item.action}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Contacts Section */}
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center justify-between px-4 sm:px-6">
            <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-400">
              Contacts
            </h3>
            <button
              onClick={() => { setEditingContact(null); setContactModalOpen(true); }}
              className="flex items-center gap-1 text-primary text-sm font-semibold hover:underline"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                  placeholder="Search contacts..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-dark-bg text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
            </div>

            {contactsLoading ? (
              <div className="p-8 text-center text-gray-400 text-sm">Loading contacts...</div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-500">
                  {contactSearch ? 'No contacts match your search' : 'No contacts yet'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
                {filteredContacts.map((contact) => (
                  <div key={contact._id} className="p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-dark-bg/20 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-sm">
                            {contact.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{contact.name}</p>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5">
                            {contact.phone && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {contact.phone}
                              </span>
                            )}
                            {contact.email && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {contact.email}
                              </span>
                            )}
                          </div>
                          {contact.transactions.count > 0 && (
                            <div className="mt-1.5">
                              <span className="text-xs text-primary font-medium">
                                {contact.transactions.count} transaction{contact.transactions.count !== 1 ? 's' : ''} · ₹{contact.transactions.totalAmount.toLocaleString('en-IN')}
                              </span>
                              {contact.transactions.splitGroups.length > 0 && (
                                <span className="text-xs text-gray-400 ml-1">
                                  in {contact.transactions.splitGroups.join(', ')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => { setEditingContact(contact); setContactModalOpen(true); }}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-danger" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Security Placeholder */}
      <div className="card border-danger/20 bg-danger/[0.02] p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="p-2 bg-danger/10 rounded-lg flex-shrink-0">
            <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-danger" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-danger">Privacy & Security</h3>
        </div>
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-6">
          Your data is encrypted and secure. nosotros never share your financial information with third parties.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button className="w-full sm:w-auto px-4 py-2 bg-danger text-white rounded-lg text-xs sm:text-sm font-bold shadow-lg shadow-danger/20 hover:bg-danger-dark transition">
            Privacy Center
          </button>
          <button className="w-full sm:w-auto px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-100 transition">
            Terms of Use
          </button>
        </div>
      </div>

      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => { setContactModalOpen(false); setEditingContact(null); }}
        onSave={handleSaveContact}
        contact={editingContact}
        saving={saving}
      />

      <NotificationModal
        notification={notification}
        onClose={() => setNotification(initialNotification)}
      />

      <ConfirmModal
        confirm={confirm}
        onClose={() => setConfirm(initialConfirm)}
      />
    </div>
  );
}
