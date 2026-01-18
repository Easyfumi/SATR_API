package ru.marinin.notification_microservice.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.support.serializer.JsonDeserializer;
import ru.marinin.notification_microservice.model.TaskAssignmentNotification;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Value("${spring.kafka.consumer.group-id:myGroup}")
    private String groupId;

    @Bean
    public ConsumerFactory<String, TaskAssignmentNotification> consumerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ConsumerConfig.GROUP_ID_CONFIG, groupId);
        configProps.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
        
        // Настройка JsonDeserializer для правильной десериализации
        JsonDeserializer<TaskAssignmentNotification> jsonDeserializer = new JsonDeserializer<>(TaskAssignmentNotification.class, false);
        jsonDeserializer.setRemoveTypeHeaders(false);
        jsonDeserializer.addTrustedPackages("*");
        // Отключаем использование информации о типе из сообщения, используем наш класс напрямую
        jsonDeserializer.setUseTypeHeaders(false);
        
        configProps.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, jsonDeserializer);
        configProps.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
        
        // At least once delivery guarantees
        configProps.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false); // Отключаем автоматический commit
        configProps.put(ConsumerConfig.SESSION_TIMEOUT_MS_CONFIG, 30000); // Таймаут сессии
        configProps.put(ConsumerConfig.HEARTBEAT_INTERVAL_MS_CONFIG, 10000); // Интервал heartbeat
        configProps.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 10); // Максимум записей за один poll
        
        return new DefaultKafkaConsumerFactory<>(configProps, new StringDeserializer(), jsonDeserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, TaskAssignmentNotification> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, TaskAssignmentNotification> factory = 
                new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        
        // Настройка для ручного подтверждения (manual acknowledgment)
        factory.getContainerProperties().setAckMode(
                org.springframework.kafka.listener.ContainerProperties.AckMode.MANUAL_IMMEDIATE
        );
        
        return factory;
    }
}
