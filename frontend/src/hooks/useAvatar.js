import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export const useAvatar = () => {
  const { user, updateUser } = useAuth();
  const [avatarError, setAvatarError] = useState('');

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Размер файла не должен превышать 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setAvatarError('Пожалуйста, выберите изображение');
      return;
    }

    setAvatarError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      const avatarData = e.target.result;
      updateUser({ avatar: avatarData }); // обновляем аватар в контексте и localStorage
    };
    reader.readAsDataURL(file);
  };

  // Удаление аватара
  const handleRemoveAvatar = () => {
    updateUser({ avatar: null });
    setAvatarError('');
  };

  return {
    avatar: user?.avatar || null,
    avatarError,
    handleAvatarUpload,
    handleRemoveAvatar,
  };
};
