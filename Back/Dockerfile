# Étape 1 : Build avec Maven et JDK 17
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Étape 2 : Exécution avec JDK complet
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/aziz-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8089
ENTRYPOINT ["java", "-jar", "app.jar"]