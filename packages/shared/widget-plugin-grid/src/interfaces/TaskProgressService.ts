export interface TaskProgressService {
    inProgress: boolean;
    lengthComputable: boolean;
    loaded: number;
    total: number;
    onloadstart: (event: ProgressEvent) => void;
    onprogress: (event: ProgressEvent) => void;
    onloadend: () => void;
}
