export interface AdminFilesystemDirectory {
	name: string;
	path: string;
}

export interface AdminFilesystemBrowse {
	currentPath: string;
	parentPath: string | null;
	directories: AdminFilesystemDirectory[];
	exists: boolean;
}
