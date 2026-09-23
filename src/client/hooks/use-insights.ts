import type { AdminAnalytics, InsightsRange, ProfileInsights, WrappedInsights } from "@reelvault/sdk";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { reelvault } from "../client";
import { adminKeys, watchedHistoryKeys } from "../utils/query-keys";

export const insightsQueryOptions = (range: InsightsRange = "30d") =>
	queryOptions<ProfileInsights>({
		queryKey: watchedHistoryKeys.insights(range),
		queryFn: () => reelvault.me.getInsights(range),
		staleTime: 60 * 1000,
	});

export function useInsights(range: InsightsRange) {
	return useQuery(insightsQueryOptions(range));
}

export function useWrappedInsights(year?: number) {
	return useQuery<WrappedInsights>({
		queryKey: watchedHistoryKeys.wrapped(year),
		queryFn: () => reelvault.me.getWrapped(year),
		staleTime: 5 * 60 * 1000,
	});
}

export const adminAnalyticsQueryOptions = (days?: number) =>
	queryOptions<AdminAnalytics>({
		queryKey: adminKeys.analytics(days),
		queryFn: () => reelvault.admin.getAnalytics(days),
		staleTime: 30 * 1000,
	});

export function useAdminAnalytics(days?: number) {
	return useQuery(adminAnalyticsQueryOptions(days));
}
