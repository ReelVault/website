import { m } from "@/paraglide/messages";

export interface SettingTranslation {
	label: string;
	description: string;
	options?: Record<string, string>;
}

export const SETTINGS_TRANSLATIONS: Record<string, SettingTranslation> = {
	// ==================== ZASOBY & CPU (SMART ENGINE) ====================
	"system.resources.cpuProfile": {
		label: m.admin_settings_label_cpu_profile(),
		description: m.admin_settings_cpu_split_description(),
		options: {
			conservative: m.admin_settings_conservative(),
			balanced: m.admin_settings_balanced(),
			performance: m.admin_settings_high_perf_performance(),
			custom: m.admin_settings_option_custom(),
		},
	},
	"system.resources.maxCpuCores": {
		label: m.admin_settings_label_max_cores(),
		description: m.admin_settings_cpu_cores_cap(),
	},
	"system.resources.reservedCoresForWeb": {
		label: m.admin_settings_label_reserved_cores(),
		description: m.admin_settings_cpu_reserve_description(),
	},
	"system.resources.ffmpegMaxThreads": {
		label: m.admin_settings_max_ffmpeg_threads(),
		description: m.admin_settings_transcoder_thread_limit(),
	},
	"system.resources.workerPoolMaxConcurrent": {
		label: m.admin_settings_total_job_cap(),
		description: m.admin_settings_global_operation_cap(),
	},

	// ==================== STREAMING & FFMPEG ====================
	"ffmpeg.hwaccel": {
		label: m.admin_settings_hwaccel_ffmpeg(),
		description: m.admin_settings_hwaccel_engine(),
		options: {
			none: m.admin_settings_option_hwaccel_none(),
			auto: m.admin_settings_option_hwaccel_auto(),
			nvenc: "NVIDIA NVENC",
			vaapi: "VAAPI (Intel / AMD Linux)",
			qsv: "Intel Quick Sync Video (QSV)",
			amf: "AMD AMF",
			videotoolbox: "Apple VideoToolbox",
		},
	},
	"ffmpeg.hwaccelDevice": {
		label: m.admin_settings_gpu_device_path(),
		description: m.admin_settings_accel_device_path(),
	},
	"ffmpeg.gracefulShutdownTimeoutMs": {
		label: m.admin_settings_ffmpeg_close_timeout_ms(),
		description: m.admin_settings_transcode_finish_timeout(),
	},
	"stream.maxSessions": {
		label: m.admin_settings_max_total_sessions(),
		description: m.admin_settings_total_stream_cap(),
	},
	"stream.maxSessionsPerUser": {
		label: m.admin_settings_max_sessions_per_user(),
		description: m.admin_settings_per_user_stream_limit(),
	},
	"stream.maxPerStreamBandwidthKbps": {
		label: m.admin_settings_max_stream_bandwidth(),
		description: m.admin_settings_per_player_bandwidth_cap(),
	},
	"stream.hlsSegmentDurationSeconds": {
		label: m.admin_settings_hls_segment_seconds(),
		description: m.admin_settings_fmp4_segment_seconds(),
	},
	"stream.inactivityTimeoutMs": {
		label: m.admin_settings_session_idle_ms(),
		description: m.admin_settings_session_release_idle_ms(),
	},
	"stream.smartAudioTrackSelection": {
		label: m.admin_settings_smart_audio(),
		description: m.admin_settings_smart_audio_description(),
	},

	// ==================== SKANOWANIE & PLIKI ====================
	"scanning.autoWatcherEnabled": {
		label: m.admin_settings_realtime_monitoring(),
		description: m.admin_settings_autoscan_description(),
	},
	"scanning.autoWatcherDelaySeconds": {
		label: m.admin_settings_scan_delay_seconds(),
		description: m.admin_settings_quiet_period_description(),
	},
	"scanning.concurrency": {
		label: m.admin_settings_concurrency_scan_library(),
		description: m.admin_settings_parallel_scan_ops(),
	},
	"scanning.ffprobeConcurrency": {
		label: m.admin_settings_concurrency_analysis_ffprobe_0(),
		description: m.admin_settings_max_ffprobe_processes(),
	},
	"media.supportedVideoExtensions": {
		label: m.admin_settings_supported_extensions(),
		description: m.admin_settings_video_extensions_list(),
	},

	// ==================== OBRAZY & MEDIA ====================
	"images.defaultQuality": {
		label: m.admin_settings_default_webp_quality(),
		description: m.admin_settings_thumbnail_compression(),
	},
	"images.defaultWidth": {
		label: m.admin_settings_default_thumbnail_width(),
		description: m.admin_settings_optimized_image_width(),
	},
	"images.maxWidth": {
		label: m.admin_settings_max_image_width(),
		description: m.admin_settings_max_scale_width(),
	},
	"images.maxHeight": {
		label: m.admin_settings_max_image_height(),
		description: m.admin_settings_max_scale_height(),
	},
	"images.maxUploadBytes": {
		label: m.admin_settings_max_upload_bytes(),
		description: m.admin_settings_max_upload_bytes(),
	},

	// ==================== WORKERY & KOLEJKI ====================
	"workers.scheduling.pollIntervalMs": {
		label: m.admin_settings_queue_check_ms(),
		description: m.admin_settings_scheduler_interval_ms(),
	},
	"workers.definitions.imageProcessing.concurrency": {
		label: m.admin_settings_concurrency_image_processing(),
		description: m.admin_settings_parallel_image_jobs(),
	},
	"workers.definitions.mediaFileAnalysis.concurrency": {
		label: m.admin_settings_concurrency_analysis_files_video(),
		description: m.admin_settings_parallel_meta_reads(),
	},
	"workers.definitions.mediaFileTechnicalRefresh.concurrency": {
		label: m.admin_settings_concurrency_tech_refresh(),
		description: m.admin_settings_parallel_tech_refresh(),
	},
	"workers.definitions.metadataRefresh.concurrency": {
		label: m.admin_settings_concurrency_metadata_refresh(),
		description: m.admin_settings_parallel_external_queries(),
	},

	// ==================== DEFAULT PROFILE PREFERENCES ====================
	"profiles.maxProfilesPerUser": {
		label: m.admin_settings_max_profiles_per_user(),
		description: m.admin_settings_max_profiles_per_user_desc(),
	},
	"profiles.defaultPreferences.language": {
		label: m.admin_settings_default_app_language(),
		description: m.admin_settings_default_profile_language(),
	},
	"profiles.defaultPreferences.autoplay": {
		label: m.admin_settings_default_autoplay(),
		description: m.admin_settings_autoplay_next_description(),
	},
	"profiles.defaultPreferences.autoSkipIntro": {
		label: m.admin_settings_default_skip_intro(),
		description: m.admin_settings_auto_skip_intro(),
	},
	"profiles.defaultPreferences.autoSkipCredits": {
		label: m.admin_settings_default_skip_credits(),
		description: m.admin_settings_auto_next_at_credits(),
	},
	"profiles.defaultPreferences.autoSkipRecap": {
		label: m.admin_settings_default_skip_recap(),
		description: m.admin_settings_auto_skip_recap(),
	},
	"profiles.defaultPreferences.subtitlesEnabled": {
		label: m.admin_settings_default_subtitles(),
		description: m.admin_settings_default_subtitles_description(),
	},
	"profiles.defaultPreferences.forcedSubtitlesOnly": {
		label: m.admin_settings_label_forced_only(),
		description: m.admin_settings_forced_only_subtitles(),
	},
	"profiles.defaultPreferences.autoForcedSubtitles": {
		label: m.admin_settings_label_auto_forced(),
		description: m.admin_settings_forced_subtitles_description(),
	},
	"profiles.defaultPreferences.continueWatchingMinutes": {
		label: m.admin_settings_default_continue_watching(),
		description: m.admin_settings_default_continue_watching_desc(),
	},
	"profiles.defaultPreferences.theme": {
		label: m.common_theme_label(),
		description: m.admin_settings_default_theme_desc(),
		options: {
			system: m.common_theme_system(),
			light: m.common_theme_light(),
			dark: m.common_theme_dark(),
		},
	},
	"profiles.defaultPreferences.audioLanguage": {
		label: m.admin_users_audio_language(),
		description: m.admin_settings_default_audio_language_desc(),
	},
	"profiles.defaultPreferences.subtitleLanguage": {
		label: m.admin_users_subtitle_language(),
		description: m.admin_settings_default_subtitle_language_desc(),
	},
	"profiles.defaultPreferences.preferHearingImpaired": {
		label: m.settings_prefer_hearing_impaired(),
		description: m.admin_settings_prefer_hearing_impaired_desc(),
	},
	"profiles.defaultPreferences.subtitleSize": {
		label: m.admin_users_subtitle_size(),
		description: m.admin_settings_default_subtitle_size_desc(),
		options: {
			small: m.admin_users_size_small(),
			normal: m.admin_users_size_normal(),
			large: m.admin_users_size_large(),
			"extra-large": m.admin_users_size_very_large(),
		},
	},
	"profiles.defaultPreferences.subtitlePosition": {
		label: m.admin_users_subtitle_position(),
		description: m.admin_settings_default_subtitle_position_desc(),
		options: {
			bottom: m.admin_users_position_bottom(),
			top: m.admin_users_position_top(),
			middle: m.admin_users_position_middle(),
		},
	},
	"profiles.defaultPreferences.subtitleColor": {
		label: m.admin_users_subtitle_text_color(),
		description: m.admin_settings_default_subtitle_color_desc(),
		options: {
			white: m.admin_users_color_white(),
			yellow: m.admin_users_color_yellow(),
			cyan: m.admin_users_color_light_blue(),
			green: m.admin_users_color_green(),
		},
	},
	"profiles.defaultPreferences.subtitleBackground": {
		label: m.admin_users_subtitle_bg_style(),
		description: m.admin_settings_default_subtitle_background_desc(),
		options: {
			semi: m.admin_users_bg_semi_transparent(),
			none: m.admin_users_no_background(),
			solid: m.admin_users_bg_opaque_black(),
		},
	},

	// ==================== ZAAWANSOWANE & SYSTEM ====================
	"paths.transcodes": {
		label: m.admin_settings_label_transcodes_path(),
		description: m.admin_settings_workdir_description(),
	},
	"paths.downloads": {
		label: m.admin_settings_label_downloads_path(),
		description: m.admin_settings_downloads_dir_description(),
	},
	"downloads.enabled": {
		label: m.admin_settings_enable_offline_downloads(),
		description: m.admin_settings_allow_offline_requests(),
	},
	"downloads.maxStorageBytesPerProfile": {
		label: m.admin_settings_download_memory_limit(),
		description: m.admin_settings_max_buffered_size(),
	},
	"downloads.retentionDays": {
		label: m.admin_settings_download_retention(),
		description: m.admin_settings_download_retention_days(),
	},
	"paths.backups": {
		label: m.admin_settings_label_backups_path(),
		description: m.admin_settings_backups_dir_description(),
	},
	"collections.minimalToShow": {
		label: m.admin_settings_min_collection_items(),
		description: m.admin_settings_min_collection_items_description(),
	},
	"plugins.providers.detailsCacheTtlMs": {
		label: m.admin_settings_query_cache_ms(),
		description: m.admin_settings_external_api_buffer(),
	},
	"metadata.ratingAggregation": {
		label: m.admin_settings_label_rating_strategy(),
		description: m.admin_settings_rating_calc_description(),
		options: {
			votes: m.admin_settings_weighted_by_votes(),
			simple: m.admin_settings_simple_average(),
		},
	},
	"auth.allowRegistration": {
		label: m.admin_settings_allow_registration(),
		description: m.admin_settings_registration_description(),
	},
	"system.database.operationRetentionDays": {
		label: m.admin_settings_worker_history_days(),
		description: m.admin_settings_job_history_days(),
	},
	"api.pagination.defaultLimit": {
		label: m.admin_settings_default_page_size(),
		description: m.admin_settings_default_api_page_size(),
	},

	// ==================== NETWORK & ALLOWED ADDRESSES ====================
	"network.allowedOrigins": {
		label: m.admin_settings_allowed_urls_description(),
		description: m.admin_settings_allowed_urls_description(),
	},
	"network.trustLocalNetworks": {
		label: m.admin_settings_label_lan_trust(),
		description: m.admin_settings_private_networks_description(),
	},
};

export function getSettingLabel(key: string): string {
	return SETTINGS_TRANSLATIONS[key]?.label ?? key;
}

export function getSettingDescription(key: string): string {
	return SETTINGS_TRANSLATIONS[key]?.description ?? "";
}

export function getSettingOptionLabel(key: string, optionValue: string): string {
	return SETTINGS_TRANSLATIONS[key]?.options?.[optionValue] ?? optionValue;
}
