import {
  useQuery,
  useMutation,
} from '@tanstack/react-query'
import { getAuthMe, login, register } from '@/lib/auth.api';

export function useMe() {
    return useQuery({
        queryKey: ["auth", "me"],
        queryFn: getAuthMe,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useLogin() {
    return useMutation({
        mutationKey: ["auth", "login"],
        mutationFn: login,
    });
}

export function useRegister() {
    return useMutation({
        mutationKey: ["auth", "register"],
        mutationFn: register
    });
}