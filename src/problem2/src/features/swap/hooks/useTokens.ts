import { useQuery } from "@tanstack/react-query";

import { fetchTokens } from "../api/prices";

export function useTokens() {
  return useQuery({
    queryKey: ["tokens"],
    queryFn: ({ signal }) => fetchTokens(signal),
    staleTime: Infinity,
    retry: 1,
  });
}
