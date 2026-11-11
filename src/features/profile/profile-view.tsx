"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSession } from "@/lib/auth/session";
import {
  getUserProfile,
  toggleFollowUser,
  getUserReviews,
} from "@/lib/api/profile";
import {
  getUserPosts,
  deletePost,
  toggleLikePost,
} from "@/lib/api/posts";
import type { UserProfile, UserReview, UserPost } from "@/lib/api/types";
import { ProfileStatsCard } from "./profile-stats-card";
import { ReviewModal } from "./review-modal";
import { CreatePostModal } from "./create-post-modal";
import {
  UserPlus,
  UserCheck,
  Star,
  MessageSquare,
  MapPin,
  Wallet,
  ShieldCheck,
  RefreshCw,
  PlusCircle,
  Heart,
  Trash2,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

export function ProfileView({ userId }: { userId?: string }) {
  const queryClient = useQueryClient();
  const { user: currentUser } = useSession();
  const effectiveUserId = userId || currentUser?.id;

  const [isFollowingPending, setIsFollowingPending] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "posts" | "reviews">("overview");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

  const isOwnProfile = !userId || userId === currentUser?.id;

  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile,
  } = useQuery<UserProfile>({
    queryKey: ["user-profile", effectiveUserId],
    queryFn: () => getUserProfile(effectiveUserId!),
    enabled: Boolean(effectiveUserId),
  });

  const {
    data: posts = [],
    refetch: refetchPosts,
  } = useQuery<UserPost[]>({
    queryKey: ["user-posts", effectiveUserId],
    queryFn: () => getUserPosts(effectiveUserId!),
    enabled: Boolean(effectiveUserId),
  });

  const {
    data: reviews = [],
    refetch: refetchReviews,
  } = useQuery<UserReview[]>({
    queryKey: ["user-reviews", effectiveUserId],
    queryFn: () => getUserReviews(effectiveUserId!),
    enabled: Boolean(effectiveUserId),
  });

  async function handleToggleFollow() {
    if (!profile || isFollowingPending) return;

    const previousProfile = profile;
    const wasFollowing = profile.is_following;
    const optimisticCount = wasFollowing
      ? Math.max(0, profile.followers_count - 1)
      : profile.followers_count + 1;

    // Optimistic update in cache
    queryClient.setQueryData<UserProfile>(
      ["user-profile", effectiveUserId],
      {
        ...profile,
        is_following: !wasFollowing,
        followers_count: optimisticCount,
      },
    );

    try {
      setIsFollowingPending(true);
      const res = await toggleFollowUser(profile.id);
      queryClient.setQueryData<UserProfile>(
        ["user-profile", effectiveUserId],
        (prev) =>
          prev
            ? {
                ...prev,
                is_following: res.is_following,
                followers_count: res.followers_count,
              }
            : prev,
      );
    } catch (err: unknown) {
      // Revert cache on error
      queryClient.setQueryData(["user-profile", effectiveUserId], previousProfile);
      toast.error(
        err instanceof Error ? err.message : "Unable to update follow status",
      );
    } finally {
      setIsFollowingPending(false);
    }
  }

  async function handleDeletePost(postId: string) {
    const prevPosts = posts;
    queryClient.setQueryData<UserPost[]>(
      ["user-posts", effectiveUserId],
      posts.filter((p) => p.id !== postId),
    );

    try {
      await deletePost(postId);
      toast.success("Post deleted");
    } catch (err: unknown) {
      queryClient.setQueryData(["user-posts", effectiveUserId], prevPosts);
      toast.error(
        err instanceof Error ? err.message : "Failed to delete post",
      );
    }
  }

  async function handleToggleLikePost(postId: string) {
    const prevPosts = posts;
    const postIndex = posts.findIndex((p) => p.id === postId);
    if (postIndex === -1) return;

    const targetPost = posts[postIndex];
    const wasLiked = targetPost.is_liked;
    const optimisticCount = wasLiked
      ? Math.max(0, targetPost.likes_count - 1)
      : targetPost.likes_count + 1;

    const updated = [...posts];
    updated[postIndex] = {
      ...targetPost,
      is_liked: !wasLiked,
      likes_count: optimisticCount,
    };
    queryClient.setQueryData(["user-posts", effectiveUserId], updated);

    try {
      const res = await toggleLikePost(postId);
      const synced = [...posts];
      synced[postIndex] = {
        ...targetPost,
        is_liked: res.is_liked,
        likes_count: res.likes_count,
      };
      queryClient.setQueryData(["user-posts", effectiveUserId], synced);
    } catch {
      queryClient.setQueryData(["user-posts", effectiveUserId], prevPosts);
    }
  }

  if (isProfileLoading && !profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-sky-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-6 bg-card rounded-2xl border border-border/40">
        <p className="text-muted-foreground mb-4">Profile not found</p>
        <button
          type="button"
          onClick={() => void refetchProfile()}
          className="px-4 py-2 rounded-xl bg-sky-500 text-white font-medium hover:bg-sky-400 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-6 px-4 sm:px-6">
      {/* 1. Header Card */}
      <div className="rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-3xl font-extrabold text-white shadow-lg">
              {profile.name ? profile.name[0].toUpperCase() : "B"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-foreground">
                  {profile.name}
                </h1>
                <ShieldCheck className="w-5 h-5 text-sky-400" />
              </div>
              {profile.username && (
                <p className="text-sm font-medium text-sky-400">
                  @{profile.username}
                </p>
              )}
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1 max-w-md">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isOwnProfile ? (
              <button
                type="button"
                onClick={() => setIsCreatePostModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 text-white hover:bg-sky-400 font-semibold text-sm shadow-md shadow-sky-500/20 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                New Post
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleToggleFollow}
                  disabled={isFollowingPending}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                    profile.is_following
                      ? "border border-border/60 bg-white/5 text-foreground hover:bg-white/10"
                      : "bg-sky-500 text-white hover:bg-sky-400 shadow-md shadow-sky-500/20"
                  }`}
                >
                  {profile.is_following ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-400" />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Follow
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/60 bg-white/5 text-foreground hover:bg-white/10 text-sm font-medium transition-colors"
                >
                  <Star className="w-4 h-4 text-amber-400" />
                  Review
                </button>
              </>
            )}
          </div>
        </div>

        {/* Counts & Meta */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/30">
          <div>
            <div className="text-lg font-bold text-foreground">
              {profile.followers_count}
            </div>
            <div className="text-xs text-muted-foreground">Followers</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">
              {profile.following_count}
            </div>
            <div className="text-xs text-muted-foreground">Following</div>
          </div>
          <div>
            <div className="flex items-center gap-1 text-lg font-bold text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              {profile.rating.count > 0
                ? profile.rating.average.toFixed(1)
                : "—"}
            </div>
            <div className="text-xs text-muted-foreground">
              {profile.rating.count} Reviews
            </div>
          </div>
          {profile.balance !== undefined && isOwnProfile && (
            <div>
              <div className="flex items-center gap-1 text-lg font-bold text-emerald-400">
                <Wallet className="w-4 h-4" />
                ${profile.balance}
              </div>
              <div className="text-xs text-muted-foreground">Wallet Balance</div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Betting Performance Stats Grid */}
      <ProfileStatsCard profile={profile} />

      {/* 3. Navigation Tabs */}
      <div className="flex border-b border-border/40 space-x-6">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "overview"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Overview & Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "posts"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Profile Posts ({posts.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reviews")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === "reviews"
              ? "border-sky-500 text-sky-400"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Reviews & Trust ({reviews.length})
        </button>
      </div>

      {/* 4. Tab Content */}
      {activeTab === "overview" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border/40 bg-card p-5 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Profile Details
            </h4>
            {profile.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-sky-400" />
                <span>{profile.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Verified P2P Bettor</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-card p-5 space-y-3">
            <h4 className="text-sm font-semibold text-foreground">
              Betting Highlights
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Maintains an active match history with automated escrow payouts
              and verified results across sports and politics predictions.
            </p>
          </div>
        </div>
      ) : activeTab === "posts" ? (
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-border/40 bg-card p-6">
              <Camera className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                No profile posts yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Personal posts live strictly on this profile tab.
              </p>
              {isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setIsCreatePostModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 transition-colors"
                >
                  Create First Post
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-sm"
              >
                <div className="p-4 flex items-center justify-between border-b border-border/20">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                      {post.author?.name ? post.author.name[0].toUpperCase() : "B"}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        {post.author?.name ?? "Bettor"}
                      </div>
                      {post.location_tag && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-rose-400" />
                          <span>{post.location_tag}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button
                      type="button"
                      onClick={() => void handleDeletePost(post.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-white/5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {post.image_url && (
                  <div className="relative max-h-96 overflow-hidden bg-[#0B1222]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.image_url}
                      alt={post.caption || "Post photo"}
                      className="w-full object-cover max-h-96"
                    />
                  </div>
                )}

                {post.caption && (
                  <p className="p-4 text-sm text-foreground/90 leading-relaxed">
                    {post.caption}
                  </p>
                )}

                <div className="px-4 py-3 bg-surface-subtle/30 border-t border-border/20 flex items-center justify-between text-xs text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => void handleToggleLikePost(post.id)}
                    className={`flex items-center gap-1.5 font-medium transition-colors ${
                      post.is_liked
                        ? "text-rose-400"
                        : "hover:text-foreground text-muted-foreground"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        post.is_liked ? "fill-rose-400" : ""
                      }`}
                    />
                    <span>{post.likes_count}</span>
                  </button>
                  <span>{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-border/40 bg-card p-6">
              <MessageSquare className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-foreground">
                No reviews yet
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Be the first to share your experience with this bettor.
              </p>
              {!isOwnProfile && (
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-sky-500 text-white text-xs font-semibold hover:bg-sky-400 transition-colors"
                >
                  Write Review
                </button>
              )}
            </div>
          ) : (
            reviews.map((rev) => (
              <div
                key={rev.id}
                className="rounded-xl border border-border/40 bg-card p-5 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {rev.author?.name ?? "Anonymous"}
                    </span>
                    {rev.author?.username && (
                      <span className="text-xs text-muted-foreground">
                        @{rev.author.username}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {rev.comment && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {rev.comment}
                  </p>
                )}
                <div className="text-[11px] text-muted-foreground/60">
                  {new Date(rev.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      <ReviewModal
        userId={profile.id}
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => {
          void refetchReviews();
          void refetchProfile();
        }}
      />

      <CreatePostModal
        isOpen={isCreatePostModalOpen}
        onClose={() => setIsCreatePostModalOpen(false)}
        onSuccess={() => {
          void refetchPosts();
        }}
      />
    </div>
  );
}
