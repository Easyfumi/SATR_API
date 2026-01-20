package ru.marinin.notification_microservice.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import ru.marinin.notification_microservice.model.TaskAssignmentNotification;
import ru.marinin.notification_microservice.model.TaskDecisionNotification;
import ru.marinin.notification_microservice.model.UserRegistrationNotification;
import ru.marinin.notification_microservice.service.EmailService;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationConsumer {

    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${kafka.topic.notifications:task-assignments}", groupId = "${spring.kafka.consumer.group-id:myGroup}")
    public void consumeNotification(
            ConsumerRecord<String, Object> record,
            Acknowledgment acknowledgment) {
        try {
            // Извлекаем значение из ConsumerRecord
            Object messageValue = record.value();
            
            // Преобразуем сообщение в Map для проверки типа
            Map<String, Object> messageMap = objectMapper.convertValue(messageValue, Map.class);
            
            // Проверяем наличие поля "message" для TaskAssignmentNotification
            if (messageMap.containsKey("message")) {
                TaskAssignmentNotification notification = objectMapper.convertValue(messageValue, TaskAssignmentNotification.class);
                consumeTaskAssignmentNotification(notification, acknowledgment);
            } 
            // Проверяем наличие поля "decisionDate" для TaskDecisionNotification
            else if (messageMap.containsKey("decisionDate")) {
                TaskDecisionNotification notification = objectMapper.convertValue(messageValue, TaskDecisionNotification.class);
                consumeTaskDecisionNotification(notification, acknowledgment);
            } 
            // Проверяем наличие поля "newUserEmail" для UserRegistrationNotification
            else if (messageMap.containsKey("newUserEmail")) {
                UserRegistrationNotification notification = objectMapper.convertValue(messageValue, UserRegistrationNotification.class);
                consumeUserRegistrationNotification(notification, acknowledgment);
            } else {
                log.error("Неизвестный тип уведомления: {}", messageMap);
                acknowledgment.acknowledge(); // Подтверждаем, чтобы не зациклиться
            }
        } catch (Exception e) {
            log.error("Ошибка при обработке уведомления: key={}, value={}", record.key(), record.value(), e);
            throw e;
        }
    }

    private void consumeTaskAssignmentNotification(
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

    private void consumeTaskDecisionNotification(
            TaskDecisionNotification notification,
            Acknowledgment acknowledgment) {
        try {
            log.info("Получено уведомление о решении по заявке: recipient={}, taskId={}, taskNumber={}", 
                    notification.getRecipientEmail(), notification.getTaskId(), notification.getTaskNumber());
            
            // Отправляем email
            emailService.sendTaskDecisionNotification(
                    notification.getRecipientEmail(),
                    notification.getRecipientName(),
                    notification.getTaskNumber(),
                    notification.getDecisionDate(),
                    notification.getApplicantName()
            );
            
            // Подтверждаем обработку только после успешной отправки email
            acknowledgment.acknowledge();
            
            log.info("Уведомление о решении успешно обработано и подтверждено: recipient={}, taskId={}", 
                    notification.getRecipientEmail(), notification.getTaskId());
        } catch (Exception e) {
            log.error("Ошибка при обработке уведомления о решении: recipient={}, taskId={}. Сообщение будет обработано повторно.", 
                    notification.getRecipientEmail(), notification.getTaskId(), e);
            throw e; // Пробрасываем исключение для повторной обработки
        }
    }

    private void consumeUserRegistrationNotification(
            UserRegistrationNotification notification,
            Acknowledgment acknowledgment) {
        try {
            log.info("Получено уведомление о регистрации нового пользователя: recipient={}, newUserEmail={}", 
                    notification.getRecipientEmail(), notification.getNewUserEmail());
            
            // Отправляем email
            emailService.sendUserRegistrationNotification(
                    notification.getRecipientEmail(),
                    notification.getRecipientName(),
                    notification.getNewUserEmail(),
                    notification.getNewUserFirstName(),
                    notification.getNewUserSecondName(),
                    notification.getNewUserPatronymic()
            );
            
            // Подтверждаем обработку только после успешной отправки email
            acknowledgment.acknowledge();
            
            log.info("Уведомление о регистрации пользователя успешно обработано и подтверждено: recipient={}, newUserEmail={}", 
                    notification.getRecipientEmail(), notification.getNewUserEmail());
        } catch (Exception e) {
            log.error("Ошибка при обработке уведомления о регистрации пользователя: recipient={}, newUserEmail={}. Сообщение будет обработано повторно.", 
                    notification.getRecipientEmail(), notification.getNewUserEmail(), e);
            throw e; // Пробрасываем исключение для повторной обработки
        }
    }
}
