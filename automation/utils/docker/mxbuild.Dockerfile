FROM mono:6.12
ARG MENDIX_VERSION

# Install dependencies
RUN apt-get -qq update && \
    apt-get -qq install -y wget

# Install Java
RUN echo "Installing Java..." && \
    wget -q https://download.java.net/java/GA/jdk11/9/GPL/openjdk-11.0.2_linux-x64_bin.tar.gz -O /tmp/openjdk.tar.gz && \
    mkdir /usr/lib/jvm && \
    tar xfz /tmp/openjdk.tar.gz --directory /usr/lib/jvm && \
    rm /tmp/openjdk.tar.gz

# Download and install mxbuild
RUN echo "Downloading mxbuild ${MENDIX_VERSION}..." && \
    wget -q https://cdn.mendix.com/runtime/mxbuild-${MENDIX_VERSION}.tar.gz -O /tmp/mxbuild.tar.gz && \
    mkdir /tmp/mxbuild && \
    tar xfz /tmp/mxbuild.tar.gz --directory /tmp/mxbuild && \
    rm /tmp/mxbuild.tar.gz

# Clean up dependencies
RUN apt-get -qq remove -y wget && \
    apt-get clean

# Create mxbuild executable script
RUN echo "#!/bin/bash -x" >/bin/mxbuild && \
    echo "mono /tmp/mxbuild/modeler/mxbuild.exe --java-home=/usr/lib/jvm/jdk-11.0.2 --java-exe-path=/usr/lib/jvm/jdk-11.0.2/bin/java \$@" >>/bin/mxbuild && \
    chmod +x /bin/mxbuild

# Create mx executable script
RUN echo "#!/bin/bash -x" >/bin/mx && \
    echo "mono /tmp/mxbuild/modeler/mx.exe \$@" >>/bin/mx && \
    chmod +x /bin/mx
