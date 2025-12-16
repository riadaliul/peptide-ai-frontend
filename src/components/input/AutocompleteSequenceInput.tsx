import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Sparkles, AlertCircle, Check } from 'lucide-react';

interface AutocompleteSequenceInputProps {
    sequence: string;
    setSequence: (seq: string) => void;
    onAnalyze: () => void;
}

// Example Sequences Database
const EXAMPLE_SEQUENCES = [
    {
        name: 'Melittin (Bee Venom AMP)',
        sequence: 'GIGAVLKVLTTGLPALISWIKRKRQQ',
        description: 'Antimicrobial peptide from honeybee venom',
        category: 'Antimicrobial',
    },
    {
        name: 'LL-37 (Human)',
        sequence: 'LLGDFFRKSKEKIGKEFKRIVQRIKDFLRNLVPRTES',
        description: 'Human cathelicidin antimicrobial peptide',
        category: 'Antimicrobial',
    },
    {
        name: 'Magainin-2 (Frog)',
        sequence: 'GIGKFLHSAKKFGKAFVGEIMNS',
        description: 'Antimicrobial peptide from African clawed frog',
        category: 'Antimicrobial',
    },
    {
        name: 'Insulin Chain A (Human)',
        sequence: 'GIVEQCCTSICSLYQLENYCN',
        description: 'Human insulin A chain',
        category: 'Hormone',
    },
    {
        name: 'Calmodulin Fragment',
        sequence: 'MADQLTEEQIAEFKEAFSLFDKDGDGTITTKELGTVMRSL',
        description: 'Calcium-binding messenger protein',
        category: 'Signaling',
    },
    {
        name: 'Amyloid Beta (1-40)',
        sequence: 'DAEFRHDSGYEVHHQKLVFFAEDVGSNKGAIIGLMVGGVV',
        description: 'Associated with Alzheimer\'s disease',
        category: 'Aggregation',
    },
];

export const AutocompleteSequenceInput: React.FC<AutocompleteSequenceInputProps> = ({
    sequence,
    setSequence,
    onAnalyze,
}) => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Filter examples based on search
    const filteredExamples = EXAMPLE_SEQUENCES.filter(
        (ex) =>
            ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ex.sequence.includes(searchTerm.toUpperCase()) ||
            ex.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Validate sequence
    const validateSequence = (seq: string): string | null => {
        if (seq.length === 0) return null;
        if (seq.length < 5) return 'Sequence too short (minimum 5 residues)';
        if (seq.length > 100) return 'Sequence too long (maximum 100 residues)';
        const invalidChars = seq.match(/[^ACDEFGHIKLMNPQRSTVWY]/g);
        if (invalidChars) {
            return `Invalid characters: ${Array.from(new Set(invalidChars)).join(', ')}`;
        }
        return null;
    };

    const handleInputChange = (value: string) => {
        const filtered = value.toUpperCase().replace(/[^ACDEFGHIKLMNPQRSTVWY]/g, '');
        setSequence(filtered);
        setSearchTerm(filtered);
        setValidationError(validateSequence(filtered));

        if (filtered.length > 0) {
            setIsDropdownOpen(true);
        }
    };

    const selectExample = (example: typeof EXAMPLE_SEQUENCES[0]) => {
        setSequence(example.sequence);
        setSearchTerm('');
        setIsDropdownOpen(false);
        setValidationError(null);
        inputRef.current?.blur();
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                !inputRef.current?.contains(event.target as Node)
            ) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isValidSequence = sequence.length >= 5 && !validationError;

    return (
        <div className="relative w-full">
            {/* Input Container */}
            <div className={`
        relative flex items-stretch bg-white/90 backdrop-blur-xl rounded-2xl
        border-2 transition-all duration-300
        ${isFocused
                    ? 'border-indigo-400 shadow-lg shadow-indigo-500/20'
                    : 'border-white/40 shadow-md'
                }
        ${validationError && sequence.length > 0 ? 'border-red-400' : ''}
      `}>
                {/* Search Icon */}
                <div className="flex items-center pl-6 pr-3">
                    <Search className={`w-6 h-6 transition-colors ${isFocused ? 'text-indigo-500' : 'text-gray-400'}`} />
                </div>

                {/* Input Field */}
                <div className="flex-1 py-5 pr-4 relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={sequence}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onFocus={() => {
                            setIsFocused(true);
                            if (sequence.length === 0) setIsDropdownOpen(true);
                        }}
                        onBlur={() => setIsFocused(false)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && isValidSequence) {
                                onAnalyze();
                                setIsDropdownOpen(false);
                            }
                        }}
                        placeholder="Enter peptide sequence or search examples..."
                        className="w-full bg-transparent text-lg font-mono font-semibold text-gray-900
                     placeholder:text-gray-400 placeholder:font-normal
                     focus:outline-none"
                    />

                    {/* Character Count & Validation */}
                    {sequence.length > 0 && (
                        <div className="absolute right-0 top-1 flex items-center gap-2">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${validationError
                                    ? 'text-red-600 bg-red-50'
                                    : 'text-green-600 bg-green-50'
                                }`}>
                                {validationError ? (
                                    <span className="flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" />
                                        {sequence.length} AA
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1">
                                        <Check className="w-3 h-3" />
                                        {sequence.length} AA
                                    </span>
                                )}
                            </span>
                        </div>
                    )}
                </div>

                {/* Examples Trigger Button */}
                <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="px-4 text-gray-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
                >
                    <Sparkles className="w-4 h-4" />
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Analyze Button */}
                <button
                    onClick={onAnalyze}
                    disabled={!isValidSequence}
                    className={`
            relative px-10 py-5 rounded-r-2xl font-semibold text-lg transition-all duration-300
            ${isValidSequence
                            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }
          `}
                >
                    {isValidSequence && (
                        <motion.div
                            className="absolute inset-0 rounded-r-2xl bg-gradient-to-r from-white/0 via-white/30 to-white/0 pointer-events-none"
                            animate={{ x: ['-100%', '200%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                        />
                    )}
                    <span className="relative z-10">ANALYZE</span>
                </button>
            </div>

            {/* Validation Error Message */}
            <AnimatePresence>
                {validationError && sequence.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 top-full mt-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center gap-2"
                    >
                        <AlertCircle className="w-4 h-4" />
                        {validationError}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl border border-gray-200 shadow-2xl overflow-hidden z-50"
                    >
                        <div className="max-h-[400px] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-indigo-600" />
                                    Example Sequences
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">Click to load a pre-defined peptide sequence</p>
                            </div>

                            {/* Examples List */}
                            <div className="p-2">
                                {filteredExamples.length > 0 ? (
                                    filteredExamples.map((example, idx) => (
                                        <motion.button
                                            key={idx}
                                            onClick={() => selectExample(example)}
                                            whileHover={{ x: 4 }}
                                            className="w-full text-left p-4 rounded-xl hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                            {example.name}
                                                        </h4>
                                                        <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-full">
                                                            {example.category}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-2">{example.description}</p>
                                                    <div className="font-mono text-xs text-gray-800 bg-gray-50 px-2 py-1 rounded truncate">
                                                        {example.sequence}
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        Length: {example.sequence.length} residues
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.button>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <p>No matching sequences found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
