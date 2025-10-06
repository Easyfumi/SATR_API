import React, { useState } from 'react';
import { Button, Modal, Box, Typography, Checkbox, FormControlLabel, Link } from '@mui/material';

const DuplicateCheckModal = ({ 
    open, 
    onClose, 
    duplicates, 
    onForceCreate,
    isLoading 
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
                    {isLoading ? 'Поиск дубликатов...' : 'Найдены дубликаты заявок'}
                </Typography>

                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                        <div className="loading-spinner">Загрузка...</div>
                    </Box>
                ) : (
                    <>
                        <Typography variant="body1" sx={{ mb: 2 }}>
                            Обнаружены заявки с аналогичными данными:
                        </Typography>

                        <Box sx={{ maxHeight: 200, overflow: 'auto', mb: 2 }}>
                            {duplicates.map((duplicate) => (
                                <Box key={duplicate.id} sx={{ 
                                    p: 1, 
                                    borderBottom: '1px solid #eee',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Link 
                                        href={`/tasks/${duplicate.id}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        {duplicate.taskNumber}
                                    </Link>
                                    <Typography variant="body2" color="text.secondary">
                                        {duplicate.status}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={ignoreDuplicates}
                                    onChange={(e) => setIgnoreDuplicates(e.target.checked)}
                                    color="primary"
                                />
                            }
                            label="Продолжить создание заявки, несмотря на найденные дубликаты"
                        />

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                            <Button onClick={handleClose}>
                                Отмена
                            </Button>
                            <Button 
                                variant="contained" 
                                onClick={handleForceCreate}
                                disabled={!ignoreDuplicates}
                            >
                                Все равно зарегистрировать
                            </Button>
                        </Box>
                    </>
                )}
            </Box>
        </Modal>
    );
};

export default DuplicateCheckModal;