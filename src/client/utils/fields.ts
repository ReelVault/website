import type {
	Collection,
	CollectionWithRelations,
	Company,
	EpisodeWithRelations,
	FieldPath,
	Library,
	MediaFile,
	MetadataWithRelation,
	Person,
	Profile,
	Season,
	Watchlist,
} from "@reelvault/sdk";

type JoinPaths<Paths extends readonly string[], Result extends string = ""> = Paths extends readonly [
	infer Head extends string,
	...infer Tail extends string[],
]
	? JoinPaths<Tail, Result extends "" ? Head : `${Result},${Head}`>
	: Result;

/**
 * Local copy of the SDK `defineFields` helper (trivial `paths.join(",")`) so field
 * definitions do not pull the full @reelvault/sdk barrel into route chunks.
 */
export function defineFields<T>(): <const Paths extends ReadonlyArray<FieldPath<T>>>(...paths: Paths) => JoinPaths<Paths>;

export function defineFields<T>() {
	return (...paths: ReadonlyArray<FieldPath<T>>): string => paths.join(",");
}

export const metadataCardFields = defineFields<MetadataWithRelation>()(
	"id",
	"type",
	"title",
	"releaseDate",
	"rating",
	"genres.id",
	"genres.name",
	"images.imageType",
	"images.data.id",
	"images.data.updatedAt",
);

export const metadataInfoFields = defineFields<MetadataWithRelation>()(
	"id",
	"type",
	"title",
	"overview",
	"releaseDate",
	"genres.id",
	"genres.name",
	"collections.id",
	"collections.name",
	"images.imageType",
	"images.data.id",
	"images.data.updatedAt",
	"rating",
);

export const metadataDetailsFields = defineFields<MetadataWithRelation>()(
	"id",
	"type",
	"title",
	"originalTitle",
	"overview",
	"releaseDate",
	"genres.id",
	"genres.name",
	"collections.id",
	"collections.name",
	"companies.id",
	"companies.name",
	"companies.imageId",
	"cast.role",
	"cast.character",
	"cast.sortOrder",
	"cast.data.id",
	"cast.data.name",
	"cast.data.imageId",
	"crew.job",
	"crew.data.id",
	"crew.data.name",
	"images.imageType",
	"images.data.id",
	"images.data.updatedAt",
	"rating",
	"keywords.id",
	"keywords.name",
	"providers.id",
	"providers.name",
	"providers.externalId",
);

export const metadataRecentlyAddedFields = defineFields<MetadataWithRelation>()(
	"id",
	"type",
	"title",
	"overview",
	"releaseDate",
	"genres.id",
	"genres.name",
	"collections.id",
	"collections.name",
	"images.imageType",
	"images.data.id",
	"images.data.updatedAt",
	"rating",
	"createdAt",
);

export const companyListFields = defineFields<Company>()("id", "name", "originalName", "imageId", "updatedAt");
type CollectionList = Collection & { metadataCount: number; posterImages: Array<{ imageId: string; updatedAt: Date }> };

export const collectionListFields = defineFields<CollectionList>()(
	"id",
	"name",
	"sortMode",
	"metadataCount",
	"posterImages.imageId",
	"posterImages.updatedAt",
);

export const libraryListFields = defineFields<Library>()("id", "type", "name");

export const libraryDetailFields = defineFields<Library>()("id", "type", "name");
type MediaFileWithAudio = MediaFile & { audioStreams: unknown[] };

export const mediaFileFields = defineFields<MediaFileWithAudio>()("metadataId", "duration", "audioStreams", "episodeId");
type SeasonView = Season & { title: string | null; posterId: string | null };

export const seasonFields = defineFields<SeasonView>()("id", "metadataId", "seasonNumber", "title", "overview", "posterId");

export const episodeFields = defineFields<EpisodeWithRelations>()(
	"id",
	"seasonId",
	"imageId",
	"title",
	"overview",
	"episodeType",
	"episodeNumber",
	"absoluteNumber",
	"airDate",
	"mediaFiles",
);

export const personDetailsFields = defineFields<Person>()("id", "name", "imageId", "biography", "birthday", "knownCredits", "updatedAt");

export const profileListFields = defineFields<Profile>()("id", "userId", "name", "avatarUrl", "pin", "createdAt", "updatedAt");

export const watchlistFields = defineFields<Watchlist>()("id", "metadataId", "createdAt");

export const collectionOrderItemFields = defineFields<MetadataWithRelation>()(
	"id",
	"type",
	"title",
	"releaseDate",
	"images.imageType",
	"images.data.id",
	"images.data.updatedAt",
);

export const collectionAdminFields = defineFields<CollectionWithRelations>()(
	"id",
	"name",
	"sortMode",
	"createdAt",
	"updatedAt",
	"providers.id",
	"providers.name",
	"providers.externalId",
);

export const personAdminFields = defineFields<Person>()("id", "name", "imageId");
