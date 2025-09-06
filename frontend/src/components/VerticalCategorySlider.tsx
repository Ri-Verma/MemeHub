import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Category {
  id: number;
  name: string;
  image: string;
}

const categories: Category[] = [
  {
    id: 1,
    name: "Historical Events",
    image:
      "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1600&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Science & Technology",
    image:
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1600&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Food & Cooking",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Gym & Fitness",
    image:
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Animals",
    image:
      "https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?w=1600&auto=format&fit=crop",
  },
];

const transitionDuration = 0.8;

const CategorySlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide
  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const goToNext = () =>
    setCurrentIndex((prev) => (prev + 1) % categories.length);

  const goToPrev = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + categories.length) % categories.length
    );

  return (
    <div className="relative w-full h-72 md:h-[28rem] overflow-hidden rounded-2xl shadow-xl mb-10 group">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={categories[currentIndex].id}
          className="absolute inset-0 w-full h-full"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: transitionDuration, ease: "easeInOut" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(_, info) => {
            if (info.offset.x > 100) goToPrev();
            else if (info.offset.x < -100) goToNext();
          }}
        >
          <img
            src={categories[currentIndex].image}
            alt={categories[currentIndex].name}
            className="w-full h-full object-cover"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          {/* Text */}
          <motion.div
            className="absolute bottom-10 left-10 text-white"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{ duration: transitionDuration, ease: "easeOut" }}
          >
            <h2 className="text-3xl md:text-5xl font-extrabold drop-shadow-lg">
              {categories[currentIndex].name}
            </h2>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {categories.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 
              ${index === currentIndex ? "bg-white scale-125" : "bg-white/40"}`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Arrow buttons (hidden until hover on desktop) */}
      <button
        onClick={goToPrev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
      >
        ◀
      </button>
      <button
        onClick={goToNext}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
      >
        ▶
      </button>
    </div>
  );
};

export default CategorySlider;
