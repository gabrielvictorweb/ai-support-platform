# syntax=docker/dockerfile:1

FROM eclipse-temurin:25-jdk AS build
WORKDIR /app
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -q || true
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:25-jre AS runner
WORKDIR /app
COPY --from=build /app/target/users-*.jar app.jar
EXPOSE 8080 50051
CMD ["java", "-jar", "app.jar"]
