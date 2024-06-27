FROM --platform=$BUILDPLATFORM eclipse-temurin:17-jdk-jammy

ARG MENDIX_VERSION
ARG BUILDPLATFORM

RUN \
    echo "Downloading mxbuild ${MENDIX_VERSION}..." && \
    wget -q https://artifacts.rnd.mendix.com/runtimes/net8-mxbuild-${MENDIX_VERSION}.tar.gz -O /tmp/mxbuild.tar.gz && \
    mkdir /tmp/mxbuild && \
    tar xfz /tmp/mxbuild.tar.gz --directory /tmp/mxbuild && \
    rm /tmp/mxbuild.tar.gz && \
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
