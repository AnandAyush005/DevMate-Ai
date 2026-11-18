import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query'
import {
  getAuthMe,
  getPasswordReset,
  login,
  logout,
  register,
  requestPasswordReset,
  resetPassword,
} from '@/lib/auth.api';

export function useMe() {
    return useQuery({
        queryKey: ["auth", "me"],
        queryFn: getAuthMe,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

export function useLogin() {

    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["auth", "login"],
        mutationFn: login,

        onSuccess : ()=>{
            queryClient.invalidateQueries({
                queryKey : ["auth", "me"]
            })
        }
    });
}

export function useRegister() {
    return useMutation({
        mutationKey: ["auth", "register"],
        mutationFn: register
    });
}

export function useLogout(){

    const queryClient = useQueryClient();

    return useMutation({
        mutationKey : ["auth", "logout"],
        mutationFn : logout,

        onSuccess: () => {
            queryClient.setQueryData(["auth", "me"], null);

            queryClient.removeQueries({
                queryKey: ["auth", "me"],
            });
        },
    })
}

export function useRequestPasswordReset() {
    return useMutation({
        mutationKey: ["auth", "forgot-password"],
        mutationFn: requestPasswordReset,
    });
}

export function usePasswordResetToken(token: string) {
    return useQuery({
        queryKey: ["auth", "reset-password", token],
        queryFn: () => getPasswordReset(token),
        enabled: token.length > 0,
        retry: false,
    });
}

export function useResetPassword() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationKey: ["auth", "reset-password"],
        mutationFn: resetPassword,

        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["auth", "me"],
            });
        },
    });
}