FROM amazoncorretto:17
WORKDIR /app
EXPOSE 9090
ADD target/Back-0.0.1-SNAPSHOT.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
