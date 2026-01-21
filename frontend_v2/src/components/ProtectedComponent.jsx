import React from 'react';
import { useAuth } from '../context/AuthContext';
import AccessDenied from './AccessDenied';
import { hasAnyRole, hasRole } from '../utils/roleUtils';

/**
 * Компонент для защиты контента на основе ролей
 * @param {Object} props
 * @param {React.ReactNode} props.children - контент для отображения
 * @param {string|string[]} props.requiredRoles - требуемые роли (строка или массив)
 * @param {string} props.accessDeniedMessage - сообщение при отсутствии доступа
 */
export default function ProtectedComponent({ 
  children, 
  requiredRoles, 
  accessDeniedMessage 
}) {
  const { user } = useAuth();

  if (!user) {
    return <AccessDenied message="Необходима авторизация" />;
  }

  // Преобразуем requiredRoles в массив, если это строка
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  // Проверяем наличие хотя бы одной из требуемых ролей
  const hasAccess = roles.some(role => hasRole(user, role));

  if (!hasAccess) {
    return <AccessDenied message={accessDeniedMessage} />;
  }

  return <>{children}</>;
}
