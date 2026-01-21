/**
 * Утилиты для работы с ролями пользователей
 */

// Маппинг ролей из бэкенда
export const ROLES = {
  EMPTY: 'EMPTY',           // Гость
  EXPERT: 'EXPERT',         // Эксперт
  DIRECTOR: 'DIRECTOR',     // Руководитель
  ACCOUNTANT: 'ACCOUNTANT', // Бухгалтерия
  REGISTRAR: 'REGISTRAR'    // Регистратор
};

/**
 * Проверяет, имеет ли пользователь указанную роль
 * @param {Object} user - объект пользователя
 * @param {string} role - роль для проверки
 * @returns {boolean}
 */
export const hasRole = (user, role) => {
  if (!user || !user.roles) return false;
  return user.roles.some(r => r === role || r.name === role);
};

/**
 * Проверяет, имеет ли пользователь хотя бы одну из указанных ролей
 * @param {Object} user - объект пользователя
 * @param {string[]} roles - массив ролей для проверки
 * @returns {boolean}
 */
export const hasAnyRole = (user, roles) => {
  if (!user || !user.roles) return false;
  return roles.some(role => hasRole(user, role));
};

/**
 * Проверяет, является ли пользователь гостем (EMPTY)
 * @param {Object} user - объект пользователя
 * @returns {boolean}
 */
export const isGuest = (user) => {
  return hasRole(user, ROLES.EMPTY);
};

/**
 * Проверяет, является ли пользователь руководителем (DIRECTOR)
 * @param {Object} user - объект пользователя
 * @returns {boolean}
 */
export const isDirector = (user) => {
  return hasRole(user, ROLES.DIRECTOR);
};

/**
 * Проверяет, может ли пользователь просматривать заявки и договоры
 * (все авторизованные кроме тех, у кого ТОЛЬКО роль EMPTY)
 * @param {Object} user - объект пользователя
 * @returns {boolean}
 */
export const canViewTasksAndContracts = (user) => {
  if (!user || !user.roles || user.roles.length === 0) return false;
  // Проверяем, есть ли хотя бы одна роль, отличная от EMPTY
  const hasNonEmptyRole = user.roles.some(role => {
    const roleName = typeof role === 'string' ? role : role.name || role;
    return roleName !== 'EMPTY';
  });
  return hasNonEmptyRole;
};

/**
 * Проверяет, может ли пользователь создавать/изменять заявки
 * (EXPERT или DIRECTOR)
 * @param {Object} user - объект пользователя
 * @returns {boolean}
 */
export const canModifyTasks = (user) => {
  return hasAnyRole(user, [ROLES.EXPERT, ROLES.DIRECTOR]);
};

/**
 * Проверяет, может ли пользователь работать с договорами
 * (ACCOUNTANT)
 * @param {Object} user - объект пользователя
 * @returns {boolean}
 */
export const canManageContracts = (user) => {
  return hasRole(user, ROLES.ACCOUNTANT);
};

/**
 * Проверяет, может ли пользователь использовать вспомогательные эндпоинты
 * (EXPERT, ACCOUNTANT, DIRECTOR)
 * @param {Object} user - объект пользователя
 * @returns {boolean}
 */
export const canUseSupportingEndpoints = (user) => {
  return hasAnyRole(user, [ROLES.EXPERT, ROLES.ACCOUNTANT, ROLES.DIRECTOR]);
};
