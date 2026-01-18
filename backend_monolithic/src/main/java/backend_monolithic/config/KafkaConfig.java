package backend_monolithic.config;

import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers:localhost:9092}")
    private String bootstrapServers;

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        Map<String, Object> configProps = new HashMap<>();
        configProps.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        configProps.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        
        // Настройка JsonSerializer без добавления информации о типе
        JsonSerializer<Object> jsonSerializer = new JsonSerializer<>();
        jsonSerializer.setAddTypeInfo(false); // Отключаем добавление информации о типе
        
        configProps.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, jsonSerializer.getClass());
        
        // At least once delivery guarantees
        configProps.put(ProducerConfig.ACKS_CONFIG, "all"); // Ждем подтверждения от всех реплик
        configProps.put(ProducerConfig.RETRIES_CONFIG, 3); // Количество повторных попыток
        configProps.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 1); // Одно сообщение в полете для гарантии порядка
        configProps.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true); // Идемпотентность для предотвращения дубликатов
        configProps.put(ProducerConfig.REQUEST_TIMEOUT_MS_CONFIG, 30000); // Таймаут запроса
        configProps.put(ProducerConfig.DELIVERY_TIMEOUT_MS_CONFIG, 120000); // Таймаут доставки
        
        return new DefaultKafkaProducerFactory<>(configProps, new StringSerializer(), jsonSerializer);
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        return new KafkaTemplate<>(producerFactory());
    }
}
