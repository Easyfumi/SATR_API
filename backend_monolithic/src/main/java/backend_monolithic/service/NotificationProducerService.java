package backend_monolithic.service;

import backend_monolithic.model.dto.TaskAssignmentNotification;
import backend_monolithic.model.dto.TaskDecisionNotification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationProducerService {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.notifications:task-assignments}")
    private String notificationsTopic;

    public void sendTaskAssignmentNotification(TaskAssignmentNotification notification) {
        try {
            // Синхронная отправка с ожиданием подтверждения для гарантии "at least once"
            // Используем get() для ожидания результата
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                    notificationsTopic,
                    notification.getRecipientEmail(),
                    notification
            );

            // Ждем подтверждения отправки (с таймаутом 10 секунд)
            SendResult<String, Object> result = future.get(10, TimeUnit.SECONDS);
            
            log.info("Уведомление успешно отправлено в Kafka: recipient={}, taskId={}, offset={}, partition={}",
                    notification.getRecipientEmail(), 
                    notification.getTaskId(),
                    result.getRecordMetadata().offset(),
                    result.getRecordMetadata().partition());
                    
        } catch (Exception e) {
            log.error("Ошибка при отправке уведомления в Kafka: recipient={}, taskId={}",
                    notification.getRecipientEmail(), notification.getTaskId(), e);
            // Пробрасываем исключение, чтобы вызывающий код знал об ошибке
            throw new RuntimeException("Не удалось отправить уведомление в Kafka", e);
        }
    }

    public void sendTaskDecisionNotification(TaskDecisionNotification notification) {
        try {
            CompletableFuture<SendResult<String, Object>> future = kafkaTemplate.send(
                    notificationsTopic,
                    notification.getRecipientEmail(),
                    notification
            );

            SendResult<String, Object> result = future.get(10, TimeUnit.SECONDS);
            
            log.info("Уведомление о решении успешно отправлено в Kafka: recipient={}, taskId={}, offset={}, partition={}",
                    notification.getRecipientEmail(), 
                    notification.getTaskId(),
                    result.getRecordMetadata().offset(),
                    result.getRecordMetadata().partition());
                    
        } catch (Exception e) {
            log.error("Ошибка при отправке уведомления о решении в Kafka: recipient={}, taskId={}",
                    notification.getRecipientEmail(), notification.getTaskId(), e);
            throw new RuntimeException("Не удалось отправить уведомление о решении в Kafka", e);
        }
    }
}
