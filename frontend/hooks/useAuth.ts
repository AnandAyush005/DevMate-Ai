import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
} from '@tanstack/react-query'
import { getAuthMe, login, logout, register } from '@/lib/auth.api';

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