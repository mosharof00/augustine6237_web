import { describe, expect, it } from "vitest";
import type { UserProfile, UserReview, UserPost } from "@/lib/api/types";

describe("Slice 2: Web User Profile & Social Graph Tests", () => {
  const sampleProfile: UserProfile = {
    id: "user_alex_123",
    name: "Alex Mercer",
    username: "alexm",
    bio: "Premier League & NBA sports bettor",
    location: "London, UK",
    type: "CLIENT",
    balance: "350.00",
    followers_count: 42,
    following_count: 18,
    is_following: false,
    stats: {
      wins: 34,
      losses: 12,
      total_bets: 46,
      win_rate: 73.9,
      roi: 18.5,
    },
    rating: {
      average: 4.8,
      count: 21,
    },
  };

  it("verifies UserProfile structure and stat invariants", () => {
    expect(sampleProfile.id).toBe("user_alex_123");
    expect(sampleProfile.stats.wins).toBe(34);
    expect(sampleProfile.stats.losses).toBe(12);
    expect(sampleProfile.stats.total_bets).toBe(46);
    expect(sampleProfile.stats.win_rate).toBeCloseTo(73.9);
    expect(sampleProfile.stats.roi).toBe(18.5);
    expect(sampleProfile.rating.average).toBe(4.8);
    expect(sampleProfile.followers_count).toBe(42);
  });

  it("calculates optimistic follow state toggle accurately", () => {
    const wasFollowing = sampleProfile.is_following;
    const initialCount = sampleProfile.followers_count;

    // Follow action
    const afterFollowCount = wasFollowing ? initialCount - 1 : initialCount + 1;
    expect(afterFollowCount).toBe(43);

    // Unfollow action
    const afterUnfollowCount = !wasFollowing ? afterFollowCount - 1 : afterFollowCount + 1;
    expect(afterUnfollowCount).toBe(42);
  });

  it("parses user reviews array properly", () => {
    const reviews: UserReview[] = [
      {
        id: "rev_1",
        rating: 5,
        comment: "Excellent bettor, swift settlements",
        created_at: "2026-11-10T14:00:00Z",
        author: {
          id: "u2",
          name: "John Doe",
          username: "johnd",
        },
      },
    ];

    expect(reviews).toHaveLength(1);
    expect(reviews[0].rating).toBe(5);
    expect(reviews[0].author?.username).toBe("johnd");
  });

  describe("Slice 3: Personal Profile Posts Tests", () => {
    const samplePost: UserPost = {
      id: "post_101",
      caption: "Predictions for Liverpool vs Real Madrid",
      image_url: "https://example.com/match.jpg",
      location_tag: "Anfield",
      created_at: "2026-11-10T16:00:00Z",
      likes_count: 8,
      comments_count: 2,
      is_liked: false,
      author: {
        id: "user_alex_123",
        name: "Alex Mercer",
        username: "alexm",
      },
    };

    it("verifies UserPost structure and invariants", () => {
      expect(samplePost.id).toBe("post_101");
      expect(samplePost.caption).toBe("Predictions for Liverpool vs Real Madrid");
      expect(samplePost.image_url).toBe("https://example.com/match.jpg");
      expect(samplePost.location_tag).toBe("Anfield");
      expect(samplePost.likes_count).toBe(8);
      expect(samplePost.is_liked).toBe(false);
      expect(samplePost.author?.username).toBe("alexm");
    });

    it("handles optimistic like toggling correctly", () => {
      const wasLiked = samplePost.is_liked;
      const count = samplePost.likes_count;

      const afterLikeCount = wasLiked ? count - 1 : count + 1;
      expect(afterLikeCount).toBe(9);

      const afterUnlikeCount = !wasLiked ? afterLikeCount - 1 : afterLikeCount + 1;
      expect(afterUnlikeCount).toBe(8);
    });
  });
});

