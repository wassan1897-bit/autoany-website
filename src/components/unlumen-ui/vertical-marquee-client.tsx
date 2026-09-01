"use client";

import * as React from "react";
import { enrichTweet, type EnrichedTweet } from "react-tweet";

import type { Tweet } from "react-tweet/api";

import { cn } from "../../lib/cn";

import type { TweetItem } from "./vertical-marquee.types";
import "./vertical-marquee.css";

export const truncate = (str: string | null, length: number) => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length - 3)}...`;
};

const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("rounded-md bg-primary/10", className)} {...props} />
  );
};

export const TweetSkeleton = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) => (
  <div
    className={cn(
      "flex size-full max-h-max min-w-72 flex-col gap-3 rounded-2xl border border-stroke/55 bg-raised/90 p-4",
      className,
    )}
    {...props}
  >
    <div className="flex flex-row gap-3">
      <Skeleton className="size-11 shrink-0 rounded-full" />
      <Skeleton className="h-11 w-full" />
    </div>
    <Skeleton className="h-24 w-full" />
    <Skeleton className="h-44 w-full rounded-2xl" />
  </div>
);

export const TweetNotFound = ({
  className,
  ...props
}: {
  className?: string;
  [key: string]: unknown;
}) => (
  <div
    className={cn(
      "flex min-h-56 size-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-stroke/70 bg-raised/40 p-6 text-center",
      className,
    )}
    {...props}
  >
    <h3 className="text-base font-medium">Tweet not found</h3>
    <p className="text-muted-foreground text-sm">
      This post could not be loaded.
    </p>
  </div>
);

export const TweetHeader = ({ tweet }: { tweet: EnrichedTweet }) => (
  <div className="flex flex-row items-center tracking-normal">
    <div className="flex items-center space-x-3">
      <img
        title={`Profile picture of ${tweet.user.name}`}
        alt={tweet.user.name}
        height={48}
        width={48}
        src={tweet.user.profile_image_url_https}
        className="size-12 shrink-0 overflow-hidden rounded-full"
      />
      <div className="font-medium whitespace-nowrap text-foreground">
        {truncate(tweet.user.name, 28)}
      </div>
    </div>
  </div>
);

export const TweetBody = ({ tweet }: { tweet: EnrichedTweet }) => (
  <div className="whitespace-pre-wrap break-words text-[15px] leading-relaxed tracking-normal">
    {tweet.entities.map((entity, idx) => {
      switch (entity.type) {
        case "url":
        case "symbol":
        case "hashtag":
        case "mention":
          return (
            <a
              key={idx}
              href={entity.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground text-[15px] font-normal transition-colors"
            >
              <span>{entity.text}</span>
            </a>
          );
        case "text":
          return (
            <span
              key={idx}
              className="text-foreground text-[15px] font-normal"
              dangerouslySetInnerHTML={{ __html: entity.text }}
            />
          );
        default:
          return null;
      }
    })}
  </div>
);

function getCardThumbnail(tweet: unknown) {
  const card = tweet as {
    card?: {
      binding_values?: {
        thumbnail_image_large?: {
          image_value?: {
            url?: string;
          };
        };
      };
    };
  };

  return card.card?.binding_values?.thumbnail_image_large?.image_value?.url;
}

function getBestVideoSource(tweet: EnrichedTweet) {
  const variants = tweet.video?.variants ?? [];
  const mp4Variants = variants.filter((variant) =>
    variant.src.includes(".mp4"),
  );

  return (
    mp4Variants.at(-1)?.src ?? variants.find((variant) => variant.src)?.src
  );
}

function normalizeTweet(tweet: Tweet): Tweet {
  return {
    ...tweet,
    display_text_range: [...tweet.display_text_range],
    entities: {
      hashtags: tweet.entities?.hashtags ?? [],
      urls: tweet.entities?.urls ?? [],
      user_mentions: tweet.entities?.user_mentions ?? [],
      symbols: tweet.entities?.symbols ?? [],
      media: tweet.entities?.media,
    },
    quoted_tweet: tweet.quoted_tweet
      ? normalizeQuotedTweet(tweet.quoted_tweet)
      : undefined,
  };
}

function normalizeQuotedTweet(
  tweet: NonNullable<Tweet["quoted_tweet"]>,
): NonNullable<Tweet["quoted_tweet"]> {
  return {
    ...tweet,
    display_text_range: [...tweet.display_text_range],
    entities: {
      hashtags: tweet.entities?.hashtags ?? [],
      urls: tweet.entities?.urls ?? [],
      user_mentions: tweet.entities?.user_mentions ?? [],
      symbols: tweet.entities?.symbols ?? [],
      media: tweet.entities?.media,
    },
  };
}

export const TweetMedia = ({ tweet }: { tweet: EnrichedTweet }) => {
  const thumbnail = getCardThumbnail(tweet);
  const videoSource = getBestVideoSource(tweet);

  if (!tweet.video && !tweet.photos?.length && !thumbnail) {
    return null;
  }

  return (
    <div className="flex flex-1 items-center justify-center">
      {tweet.video ? (
        <video
          poster={tweet.video.poster}
          autoPlay
          loop
          muted
          playsInline
          className="w-full rounded-2xl border border-border/60"
        >
          {videoSource ? <source src={videoSource} type="video/mp4" /> : null}
          Your browser does not support the video tag.
        </video>
      ) : tweet.photos?.length ? (
        <div className="relative flex w-full snap-x snap-mandatory gap-3 overflow-x-auto pb-1">
          {tweet.photos.map((photo) => (
            <img
              key={photo.url}
              src={photo.url}
              width={photo.width}
              height={photo.height}
              title={`Photo by ${tweet.user.name}`}
              alt={tweet.text}
              className="h-64 w-[88%] shrink-0 snap-center rounded-2xl border border-border/60 object-cover"
            />
          ))}
        </div>
      ) : (
        <img
          src={thumbnail}
          className="h-64 w-full rounded-2xl border border-border/60 object-cover"
          alt={tweet.text}
        />
      )}
    </div>
  );
};

export const MagicTweet = ({
  tweet,
  className,
  ...props
}: {
  tweet: Tweet;
  className?: string;
}) => {
  let enrichedTweet: EnrichedTweet;
  try {
    enrichedTweet = enrichTweet(normalizeTweet(tweet));
  } catch {
    return <TweetNotFound className={className} />;
  }

  return (
    <article
      className={cn(
        "relative flex h-fit w-full flex-col gap-4 overflow-hidden rounded-2xl border border-stroke/55 bg-raised p-5",
        className,
      )}
      {...props}
    >
      <TweetHeader tweet={enrichedTweet} />
      <TweetBody tweet={enrichedTweet} />
      <TweetMedia tweet={enrichedTweet} />
    </article>
  );
};

interface ColumnProps {
  tweets: TweetItem[];
  speed: number;
  gap: number;
  reverse?: boolean;
  paused: boolean;
  tweetClassName?: string;
}

function MarqueeColumn({
  tweets,
  speed,
  gap,
  reverse = false,
  paused,
  tweetClassName,
}: ColumnProps) {
  const doubled = [...tweets, ...tweets];

  return (
    <div className="nk-review-col">
      <div
        className={cn(
          "nk-review-track",
          reverse && "nk-review-track--reverse",
          paused && "nk-review-track--paused",
        )}
        style={{ animationDuration: `${Math.max(speed, 12)}s` }}
      >
        {doubled.map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            style={{ marginBottom: `${gap}px` }}
            className="w-full"
          >
            {item.tweet ? (
              <MagicTweet tweet={item.tweet} className={tweetClassName} />
            ) : (
              <TweetNotFound className={tweetClassName} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VerticalMarqueeClient({
  tweets,
  columns = 2,
  speed = 20,
  gap = 16,
  blurSize = 120,
  pauseOnHover = true,
  paused: pausedProp = false,
  className,
  tweetClassName,
}: {
  tweets: TweetItem[];
  columns?: 1 | 2;
  speed?: number;
  gap?: number;
  blurSize?: number;
  pauseOnHover?: boolean;
  /** Pause tracks while the section is offscreen (keeps feature, saves CPU). */
  paused?: boolean;
  className?: string;
  tweetClassName?: string;
}) {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = React.useState(false);

  const paused = pausedProp || Boolean(pauseOnHover && hovered);

  const mid = Math.ceil(tweets.length / 2);
  const col1 = columns === 2 ? tweets.slice(0, mid) : tweets;
  const col2 = columns === 2 ? tweets.slice(mid) : tweets;

  return (
    <div
      ref={rootRef}
      className={cn("relative h-full w-full overflow-hidden", className)}
      onMouseEnter={() => pauseOnHover && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="flex h-full w-full justify-center"
        style={{ gap: `${gap}px` }}
      >
        <MarqueeColumn
          tweets={col1.length ? col1 : tweets}
          speed={speed}
          gap={gap}
          paused={paused}
          tweetClassName={tweetClassName}
        />
        {columns === 2 && (
          <MarqueeColumn
            tweets={col2.length ? col2 : tweets}
            speed={speed * 1.25}
            gap={gap}
            reverse
            paused={paused}
            tweetClassName={tweetClassName}
          />
        )}
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 bg-gradient-to-b from-black to-transparent"
        style={{ height: blurSize }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black to-transparent"
        style={{ height: blurSize }}
      />
    </div>
  );
}
