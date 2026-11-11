import { api, callApi } from "./client";
import type { UserProfile, UserReview } from "./types";

export function getUserProfile(id: string) {
  return callApi<UserProfile>(() =>
    api.GET("/users/{id}/profile", {
      params: { path: { id } },
    }),
  );
}

export function toggleFollowUser(id: string) {
  return callApi<{ is_following: boolean; followers_count: number }>(() =>
    api.POST("/users/{id}/follow", {
      params: { path: { id } },
    }),
  );
}

export function getUserReviews(id: string) {
  return callApi<UserReview[]>(() =>
    api.GET("/users/{id}/reviews", {
      params: { path: { id } },
    }),
  );
}

export function createUserReview(
  id: string,
  body: { rating: number; comment?: string },
) {
  return callApi<unknown>(() =>
    api.POST("/users/{id}/reviews", {
      params: { path: { id } },
      body,
    }),
  );
}

