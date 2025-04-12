package tn.esprit.examen.plateformestage;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableAspectJAutoProxy
@EnableScheduling
@SpringBootApplication
@EnableDiscoveryClient
public class AzizjemliClasseExamenApplication {

    public static void main(String[] args) {
        SpringApplication.run(AzizjemliClasseExamenApplication.class, args);
    }

}
