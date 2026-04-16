# ---- Build Stage ----
FROM ubuntu:22.04 AS build
WORKDIR /app

# Install OpenJDK 25 and curl
RUN apt-get update && apt-get install -y openjdk-25-jdk curl unzip && rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# Copy Maven wrapper and pom.xml first (for layer caching)
COPY mvnw mvnw.cmd pom.xml ./
COPY .mvn .mvn

# Download dependencies (cached unless pom.xml changes)
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Copy source and build
COPY src src
RUN ./mvnw package -DskipTests -B

# ---- Runtime Stage ----
FROM ubuntu:22.04 AS runtime
WORKDIR /app

# Install OpenJDK 25 (runtime only)
RUN apt-get update && apt-get install -y openjdk-25-jre && rm -rf /var/lib/apt/lists/*
ENV JAVA_HOME=/usr/lib/jvm/java-25-openjdk-amd64
ENV PATH="$JAVA_HOME/bin:$PATH"

# Copy the built jar
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]
