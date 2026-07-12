export const PROCESS_OPTIONS = [
    'со сроком действия до 3-х лет',
    'со сроком действия до 1-ого года в соответствии с п. 35 ТР ТС',
    'на малую партию транспортных средств (шасси) в соответствии с п. 35 ТР ТС',
    'распространение с новым сроком действия',
    'распространение со старым сроком действия'
];

export const PROCESS_TYPE_OLD_EXPIRY = 'распространение со старым сроком действия';

export const requiresProcessExpiryDate = (processType) => processType === PROCESS_TYPE_OLD_EXPIRY;

export const formatProcessTypeDisplay = (processType, processExpiryDate) => {
    if (!processType) {
        return '';
    }

    if (requiresProcessExpiryDate(processType) && processExpiryDate) {
        const date = new Date(processExpiryDate);
        if (!Number.isNaN(date.getTime())) {
            return `${processType} до ${date.toLocaleDateString('ru-RU')}`;
        }
    }

    return processType;
};
