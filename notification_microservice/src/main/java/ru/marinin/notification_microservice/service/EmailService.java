package ru.marinin.notification_microservice.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${notification.sender.name:SATR System}")
    private String senderName;

    public void sendTaskAssignmentNotification(String recipientEmail, String recipientName, String message) {
        try {
            log.debug("Начало отправки email: recipient={}, from={}", recipientEmail, fromEmail);
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, senderName);
            helper.setTo(recipientEmail);
            helper.setSubject("Новая заявка в работу");
            
            String emailContent = buildEmailContent(recipientName, message);
            helper.setText(emailContent, true);

            log.debug("Отправка email через SMTP: recipient={}", recipientEmail);
            mailSender.send(mimeMessage);
            log.info("Email успешно отправлен: recipient={}", recipientEmail);
        } catch (jakarta.mail.AuthenticationFailedException e) {
            log.error("Ошибка аутентификации при отправке email: recipient={}. Проверьте username и password.", recipientEmail, e);
            throw new RuntimeException("Ошибка аутентификации SMTP. Проверьте настройки почты.", e);
        } catch (jakarta.mail.MessagingException e) {
            log.error("Ошибка при отправке email (MessagingException): recipient={}, message={}", recipientEmail, e.getMessage(), e);
            throw new RuntimeException("Не удалось отправить email: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Неожиданная ошибка при отправке email: recipient={}", recipientEmail, e);
            throw new RuntimeException("Не удалось отправить email", e);
        }
    }

    private String buildEmailContent(String recipientName, String message) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }" +
                ".content { padding: 20px; background-color: #f9f9f9; }" +
                ".message { font-size: 16px; margin: 20px 0; }" +
                ".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class=\"container\">" +
                "<div class=\"header\">" +
                "<h1>Уведомление</h1>" +
                "</div>" +
                "<div class=\"content\">" +
                "<p>Здравствуйте" + (recipientName != null && !recipientName.isEmpty() ? ", " + recipientName : "") + "!</p>" +
                "<div class=\"message\">" +
                "<p><strong>" + message + "</strong></p>" +
                "</div>" +
                "<p>Пожалуйста, проверьте систему для получения дополнительной информации.</p>" +
                "</div>" +
                "<div class=\"footer\">" +
                "<p>Это автоматическое сообщение. Пожалуйста, не отвечайте на это письмо.</p>" +
                "</div>" +
                "</div>" +
                "</body>" +
                "</html>";
    }
}
