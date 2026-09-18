import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Accordion({ title, children, defaultOpen = false }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="border border-gray-300 rounded-2xl mb-4 bg-transparent overflow-hidden">
            <button
                className="w-full py-4 px-6 flex justify-between items-center focus:outline-none transition-colors duration-300 hover:bg-gray-50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex items-center text-gray-900">
                    <span className="mr-2 text-lg leading-none">✦</span>
                    <span className="font-semibold text-[15px]">{title}</span>
                </div>
                <motion.svg
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="w-3 h-3 text-gray-400 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                </motion.svg>
            </button>
            
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                    >
                        <div className="px-6 pb-5 pt-1 text-gray-600 text-[15px] leading-relaxed">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
