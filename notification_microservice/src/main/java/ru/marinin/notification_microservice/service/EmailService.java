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

    public void sendTaskDecisionNotification(String recipientEmail, String recipientName, 
                                            String taskNumber, java.time.LocalDate decisionDate, 
                                            String applicantName) {
        try {
            log.debug("Начало отправки email о решении: recipient={}, taskNumber={}", recipientEmail, taskNumber);
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, senderName);
            helper.setTo(recipientEmail);
            helper.setSubject("Решение по заявке готово");
            
            String emailContent = buildTaskDecisionEmailContent(recipientName, taskNumber, decisionDate, applicantName);
            helper.setText(emailContent, true);

            log.debug("Отправка email через SMTP: recipient={}", recipientEmail);
            mailSender.send(mimeMessage);
            log.info("Email о решении успешно отправлен: recipient={}, taskNumber={}", recipientEmail, taskNumber);
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

    private String buildTaskDecisionEmailContent(String recipientName, String taskNumber, 
                                                 java.time.LocalDate decisionDate, String applicantName) {
        String formattedDate = decisionDate != null ? 
            decisionDate.format(java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy")) : "Не указана";
        
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }" +
                ".content { padding: 20px; background-color: #f9f9f9; }" +
                ".info-block { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #2196F3; }" +
                ".info-label { font-weight: bold; color: #555; }" +
                ".info-value { color: #333; margin-left: 10px; }" +
                ".message { font-size: 16px; margin: 20px 0; color: #2196F3; }" +
                ".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class=\"container\">" +
                "<div class=\"header\">" +
                "<h1>Решение по заявке готово</h1>" +
                "</div>" +
                "<div class=\"content\">" +
                "<p>Здравствуйте" + (recipientName != null && !recipientName.isEmpty() ? ", " + recipientName : "") + "!</p>" +
                "<div class=\"message\">" +
                "<p><strong>Написано решение по заявке</strong></p>" +
                "</div>" +
                "<div class=\"info-block\">" +
                "<p><span class=\"info-label\">Номер заявки:</span><span class=\"info-value\">" + taskNumber + "</span></p>" +
                "<p><span class=\"info-label\">Дата заявки:</span><span class=\"info-value\">" + formattedDate + "</span></p>" +
                "<p><span class=\"info-label\">Наименование заявителя:</span><span class=\"info-value\">" + applicantName + "</span></p>" +
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

    public void sendUserRegistrationNotification(String recipientEmail, String recipientName,
                                                 String newUserEmail, String newUserFirstName,
                                                 String newUserSecondName, String newUserPatronymic) {
        try {
            log.debug("Начало отправки email о регистрации пользователя: recipient={}, newUserEmail={}", recipientEmail, newUserEmail);
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, senderName);
            helper.setTo(recipientEmail);
            helper.setSubject("Регистрация нового пользователя");
            
            String emailContent = buildUserRegistrationEmailContent(recipientName, newUserEmail, 
                    newUserFirstName, newUserSecondName, newUserPatronymic);
            helper.setText(emailContent, true);

            log.debug("Отправка email через SMTP: recipient={}", recipientEmail);
            mailSender.send(mimeMessage);
            log.info("Email о регистрации пользователя успешно отправлен: recipient={}, newUserEmail={}", recipientEmail, newUserEmail);
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

    private String buildUserRegistrationEmailContent(String recipientName, String newUserEmail,
                                                    String newUserFirstName, String newUserSecondName,
                                                    String newUserPatronymic) {
        // Формируем полное ФИО нового пользователя
        StringBuilder fullName = new StringBuilder();
        if (newUserSecondName != null && !newUserSecondName.isBlank()) {
            fullName.append(newUserSecondName);
        }
        if (newUserFirstName != null && !newUserFirstName.isBlank()) {
            if (fullName.length() > 0) {
                fullName.append(" ");
            }
            fullName.append(newUserFirstName);
        }
        if (newUserPatronymic != null && !newUserPatronymic.isBlank()) {
            if (fullName.length() > 0) {
                fullName.append(" ");
            }
            fullName.append(newUserPatronymic);
        }
        
        String fullNameStr = fullName.length() > 0 ? fullName.toString() : "Не указано";
        
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset=\"UTF-8\">" +
                "<style>" +
                "body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }" +
                ".container { max-width: 600px; margin: 0 auto; padding: 20px; }" +
                ".header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }" +
                ".content { padding: 20px; background-color: #f9f9f9; }" +
                ".info-block { background-color: white; padding: 15px; margin: 15px 0; border-left: 4px solid #FF9800; }" +
                ".info-label { font-weight: bold; color: #555; }" +
                ".info-value { color: #333; margin-left: 10px; }" +
                ".message { font-size: 16px; margin: 20px 0; color: #FF9800; }" +
                ".footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class=\"container\">" +
                "<div class=\"header\">" +
                "<h1>Регистрация нового пользователя</h1>" +
                "</div>" +
                "<div class=\"content\">" +
                "<p>Здравствуйте" + (recipientName != null && !recipientName.isEmpty() ? ", " + recipientName : "") + "!</p>" +
                "<div class=\"message\">" +
                "<p><strong>Зарегистрирован новый пользователь в системе</strong></p>" +
                "</div>" +
                "<div class=\"info-block\">" +
                "<p><span class=\"info-label\">Фамилия:</span><span class=\"info-value\">" + 
                (newUserSecondName != null && !newUserSecondName.isBlank() ? newUserSecondName : "Не указана") + "</span></p>" +
                "<p><span class=\"info-label\">Имя:</span><span class=\"info-value\">" + 
                (newUserFirstName != null && !newUserFirstName.isBlank() ? newUserFirstName : "Не указано") + "</span></p>" +
                (newUserPatronymic != null && !newUserPatronymic.isBlank() ? 
                "<p><span class=\"info-label\">Отчество:</span><span class=\"info-value\">" + newUserPatronymic + "</span></p>" : "") +
                "<p><span class=\"info-label\">Email:</span><span class=\"info-value\">" + newUserEmail + "</span></p>" +
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

    public void sendDeclarationRegisteredNotification(String recipientEmail, String recipientName,
                                                      String applicationNumber, java.time.LocalDate applicationDate,
                                                      String applicantName, String declarationNumber, String executorName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, senderName);
            helper.setTo(recipientEmail);
            helper.setSubject("Зарегистрирована декларация");
            helper.setText(buildDeclarationRegisteredEmailContent(
                    recipientName,
                    applicationNumber,
                    applicationDate,
                    applicantName,
                    declarationNumber,
                    executorName
            ), true);

            mailSender.send(mimeMessage);
            log.info("Email о регистрации декларации отправлен: recipient={}, declarationNumber={}",
                    recipientEmail, declarationNumber);
        } catch (MessagingException e) {
            log.error("Ошибка отправки email о регистрации декларации: recipient={}, declarationNumber={}",
                    recipientEmail, declarationNumber, e);
            throw new RuntimeException("Не удалось отправить email о регистрации декларации", e);
        } catch (Exception e) {
            log.error("Неожиданная ошибка отправки email о регистрации декларации: recipient={}, declarationNumber={}",
                    recipientEmail, declarationNumber, e);
            throw new RuntimeException("Не удалось отправить email о регистрации декларации", e);
        }
    }

    private String buildDeclarationRegisteredEmailContent(String recipientName, String applicationNumber,
                                                          java.time.LocalDate applicationDate, String applicantName,
                                                          String declarationNumber, String executorName) {
        String dateText = applicationDate != null
                ? applicationDate.format(java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy"))
                : "не указана";
        String applicantText = (applicantName != null && !applicantName.isBlank()) ? applicantName : "Не указан";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; color:#333;\">" +
                "<h2>Зарегистрирована декларация</h2>" +
                "<p><strong>По заявке № " + applicationNumber + " от " + dateText +
                " зарегистрирована декларация с номером " + declarationNumber + ".</strong></p>" +
                "<p><strong>Заявитель: " + applicantText + ".</strong></p>" +
                "<p><strong>Исполнитель: " + executorName + ".</strong></p>" +
                "<p>Это автоматическое сообщение. Пожалуйста, не отвечайте на него.</p>" +
                "</body>" +
                "</html>";
    }

    public void sendCertificateRegisteredNotification(String recipientEmail, String recipientName,
                                                      String applicationNumber, java.time.LocalDate applicationDate,
                                                      String applicantName, String certificateNumber, String executorName) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, senderName);
            helper.setTo(recipientEmail);
            helper.setSubject("Зарегистрирован сертификат");
            helper.setText(buildCertificateRegisteredEmailContent(
                    recipientName,
                    applicationNumber,
                    applicationDate,
                    applicantName,
                    certificateNumber,
                    executorName
            ), true);

            mailSender.send(mimeMessage);
            log.info("Email о регистрации сертификата отправлен: recipient={}, certificateNumber={}",
                    recipientEmail, certificateNumber);
        } catch (MessagingException e) {
            log.error("Ошибка отправки email о регистрации сертификата: recipient={}, certificateNumber={}",
                    recipientEmail, certificateNumber, e);
            throw new RuntimeException("Не удалось отправить email о регистрации сертификата", e);
        } catch (Exception e) {
            log.error("Неожиданная ошибка отправки email о регистрации сертификата: recipient={}, certificateNumber={}",
                    recipientEmail, certificateNumber, e);
            throw new RuntimeException("Не удалось отправить email о регистрации сертификата", e);
        }
    }

    private String buildCertificateRegisteredEmailContent(String recipientName, String applicationNumber,
                                                          java.time.LocalDate applicationDate, String applicantName,
                                                          String certificateNumber, String executorName) {
        String dateText = applicationDate != null
                ? applicationDate.format(java.time.format.DateTimeFormatter.ofPattern("dd.MM.yyyy"))
                : "не указана";
        String applicantText = (applicantName != null && !applicantName.isBlank()) ? applicantName : "Не указан";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset=\"UTF-8\"></head>" +
                "<body style=\"font-family: Arial, sans-serif; color:#333;\">" +
                "<h2>Зарегистрирован сертификат</h2>" +
                "<p><strong>По заявке № " + applicationNumber + " от " + dateText +
                " зарегистрирован сертификат с номером " + certificateNumber + ".</strong></p>" +
                "<p><strong>Заявитель: " + applicantText + ".</strong></p>" +
                "<p><strong>Исполнитель: " + executorName + ".</strong></p>" +
                "<p>Это автоматическое сообщение. Пожалуйста, не отвечайте на него.</p>" +
                "</body>" +
                "</html>";
    }
}
