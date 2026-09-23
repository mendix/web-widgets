FROM --platform=$BUILDPLATFORM eclipse-temurin:21-jdk-jammy

ARG MENDIX_VERSION
ARG BUILDPLATFORM

SHELL ["/bin/bash", "-c"]
RUN \
echo "Downloading mxbuild ${MENDIX_VERSION} and docker building for ${BUILDPLATFORM}..." \
    && case "${BUILDPLATFORM}" in \
        linux/arm64) \
            BINARY_URL="https://cdn.mendix.com/runtime/arm64-mxbuild-${MENDIX_VERSION}.tar.gz"; \
            ;; \
        linux/amd64) \
            BINARY_URL="https://cdn.mendix.com/runtime/mxbuild-${MENDIX_VERSION}.tar.gz"; \
            ;; \
        *) \
            echo "Unsupported architecture: ${BUILDPLATFORM}" >&2; \
            exit 1; \
            ;; \
    esac \
    && echo "Downloading from: ${BINARY_URL}" \
    && wget -q "${BINARY_URL}" -O /tmp/mxbuild.tar.gz \
    && mkdir /tmp/mxbuild \
    && tar xfz /tmp/mxbuild.tar.gz --directory /tmp/mxbuild \
    && rm /tmp/mxbuild.tar.gz && \
\
    rm -rf /var/lib/apt/lists/* && \
    apt-get update --allow-insecure-repositories -qqy && \
    apt-get install -qqy --allow-unauthenticated libicu70 libfontconfig1 libfreetype6 libharfbuzz0b && \
    apt-get -qqy remove --auto-remove wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
\
    echo "#!/bin/bash -x" >/bin/mxbuild && \
    echo "source /bin/mxlibs.sh" >>/bin/mxbuild && \
    echo "/tmp/mxbuild/modeler/mxbuild --java-home=/opt/java/openjdk --java-exe-path=/opt/java/openjdk/bin/java \$@" >>/bin/mxbuild && \
    chmod +x /bin/mxbuild && \
\
    echo "#!/bin/bash -x" >/bin/mx && \
    echo "source /bin/mxlibs.sh" >>/bin/mx && \
    echo "/tmp/mxbuild/modeler/mx \$@" >>/bin/mx && \
    chmod +x /bin/mx

# libSkiaSharp.so shipped with mxbuild (Mendix 11) does not link libuuid/libfreetype
# itself, so their symbols must be preloaded. Paths differ per architecture.
RUN cat >/bin/mxlibs.sh <<'SH'
libs=""
for lib in libuuid.so.1 libfreetype.so.6; do
    path=$(ls /lib/*/$lib /usr/lib/*/$lib 2>/dev/null | head -1)
    [ -n "$path" ] && libs="$libs $path"
done
export LD_PRELOAD="${LD_PRELOAD:+$LD_PRELOAD }${libs# }"
SH
