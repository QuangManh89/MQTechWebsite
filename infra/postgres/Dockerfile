# ==============================================================================
# MQTech PostgreSQL 16 Lean Container Image
# Pinned to official postgres:16-alpine for minimal memory & disk footprint.
# ==============================================================================

FROM postgres:16-alpine

LABEL maintainer="MQTech Engineering <admin@mqcomputech.com>"
LABEL description="Self-managed PostgreSQL 16 for MQTech on Fly.io 256MB Machine"

# Mandatory SCRAM-SHA-256 for initial database clustering
ENV POSTGRES_INITDB_ARGS="--auth-host=scram-sha-256 --auth-local=scram-sha-256"
ENV PGDATA="/var/lib/postgresql/data/pgdata"

# Install bash for robust entrypoint script handling
RUN apk add --no-cache bash

# Copy custom postgresql.conf tuned for 256MB RAM
COPY postgresql.conf /etc/postgresql/postgresql.conf

# Copy automated role & permission initialization script
COPY init-scripts/ /docker-entrypoint-initdb.d/
RUN chmod +x /docker-entrypoint-initdb.d/*.sh

# Copy storage verification entrypoint wrapper
COPY entrypoint-wrapper.sh /usr/local/bin/entrypoint-wrapper.sh
RUN chmod +x /usr/local/bin/entrypoint-wrapper.sh

# Expose internal PostgreSQL port (Accessible only via 6PN wireguard network)
EXPOSE 5432

# Container Healthcheck (Checks internal service readiness via pg_isready)
HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD pg_isready -h 127.0.0.1 -p 5432 -U mqtech_app -d "${POSTGRES_DB:-mqtech}" || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint-wrapper.sh"]
