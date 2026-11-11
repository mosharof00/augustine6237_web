import { api, callApi } from "./client";
import type { UserPost } from "./types";

export function getUserPosts(userId: string) {
  return callApi<UserPost[]>(() =>
    api.GET("/users/{id}/posts", {
      params: { path: { id: userId } },
    }),
  );
}

export function createPost(body: {
  caption?: string;
  image_url?: string;
  location_tag?: string;
}) {
  return callApi<UserPost>(() =>
    api.POST("/posts", {
      body,
    }),
  );
}

export function deletePost(postId: string) {
  return callApi<unknown>(() =>
    api.DELETE("/posts/{id}", {
      params: { path: { id: postId } },
    }),
  );
}

export function toggleLikePost(postId: string) {
  return callApi<{ is_liked: boolean; likes_count: number }>(() =>
    api.POST("/posts/{id}/like", {
      params: { path: { id: postId } },
    }),
  );
}

