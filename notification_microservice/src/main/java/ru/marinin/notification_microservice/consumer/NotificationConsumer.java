package ru.marinin.notification_microservice.consumer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import ru.marinin.notification_microservice.model.TaskAssignmentNotification;
import ru.marinin.notification_microservice.service.EmailService;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final EmailService emailService;

    @KafkaListener(topics = "${kafka.topic.notifications:task-assignments}", groupId = "${spring.kafka.consumer.group-id:myGroup}")
    public void consumeTaskAssignmentNotification(
            TaskAssignmentNotification notification,
            Acknowledgment acknowledgment) {
        try {
            log.info("Получено уведомление о назначении задачи: recipient={}, taskId={}", 
                    notification.getRecipientEmail(), notification.getTaskId());
            
            // Отправляем email
            emailService.sendTaskAssignmentNotification(
                    notification.getRecipientEmail(),
                    notification.getRecipientName(),
                    notification.getMessage()
            );
            
            // Подтверждаем обработку только после успешной отправки email
            // Это гарантирует "at least once" доставку
            acknowledgment.acknowledge();
            
            log.info("Уведомление успешно обработано и подтверждено: recipient={}, taskId={}", 
                    notification.getRecipientEmail(), notification.getTaskId());
        } catch (Exception e) {
            log.error("Ошибка при обработке уведомления: recipient={}, taskId={}. Сообщение будет обработано повторно.", 
                    notification.getRecipientEmail(), notification.getTaskId(), e);
            // Не подтверждаем обработку - сообщение будет обработано повторно
            // В будущем можно добавить retry механизм или отправку в dead letter queue
            throw e; // Пробрасываем исключение для повторной обработки
        }
    }
}
