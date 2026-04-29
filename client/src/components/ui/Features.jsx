import { Zap, Brain, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

const Features = () => {
    return (
        <section className="py-24 bg-white px-4 sm:px-6 lg:px-8 relative overflow-hidden border-t border-gray-50">
            {/* Subtle Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-indigo-50 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-blue-50 rounded-full blur-3xl opacity-50" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight"
                    >
                        Supercharge your <span className="text-blue-600">learning workflow</span>
                    </motion.h2>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium">
                        Everything you need to consume knowledge faster and retain it longer.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Feature 1 */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="p-8 rounded-3xl bg-white border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-12px_rgba(79,70,229,0.1)] transition-all duration-300 group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                            <Zap size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">AI Magic Summaries</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Too long to read? Our custom AI engine extracts the most critical information instantly, saving you hours of reading time.
                        </p>
                    </motion.div>

                    {/* Feature 2 */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="p-8 rounded-3xl bg-white border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-12px_rgba(147,51,234,0.1)] transition-all duration-300 group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                            <Brain size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Intelligent Hints</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Stuck on a tricky assignment? Ask the AI for a gentle nudge. It guides you to the logic without solving it for you.
                        </p>
                    </motion.div>

                    {/* Feature 3 */}
                    <motion.div
                        whileHover={{ y: -10 }}
                        className="p-8 rounded-3xl bg-white border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-12px_rgba(249,115,22,0.1)] transition-all duration-300 group"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors duration-300">
                            <Trophy size={28} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Global Leaderboard</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Compete with learners worldwide. Climb the ranks by maintaining high accuracy and completing assignments efficiently.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Features;