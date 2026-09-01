import { motion, useReducedMotion } from "framer-motion";
import { useRef, useSyncExternalStore } from "react";
import type { Tweet } from "react-tweet/api";

import { CLIENT_REVIEWS } from "../lib/client-reviews";
import { VerticalMarqueeClient } from "./unlumen-ui/vertical-marquee-client";
import type { TweetItem } from "./unlumen-ui/vertical-marquee.types";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function initialsAvatar(initials: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="32" fill="%23111111"/><text x="32" y="39" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="18" font-weight="600" fill="%23f5f5f5">${initials}</text></svg>`;
  return `data:image/svg+xml,${svg}`;
}

function makeTweet(
  id: string,
  name: string,
  handle: string,
  initials: string,
  text: string,
): Tweet {
  return {
    __typename: "Tweet",
    lang: "en",
    favorite_count: 0,
    created_at: "2024-01-01T12:00:00.000Z",
    display_text_range: [0, text.length] as [number, number],
    entities: {
      hashtags: [],
      urls: [],
      user_mentions: [],
      symbols: [],
      media: [],
    },
    id_str: id,
    text,
    user: {
      id_str: id,
      name,
      screen_name: handle,
      profile_image_url_https: initialsAvatar(initials),
      profile_image_shape: "Circle",
      verified: false,
      is_blue_verified: false,
    },
    edit_control: {
      edit_tweet_ids: [id],
      editable_until_msecs: "0",
      is_edit_eligible: false,
      edits_remaining: "0",
    },
    isEdited: false,
    isStaleEdit: false,
    conversation_count: 0,
    news_action_type: "conversation",
  };
}

const REVIEW_TWEETS: TweetItem[] = CLIENT_REVIEWS.map((review) => ({
  id: review.id,
  tweet: makeTweet(
    review.id,
    review.name,
    review.handle,
    review.initials,
    review.quote,
  ),
}));

function subscribeMarqueeColumns(onStoreChange: () => void) {
  const mq = window.matchMedia("(min-width: 768px)");
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getMarqueeColumns() {
  return window.matchMedia("(min-width: 768px)").matches ? 2 : 1;
}

export default function ClientReviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const marqueeColumns = useSyncExternalStore(
    subscribeMarqueeColumns,
    getMarqueeColumns,
    () => 1 as 1 | 2,
  );

  return (
    <section
      ref={sectionRef}
      id="reviews"
      className="relative flex flex-col bg-black py-16 md:py-24"
      aria-labelledby="reviews-heading"
    >
      <div className="mx-auto w-full max-w-7xl px-6 text-center mb-12">
        <motion.h2
          id="reviews-heading"
          className="text-3xl md:text-5xl font-medium tracking-tight text-white"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20 }}
          whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          What our clients say
        </motion.h2>
      </div>

      <motion.div
        className="h-[600px] w-full max-w-5xl mx-auto px-4 md:px-6"
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 30 }}
        whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
      >
        <VerticalMarqueeClient
          tweets={REVIEW_TWEETS}
          columns={marqueeColumns}
          pauseOnHover={true}
          speed={25}
          className="h-full"
          tweetClassName="rounded-2xl border border-white/10 bg-white/5 px-6 py-6 shadow-none"
        />
      </motion.div>
    </section>
  );
}
