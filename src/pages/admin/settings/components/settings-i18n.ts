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
	"metadata.minMatchScore": {
		label: m.admin_settings_min_match_score(),
		description: m.admin_settings_min_match_score_description(),
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

	// ==================== MONITORING / RESCUE (RAW KEYS FILLED) ====================
	"system.resources.monitoringEnabled": {
		label: m.admin_settings_monitoring_enabled(),
		description: m.admin_settings_monitoring_enabled_description(),
	},
	"system.resources.monitoringIntervalMs": {
		label: m.admin_settings_monitoring_interval_ms(),
		description: m.admin_settings_monitoring_interval_ms_description(),
	},
	"system.resources.memoryThresholdPercent": {
		label: m.admin_settings_memory_threshold_percent(),
		description: m.admin_settings_memory_threshold_percent_description(),
	},
	"system.resources.memoryCriticalPercent": {
		label: m.admin_settings_memory_critical_percent(),
		description: m.admin_settings_memory_critical_percent_description(),
	},
	"system.resources.diskThresholdPercent": {
		label: m.admin_settings_disk_threshold_percent(),
		description: m.admin_settings_disk_threshold_percent_description(),
	},
	"system.resources.enableDynamicThrottling": {
		label: m.admin_settings_dynamic_throttling(),
		description: m.admin_settings_dynamic_throttling_description(),
	},
	"system.resources.throttleLowPriorityAbovePercent": {
		label: m.admin_settings_throttle_above_percent(),
		description: m.admin_settings_throttle_above_percent_description(),
	},
	"system.resources.streamingGuaranteedCores": {
		label: m.admin_settings_streaming_guaranteed_cores(),
		description: m.admin_settings_streaming_guaranteed_cores_description(),
	},
	"system.rescue.enabled": {
		label: m.admin_settings_rescue_enabled(),
		description: m.admin_settings_rescue_enabled_description(),
	},
	"system.rescue.eventLoopLagMs": {
		label: m.admin_settings_rescue_event_loop_lag(),
		description: m.admin_settings_rescue_event_loop_lag_description(),
	},
	"system.rescue.sustainMs": {
		label: m.admin_settings_rescue_sustain(),
		description: m.admin_settings_rescue_sustain_description(),
	},
	"system.rescue.releaseMs": {
		label: m.admin_settings_rescue_release(),
		description: m.admin_settings_rescue_release_description(),
	},

	// ==================== FFMPEG / FFPROBE BINARIES & QUALITY ====================
	"ffmpeg.path": {
		label: m.admin_settings_ffmpeg_path(),
		description: m.admin_settings_ffmpeg_path_description(),
	},
	"ffmpeg.preset": {
		label: m.admin_settings_ffmpeg_preset(),
		description: m.admin_settings_ffmpeg_preset_description(),
	},
	"ffmpeg.crf": {
		label: m.admin_settings_ffmpeg_crf(),
		description: m.admin_settings_ffmpeg_crf_description(),
	},
	"ffmpeg.threads": {
		label: m.admin_settings_ffmpeg_threads(),
		description: m.admin_settings_ffmpeg_threads_description(),
	},
	"ffmpeg.toneMapping": {
		label: m.admin_settings_ffmpeg_tone_mapping(),
		description: m.admin_settings_ffmpeg_tone_mapping_description(),
	},
	"ffmpeg.toneMapAlgorithm": {
		label: m.admin_settings_ffmpeg_tone_map_algorithm(),
		description: m.admin_settings_ffmpeg_tone_map_algorithm_description(),
	},
	"ffprobe.path": {
		label: m.admin_settings_ffprobe_path(),
		description: m.admin_settings_ffprobe_path_description(),
	},

	// ==================== TRICKPLAY ====================
	"trickplay.enabled": {
		label: m.admin_settings_trickplay_enabled(),
		description: m.admin_settings_trickplay_enabled_description(),
	},
	"trickplay.autoOnRefresh": {
		label: m.admin_settings_trickplay_auto_on_refresh(),
		description: m.admin_settings_trickplay_auto_on_refresh_description(),
	},
	"trickplay.intervalSeconds": {
		label: m.admin_settings_trickplay_interval_seconds(),
		description: m.admin_settings_trickplay_interval_seconds_description(),
	},
	"trickplay.tileWidth": {
		label: m.admin_settings_trickplay_tile_width(),
		description: m.admin_settings_trickplay_tile_width_description(),
	},
	"trickplay.columns": {
		label: m.admin_settings_trickplay_columns(),
		description: m.admin_settings_trickplay_columns_description(),
	},

	// ==================== CORE ARTIFACTS ====================
	"system.artifacts.coreMaxStorageGb": {
		label: m.admin_settings_artifacts_core_max_storage_gb(),
		description: m.admin_settings_artifacts_core_max_storage_gb_description(),
	},

	// ==================== MARKERS ====================
	"markers.introKeywords": {
		label: m.admin_settings_markers_intro_keywords(),
		description: m.admin_settings_markers_intro_keywords_description(),
	},
	"markers.creditsKeywords": {
		label: m.admin_settings_markers_credits_keywords(),
		description: m.admin_settings_markers_credits_keywords_description(),
	},
	"markers.recapKeywords": {
		label: m.admin_settings_markers_recap_keywords(),
		description: m.admin_settings_markers_recap_keywords_description(),
	},

	// ==================== SCANNING / PLUGINS / SYSTEM ====================
	"scanning.autoWatcherCooldownSeconds": {
		label: m.admin_settings_scanning_watcher_cooldown(),
		description: m.admin_settings_scanning_watcher_cooldown_description(),
	},
	"scanning.supportedVideoExtensions": {
		label: m.admin_settings_scanning_video_extensions(),
		description: m.admin_settings_scanning_video_extensions_description(),
	},
	"scanning.ignorePatterns": {
		label: m.admin_settings_scanning_ignore_patterns(),
		description: m.admin_settings_scanning_ignore_patterns_description(),
	},
	"plugins.http.allowedDomains": {
		label: m.admin_settings_plugins_allowed_domains(),
		description: m.admin_settings_plugins_allowed_domains_description(),
	},
	"system.logs.retentionDays": {
		label: m.admin_settings_logs_retention_days(),
		description: m.admin_settings_logs_retention_days_description(),
	},
	"auth.enforceTwoFactor": {
		label: m.admin_settings_enforce_two_factor(),
		description: m.admin_settings_enforce_two_factor_description(),
	},
	"auth.sessionLifetimeDays": {
		label: m.admin_settings_session_lifetime_days(),
		description: m.admin_settings_session_lifetime_days_description(),
	},
	"auth.rateLimit.loginAccountMaxAttempts": {
		label: m.admin_settings_login_max_attempts(),
		description: m.admin_settings_login_max_attempts_description(),
	},
	"network.rateLimit.globalMax": {
		label: m.admin_settings_rate_limit_global_max(),
		description: m.admin_settings_rate_limit_global_max_description(),
	},
	"network.rateLimit.routeMultiplier": {
		label: m.admin_settings_rate_limit_route_multiplier(),
		description: m.admin_settings_rate_limit_route_multiplier_description(),
	},
	"system.database.watchedHistoryRetentionDays": {
		label: m.admin_settings_watched_history_retention(),
		description: m.admin_settings_watched_history_retention_description(),
	},
	"system.database.backupRetentionCount": {
		label: m.admin_settings_backup_retention_count(),
		description: m.admin_settings_backup_retention_count_description(),
	},
	"system.analytics.windowDays": {
		label: m.admin_settings_analytics_window_days(),
		description: m.admin_settings_analytics_window_days_description(),
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
