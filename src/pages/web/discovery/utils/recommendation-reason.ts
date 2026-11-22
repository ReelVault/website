import type { RecommendationReason, RecommendationReasonKind } from "@reelvault/sdk";
import { m } from "@/paraglide/messages";

type LabelledReasonKind = Exclude<RecommendationReasonKind, "popular" | "taste" | "credit">;

const LABELLED_REASON_MESSAGES: Record<LabelledReasonKind, (params: { label: string }) => string> = {
	collection: m.web_recommendation_reason_collection,
	keyword: m.web_recommendation_reason_keyword,
	genre: m.web_recommendation_reason_genre,
	person: m.web_recommendation_reason_person,
	seed: m.web_recommendation_reason_seed,
};

/** The sentence under a recommended title, built from the reason kind and the provider label the server sends. */
export function formatRecommendationReason(reason: RecommendationReason): string {
	if (reason.kind === "popular") return m.web_recommendation_reason_popular();
	if (reason.kind === "taste" || !reason.label) return m.web_recommendation_reason_taste();
	// The role is the provider's own job name (a TMDB job, a MAL role, any language), shown as sent.
	if (reason.kind === "credit") {
		return reason.role
			? m.web_recommendation_reason_credit({ role: reason.role, label: reason.label })
			: m.web_recommendation_reason_person({ label: reason.label });
	}

	return LABELLED_REASON_MESSAGES[reason.kind]({ label: reason.label });
}

/** Reason sentences keyed by metadata id, for the rows that show them. */
export function recommendationReasonMap(reasons: readonly RecommendationReason[] | undefined): Map<string, string> {
	return new Map((reasons ?? []).map((reason) => [reason.metadataId, formatRecommendationReason(reason)]));
}
