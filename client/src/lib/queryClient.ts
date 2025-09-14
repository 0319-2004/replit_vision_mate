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
                    return await api.projects.getAll() as T;
                  }
                  
                  if (path === "/api/projects/discover") {
                    return await api.projects.getForDiscover() as T;
                  }
                  
                  if (path.startsWith("/api/projects/") && path.split("/").length === 4) {
                    const projectId = path.split("/")[3];
                    return await api.projects.getById(projectId) as T;
                  }
                  
                  if (path === "/api/conversations") {
                    return await api.messages.getConversations() as T;
                  }
                  
                  if (path.startsWith("/api/conversations/") && path.split("/").length === 4) {
                    const conversationId = path.split("/")[3];
                    return await api.messages.getConversationById(conversationId) as T;
                  }
                  
                  if (path === "/api/auth/user") {
                    return await api.users.getCurrentUser() as T;
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
    } catch (error) {
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
  try {
    if (url === '/api/projects' && method === 'POST') {
      const result = await api.projects.create(data as any);
      return new Response(JSON.stringify(result), { status: 201 });
    }
    
    if (url.startsWith('/api/projects/') && url.endsWith('/participate')) {
      const projectId = url.split('/')[3];
      if (method === 'POST') {
        const result = await api.participations.add(projectId, (data as any).type);
        return new Response(JSON.stringify(result), { status: 201 });
      } else if (method === 'DELETE') {
        await api.participations.remove(projectId, (data as any).type);
        return new Response('', { status: 204 });
      }
    }
    
    if (url === '/api/messages' && method === 'POST') {
      const { recipientId, content } = data as any;
      const result = await api.messages.sendMessage(recipientId, content);
      return new Response(JSON.stringify(result), { status: 201 });
    }
    
                if (url === '/api/reactions' && method === 'POST') {
                  const { targetId, targetType } = data as any;
                  const result = await api.reactions.toggle(targetId, targetType);
                  return new Response(JSON.stringify(result), { status: 200 });
                }
                
                if (url === '/api/profile' && method === 'PUT') {
                  const result = await api.users.updateProfile(data as any);
                  return new Response(JSON.stringify(result), { status: 200 });
                }
  } catch (error) {
    throw new Error(`Supabase API Error: ${error.message}`);
  }
  
  // Legacy API fallback
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
