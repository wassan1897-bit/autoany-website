"use client";

import { useEffect, useState } from "react";
import type { Tweet } from "react-tweet/api";

import {
  TweetNotFound,
  TweetSkeleton,
  VerticalMarqueeClient,
} from "./vertical-marquee-client";
import type { TweetItem } from "./vertical-marquee.types";

export type { TweetItem } from "./vertical-marquee.types";

export interface VerticalMarqueeProps {
  /** Tweet IDs to fetch and display. Skipped when `tweets` already includes resolved items. */
  tweetIds?: string[];
  /** Prebuilt tweets (mock or live). When any item has `tweet`, fetch is skipped. */
  tweets?: TweetItem[];
  /** Number of scrolling columns. @default 2 */
  columns?: 1 | 2;
  /** Scroll duration in seconds per full loop. @default 20 */
  speed?: number;
  /** Vertical gap between cards in px. @default 16 */
  gap?: number;
  /** Height of the fade zone at top and bottom in px. @default 120 */
  blurSize?: number;
  /** Smoothly decelerate to a stop when hovering. @default true */
  pauseOnHover?: boolean;
  className?: string;
  tweetClassName?: string;
}

/** Same host `useTweet` uses in `react-tweet` (syndication `getTweet` is CORS-blocked in the browser). */
const TWEET_HOST = "https://react-tweet.vercel.app";

async function getTweetItem(id: string): Promise<TweetItem> {
  try {
    const res = await fetch(`${TWEET_HOST}/api/tweet/${id}`);
    const json = (await res.json()) as { data?: Tweet | null };
    if (res.ok) return { id, tweet: json.data || undefined };
    console.error(
      `Failed to fetch tweet at "${TWEET_HOST}/api/tweet/${id}" with "${res.status}".`,
    );
    return { id };
  } catch (error) {
    console.error(error);
    return { id };
  }
}

export function VerticalMarquee({
  tweetIds,
  tweets: providedTweets,
  columns = 2,
  speed = 20,
  gap = 16,
  blurSize = 120,
  pauseOnHover = true,
  className,
  tweetClassName,
}: VerticalMarqueeProps) {
  const ids = tweetIds ?? [];
  const hasProvidedTweets = Boolean(providedTweets?.some((item) => item.tweet));
  const [fetched, setFetched] = useState<TweetItem[] | null>(null);
  const tweetKey = ids.join(",");

  useEffect(() => {
    if (!tweetKey || hasProvidedTweets) {
      setFetched(null);
      return;
    }

    const pendingIds = tweetKey.split(",");
    let cancelled = false;
    setFetched(null);
    Promise.all(pendingIds.map((id) => getTweetItem(id))).then((items) => {
      if (!cancelled) setFetched(items);
    });

    return () => {
      cancelled = true;
    };
  }, [tweetKey, hasProvidedTweets]);

  const resolvedFetched = fetched?.filter((item) => item.tweet) ?? [];
  const displayTweets: TweetItem[] | null =
    resolvedFetched.length > 0 && fetched
      ? fetched
      : hasProvidedTweets
        ? (providedTweets ?? null)
        : fetched;

  if (!ids.length && !hasProvidedTweets) {
    return null;
  }

  if (!displayTweets) {
    return (
      <div className="grid h-full gap-4 sm:grid-cols-2">
        {ids.slice(0, Math.min(ids.length, 4)).map((id) => (
          <TweetSkeleton key={id} />
        ))}
      </div>
    );
  }

  if (!displayTweets.some((item) => item.tweet)) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {ids.slice(0, Math.min(ids.length || 4, 4)).map((id) => (
          <TweetNotFound key={id} />
        ))}
      </div>
    );
  }

  return (
    <VerticalMarqueeClient
      tweets={displayTweets}
      columns={columns}
      speed={speed}
      gap={gap}
      blurSize={blurSize}
      pauseOnHover={pauseOnHover}
      className={className}
      tweetClassName={tweetClassName}
    />
  );
}

export {
  MagicTweet,
  TweetBody,
  TweetHeader,
  TweetMedia,
  TweetNotFound,
  TweetSkeleton,
  VerticalMarqueeClient,
} from "./vertical-marquee-client";
