# Simple test container
FROM alpine:latest

# Install curl for health checks
RUN apk add --no-cache curl

# Create a simple web server
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'echo "Docker is working! NannyRadar ready for containerization."' >> /start.sh && \
    echo 'echo "Server would run on port 4000"' >> /start.sh && \
    echo 'while true; do sleep 30; done' >> /start.sh && \
    chmod +x /start.sh

CMD ["/start.sh"]
