import React from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "motion/react";
import OptimizedImage from "./OptimizedImage";
import { getEffectQuality } from "../../lib/performance";

export type HeroParallaxProduct = {
  title: string;
  link: string;
  thumbnail: string;
  fit?: "contain" | "cover";
  objectPosition?: string;
};

export const HeroParallax = ({
  products,
}: {
  products: HeroParallaxProduct[];
}) => {
  const firstRow = products.slice(0, 5);
  const secondRow = products.slice(5, 10);
  const thirdRow = products.slice(10, 15);
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const quality = getEffectQuality();
  const springConfig =
    quality === "high"
      ? { stiffness: 300, damping: 30, bounce: 100 }
      : quality === "medium"
        ? { stiffness: 240, damping: 34, bounce: 72 }
        : { stiffness: 200, damping: 40, bounce: 0 };

  // Springs keep integrating after the scroll stops, so only the horizontal
  // drift - where the overshoot is actually visible - gets one. The rest scrub
  // straight off scroll progress and settle the moment the user does.
  const translateX = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, 900]),
    springConfig,
  );
  const translateXReverse = useSpring(
    useTransform(scrollYProgress, [0, 1], [0, -900]),
    springConfig,
  );
  const rotateX = useTransform(scrollYProgress, [0, 0.18], [12, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.18], [0.25, 1]);
  const rotateZ = useTransform(scrollYProgress, [0, 0.18], [14, 0]);
  const translateY = useTransform(scrollYProgress, [0, 0.22], [-160, 40]);

  return (
    <div
      ref={ref}
      id="work"
      className="relative overflow-x-hidden bg-black pt-16 pb-16 antialiased [perspective:1000px] [transform-style:preserve-3d] md:pt-20 md:pb-20"
    >
      <Header />
      <motion.div
        style={{
          rotateX,
          rotateZ,
          translateY,
          opacity,
        }}
        className="pb-4"
      >
        <motion.div className="mb-8 flex flex-row-reverse space-x-14 space-x-reverse md:mb-10 md:space-x-16 md:space-x-reverse">
          {firstRow.map((product, i) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={`${product.link}-r1-${i}`}
            />
          ))}
        </motion.div>
        <motion.div className="mb-8 flex flex-row space-x-14 md:mb-10 md:space-x-16">
          {secondRow.map((product, i) => (
            <ProductCard
              product={product}
              translate={translateXReverse}
              key={`${product.link}-r2-${i}`}
            />
          ))}
        </motion.div>
        <motion.div className="flex flex-row-reverse space-x-14 space-x-reverse md:space-x-16 md:space-x-reverse">
          {thirdRow.map((product, i) => (
            <ProductCard
              product={product}
              translate={translateX}
              key={`${product.link}-r3-${i}`}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export const Header = () => {
  return (
    <div className="relative top-0 left-0 mx-auto w-full max-w-7xl shrink-0 px-4 py-8 md:px-10 md:py-14">
      <h2
        id="work-heading"
        className="text-2xl font-bold text-white md:text-7xl"
      >
        Selected <br />
        <span className="font-display italic">work</span>
      </h2>
      <p className="mt-5 max-w-2xl text-base text-neutral-200 md:mt-6 md:text-xl">
        Systems already in production - open a still to see the workflow.
      </p>
    </div>
  );
};

export const ProductCard = ({
  product,
  translate,
}: {
  product: HeroParallaxProduct;
  translate: MotionValue<number>;
}) => {
  const fit = product.fit ?? "contain";

  return (
    <motion.div
      style={{ x: translate }}
      whileHover={{ y: -16 }}
      className="group/product relative h-64 w-[24rem] shrink-0 md:h-72 md:w-[27rem]"
    >
      <Link
        to={product.link}
        className="block h-full w-full group-hover/product:shadow-2xl"
      >
        <OptimizedImage
          src={product.thumbnail}
          height={600}
          width={600}
          loading="lazy"
          className={
            fit === "cover"
              ? "absolute inset-0 h-full w-full object-cover object-left-top"
              : "absolute inset-0 h-full w-full object-contain object-left-top"
          }
          style={{ objectPosition: product.objectPosition }}
          alt={product.title}
        />
      </Link>
      <div className="pointer-events-none absolute inset-0 h-full w-full bg-black opacity-0 group-hover/product:opacity-80" />
      <h2 className="absolute bottom-4 left-4 text-white opacity-0 group-hover/product:opacity-100">
        {product.title}
      </h2>
    </motion.div>
  );
};
