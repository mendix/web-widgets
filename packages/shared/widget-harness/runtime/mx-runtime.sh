#!/usr/bin/env bash
# Runs the datagrid-web test project on a real Mendix runtime, natively (no Docker), with the
# Datagrid widget replaced by a probe build that records its props for the behavior specs.
#
#   runtime/mx-runtime.sh start   # download (once), build the app, start it on :8080
#   runtime/mx-runtime.sh stop
#
# Mirrors automation/run-e2e (mxbuild + m2ee), with the same Mendix version as datagrid-web's e2e script.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$HERE/../../../.." && pwd)"
DATAGRID="$REPO/packages/pluggableWidgets/datagrid-web"
MENDIX_VERSION="${MENDIX_VERSION:-11.15.0}"
# mxbuild fails on long paths, so the workspace lives under a short directory.
RT="${MXRT_DIR:-$HOME/.cache/mxrt}"
PROJECT="$RT/dg"
ARCH="$(uname -m)"

log() { echo "[mx-runtime] $*"; }

fetch() {
    local url="$1" dest="$2"
    [[ -e "$dest" ]] || { log "downloading $url"; curl -fsSL "$url" -o "$dest"; }
}

setup() {
    mkdir -p "$RT/dl" "$RT/results"
    local jdk_arch mxbuild_prefix
    case "$ARCH" in
        aarch64 | arm64) jdk_arch=aarch64 mxbuild_prefix="arm64-" ;;
        x86_64) jdk_arch=x64 mxbuild_prefix="" ;;
        *) echo "Unsupported architecture $ARCH" >&2; exit 1 ;;
    esac

    if [[ ! -x "$RT/jdk/bin/java" ]]; then
        fetch "https://api.adoptium.net/v3/binary/latest/21/ga/linux/$jdk_arch/jdk/hotspot/normal/eclipse" "$RT/dl/jdk.tgz"
        mkdir -p "$RT/jdk" && tar xzf "$RT/dl/jdk.tgz" -C "$RT/jdk" --strip-components=1
    fi
    if [[ ! -x "$RT/mxbuild/modeler/mxbuild" ]]; then
        fetch "https://cdn.mendix.com/runtime/${mxbuild_prefix}mxbuild-$MENDIX_VERSION.tar.gz" "$RT/dl/mxbuild.tgz"
        mkdir -p "$RT/mxbuild" && tar xzf "$RT/dl/mxbuild.tgz" -C "$RT/mxbuild"
    fi
    if [[ ! -d "$RT/runtime/$MENDIX_VERSION" ]]; then
        fetch "https://cdn.mendix.com/runtime/mendix-$MENDIX_VERSION.tar.gz" "$RT/dl/runtime.tgz"
        mkdir -p "$RT/runtime" && tar xzf "$RT/dl/runtime.tgz" -C "$RT/runtime"
    fi
    if [[ ! -d "$RT/m2ee" ]]; then
        git clone -q https://github.com/mendix/m2ee-tools.git --branch v7.2.3 --single-branch "$RT/m2ee"
    fi
    if [[ ! -d "$RT/pylib/yaml" ]]; then
        # m2ee needs PyYAML and httplib2; unpacking wheels avoids needing pip or venv.
        mkdir -p "$RT/pylib" "$RT/dl/wheels"
        python3 - "$RT/dl/wheels" <<'PY'
import json, platform, sys, urllib.request
out = sys.argv[1]
machine = {"arm64": "aarch64"}.get(platform.machine(), platform.machine())
tag = f"cp{sys.version_info.major}{sys.version_info.minor}"
for name, pick in [
    ("httplib2", lambda f: f.endswith("py3-none-any.whl")),
    ("pyparsing", lambda f: f.endswith("py3-none-any.whl")),
    ("PyYAML", lambda f: f"{tag}-{tag}-manylinux" in f and machine in f),
]:
    meta = json.load(urllib.request.urlopen(f"https://pypi.org/pypi/{name}/json"))
    url = next(u["url"] for u in meta["urls"] if pick(u["filename"]))
    urllib.request.urlretrieve(url, f"{out}/{url.rsplit('/', 1)[1]}")
