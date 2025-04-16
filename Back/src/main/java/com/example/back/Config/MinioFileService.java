package com.example.back.Config;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
public class MinioFileService {

    @Autowired
    private MinioClient minioClient;

    public void uploadFile(MultipartFile file, String bucketName, String objectName, String contentType) {
        try {
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
            minioClient.putObject(
                    PutObjectArgs.builder().bucket(bucketName).object(objectName).stream(
                                    file.getInputStream(), file.getSize(), -1)
                            .contentType(contentType)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error uploading file : " + e.getMessage());
        }
    }



    /*
    public void uploadFile(String bucketName, String objectName, InputStream inputStream, String contentType) {
        try {
                // vérifie si le bucket spécifié existe déjà dans MinIO
            boolean found = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucketName).build());
            if (!found) {
                // Si le bucket n'existe pas, cette ligne crée un nouveau bucket avec le nom spécifié
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
            }
            // put le fichier vers MinIO en utilisant le flux d'entrée fourni inputStream
            minioClient.putObject(
                    PutObjectArgs.builder().bucket(bucketName).object(objectName).stream( // construit un objet
                                    inputStream, inputStream.available(), -1)  // spécifie le flux d'entrée du fichier et sa taille.
                            .contentType(contentType) // spécifie le type de contenu du fichier
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("Error occurred: " + e.getMessage());
        }
    }

 */




}
