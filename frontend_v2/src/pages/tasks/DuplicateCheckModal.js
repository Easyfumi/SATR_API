import React, { useState } from 'react';
import { Button, Modal, Box, Typography, Checkbox, FormControlLabel, Link } from '@mui/material';


const DuplicateCheckModal = ({ 
    open, 
    onClose, 
    duplicates, 
    onForceCreate,
    isLoading,
    itemPathPrefix = '/tasks',
    title = 'Найдены дубликаты заявок',
    description = 'Обнаружены заявки с аналогичными данными:',
    forceLabel = 'Все равно зарегистрировать',
    statusLabels = null
}) => {
    const [ignoreDuplicates, setIgnoreDuplicates] = useState(false);

    const handleForceCreate = () => {
        onForceCreate();
        setIgnoreDuplicates(false);
    };

    const handleClose = () => {
        onClose();
        setIgnoreDuplicates(false);
    };

    // Функция для форматирования даты
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

        // Объект для отображения статусов
    const defaultStatusLabels = {
        RECEIVED: 'Заявка получена',
        REGISTERED: 'Заявка зарегистрирована',
        DECISION_DONE: 'Решение по заявке готово',
        DOCUMENTS_WAITING: 'Ожидание документов',
        REJECTION: 'Отказ в проведении работ',
        CANCELLED: 'Аннулирована',
        PROJECT: 'Переведено в проект',
        SIGNED: 'Подписано',
        FOR_REVISION: 'Возвращено на доработку',
        COMPLETED: 'Заявка выполнена'
    };

    // Функция для получения читаемого названия статуса
    const getStatusLabel = (status) => {
        const labels = statusLabels || defaultStatusLabels;
        return labels[status] || status;
    };

    // Функция для получения цвета статуса
    const getStatusColor = (status) => {
        const colors = {
            'RECEIVED': '#1976d2', // Синий
            'REGISTERED': '#2e7d32', // Зеленый
            'DECISION_DONE': '#ed6c02', // Оранжевый
            'DOCUMENTS_WAITING': '#ffb300', // Желтый
            'REJECTION': '#d32f2f', // Красный
            'CANCELLED': '#757575', // Серый
            'PROJECT': '#7b1fa2', // Фиолетовый
            'SIGNED': '#2e7d32', // Зеленый
            'FOR_REVISION': '#ed6c02', // Оранжевый
            'COMPLETED': '#2e7d32' // Зеленый
        };
        return colors[status] || '#757575';
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 600,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2
            }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    {isLoading ? 'Поиск дубликатов...' : title}
                </Typography>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <div className="loading-spinner">Загрузка...</div>
                    </Box>
                ) : (
                    <>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            {description}
                        </Typography>

                        <Box sx={{ 
                            maxHeight: 300, 
                            overflow: 'auto', 
                            mb: 2, 
                            border: '1px solid #e0e0e0', 
                            borderRadius: 1,
                            backgroundColor: '#fafafa'
                        }}>
                            {duplicates.length === 0 ? (
                                <Box sx={{ p: 2, textAlign: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        Дубликаты не найдены
                                    </Typography>
                                </Box>
                            ) : (
                                duplicates.map((duplicate) => (
                                    <Box key={duplicate.id} sx={{ 
                                        p: 2, 
                                        borderBottom: '1px solid #f0f0f0',
                                        backgroundColor: 'white',
                                        '&:last-child': { borderBottom: 'none' },
                                        '&:hover': { backgroundColor: '#f5f5f5' }
                                    }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                            <Box>
                                                <Link 
                                                    href={`${itemPathPrefix}/${duplicate.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    sx={{ 
                                                        cursor: 'pointer',
                                                        fontWeight: 'bold',
                                                        textDecoration: 'none',
                                                        fontSize: '1rem',
                                                        color: '#1976d2',
                                                        '&:hover': { 
                                                            textDecoration: 'underline',
                                                            color: '#1565c0'
                                                        }
                                                    }}
                                                >
                                                    {duplicate.displayIdentifier}
                                                </Link>
                                            </Box>
                                            <Typography 
                                                variant="caption" 
                                                sx={{ 
                                                    padding: '4px 8px',
                                                    borderRadius: 1,
                                                    backgroundColor: getStatusColor(duplicate.status),
                                                    color: 'white',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.7rem',
                                                    whiteSpace: 'nowrap'
                                                }}
                                            >
                                                {getStatusLabel(duplicate.status)}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Создана: {formatDate(duplicate.createdAt)}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </Box>

                        {duplicates.length > 0 && (
                            <>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={ignoreDuplicates}
                                            onChange={(e) => setIgnoreDuplicates(e.target.checked)}
                                            color="primary"
                                        />
                                    }
                                    label="Продолжить создание заявки, несмотря на найденные дубликаты"
                                    sx={{ mt: 1 }}
                                />

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                                    <Button 
                                        onClick={handleClose}
                                        variant="outlined"
                                    >
                                        Отмена
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        onClick={handleForceCreate}
                                        disabled={!ignoreDuplicates}
                                        color="warning"
                                        sx={{ 
                                            backgroundColor: ignoreDuplicates ? '#ed6c02' : '',
                                            '&:hover': {
                                                backgroundColor: ignoreDuplicates ? '#e65100' : ''
                                            }
                                        }}
                                    >
                                        {forceLabel}
                                    </Button>
                                </Box>
                            </>
                        )}
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default DuplicateCheckModal;