PY
        for wheel in "$RT"/dl/wheels/*.whl; do python3 -m zipfile -e "$wheel" "$RT/pylib"; done
    fi
    if [[ ! -f "$PROJECT/DataGrid.mpr" ]]; then
        local url branch
        url="$(node -p "require('$DATAGRID/package.json').testProject.githubUrl")"
        branch="$(node -p "require('$DATAGRID/package.json').testProject.branchName")"
        fetch "$url/archive/refs/heads/$branch.zip" "$RT/dl/test-project.zip"
        rm -rf "$RT/tp" && python3 -m zipfile -e "$RT/dl/test-project.zip" "$RT/tp"
        mv "$RT"/tp/* "$PROJECT" && rmdir "$RT/tp"
    fi
}

m2ee() {
    PYTHONPATH="$RT/pylib" python3 "$RT/m2ee/src/m2ee.py" -c "$RT/m2ee.yml" --yolo "$@"
}

write_m2ee_config() {
    cat >"$RT/m2ee.yml" <<EOF
m2ee:
    app_name: Widget harness test app
    app_base: $PROJECT/deployment
    model_upload_path: $PROJECT
    admin_port: 8090
    admin_pass: Password1!
    runtime_port: 8080
    runtime_listen_addresses: "*"
    javaopts: ["-Dfile.encoding=UTF-8", "-Xmx512M", "-Xms512M", "-Djava.io.tmpdir=$PROJECT/deployment/data/tmp"]
    javabin: $RT/jdk/bin/java
    pidfile: $RT/m2ee.pid
mxruntime:
    DTAPMode: T
    # A trial license allows few concurrent sessions; expire them quickly.
    SessionTimeout: 15000
    ClusterManagerActionInterval: 5000
    ApplicationRootUrl: http://localhost:8080/
    DatabaseType: HSQLDB
    DatabaseName: default
    DatabasePassword: ""
    BuiltInDatabasePath: $PROJECT/deployment/data/database
logging:
    - type: file
      name: FileSubscriber
      autosubscribe: INFO
      filename: $RT/results/runtime.log
      max_size: 10485760
      max_rotation: 10
mxnode:
    mxjar_repo: $RT/runtime
EOF
}

start() {
    setup
    log "building Datagrid and its probe MPK"
    (cd "$DATAGRID" && pnpm turbo build >/dev/null)
    local mpk
    mpk="$(ls "$DATAGRID"/dist/*/com.mendix.widget.web.Datagrid.mpk | tail -1)"
    node "$HERE/make-probe-mpk.mjs" "$mpk" "$PROJECT/widgets/com.mendix.widget.web.Datagrid.mpk" \
        com/mendix/widget/web/datagrid/Datagrid.mjs

    export JAVA_HOME="$RT/jdk" LD_PRELOAD=libfontconfig.so.1
    log "mx update-widgets + mxbuild $MENDIX_VERSION"
    "$RT/mxbuild/modeler/mx" update-widgets --loose-version-check "$PROJECT/DataGrid.mpr" >"$RT/results/update-widgets.log" 2>&1
    "$RT/mxbuild/modeler/mxbuild" --java-home="$JAVA_HOME" --java-exe-path="$JAVA_HOME/bin/java" \
        --modern-web-client --output="$RT/automation.mda" "$PROJECT/DataGrid.mpr" >"$RT/results/mxbuild.log" 2>&1 ||
        { tail -20 "$RT/results/mxbuild.log"; exit 1; }

    write_m2ee_config
    stop_quietly
    # A fresh database: the app creates its demo data on startup, and old sessions count against the license.
    rm -rf "$PROJECT/deployment/data/database"
    mkdir -p "$PROJECT/deployment/data/database" "$PROJECT/deployment/data/tmp"
    log "starting runtime"
    # "c" answers m2ee's prompts to create the database.
    printf "c\nc\n" | m2ee start >"$RT/results/m2ee-start.log" 2>&1 || true
    if curl -fs -o /dev/null http://localhost:8080/; then
        log "ready: MX_RUNTIME_URL=http://localhost:8080 pnpm run test:e2e"
    else
        tail -20 "$RT/results/runtime.log" >&2
        exit 1
    fi
}

stop_quietly() {
    [[ -f "$RT/m2ee.yml" ]] && { printf "y\n" | m2ee stop >/dev/null 2>&1 || true; }
}

case "${1:-}" in
    start) start ;;
    stop) stop_quietly && log "stopped" ;;
    *) echo "Usage: $0 start|stop" >&2; exit 1 ;;
esac
