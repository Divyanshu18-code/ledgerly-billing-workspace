import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { CustomSelect } from '@/components/ui/CustomSelect';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: Record<string, any>;
  onSave: (data: Record<string, any>) => Promise<void>;
  isLoading: boolean;
}

const GENDER_OPTIONS = [
  { value: '', label: 'Select Gender' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSave,
  isLoading,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
  };

  const modalMarkup = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/70 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#12101b] border border-slate-200 dark:border-white/10 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl space-y-6 text-slate-900 dark:text-white p-6 sm:p-8 relative">
        {/* CLOSE BUTTON */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* MODAL HEADER */}
        <div className="border-b border-slate-200 dark:border-white/10 pb-4 space-y-1">
          <div className="flex items-center gap-2 text-violet-600 dark:text-violet-400">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-xl font-black font-heading text-slate-900 dark:text-white">Edit Profile Details</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-gray-400">
            Update your personal account information, role details, and address information.
          </p>
        </div>

        {/* MODAL FORM */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Display Name</label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName || ''}
                onChange={handleInputChange}
                placeholder="e.g. Divyanshu"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone || ''}
                onChange={handleInputChange}
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Job Title</label>
              <input
                type="text"
                name="jobTitle"
                value={formData.jobTitle || ''}
                onChange={handleInputChange}
                placeholder="e.g. Chief Accountant"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department || ''}
                onChange={handleInputChange}
                placeholder="e.g. Finance & Billing"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Gender</label>
              <CustomSelect
                options={GENDER_OPTIONS}
                value={formData.gender || ''}
                onChange={(val) => setFormData((prev) => ({ ...prev, gender: val }))}
                placeholder="Select Gender"
                className="h-[38px]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Country</label>
              <input
                type="text"
                name="country"
                value={formData.country || 'India'}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Bio Intro</label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio || ''}
                onChange={handleInputChange}
                placeholder="A short intro about your background..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none resize-none transition placeholder:text-slate-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Street Address</label>
              <input
                type="text"
                name="address"
                value={formData.address || ''}
                onChange={handleInputChange}
                placeholder="123 Business Avenue, Suite 400"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition placeholder:text-slate-400 dark:placeholder:text-gray-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.city || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">State / Province</label>
              <input
                type="text"
                name="state"
                value={formData.state || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-gray-300 mb-1">Postal Code</label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode || ''}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#171424] text-slate-900 dark:text-white text-xs font-medium focus:ring-2 focus:ring-violet-500 outline-none transition"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-5 rounded-full bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white text-xs font-semibold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 py-2.5 px-6 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-violet-600/30 transition-all duration-200 cursor-pointer disabled:opacity-50 hover:scale-[1.02]"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              Save Profile Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalMarkup, document.body);
};
