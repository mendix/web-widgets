FROM eclipse-temurin:21-jdk-jammy

ARG MENDIX_VERSION

ENV RUNTIME_PORT=8080 \
    ADMIN_PORT=8090 \
    LANG="C.UTF-8"

EXPOSE $RUNTIME_PORT $ADMIN_PORT

# Health check for "docker compose up --wait" and "docker run --health-*".
# TCP connect on port 8080; any response means ready.
# interval=5s × retries=36 = up to 3 min grace time.
HEALTHCHECK --interval=5s --timeout=5s --retries=36 --start-period=15s \
    CMD python3 -c "import socket,sys; s=socket.socket(); s.settimeout(4); sys.exit(0) if not s.connect_ex(('127.0.0.1', 8080)) else sys.exit(1)"

#install dependency -> git
RUN apt-get update -qqy && \
    apt-get install -qqy git wget && \
    # Install m2ee + dependencies
    # https://github.com/mendix/m2ee-tools
    git clone https://github.com/mendix/m2ee-tools.git --branch v7.2.3 --single-branch /tmp/m2ee && \
    mkdir -p /var/log /var/opt/m2ee && \
    mv /tmp/m2ee/src/* /var/opt/m2ee && \
    chmod a=rwx /var/log/ /var/run/ && \
\
    apt-get install -qqy \
        python3 \
        python3-pip \
        unzip \
        libfontconfig1 && \
\
    pip3 install -q --upgrade pip && \
    pip install -q pyyaml httplib2 && \
\
    echo "Downloading runtime ${MENDIX_VERSION}..." && \
    wget -q https://cdn.mendix.com/runtime/mendix-${MENDIX_VERSION}.tar.gz -O /tmp/runtime.tar.gz && \
    mkdir /var/opt/runtime && \
    tar xfz /tmp/runtime.tar.gz --directory /var/opt/runtime && \
    rm /tmp/runtime.tar.gz && \
    chown -R root:root /var/opt/runtime && \
\
    apt-get -qqy remove --auto-remove git wget && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* && \
\
    ln -s $JAVA_HOME/bin/* /usr/bin/ && \
\
    echo "#!/bin/bash -x" >/bin/m2ee && \
    echo "python3 /var/opt/m2ee/m2ee.py \$@" >>/bin/m2ee && \
    chmod +x /bin/m2ee

