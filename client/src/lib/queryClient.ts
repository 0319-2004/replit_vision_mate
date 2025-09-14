import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { projectsApi, participationsApi, progressUpdatesApi, commentsApi, reactionsApi, messagesApi, usersApi } from './supabaseApi';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

// Supabase API wrapper for easier access
export const api = {
  projects: projectsApi,
  participations: participationsApi,
  progressUpdates: progressUpdatesApi,
  comments: commentsApi,
  reactions: reactionsApi,
  messages: messagesApi,
  users: usersApi,
};

// Enhanced query function with Supabase integration
export const getQueryFn: <T>(options: {
  on401: "returnNull" | "throw";
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const path = queryKey.join("/") as string;
    
                // Handle Supabase API calls
                try {
                  if (path === "/api/projects") {
                    return await api.projects.getAll() as any;
                  }
                  
                  if (path === "/api/projects/discover") {
                    return await api.projects.getForDiscover() as any;
                  }
                  
                  if (path.startsWith("/api/projects/") && path.split("/").length === 4) {
                    const projectId = path.split("/")[3];
                    return await api.projects.getById(projectId) as any;
                  }
                  
                  if (path === "/api/conversations") {
                    return await api.messages.getConversations() as any;
                  }
                  
                  if (path.startsWith("/api/conversations/") && path.split("/").length === 4) {
                    const conversationId = path.split("/")[3];
                    return await api.messages.getConversation(conversationId) as any;
                  }
                  
                  if (path === "/api/auth/user") {
                    return await api.users.getCurrentUser() as any;
                  }
                  
                  if (path.startsWith("/api/reactions/") && path.includes("/")) {
                    const parts = path.split("/");
                    if (parts.length === 5 && parts[3]) { // /api/reactions/{targetType}/{targetId}
                      const targetType = parts[3];
                      const targetId = parts[4];
                      return await api.reactions.getStatus(targetId, targetType) as any;
                    }
                  }
      
      // Legacy API fallback
      const res = await fetch(path, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (error: any) {
      if (unauthorizedBehavior === "returnNull" && error?.message?.includes('401')) {
        return null;
      }
      throw error;
    }
  };

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Handle Supabase API calls through our wrapper
  if (url === '/api/projects' && method === 'POST') {
    try {
      const result = await api.projects.create(data as any);
      return new Response(JSON.stringify(result), { status: 201 });
    } catch (error: any) {
      throw new Error(`Supabase API Error: ${error.message}`);
    }
  }
  
  if (url.startsWith('/api/projects/') && url.endsWith('/participate')) {
    const projectId = url.split('/')[3];
    try {
      if (method === 'POST') {
        // 排他的な参加設定を使用
        const result = await api.participations.setExclusive(projectId, (data as any).type);
        return new Response(JSON.stringify(result), { status: 201 });
      } else if (method === 'DELETE') {
        // 特定のタイプを削除（トグル）またはすべて削除
        if ((data as any).type) {
          await api.participations.remove(projectId, (data as any).type);
        } else {
          await api.participations.removeAll(projectId);
        }
        return new Response('', { status: 204 });
      }
    } catch (error: any) {
      throw new Error(`Supabase API Error: ${error.message}`);
    }
  }
  
  if (url === '/api/messages' && method === 'POST') {
    try {
      const { recipientId, content } = data as any;
      const result = await api.messages.sendMessage(recipientId, content);
      return new Response(JSON.stringify(result), { status: 201 });
    } catch (error: any) {
      throw new Error(`Supabase API Error: ${error.message}`);
    }
  }
  
  if (url.startsWith('/api/projects/') && url.endsWith('/comments') && method === 'POST') {
    const projectId = url.split('/')[3];
    try {
      const { content } = data as any;
      const result = await api.comments.create(projectId, content);
      return new Response(JSON.stringify(result), { status: 201 });
    } catch (error: any) {
      throw new Error(`Supabase API Error: ${error.message}`);
    }
  }
  
  if (url === '/api/reactions' && method === 'POST') {
    try {
      const { targetId, targetType } = data as any;
      const result = await api.reactions.toggle(targetId, targetType);
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error: any) {
      throw new Error(`Supabase API Error: ${error.message}`);
    }
  }
  
  if (url === '/api/profile' && method === 'PUT') {
    try {
      const result = await api.users.updateProfile(data as any);
      return new Response(JSON.stringify(result), { status: 200 });
    } catch (error: any) {
      throw new Error(`Supabase API Error: ${error.message}`);
    }
  }
  
  // Legacy API fallback for unhandled endpoints only
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "returnNull" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes for Supabase data
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
