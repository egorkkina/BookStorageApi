import { useState } from 'react';

export function useAuthForm(initialValues, onSubmit) {
  const [formData, setFormData] = useState(initialValues);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return { formData, loading, error, handleChange, handleSubmit };
}
