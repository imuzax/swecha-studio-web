import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirm', cancelText = 'Cancel', confirmStyle = 'danger' }) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#E8E4DC] shadow-xl"
                >
                    <h3 className="text-lg font-serif text-gray-800 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>

                    <div className="flex justify-end gap-3 pt-3 border-t border-[#E8E4DC]">
                        <button 
                            type="button" 
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button 
                            type="button" 
                            onClick={onConfirm}
                            className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-colors shadow-sm ${confirmStyle === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#C1633D] hover:bg-[#A85331]'}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
