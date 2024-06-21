FROM --platform=$BUILDPLATFORM eclipse-temurin:17-jdk-jammy

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
    apt-get update -qqy && \
    apt-get install -qqy libicu70 && \
    apt-get -qqy remove --auto-remove wget && \
    apt-get clean && \
\
    echo "#!/bin/bash -x" >/bin/mxbuild && \
    echo "/tmp/mxbuild/modeler/mxbuild --java-home=/opt/java/openjdk --java-exe-path=/opt/java/openjdk/bin/java \$@" >>/bin/mxbuild && \
    chmod +x /bin/mxbuild && \
\
    echo "#!/bin/bash -x" >/bin/mx && \
    echo "/tmp/mxbuild/modeler/mx \$@" >>/bin/mx && \
    chmod +x /bin/mx
