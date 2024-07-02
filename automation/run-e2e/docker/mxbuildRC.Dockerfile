FROM eclipse-temurin:17-jdk-jammy

ARG MENDIX_VERSION

COPY --link mxbuild.tar.gz /tmp/mxbuild.tar.gz

SHELL ["/bin/bash", "-c"]
RUN \
    echo "Copying mxbuild ${MENDIX_VERSION}..." && \
    mkdir /tmp/mxbuild && \
    tar xfz /tmp/mxbuild.tar.gz --directory /tmp/mxbuild && \
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
